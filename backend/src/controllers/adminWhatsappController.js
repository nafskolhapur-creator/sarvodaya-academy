import { listWhatsAppLogs } from "../services/whatsappLogService.js";
import { getWhatsAppSettings, updateWhatsAppSettings } from "../services/whatsappConfigService.js";
import { sendTemplatedWhatsAppMessage } from "../services/whatsappService.js";

const TEMPLATE_PREVIEWS = {
  reminder:
    "Reminder: Your monthly fee for [Course Name] is pending. Please pay before 10th to avoid late fee.",
  urgent: "Urgent: Your fee is still pending. Pay before due date to avoid penalty.",
  late: "Your fee is overdue. Late fee has been applied. Kindly pay as soon as possible.",
  paymentReceived: "Payment received successfully. Your receipt is attached.",
  enquiryReply:
    "Hello, thank you for your enquiry at Sarvodaya Academy. Our team will guide you for the best Fire and Safety course options.",
};

export const getWhatsAppAdminOverview = async (_req, res) => {
  const [settings, logs] = await Promise.all([getWhatsAppSettings(), listWhatsAppLogs(20)]);

  res.json({
    success: true,
    settings,
    logs,
  });
};

export const updateWhatsAppAdminSettings = async (req, res) => {
  const settings = await updateWhatsAppSettings({
    apiUrl: req.body.apiUrl,
    apiKey: req.body.apiKey,
    phoneNumber: req.body.phoneNumber,
    automationEnabled: req.body.automationEnabled,
    botEnabled: req.body.botEnabled,
    botReplyDelaySeconds: req.body.botReplyDelaySeconds,
    autoReplies: {
      fees: req.body.autoReplies?.fees,
      course: req.body.autoReplies?.course,
      job: req.body.autoReplies?.job,
      duration: req.body.autoReplies?.duration,
      tenthSuggestion: req.body.autoReplies?.tenthSuggestion,
      twelfthSuggestion: req.body.autoReplies?.twelfthSuggestion,
      graduateSuggestion: req.body.autoReplies?.graduateSuggestion,
    },
    templates: {
      paymentReceived: req.body.templates?.paymentReceived,
      enquiryReply: req.body.templates?.enquiryReply,
    },
  });

  res.json({ success: true, settings });
};

export const sendManualWhatsAppMessage = async (req, res) => {
  const recipientPhone = String(req.body.to || "").trim();
  const templateKey = String(req.body.templateKey || "").trim();
  const bodyValues = Array.isArray(req.body.bodyValues)
    ? req.body.bodyValues
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    : [];

  if (!recipientPhone || !templateKey) {
    return res.status(400).json({
      success: false,
      message: "Recipient phone number and Interakt template are required.",
    });
  }

  if (!TEMPLATE_PREVIEWS[templateKey]) {
    return res.status(400).json({
      success: false,
      message: "Unsupported Interakt template key.",
    });
  }

  const result = await sendTemplatedWhatsAppMessage({
    to: recipientPhone,
    templateKey,
    defaultMessage: TEMPLATE_PREVIEWS[templateKey] || `Interakt template: ${templateKey}`,
    bodyValues,
    category: "manual",
    triggerSource: "manual",
    bypassAutomation: true,
  });

  if (!result.success) {
    return res.status(502).json({
      success: false,
      message: result.errorMessage || "Failed to send Interakt template.",
      result,
    });
  }

  res.json({ success: true, result });
};
