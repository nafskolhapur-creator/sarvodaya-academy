import mongoose from "mongoose";

const placementRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    salaryAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    salaryPeriod: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfJoining: {
      type: Date,
    },
    placementStatus: {
      type: String,
      enum: ["Not Placed", "In Process", "Placed"],
      default: "Not Placed",
      index: true,
    },
    offerLetterUrl: {
      type: String,
      default: "",
    },
    offerLetterFileName: {
      type: String,
      default: "",
      trim: true,
    },
    successStoryDescription: {
      type: String,
      default: "",
      trim: true,
    },
    studentPhotoUrl: {
      type: String,
      default: "",
    },
    companyLogoUrl: {
      type: String,
      default: "",
    },
    highlightOnHomepage: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const PlacementRecord = mongoose.model("PlacementRecord", placementRecordSchema);

export default PlacementRecord;
