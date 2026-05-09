import { Router } from "express";

import { getPlacementHighlights } from "../controllers/placementController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/highlights", asyncHandler(getPlacementHighlights));

export default router;
