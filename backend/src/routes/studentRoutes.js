import { Router } from "express";

import {
  applyForJob,
  getStudentCertificates,
  getStudentFees,
  getStudentJobs,
  getStudentMaterials,
  getStudentPlacements,
  getStudentProfile,
  getStudentTests,
  submitStudentTest,
} from "../controllers/studentController.js";
import { requireStudentAuth } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(requireStudentAuth);

router.get("/profile", asyncHandler(getStudentProfile));
router.get("/fees", asyncHandler(getStudentFees));
router.get("/materials", asyncHandler(getStudentMaterials));
router.get("/tests", asyncHandler(getStudentTests));
router.post("/tests/:id/submit", asyncHandler(submitStudentTest));
router.get("/jobs", asyncHandler(getStudentJobs));
router.post("/jobs/:id/apply", asyncHandler(applyForJob));
router.get("/certificates", asyncHandler(getStudentCertificates));
router.get("/placements", asyncHandler(getStudentPlacements));

export default router;
