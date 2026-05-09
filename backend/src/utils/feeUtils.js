import { defaultInstituteSettings, runtimeInstituteSettings } from "../data/defaultCatalog.js";

const defaultConfig = defaultInstituteSettings.feeReminderConfig;

export const normalizeFeeReminderSettings = (settings = {}) => {
  const runtimeConfig = runtimeInstituteSettings.feeReminderConfig || {};
  const source = settings?.feeReminderConfig || settings || {};
  const dueDay = Number(source.dueDay ?? runtimeConfig.dueDay ?? defaultConfig.dueDay);
  const reminderDay = Number(
    source.reminderDay ?? runtimeConfig.reminderDay ?? defaultConfig.reminderDay,
  );
  const urgentReminderDay = Number(
    source.urgentReminderDay ?? runtimeConfig.urgentReminderDay ?? defaultConfig.urgentReminderDay,
  );

  return {
    autoRemindersEnabled: Boolean(
      source.autoRemindersEnabled ??
        runtimeConfig.autoRemindersEnabled ??
        defaultConfig.autoRemindersEnabled,
    ),
    dueDay: Math.min(28, Math.max(1, dueDay || defaultConfig.dueDay)),
    reminderDay: Math.min(28, Math.max(1, reminderDay || defaultConfig.reminderDay)),
    urgentReminderDay: Math.min(28, Math.max(1, urgentReminderDay || defaultConfig.urgentReminderDay)),
    defaultLateFee: Math.max(
      0,
      Number(source.defaultLateFee ?? runtimeConfig.defaultLateFee ?? defaultConfig.defaultLateFee) || 0,
    ),
    templates: {
      reminder:
        source.templates?.reminder ||
        runtimeConfig.templates?.reminder ||
        defaultConfig.templates.reminder,
      urgent:
        source.templates?.urgent || runtimeConfig.templates?.urgent || defaultConfig.templates.urgent,
      late: source.templates?.late || runtimeConfig.templates?.late || defaultConfig.templates.late,
    },
  };
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const buildDueDate = (year, month, dueDay) =>
  new Date(Number(year), Number(month) - 1, Number(dueDay));

export const getConfiguredLateFee = (feeRecord, settings) =>
  Math.max(
    0,
    Number(feeRecord?.lateFeeAmount ?? feeRecord?.lateFee ?? settings.defaultLateFee ?? 0) || 0,
  );

export const computeFeeState = (feeRecord, settings, referenceDate = new Date()) => {
  const baseAmount = Number(feeRecord.amountDue || 0);
  const configuredLateFee = getConfiguredLateFee(feeRecord, settings);
  const dueDate = new Date(feeRecord.dueDate);
  const statusReferenceDate =
    feeRecord.status === "paid" && feeRecord.paidDate ? new Date(feeRecord.paidDate) : referenceDate;
  const isLate = statusReferenceDate > endOfDay(dueDate);
  const appliedLateFee = isLate ? Math.max(Number(feeRecord.lateFee || 0), configuredLateFee) : 0;

  return {
    lateFeeAmount: configuredLateFee,
    lateFee: appliedLateFee,
    totalDue: baseAmount + appliedLateFee,
    status: feeRecord.status === "paid" ? "paid" : isLate ? "late" : "unpaid",
  };
};

export const getFeeReminderType = (feeRecord, settings, referenceDate = new Date()) => {
  if (feeRecord.status === "paid") {
    return null;
  }

  const today = new Date(referenceDate);
  const dayOfMonth = today.getDate();
  const dueDay = new Date(feeRecord.dueDate).getDate();

  if (feeRecord.status === "late" || dayOfMonth > dueDay) {
    return "late";
  }

  if (dayOfMonth >= settings.urgentReminderDay) {
    return "urgent";
  }

  return "reminder";
};

export const getFeeReminderTypeForAutoRun = (feeRecord, settings, referenceDate = new Date()) => {
  if (feeRecord.status === "paid") {
    return null;
  }

  const today = new Date(referenceDate);
  const dayOfMonth = today.getDate();
  const dueDay = new Date(feeRecord.dueDate).getDate();

  if (dayOfMonth === settings.reminderDay && dayOfMonth < dueDay) {
    return "reminder";
  }

  if (dayOfMonth === settings.urgentReminderDay && dayOfMonth < dueDay) {
    return "urgent";
  }

  if (dayOfMonth > dueDay) {
    return "late";
  }

  return null;
};

export const formatReminderTemplate = (template, context) => {
  const replacements = {
    "{{courseName}}": context.courseName,
    "[Course Name]": context.courseName,
    "{{dueDay}}": String(context.dueDay),
    "[Due Day]": String(context.dueDay),
    "{{studentName}}": context.studentName,
    "[Student Name]": context.studentName,
    "{{monthName}}": context.monthName,
    "[Month Name]": context.monthName,
  };

  return Object.entries(replacements).reduce(
    (message, [searchValue, replacement]) => message.split(searchValue).join(replacement || ""),
    template,
  );
};

export const getMonthName = (monthNumber) =>
  new Date(2000, Number(monthNumber) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });
