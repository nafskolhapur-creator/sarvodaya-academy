import FeeRecord from "../models/FeeRecord.js";
import InstituteSettings from "../models/InstituteSettings.js";
import Student from "../models/Student.js";
import { createActivityLog } from "../services/activityLogService.js";
import { getFeeReminderSettings } from "../services/feeReminderService.js";
import { generateFeeReceipt } from "../services/receiptService.js";
import { sendTemplatedWhatsAppMessage } from "../services/whatsappService.js";
import { buildDueDate, computeFeeState, normalizeFeeReminderSettings } from "../utils/feeUtils.js";
import { buildFileUrl } from "../utils/upload.js";
import { isNonNegativeNumber, isPositiveNumber, isValidDateInput, sanitizeText } from "../utils/validation.js";

const getReminderSettings = async () => normalizeFeeReminderSettings(await getFeeReminderSettings());

const getInstituteSettings = async () => {
  const settings = await InstituteSettings.findOne().lean();

  return (
    settings || {
      instituteName: "Sarvodaya Academy",
      instituteSubtitle: "NAFS Fire and Safety College, Kolhapur",
      affiliation: "Affiliated with NAFS India",
      logoUrl: "",
      contactPhone: "",
      contactEmail: "",
      address: "Kolhapur, Maharashtra, India",
    }
  );
};

const getCollectionSummary = async () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const feeRecords = await FeeRecord.find({
    month: currentMonth,
    year: currentYear,
  }).lean();

  const totalExpected = feeRecords.reduce(
    (sum, record) => sum + Number(record.totalDue || record.amountDue || 0),
    0,
  );
  const totalCollected = feeRecords.reduce(
    (sum, record) => sum + Number(record.payment?.amountPaid || 0),
    0,
  );

  return {
    month: currentMonth,
    year: currentYear,
    totalExpected,
    totalCollected,
    pendingAmount: Math.max(totalExpected - totalCollected, 0),
  };
};

export const listFeeRecords = async (_req, res) => {
  const reminderSettings = await getReminderSettings();
  const feeRecords = await FeeRecord.find()
    .populate("student", "name academicYear courseEnrolled parentContact mobileNumber")
    .sort({ year: -1, month: -1, createdAt: -1 });

  const normalized = await Promise.all(
    feeRecords.map(async (feeRecord) => {
      const nextState = computeFeeState(feeRecord, reminderSettings);

      if (
        feeRecord.lateFee !== nextState.lateFee ||
        feeRecord.totalDue !== nextState.totalDue ||
        feeRecord.status !== nextState.status ||
        feeRecord.lateFeeAmount !== nextState.lateFeeAmount
      ) {
        feeRecord.status = nextState.status;
        feeRecord.lateFeeAmount = nextState.lateFeeAmount;
        feeRecord.lateFee = nextState.lateFee;
        feeRecord.totalDue = nextState.totalDue;
        await feeRecord.save();
      }

      return feeRecord;
    }),
  );

  const collectionSummary = await getCollectionSummary();

  res.json({ success: true, feeRecords: normalized, collectionSummary });
};

export const createFeeRecord = async (req, res) => {
  const month = Number(req.body.month);
  const year = Number(req.body.year);

  if (!req.body.studentId || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year)) {
    return res.status(400).json({
      success: false,
      message: "Student, valid month, and valid year are required for fee records.",
    });
  }

  if (!isPositiveNumber(req.body.amountDue) || !isNonNegativeNumber(req.body.lateFee ?? 0)) {
    return res.status(400).json({
      success: false,
      message: "Amount due must be greater than zero and late fee must be non-negative.",
    });
  }

  const student = await Student.findById(req.body.studentId);
  const reminderSettings = await getReminderSettings();

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found for fee record.",
    });
  }

  const dueDate = buildDueDate(req.body.year, req.body.month, reminderSettings.dueDay);
  const lateFeeAmount = Math.max(
    0,
    Number(req.body.lateFee ?? reminderSettings.defaultLateFee ?? 0) || 0,
  );
  const baseRecord = {
    student: student.id,
    academicYear: student.academicYear,
    year,
    month,
    amountDue: Number(req.body.amountDue),
    lateFeeAmount,
    lateFee: 0,
    totalDue: Number(req.body.amountDue),
    dueDate,
    status: "unpaid",
  };

  const computed = computeFeeState(baseRecord, reminderSettings);

  const feeRecord = await FeeRecord.create({
    ...baseRecord,
    ...computed,
  });

  const populated = await feeRecord.populate("student", "name academicYear courseEnrolled");

  await createActivityLog({
    category: "fee-update",
    status: "success",
    actorRole: "admin",
    actorId: req.admin?.sub || "",
    message: "Fee record created.",
    meta: {
      feeRecordId: feeRecord.id,
      studentId: student.id,
      month,
      year,
      amountDue: feeRecord.amountDue,
    },
  });

  res.status(201).json({ success: true, feeRecord: populated });
};

export const markFeePaid = async (req, res) => {
  const reminderSettings = await getReminderSettings();
  const instituteSettings = await getInstituteSettings();
  const feeRecord = await FeeRecord.findById(req.params.id).populate(
    "student",
    "name academicYear courseEnrolled mobileNumber parentContact",
  );

  if (!feeRecord) {
    return res.status(404).json({
      success: false,
      message: "Fee record not found.",
    });
  }

  const amountPaid = Number(req.body.amountPaid || feeRecord.totalDue || feeRecord.amountDue || 0);

  if (!isPositiveNumber(amountPaid)) {
    return res.status(400).json({
      success: false,
      message: "Amount paid is required.",
    });
  }

  const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
  if (!isValidDateInput(paymentDate)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid payment date.",
    });
  }

  const paymentMode = String(req.body.paymentMode || "").trim();

  if (!["Cash", "UPI", "Bank Transfer"].includes(paymentMode)) {
    return res.status(400).json({
      success: false,
      message: "Payment mode must be Cash, UPI, or Bank Transfer.",
    });
  }

  feeRecord.status = "paid";
  feeRecord.paidDate = paymentDate;
  const computed = computeFeeState(feeRecord, reminderSettings);
  feeRecord.lateFeeAmount = computed.lateFeeAmount;
  feeRecord.lateFee = computed.lateFee;
  feeRecord.totalDue = computed.totalDue;
  feeRecord.payment = {
    paymentDate,
    amountPaid,
    paymentMode,
    transactionId: sanitizeText(req.body.transactionId),
    proofUrl: buildFileUrl(req, req.file) || feeRecord.payment?.proofUrl || "",
    receiptNumber: feeRecord.payment?.receiptNumber || "",
    receiptUrl: feeRecord.payment?.receiptUrl || "",
    receiptGeneratedAt: feeRecord.payment?.receiptGeneratedAt,
    receiptWhatsappStatus: "pending",
    receiptWhatsappSentAt: undefined,
    receiptWhatsappError: "",
  };

  const receipt = await generateFeeReceipt({
    feeRecord,
    payment: feeRecord.payment,
    settings: instituteSettings,
    baseUrl: `${req.protocol}://${req.get("host")}`,
  });

  feeRecord.payment.receiptNumber = receipt.receiptNumber;
  feeRecord.payment.receiptUrl = receipt.receiptUrl;
  feeRecord.payment.receiptGeneratedAt = receipt.receiptGeneratedAt;

  const whatsappResult = await sendTemplatedWhatsAppMessage({
    to: feeRecord.student?.mobileNumber || feeRecord.student?.parentContact,
    templateKey: "paymentReceived",
    defaultMessage: "Payment received successfully. Your receipt is attached.",
    category: "payment-confirmation",
    triggerSource: "system",
    mediaUrl: receipt.receiptUrl,
    fileName: `${receipt.receiptNumber}.pdf`,
    feeRecord: feeRecord._id,
    student: feeRecord.student?._id,
    variables: {
      studentName: feeRecord.student?.name || "Student",
      courseName: feeRecord.student?.courseEnrolled || "Course",
    },
  });

  feeRecord.payment.receiptWhatsappStatus = whatsappResult.status === "sent" ? "sent" : "failed";
  feeRecord.payment.receiptWhatsappSentAt =
    whatsappResult.status === "sent" ? new Date() : undefined;
  feeRecord.payment.receiptWhatsappError = whatsappResult.errorMessage || "";
  await feeRecord.save();

  await createActivityLog({
    category: "fee-update",
    status: "success",
    actorRole: "admin",
    actorId: req.admin?.sub || "",
    message: "Fee payment recorded.",
    meta: {
      feeRecordId: feeRecord.id,
      studentId: feeRecord.student?.id,
      amountPaid,
      paymentMode,
      receiptNumber: feeRecord.payment.receiptNumber,
    },
  });

  return res.json({ success: true, feeRecord });
};

export const deleteFeeRecord = async (req, res) => {
  const deleted = await FeeRecord.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Fee record not found.",
    });
  }

  await createActivityLog({
    category: "fee-update",
    status: "success",
    actorRole: "admin",
    actorId: req.admin?.sub || "",
    message: "Fee record deleted.",
    meta: {
      feeRecordId: req.params.id,
    },
  });

  return res.json({ success: true, message: "Fee record deleted." });
};
