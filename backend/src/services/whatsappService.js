import { env } from "../config/env.js";
import { createWhatsAppLog } from "./whatsappLogService.js";
import { getResolvedWhatsAppSettings } from "./whatsappConfigService.js";

const INTERAKT_DEFAULT_API_URL = "https://api.interakt.ai/v1/public/message/";

const INTERAKT_TEMPLATE_MAP = {
  reminder: "fee_reminder",
  urgent: "fee_urgent",
  late: "fee_late",
  paymentReceived: "payment_received",
  enquiryReply: "course_enquiry_reply",
};

const TEMPLATE_BODY_TOKEN_MAP = [
  {
    aliases: ["coursename"],
    tokens: ["{{courseName}}", "{{CourseName}}", "[Course Name]", "[CourseName]"],
  },
  {
    aliases: ["dueday"],
    tokens: ["{{dueDay}}", "{{DueDay}}", "[Due Day]", "[DueDay]"],
  },
  {
    aliases: ["studentname"],
    tokens: ["{{studentName}}", "{{StudentName}}", "[Student Name]", "[StudentName]"],
  },
  {
    aliases: ["monthname"],
    tokens: ["{{monthName}}", "{{MonthName}}", "[Month Name]", "[MonthName]"],
  },
  {
    aliases: ["courses", "courseslist"],
    tokens: ["{{coursesList}}", "{{CoursesList}}", "[Courses]", "[Course List]"],
  },
];

const normalizePhoneNumber = (phoneNumber) => {
  const raw = String(phoneNumber || "").trim();

  if (!raw) {
    return { countryCode: "+91", phoneNumber: "" };
  }

  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return { countryCode: "+91", phoneNumber: "" };
  }

  if (digits.length === 10) {
    return { countryCode: "+91", phoneNumber: digits };
  }

  if (digits.startsWith("91") && digits.length >= 12) {
    return { countryCode: "+91", phoneNumber: digits.slice(2) };
  }

  return {
    countryCode: `+${digits.slice(0, Math.max(digits.length - 10, 1))}`,
    phoneNumber: digits.slice(-10),
  };
};

const normalizeVariableKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const stringifyResponse = (data) => {
  if (!data) {
    return "";
  }

  try {
    return JSON.stringify(data).slice(0, 1500);
  } catch {
    return String(data).slice(0, 1500);
  }
};

export const buildTemplateBodyValues = (template, variables = {}) => {
  const normalizedVariables = Object.entries(variables).reduce((accumulator, [key, value]) => {
    accumulator[normalizeVariableKey(key)] = String(value ?? "");
    return accumulator;
  }, {});

  return TEMPLATE_BODY_TOKEN_MAP.reduce((values, templateToken) => {
    const variableKey = templateToken.aliases.find((alias) => normalizedVariables[alias] !== undefined);

    if (!variableKey) {
      return values;
    }

    const isUsedInTemplate = templateToken.tokens.some((token) => String(template || "").includes(token));

    if (!isUsedInTemplate) {
      return values;
    }

    return [...values, normalizedVariables[variableKey]];
  }, []);
};

const renderTemplatePreview = (template, variables = {}) =>
  TEMPLATE_BODY_TOKEN_MAP.reduce((message, templateToken) => {
    const variableEntry = Object.entries(variables).find(([key]) =>
      templateToken.aliases.includes(normalizeVariableKey(key)),
    );

    if (!variableEntry) {
      return message;
    }

    return templateToken.tokens.reduce(
      (nextMessage, token) => nextMessage.split(token).join(String(variableEntry[1] ?? "")),
      message,
    );
  }, String(template || ""));

const buildInteraktBody = ({
  phone,
  templateName,
  bodyValues = [],
  callbackData = "",
  headerValues = [],
  fileName = "",
}) => {
  const payload = {
    countryCode: phone.countryCode,
    phoneNumber: phone.phoneNumber,
    type: "Template",
    template: {
      name: templateName,
      languageCode: "en",
      bodyValues: bodyValues.map((value) => String(value ?? "")),
    },
  };

  if (callbackData) {
    payload.callbackData = callbackData;
  }

  if (headerValues.length) {
    payload.template.headerValues = headerValues.map((value) => String(value ?? ""));
  }

  if (fileName) {
    payload.template.fileName = fileName;
  }

  return payload;
};

const postInteraktMessage = async ({ apiUrl, payload, authorizationHeader }) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

export const sendWhatsAppMessage = async (to, message, options = {}) => {
  const settings = options.settings || (await getResolvedWhatsAppSettings());
  const apiUrl = settings.apiUrl || env.whatsappApiUrl || INTERAKT_DEFAULT_API_URL;
  const apiKey = settings.apiKey || env.whatsappApiKey;
  const phone = normalizePhoneNumber(to);
  const templateName =
    options.templateName ||
    INTERAKT_TEMPLATE_MAP[options.templateKey] ||
    INTERAKT_TEMPLATE_MAP.enquiryReply;
  const payload = buildInteraktBody({
    phone,
    templateName,
    bodyValues: options.bodyValues || [],
    callbackData: options.callbackData || "",
    headerValues: options.headerValues || [],
    fileName: options.fileName || "",
  });

  if (!phone.phoneNumber) {
    return {
      success: false,
      status: "failed",
      errorMessage: "Recipient WhatsApp number is missing.",
      recipientPhone: phone.phoneNumber,
      provider: "interakt",
      providerResponse: "",
    };
  }

  if (!apiUrl || !apiKey) {
    return {
      success: false,
      status: "failed",
      errorMessage: "Interakt API configuration is incomplete. Check API URL and API key.",
      recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
      provider: "interakt",
      providerResponse: "",
    };
  }

  try {
    let interaktResponse = await postInteraktMessage({
      apiUrl,
      payload,
      authorizationHeader: `Bearer ${apiKey}`,
    });

    // Interakt examples have historically used Basic auth in some docs, so retry once for compatibility.
    if (!interaktResponse.ok && [401, 403].includes(interaktResponse.status)) {
      interaktResponse = await postInteraktMessage({
        apiUrl,
        payload,
        authorizationHeader: `Basic ${apiKey}`,
      });
    }

    if (!interaktResponse.ok) {
      return {
        success: false,
        status: "failed",
        errorMessage:
          interaktResponse.data?.message ||
          interaktResponse.data?.error ||
          interaktResponse.data?.result?.message ||
          "Failed to send WhatsApp template via Interakt.",
        recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
        provider: "interakt",
        providerResponse: stringifyResponse(interaktResponse.data),
      };
    }

    return {
      success: true,
      status: "sent",
      providerMessageId:
        interaktResponse.data?.id ||
        interaktResponse.data?.result?.id ||
        interaktResponse.data?.messageId ||
        "",
      recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
      provider: "interakt",
      providerResponse: stringifyResponse(interaktResponse.data),
      templateName,
      previewMessage: message,
    };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      errorMessage: error.message || "Failed to send WhatsApp template via Interakt.",
      recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
      provider: "interakt",
      providerResponse: "",
    };
  }
};

export const sendTemplatedWhatsAppMessage = async ({
  to,
  templateKey,
  templateName,
  defaultMessage,
  variables = {},
  bodyValues = [],
  category,
  triggerSource = "system",
  mediaUrl,
  fileName,
  feeRecord,
  student,
  bypassAutomation = false,
}) => {
  const settings = await getResolvedWhatsAppSettings();
  const resolvedTemplateName = templateName || INTERAKT_TEMPLATE_MAP[templateKey] || "";
  const resolvedBodyValues = bodyValues.length
    ? bodyValues.map((value) => String(value ?? ""))
    : buildTemplateBodyValues(defaultMessage, variables);

  if (!settings.automationEnabled && !bypassAutomation) {
    const phone = normalizePhoneNumber(to);
    const skipped = {
      success: false,
      status: "skipped",
      errorMessage: "WhatsApp automation is disabled.",
      recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
      provider: "interakt",
      providerResponse: "",
    };

    await createWhatsAppLog({
      category,
      templateKey,
      triggerSource,
      recipientPhone: skipped.recipientPhone,
      messageBody: defaultMessage,
      status: skipped.status,
      provider: skipped.provider,
      errorMessage: skipped.errorMessage,
      providerResponse: skipped.providerResponse,
      feeRecord,
      student,
      sentAt: new Date(),
    });

    return skipped;
  }

  if (!resolvedTemplateName) {
    const phone = normalizePhoneNumber(to);
    const failed = {
      success: false,
      status: "failed",
      errorMessage: "Interakt template name is required.",
      recipientPhone: `${phone.countryCode}${phone.phoneNumber}`,
      provider: "interakt",
      providerResponse: "",
    };

    await createWhatsAppLog({
      category,
      templateKey,
      triggerSource,
      recipientPhone: failed.recipientPhone,
      messageBody: defaultMessage || "Missing Interakt template name.",
      status: failed.status,
      provider: failed.provider,
      errorMessage: failed.errorMessage,
      providerResponse: failed.providerResponse,
      feeRecord,
      student,
      sentAt: new Date(),
    });

    return failed;
  }

  const previewMessage = renderTemplatePreview(
    defaultMessage || `Interakt template: ${resolvedTemplateName}`,
    variables,
  );

  const result = await sendWhatsAppMessage(to, previewMessage, {
    templateKey,
    templateName: resolvedTemplateName,
    bodyValues: resolvedBodyValues,
    callbackData: category,
    headerValues: mediaUrl ? [mediaUrl] : [],
    fileName,
    settings,
  });

  await createWhatsAppLog({
    category,
    templateKey,
    triggerSource,
    recipientPhone: result.recipientPhone || normalizePhoneNumber(to).phoneNumber,
    messageBody: previewMessage,
    status: result.status,
    provider: result.provider || "interakt",
    providerMessageId: result.providerMessageId || "",
    providerResponse: result.providerResponse || "",
    errorMessage: result.errorMessage || "",
    feeRecord,
    student,
    sentAt: new Date(),
  });

  return {
    ...result,
    messageBody: previewMessage,
  };
};
