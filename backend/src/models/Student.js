import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { _id: false },
);

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseEnrolled: {
      type: String,
      required: true,
      trim: true,
    },
    courseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    installments: {
      type: [installmentSchema],
      default: [],
    },
    fine: {
      type: Number,
      default: 0,
      min: 0,
    },
    parentContact: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
