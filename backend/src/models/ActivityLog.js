import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["student-login", "admin-login", "fee-update"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true,
    },
    actorRole: {
      type: String,
      enum: ["student", "admin", "system", "unknown"],
      default: "system",
    },
    actorId: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
