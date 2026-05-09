import { Router } from "express";

import { handleWhatsAppWebhook } from "../controllers/whatsappWebhookController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/webhook", asyncHandler(handleWhatsAppWebhook));

export default router;
