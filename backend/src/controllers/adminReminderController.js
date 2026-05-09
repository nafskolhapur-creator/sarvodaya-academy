import { getFeeReminderOverview, runFeeReminderCycle, updateFeeReminderSettings } from "../services/feeReminderService.js";

export const getAdminFeeReminderOverview = async (_req, res) => {
  const overview = await getFeeReminderOverview();
  res.json({ success: true, ...overview });
};

export const updateAdminFeeReminderSettings = async (req, res) => {
  const settings = await updateFeeReminderSettings(req.body);
  res.json({ success: true, settings });
};

export const runAdminFeeReminders = async (req, res) => {
  const result = await runFeeReminderCycle({
    feeRecordId: req.body.feeRecordId,
    triggerSource: "manual",
    referenceDate: new Date(),
  });

  res.json({
    success: true,
    ...result,
  });
};
