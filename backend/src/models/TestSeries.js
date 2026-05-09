import mongoose from "mongoose";

const testSeriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    courseName: {
      type: String,
      default: "",
      trim: true,
    },
    googleFormUrl: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const TestSeries = mongoose.model("TestSeries", testSeriesSchema);

export default TestSeries;
