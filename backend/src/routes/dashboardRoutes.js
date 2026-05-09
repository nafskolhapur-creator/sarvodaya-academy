import { Router } from "express";

import { getDashboardByRole } from "../controllers/dashboardController.js";

const router = Router();

router.get("/:role", getDashboardByRole);

export default router;
