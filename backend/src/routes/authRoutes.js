import { Router } from "express";

import { getStudentSession, login } from "../controllers/authController.js";
import { authRateLimit } from "../middleware/rateLimitMiddleware.js";
import { requireStudentAuth } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", authRateLimit, asyncHandler(login));
router.get("/me", requireStudentAuth, asyncHandler(getStudentSession));

export default router;
