import { runFeeReminderCycle } from "./feeReminderService.js";

let schedulerHandle = null;

const computeDelayToNextRun = () => {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(9, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
};

const queueNextRun = () => {
  schedulerHandle = setTimeout(async () => {
    try {
      await runFeeReminderCycle({
        triggerSource: "auto",
        referenceDate: new Date(),
      });
    } catch (error) {
      console.error("Fee reminder scheduler error:", error.message);
    } finally {
      queueNextRun();
    }
  }, computeDelayToNextRun());
};

export const startFeeReminderScheduler = () => {
  if (schedulerHandle) {
    return;
  }

  queueNextRun();
};
