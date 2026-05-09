import mongoose from "mongoose";

const whatsAppMessageLogSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["fee-reminder", "payment-confirmation", "manual", "enquiry-reply", "auto-reply"],
      required: true,
      index: true,
    },
    templateKey: {
      type: String,
      trim: true,
      default: "",
    },
    triggerSource: {
      type: String,
      enum: ["auto", "manual", "system"],
      default: "system",
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    messageBody: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: "interakt",
      trim: true,
    },
    providerMessageId: {
      type: String,
      default: "",
      trim: true,
    },
    providerResponse: {
      type: String,
      default: "",
      trim: true,
    },
    errorMessage: {
      type: String,
      default: "",
      trim: true,
    },
    feeRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeRecord",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const WhatsAppMessageLog = mongoose.model("WhatsAppMessageLog", whatsAppMessageLogSchema);

export default WhatsAppMessageLog;
