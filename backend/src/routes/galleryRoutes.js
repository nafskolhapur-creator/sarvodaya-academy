import { Router } from "express";

import { listGalleryItems } from "../controllers/galleryController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listGalleryItems));

export default router;
