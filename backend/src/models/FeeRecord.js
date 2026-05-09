import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    paymentDate: {
      type: Date,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer"],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },
    proofUrl: {
      type: String,
      default: "",
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: "",
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    receiptGeneratedAt: {
      type: Date,
    },
    receiptWhatsappStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    receiptWhatsappSentAt: {
      type: Date,
    },
    receiptWhatsappError: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const feeRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "late"],
      default: "unpaid",
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    payment: {
      type: feePaymentSchema,
    },
    reminderSummary: {
      lastReminderType: {
        type: String,
        enum: ["reminder", "urgent", "late"],
      },
      lastReminderSentAt: {
        type: Date,
      },
      lastReminderStatus: {
        type: String,
        enum: ["sent", "failed"],
      },
    },
  },
  {
    timestamps: true,
  },
);

feeRecordSchema.index({ student: 1, year: 1, month: 1 }, { unique: true });

const FeeRecord = mongoose.model("FeeRecord", feeRecordSchema);

export default FeeRecord;
