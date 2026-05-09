import mongoose from "mongoose";

export const galleryCategories = [
  "Placement Photos",
  "Student Activities",
  "Industrial Visits",
  "Fire Drill Training",
  "Certifications",
  "Events & Seminars",
];

const galleryItemSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: galleryCategories,
      required: true,
      index: true,
    },
    activityDate: {
      type: Date,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageFileName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
