import mongoose from "mongoose";

const feeReminderLogSchema = new mongoose.Schema(
  {
    feeRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeRecord",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    reminderType: {
      type: String,
      enum: ["reminder", "urgent", "late"],
      required: true,
      index: true,
    },
    triggerSource: {
      type: String,
      enum: ["auto", "manual"],
      default: "auto",
    },
    channel: {
      type: String,
      enum: ["whatsapp"],
      default: "whatsapp",
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    messageBody: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed"],
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
      trim: true,
    },
    errorMessage: {
      type: String,
      trim: true,
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

const FeeReminderLog = mongoose.model("FeeReminderLog", feeReminderLogSchema);

export default FeeReminderLog;
