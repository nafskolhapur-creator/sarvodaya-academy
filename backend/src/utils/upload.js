import fs from "fs";
import path from "path";

import multer from "multer";

const uploadRoot = path.resolve(process.cwd(), "uploads");

const ensureDirectory = (folderName) => {
  const target = path.join(uploadRoot, folderName);

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  return target;
};

const createStorage = (folderName) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, ensureDirectory(folderName));
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname);
      const baseName = path
        .basename(file.originalname, extension)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      callback(null, `${Date.now()}-${baseName || "file"}${extension}`);
    },
  });

const fileFilterByMime = (allowedMimes) => (_req, file, callback) => {
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error("Unsupported file type."));
};

export const studentPhotoUpload = multer({
  storage: createStorage("students"),
  fileFilter: fileFilterByMime(["image/jpeg", "image/png"]),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const studyMaterialUpload = multer({
  storage: createStorage("materials"),
  fileFilter: fileFilterByMime([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const pdfUpload = multer({
  storage: createStorage("interviews"),
  fileFilter: fileFilterByMime(["application/pdf"]),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const certificateUpload = multer({
  storage: createStorage("certificates"),
  fileFilter: fileFilterByMime(["application/pdf", "image/jpeg", "image/png"]),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const paymentProofUpload = multer({
  storage: createStorage("payments"),
  fileFilter: fileFilterByMime(["application/pdf", "image/jpeg", "image/png"]),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const placementAssetUpload = multer({
  storage: createStorage("placements"),
  fileFilter: fileFilterByMime(["application/pdf", "image/jpeg", "image/png"]),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const galleryImageUpload = multer({
  storage: createStorage("gallery"),
  fileFilter: fileFilterByMime(["image/jpeg", "image/png"]),
  limits: { fileSize: 6 * 1024 * 1024 },
});

export const buildFileUrl = (req, file) => {
  if (!file) {
    return "";
  }

  return `${req.protocol}://${req.get("host")}/uploads/${file.destination.split(path.sep).pop()}/${file.filename}`;
};
