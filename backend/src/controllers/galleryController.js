import path from "path";

import GalleryItem, { galleryCategories } from "../models/GalleryItem.js";
import { buildFileUrl } from "../utils/upload.js";
import { isValidDateInput, sanitizeText } from "../utils/validation.js";

const normalizeGalleryItem = (item) => ({
  _id: item._id?.toString?.() || item._id,
  title: item.title,
  description: item.description,
  category: item.category,
  activityDate: item.activityDate,
  imageUrl: item.imageUrl,
  imageFileName: item.imageFileName,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const normalizeTitleForBatch = (title, file, index, total) => {
  if (title) {
    return total > 1 ? `${title} ${index + 1}` : title;
  }

  const extension = path.extname(file.originalname);
  const base = path.basename(file.originalname, extension).replace(/[-_]+/g, " ").trim();
  return base || `Gallery Image ${index + 1}`;
};

const isAllowedCategory = (value) => galleryCategories.includes(value);

export const listGalleryItems = async (req, res) => {
  const filters = {};
  const selectedCategory = sanitizeText(req.query.category);
  const limit = Math.min(Math.max(Number(req.query.limit || 0), 0), 48);

  if (selectedCategory && isAllowedCategory(selectedCategory)) {
    filters.category = selectedCategory;
  }

  const query = GalleryItem.find(filters).sort({ activityDate: -1, createdAt: -1 });
  const items = limit ? await query.limit(limit) : await query;

  res.json({
    success: true,
    categories: galleryCategories,
    items: items.map((item) => normalizeGalleryItem(item.toObject())),
  });
};

export const listAdminGalleryItems = async (_req, res) => {
  const items = await GalleryItem.find().sort({ activityDate: -1, createdAt: -1 });

  res.json({
    success: true,
    categories: galleryCategories,
    items: items.map((item) => normalizeGalleryItem(item.toObject())),
  });
};

export const createGalleryItems = async (req, res) => {
  const title = sanitizeText(req.body.title);
  const description = sanitizeText(req.body.description);
  const category = sanitizeText(req.body.category);
  const activityDate = req.body.activityDate;
  const files = req.files || [];

  if (!files.length) {
    return res.status(400).json({ success: false, message: "At least one image is required." });
  }

  if (!isAllowedCategory(category)) {
    return res.status(400).json({ success: false, message: "Please choose a valid gallery category." });
  }

  if (!isValidDateInput(activityDate)) {
    return res.status(400).json({ success: false, message: "Please provide a valid activity date." });
  }

  const payload = files.map((file, index) => ({
    title: normalizeTitleForBatch(title, file, index, files.length),
    description,
    category,
    activityDate,
    imageUrl: buildFileUrl(req, file),
    imageFileName: file.originalname || "",
  }));

  const createdItems = await GalleryItem.insertMany(payload);

  res.status(201).json({
    success: true,
    items: createdItems.map((item) => normalizeGalleryItem(item.toObject())),
  });
};

export const updateGalleryItem = async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: "Gallery item not found." });
  }

  if (req.body.title !== undefined) {
    item.title = sanitizeText(req.body.title);
  }

  if (req.body.description !== undefined) {
    item.description = sanitizeText(req.body.description);
  }

  if (req.body.category !== undefined) {
    const category = sanitizeText(req.body.category);

    if (!isAllowedCategory(category)) {
      return res.status(400).json({ success: false, message: "Please choose a valid gallery category." });
    }

    item.category = category;
  }

  if (req.body.activityDate !== undefined) {
    if (!isValidDateInput(req.body.activityDate)) {
      return res.status(400).json({ success: false, message: "Please provide a valid activity date." });
    }

    item.activityDate = req.body.activityDate;
  }

  if (!item.title) {
    return res.status(400).json({ success: false, message: "Gallery title is required." });
  }

  if (req.file) {
    item.imageUrl = buildFileUrl(req, req.file);
    item.imageFileName = req.file.originalname || "";
  }

  await item.save();

  res.json({ success: true, item: normalizeGalleryItem(item.toObject()) });
};

export const deleteGalleryItem = async (req, res) => {
  const deleted = await GalleryItem.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Gallery item not found." });
  }

  res.json({ success: true, message: "Gallery item deleted." });
};
