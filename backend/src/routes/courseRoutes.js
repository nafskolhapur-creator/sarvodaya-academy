import { Router } from "express";

import { getCourses, getFeaturedCourses } from "../controllers/courseController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCourses));
router.get("/featured", asyncHandler(getFeaturedCourses));

export default router;
