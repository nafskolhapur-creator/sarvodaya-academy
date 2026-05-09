import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      trim: true,
    },
    board: {
      type: String,
      enum: ["NAFS", "NBVTE", "MSBTE"],
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ board: 1, eligibility: 1, featured: -1, popular: -1 });

const Course = mongoose.model("Course", courseSchema);

export default Course;
