import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      default: "whatsapp-bot",
      trim: true,
    },
    interest: {
      type: String,
      default: "",
      trim: true,
    },
    qualification: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Not Interested", "Converted"],
      default: "New",
      index: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    lastMessageText: {
      type: String,
      default: "",
      trim: true,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastBotReplyAt: {
      type: Date,
    },
    conversationStage: {
      type: String,
      enum: ["new", "awaiting-qualification", "qualified"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
