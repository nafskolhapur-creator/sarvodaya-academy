import { processIncomingWhatsAppWebhook } from "../services/whatsappBotService.js";

export const handleWhatsAppWebhook = async (req, res) => {
  const payload = req.body || {};

  processIncomingWhatsAppWebhook(payload).catch((error) => {
    console.error("WhatsApp webhook processing failed:", error);
  });

  res.status(200).json({
    success: true,
    accepted: true,
  });
};
