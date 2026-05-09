import mongoose from "mongoose";

import { runtimeWhatsAppLogs } from "../data/defaultCatalog.js";
import WhatsAppMessageLog from "../models/WhatsAppMessageLog.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const createWhatsAppLog = async (payload) => {
  if (isDatabaseReady()) {
    await WhatsAppMessageLog.create(payload);
    return;
  }

  runtimeWhatsAppLogs.unshift({
    _id: `runtime-wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...payload,
  });
  runtimeWhatsAppLogs.splice(100);
};

export const listWhatsAppLogs = async (limit = 20) => {
  if (isDatabaseReady()) {
    return WhatsAppMessageLog.find()
      .populate("student", "name")
      .populate("feeRecord", "month year")
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();
  }

  return runtimeWhatsAppLogs.slice(0, limit);
};
