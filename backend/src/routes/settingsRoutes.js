import { Router } from "express";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getSettings));
router.put("/", requireAdminAuth, asyncHandler(updateSettings));

export default router;
