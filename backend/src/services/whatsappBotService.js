import mongoose from "mongoose";

import { runtimeCourses, runtimeWhatsAppInboundMessages } from "../data/defaultCatalog.js";
import Course from "../models/Course.js";
import WhatsAppInboundMessage from "../models/WhatsAppInboundMessage.js";
import { upsertLeadFromMessage } from "./leadService.js";
import { getResolvedWhatsAppSettings } from "./whatsappConfigService.js";
import { sendTemplatedWhatsAppMessage } from "./whatsappService.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const BOT_TEMPLATE_MAP = {
  fees: "bot_fees_reply",
  course: "bot_course_reply",
  job: "bot_job_reply",
  duration: "bot_duration_reply",
  tenth: "bot_qualification_10th",
  twelfth: "bot_qualification_12th",
  graduate: "bot_qualification_graduate",
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const normalizePhoneNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.startsWith("91")) {
    return `+${digits}`;
  }

  return `+${digits}`;
};

const parseRawMessageValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        return parseRawMessageValue(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => parseRawMessageValue(entry)).filter(Boolean).join(" ").trim();
  }

  if (typeof value === "object") {
    if (value.text) {
      return parseRawMessageValue(value.text);
    }

    if (value.body) {
      return parseRawMessageValue(value.body);
    }

    if (value.caption) {
      return parseRawMessageValue(value.caption);
    }

    if (value.message) {
      return parseRawMessageValue(value.message);
    }

    if (value.parameters) {
      return parseRawMessageValue(value.parameters);
    }

    if (value.payload?.text) {
      return parseRawMessageValue(value.payload.text);
    }

    return "";
  }

  return "";
};

const extractIncomingMessage = (payload = {}) => {
  const eventType = String(payload.type || "").trim();

  if (eventType !== "message_received") {
    return null;
  }

  const customer = payload.data?.customer || {};
  const message = payload.data?.message || {};
  const senderPhone =
    normalizePhoneNumber(customer.channel_phone_number) ||
    normalizePhoneNumber(customer.phone) ||
    normalizePhoneNumber(customer.traits?.phone) ||
    "";
  const messageText =
    parseRawMessageValue(message.message) ||
    parseRawMessageValue(message.text) ||
    parseRawMessageValue(message.body);

  return {
    eventType,
    senderPhone,
    messageText,
    normalizedText: normalizeText(messageText),
    senderName: String(customer.traits?.name || customer.name || "").trim(),
    receivedAt: message.received_at_utc || payload.timestamp || new Date().toISOString(),
    rawPayload: payload,
  };
};

const detectInterest = (normalizedText) => {
  if (normalizedText.includes("fees") || normalizedText.includes("fee")) {
    return "fees";
  }

  if (normalizedText.includes("course") || normalizedText.includes("courses")) {
    return "course";
  }

  if (normalizedText.includes("job") || normalizedText.includes("placement")) {
    return "job";
  }

  if (normalizedText.includes("duration") || normalizedText.includes("time")) {
    return "duration";
  }

  return "";
};

const detectQualification = (normalizedText) => {
  if (!normalizedText) {
    return "";
  }

  if (/(^|\s)(10th|10|ssc)(\s|$)/i.test(normalizedText)) {
    return "10th";
  }

  if (/(^|\s)(12th|12|hsc|10\+2)(\s|$)/i.test(normalizedText)) {
    return "12th";
  }

  if (normalizedText.includes("graduate") || normalizedText.includes("graduation")) {
    return "Graduate";
  }

  return "";
};

const formatCourseList = (courses) => courses.filter(Boolean).slice(0, 3).join(", ");

const loadCourses = async () => {
  if (isDatabaseReady()) {
    return Course.find({ isPublished: true }).sort({ popular: -1, featured: -1, title: 1 }).lean();
  }

  return runtimeCourses.filter((course) => course.isPublished !== false);
};

const getSuggestedCourses = async (qualification) => {
  const courses = await loadCourses();

  if (qualification === "10th") {
    return courses
      .filter((course) => course.eligibility === "10th Pass" && /diploma/i.test(course.title))
      .map((course) => course.title);
  }

  if (qualification === "12th") {
    return courses
      .filter((course) => ["12th Pass", "10+2 Pass"].includes(course.eligibility))
      .map((course) => course.title);
  }

  return courses
    .filter((course) => course.eligibility === "Graduate")
    .map((course) => course.title);
};

const replaceCoursesPlaceholder = (template, courses) =>
  String(template || "").replace(/\[Courses\]|\[Course List\]|\{\{coursesList\}\}|\{\{CoursesList\}\}/g, courses);

const getReplyPlan = async ({ interest, qualification, settings }) => {
  if (qualification === "10th") {
    const courseList =
      formatCourseList(await getSuggestedCourses("10th")) ||
      "Diploma in Industrial Safety Management, Diploma in Environment Safety Engineering, Diploma in Fire & Safety Management";

    return {
      templateName: BOT_TEMPLATE_MAP.tenth,
      previewMessage: replaceCoursesPlaceholder(settings.autoReplies.tenthSuggestion, courseList),
      variables: { coursesList: courseList },
      conversationStage: "qualified",
    };
  }

  if (qualification === "12th") {
    const courseList =
      formatCourseList(await getSuggestedCourses("12th")) ||
      "Advance Diploma in Industrial Safety, Diploma in Fire Safety Technology, Advance Diploma in Fire Safety and Hazards Management";

    return {
      templateName: BOT_TEMPLATE_MAP.twelfth,
      previewMessage: replaceCoursesPlaceholder(settings.autoReplies.twelfthSuggestion, courseList),
      variables: { coursesList: courseList },
      conversationStage: "qualified",
    };
  }

  if (qualification === "Graduate") {
    const courseList = formatCourseList(await getSuggestedCourses("Graduate"));
    const message = courseList
      ? `${settings.autoReplies.graduateSuggestion} Available options include: ${courseList}.`
      : settings.autoReplies.graduateSuggestion;

    return {
      templateName: BOT_TEMPLATE_MAP.graduate,
      previewMessage: message,
      variables: { coursesList: courseList },
      conversationStage: "qualified",
    };
  }

  if (interest && BOT_TEMPLATE_MAP[interest]) {
    return {
      templateName: BOT_TEMPLATE_MAP[interest],
      previewMessage: settings.autoReplies[interest],
      variables: {},
      conversationStage: ["fees", "course"].includes(interest) ? "awaiting-qualification" : "new",
    };
  }

  return null;
};

const shouldSkipReply = ({ previousLead, normalizedText, settings, receivedAt }) => {
  const delayMs = Number(settings.botReplyDelaySeconds || 45) * 1000;
  const duplicateWindowMs = 5 * 60 * 1000;

  if (!previousLead) {
    return false;
  }

  if (previousLead.lastBotReplyAt) {
    const lastReplyAt = new Date(previousLead.lastBotReplyAt).getTime();

    if (Number.isFinite(lastReplyAt) && new Date(receivedAt).getTime() - lastReplyAt < delayMs) {
      return true;
    }
  }

  if (
    previousLead.lastMessageText &&
    normalizeText(previousLead.lastMessageText) === normalizedText &&
    previousLead.lastInteractionAt
  ) {
    const lastInteractionAt = new Date(previousLead.lastInteractionAt).getTime();

    if (Number.isFinite(lastInteractionAt) && new Date(receivedAt).getTime() - lastInteractionAt < duplicateWindowMs) {
      return true;
    }
  }

  return false;
};

const saveInboundMessage = async (payload) => {
  if (isDatabaseReady()) {
    await WhatsAppInboundMessage.create(payload);
    return;
  }

  runtimeWhatsAppInboundMessages.unshift({
    _id: `wa-in-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...payload,
  });
  runtimeWhatsAppInboundMessages.splice(100);
};

export const processIncomingWhatsAppWebhook = async (payload = {}) => {
  const incomingMessage = extractIncomingMessage(payload);

  if (!incomingMessage?.senderPhone || !incomingMessage.messageText) {
    return {
      success: true,
      ignored: true,
    };
  }

  const settings = await getResolvedWhatsAppSettings();
  const detectedInterest = detectInterest(incomingMessage.normalizedText);
  const detectedQualification = detectQualification(incomingMessage.normalizedText);
  const replyPlan = await getReplyPlan({
    interest: detectedInterest,
    qualification: detectedQualification,
    settings,
  });

  const upsertResult = await upsertLeadFromMessage({
    mobileNumber: incomingMessage.senderPhone,
    name: incomingMessage.senderName,
    interest: detectedInterest,
    qualification: detectedQualification,
    messageText: incomingMessage.messageText,
    receivedAt: incomingMessage.receivedAt,
    conversationStage: replyPlan?.conversationStage || "new",
  });

  const { lead, previousLead } = upsertResult;

  if (!lead) {
    return {
      success: true,
      ignored: true,
    };
  }

  let replyStatus = "received";
  let replyText = "";
  let replyError = "";
  let providerResponse = "";
  let repliedAt = null;

  if (!settings.botEnabled || !settings.automationEnabled || !replyPlan) {
    replyStatus = settings.botEnabled && settings.automationEnabled ? "ignored" : "skipped";
  } else if (
    shouldSkipReply({
      previousLead,
      normalizedText: incomingMessage.normalizedText,
      settings,
      receivedAt: incomingMessage.receivedAt,
    })
  ) {
    replyStatus = "skipped";
    replyError = "Reply skipped due to anti-spam cooldown.";
  } else {
    const sendResult = await sendTemplatedWhatsAppMessage({
      to: incomingMessage.senderPhone,
      templateName: replyPlan.templateName,
      defaultMessage: replyPlan.previewMessage,
      variables: replyPlan.variables,
      category: "auto-reply",
      triggerSource: "system",
      bypassAutomation: true,
    });

    replyText = sendResult.messageBody || replyPlan.previewMessage;
    replyStatus = sendResult.status === "sent" ? "sent" : sendResult.status;
    replyError = sendResult.errorMessage || "";
    providerResponse = sendResult.providerResponse || "";

    if (sendResult.status === "sent") {
      repliedAt = new Date();

      if (isDatabaseReady()) {
        lead.lastBotReplyAt = repliedAt;
        await lead.save();
      } else {
        lead.lastBotReplyAt = repliedAt;
      }
    }
  }

  await saveInboundMessage({
    senderPhone: incomingMessage.senderPhone,
    messageText: incomingMessage.messageText,
    normalizedText: incomingMessage.normalizedText,
    eventType: incomingMessage.eventType,
    detectedInterest,
    detectedQualification,
    botReplyText: replyText,
    replyStatus,
    replyError,
    providerResponse,
    lead: lead._id || lead.id,
    rawPayload: incomingMessage.rawPayload,
    receivedAt: new Date(incomingMessage.receivedAt),
    repliedAt,
  });

  return {
    success: true,
    leadId: String(lead._id || lead.id),
    replyStatus,
  };
};
