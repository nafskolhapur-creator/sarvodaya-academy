import mongoose from "mongoose";

const whatsAppInboundMessageSchema = new mongoose.Schema(
  {
    senderPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    messageText: {
      type: String,
      default: "",
      trim: true,
    },
    normalizedText: {
      type: String,
      default: "",
      trim: true,
    },
    eventType: {
      type: String,
      default: "message_received",
      trim: true,
    },
    detectedInterest: {
      type: String,
      default: "",
      trim: true,
    },
    detectedQualification: {
      type: String,
      default: "",
      trim: true,
    },
    botReplyText: {
      type: String,
      default: "",
      trim: true,
    },
    replyStatus: {
      type: String,
      enum: ["received", "sent", "skipped", "failed", "ignored"],
      default: "received",
      index: true,
    },
    replyError: {
      type: String,
      default: "",
      trim: true,
    },
    providerResponse: {
      type: String,
      default: "",
      trim: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppInboundMessage = mongoose.model("WhatsAppInboundMessage", whatsAppInboundMessageSchema);

export default WhatsAppInboundMessage;
