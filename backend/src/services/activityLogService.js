import mongoose from "mongoose";

import { runtimeActivityLogs } from "../data/defaultCatalog.js";
import ActivityLog from "../models/ActivityLog.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const createActivityLog = async (payload) => {
  if (isDatabaseReady()) {
    await ActivityLog.create(payload);
    return;
  }

  runtimeActivityLogs.unshift({
    _id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...payload,
  });
  runtimeActivityLogs.splice(100);
};
