import { Router } from "express";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { brandingAssetUpload } from "../utils/upload.js";

const router = Router();

router.get("/", asyncHandler(getSettings));
router.put(
  "/",
  requireAdminAuth,
  brandingAssetUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  asyncHandler(updateSettings),
);

export default router;
