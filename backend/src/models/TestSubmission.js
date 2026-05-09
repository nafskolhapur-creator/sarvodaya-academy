import mongoose from "mongoose";

const testSubmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    testSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSeries",
      required: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  },
);

testSubmissionSchema.index({ student: 1, testSeries: 1 }, { unique: true });

const TestSubmission = mongoose.model("TestSubmission", testSubmissionSchema);

export default TestSubmission;
