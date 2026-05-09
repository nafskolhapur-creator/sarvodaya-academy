import mongoose from "mongoose";

import { runtimeFeeReminderLogs, runtimeInstituteSettings } from "../data/defaultCatalog.js";
import FeeRecord from "../models/FeeRecord.js";
import FeeReminderLog from "../models/FeeReminderLog.js";
import InstituteSettings from "../models/InstituteSettings.js";
import {
  computeFeeState,
  formatReminderTemplate,
  getFeeReminderType,
  getFeeReminderTypeForAutoRun,
  getMonthName,
  normalizeFeeReminderSettings,
} from "../utils/feeUtils.js";
import { sendTemplatedWhatsAppMessage } from "./whatsappService.js";

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const getFeeReminderSettings = async () => {
  if (isDatabaseReady()) {
    const settings = await InstituteSettings.findOne().lean();
    return normalizeFeeReminderSettings(settings || {});
  }

  return normalizeFeeReminderSettings(runtimeInstituteSettings);
};

export const updateFeeReminderSettings = async (payload) => {
  const currentSettings = await getFeeReminderSettings();
  const nextSettings = normalizeFeeReminderSettings({
    feeReminderConfig: {
      ...currentSettings,
      ...payload,
      templates: {
        ...currentSettings.templates,
        ...payload.templates,
      },
    },
  });

  if (isDatabaseReady()) {
    let settings = await InstituteSettings.findOne();

    if (!settings) {
      settings = await InstituteSettings.create({
        ...runtimeInstituteSettings,
        feeReminderConfig: nextSettings,
      });
    } else {
      settings.feeReminderConfig = nextSettings;
      await settings.save();
    }
  } else {
    runtimeInstituteSettings.feeReminderConfig = {
      ...nextSettings,
      templates: {
        ...nextSettings.templates,
      },
    };
  }

  return nextSettings;
};

const saveFeeRecordState = async (feeRecord, nextState) => {
  if (
    feeRecord.status !== nextState.status ||
    feeRecord.lateFee !== nextState.lateFee ||
    feeRecord.totalDue !== nextState.totalDue ||
    feeRecord.lateFeeAmount !== nextState.lateFeeAmount
  ) {
    feeRecord.status = nextState.status;
    feeRecord.lateFee = nextState.lateFee;
    feeRecord.totalDue = nextState.totalDue;
    feeRecord.lateFeeAmount = nextState.lateFeeAmount;
    await feeRecord.save();
  }

  return feeRecord;
};

const createRuntimeLog = (logEntry) => {
  runtimeFeeReminderLogs.unshift({
    _id: `runtime-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...logEntry,
  });
  runtimeFeeReminderLogs.splice(100);
};

const hasAutoReminderBeenSent = async ({ feeRecordId, reminderType, referenceDate, isLate }) => {
  if (!isDatabaseReady()) {
    return runtimeFeeReminderLogs.some((log) => {
      const isSameFee = String(log.feeRecord) === String(feeRecordId);
      const isSameType = log.reminderType === reminderType && log.status === "sent";
      const sentAt = new Date(log.sentAt);
      const sameDay = sentAt >= startOfDay(referenceDate) && sentAt <= endOfDay(referenceDate);
      return isSameFee && isSameType && (isLate ? true : sameDay);
    });
  }

  const query = {
    feeRecord: feeRecordId,
    reminderType,
    status: "sent",
  };

  if (!isLate) {
    query.sentAt = {
      $gte: startOfDay(referenceDate),
      $lte: endOfDay(referenceDate),
    };
  }

  const existingLog = await FeeReminderLog.findOne(query).lean();
  return Boolean(existingLog);
};

const listRecentLogs = async () => {
  if (!isDatabaseReady()) {
    return runtimeFeeReminderLogs.slice(0, 12);
  }

  return FeeReminderLog.find()
    .populate("student", "name")
    .populate("feeRecord", "month year")
    .sort({ sentAt: -1 })
    .limit(12)
    .lean();
};

const buildReminderContext = (feeRecord, settings) => ({
  courseName: feeRecord.student?.courseEnrolled || "your course",
  dueDay: new Date(feeRecord.dueDate).getDate() || settings.dueDay,
  studentName: feeRecord.student?.name || "Student",
  monthName: getMonthName(feeRecord.month),
});

const createLogEntry = async ({
  feeRecord,
  reminderType,
  triggerSource,
  body,
  recipientPhone,
  sendResult,
  sentAt,
}) => {
  const logPayload = {
    feeRecord: feeRecord._id || feeRecord.id,
    student: feeRecord.student?._id || feeRecord.student?.id || feeRecord.student,
    reminderType,
    triggerSource,
    recipientPhone,
    messageBody: body,
    status: sendResult.status === "sent" ? "sent" : "failed",
    provider: sendResult.provider || "interakt",
    providerMessageId: sendResult.providerMessageId || "",
    errorMessage: sendResult.errorMessage || "",
    sentAt,
  };

  if (isDatabaseReady()) {
    await FeeReminderLog.create(logPayload);
  } else {
    createRuntimeLog(logPayload);
  }
};

const sendFeeReminder = async ({
  feeRecord,
  reminderType,
  triggerSource,
  sentAt,
  settings,
}) => {
  const template = settings.templates[reminderType];
  const context = buildReminderContext(feeRecord, settings);
  const body = formatReminderTemplate(template, context);
  const recipientPhone = feeRecord.student?.mobileNumber || feeRecord.student?.parentContact || "";
  const sendResult = await sendTemplatedWhatsAppMessage({
    to: recipientPhone,
    templateKey: reminderType,
    defaultMessage: template,
    variables: {
      courseName: context.courseName,
      dueDay: context.dueDay,
      studentName: context.studentName,
      monthName: context.monthName,
    },
    category: "fee-reminder",
    triggerSource,
    feeRecord: feeRecord._id || feeRecord.id,
    student: feeRecord.student?._id || feeRecord.student?.id || feeRecord.student,
  });

  feeRecord.reminderSummary = {
    lastReminderType: reminderType,
    lastReminderSentAt: sentAt,
    lastReminderStatus: sendResult.status,
  };
  await feeRecord.save();

  await createLogEntry({
    feeRecord,
    reminderType,
    triggerSource,
    body,
    recipientPhone: sendResult.recipientPhone || recipientPhone,
    sendResult,
    sentAt,
  });

  return sendResult;
};

const getReminderCandidates = async (feeRecordId) => {
  const query = feeRecordId ? { _id: feeRecordId } : { status: { $ne: "paid" } };

  return FeeRecord.find(query)
    .populate("student", "name mobileNumber parentContact courseEnrolled")
    .sort({ dueDate: 1 });
};

export const getFeeReminderOverview = async (referenceDate = new Date()) => {
  const settings = await getFeeReminderSettings();
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);

  if (!isDatabaseReady()) {
    return {
      settings,
      summary: {
        autoRemindersEnabled: settings.autoRemindersEnabled,
        unpaidCount: 0,
        lateCount: 0,
        messagesToday: runtimeFeeReminderLogs.filter((log) => {
          const sentAt = new Date(log.sentAt);
          return sentAt >= todayStart && sentAt <= todayEnd;
        }).length,
      },
      dueToday: [],
      overdue: [],
      logs: runtimeFeeReminderLogs.slice(0, 12),
    };
  }

  const [unpaidCount, lateCount, messagesToday, dueToday, overdue, logs] = await Promise.all([
    FeeRecord.countDocuments({ status: { $ne: "paid" } }),
    FeeRecord.countDocuments({
      status: { $ne: "paid" },
      dueDate: { $lt: todayStart },
    }),
    FeeReminderLog.countDocuments({
      sentAt: { $gte: todayStart, $lte: todayEnd },
    }),
    FeeRecord.find({
      status: { $ne: "paid" },
      dueDate: { $gte: todayStart, $lte: todayEnd },
    })
      .populate("student", "name courseEnrolled")
      .sort({ dueDate: 1 })
      .limit(8)
      .lean(),
    FeeRecord.find({
      status: { $ne: "paid" },
      dueDate: { $lt: todayStart },
    })
      .populate("student", "name courseEnrolled")
      .sort({ dueDate: 1 })
      .limit(8)
      .lean(),
    listRecentLogs(),
  ]);

  return {
    settings,
    summary: {
      autoRemindersEnabled: settings.autoRemindersEnabled,
      unpaidCount,
      lateCount,
      messagesToday,
    },
    dueToday,
    overdue,
    logs,
  };
};

export const runFeeReminderCycle = async ({
  feeRecordId,
  triggerSource = "auto",
  referenceDate = new Date(),
} = {}) => {
  const settings = await getFeeReminderSettings();

  if (triggerSource === "auto" && !settings.autoRemindersEnabled) {
    return {
      success: true,
      settings,
      results: [],
      summary: {
        processed: 0,
        sent: 0,
        failed: 0,
        lateMarked: 0,
        skipped: 0,
      },
    };
  }

  if (!isDatabaseReady()) {
    return {
      success: false,
      message: "Database connection is required for automated fee reminders.",
      results: [],
      summary: {
        processed: 0,
        sent: 0,
        failed: 0,
        lateMarked: 0,
        skipped: 0,
      },
    };
  }

  const feeRecords = await getReminderCandidates(feeRecordId);
  const results = [];
  let sent = 0;
  let failed = 0;
  let lateMarked = 0;
  let skipped = 0;

  for (const feeRecord of feeRecords) {
    const nextState = computeFeeState(feeRecord, settings, referenceDate);
    const wasLate = feeRecord.status === "late";
    await saveFeeRecordState(feeRecord, nextState);

    if (!wasLate && nextState.status === "late") {
      lateMarked += 1;
    }

    const reminderType =
      triggerSource === "manual"
        ? getFeeReminderType(feeRecord, settings, referenceDate)
        : getFeeReminderTypeForAutoRun(feeRecord, settings, referenceDate);

    if (!reminderType) {
      skipped += 1;
      results.push({
        feeRecordId: feeRecord.id,
        studentName: feeRecord.student?.name,
        status: "skipped",
        reason: "No reminder scheduled for this record today.",
      });
      continue;
    }

    const alreadySent = triggerSource === "auto"
      ? await hasAutoReminderBeenSent({
          feeRecordId: feeRecord.id,
          reminderType,
          referenceDate,
          isLate: reminderType === "late",
        })
      : false;

    if (alreadySent) {
      skipped += 1;
      results.push({
        feeRecordId: feeRecord.id,
        studentName: feeRecord.student?.name,
        status: "skipped",
        reason: "Reminder already sent for this fee cycle.",
      });
      continue;
    }

    const sendResult = await sendFeeReminder({
      feeRecord,
      reminderType,
      triggerSource,
      sentAt: new Date(referenceDate),
      settings,
    });

    if (sendResult.success) {
      sent += 1;
    } else if (sendResult.status === "skipped") {
      skipped += 1;
    } else {
      failed += 1;
    }

    results.push({
      feeRecordId: feeRecord.id,
      studentName: feeRecord.student?.name,
      status: sendResult.status,
      reminderType,
      errorMessage: sendResult.errorMessage || "",
    });
  }

  return {
    success: failed === 0,
    settings,
    results,
    summary: {
      processed: feeRecords.length,
      sent,
      failed,
      lateMarked,
      skipped,
    },
  };
};
