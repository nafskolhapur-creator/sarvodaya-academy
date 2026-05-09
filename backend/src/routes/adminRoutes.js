import { Router } from "express";

import { getAdminSession, loginAdmin } from "../controllers/adminAuthController.js";
import { createAdminCourse, deleteAdminCourse, getAdminCourses, getCourseSettings, updateAdminCourse, updateCourseSettings } from "../controllers/adminCourseController.js";
import { createCertificate, createInterviewResource, createJobPosting, createStudyMaterial, createTestSeries, deleteCertificate, deleteInterviewResource, deleteJobPosting, deleteStudyMaterial, deleteTestSeries, listCertificates, listInterviewResources, listJobPostings, listStudyMaterials, listTestSeries, toggleJobApplicant, updateJobPosting, updateStudyMaterial, updateTestSeries } from "../controllers/adminContentController.js";
import { createFeeRecord, deleteFeeRecord, listFeeRecords, markFeePaid } from "../controllers/adminFeeController.js";
import { createGalleryItems, deleteGalleryItem, listAdminGalleryItems, updateGalleryItem } from "../controllers/galleryController.js";
import { getAdminLeads, updateAdminLead } from "../controllers/adminLeadController.js";
import { getAdminOverview } from "../controllers/adminOverviewController.js";
import { createPlacementRecord, deletePlacementRecord, listPlacementRecords, updatePlacementRecord } from "../controllers/placementController.js";
import { getAdminFeeReminderOverview, runAdminFeeReminders, updateAdminFeeReminderSettings } from "../controllers/adminReminderController.js";
import { createStudent, deleteStudent, listStudents, updateStudent } from "../controllers/adminStudentController.js";
import { getWhatsAppAdminOverview, sendManualWhatsAppMessage, updateWhatsAppAdminSettings } from "../controllers/adminWhatsappController.js";
import { requireAdminAuth } from "../middleware/authMiddleware.js";
import { authRateLimit } from "../middleware/rateLimitMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { certificateUpload, galleryImageUpload, paymentProofUpload, pdfUpload, placementAssetUpload, studentPhotoUpload, studyMaterialUpload } from "../utils/upload.js";

const router = Router();

router.post("/auth/login", authRateLimit, asyncHandler(loginAdmin));
router.get("/auth/me", requireAdminAuth, asyncHandler(getAdminSession));

router.use(requireAdminAuth);

router.get("/overview", asyncHandler(getAdminOverview));
router.get("/course-settings", asyncHandler(getCourseSettings));
router.put("/course-settings", asyncHandler(updateCourseSettings));
router.get("/courses", asyncHandler(getAdminCourses));
router.post("/courses", asyncHandler(createAdminCourse));
router.put("/courses/:id", asyncHandler(updateAdminCourse));
router.delete("/courses/:id", asyncHandler(deleteAdminCourse));
router.get("/whatsapp", asyncHandler(getWhatsAppAdminOverview));
router.put("/whatsapp", asyncHandler(updateWhatsAppAdminSettings));
router.post("/whatsapp/send", asyncHandler(sendManualWhatsAppMessage));
router.get("/leads", asyncHandler(getAdminLeads));
router.put("/leads/:id", asyncHandler(updateAdminLead));

router.get("/students", asyncHandler(listStudents));
router.post("/students", studentPhotoUpload.single("photo"), asyncHandler(createStudent));
router.put("/students/:id", studentPhotoUpload.single("photo"), asyncHandler(updateStudent));
router.delete("/students/:id", asyncHandler(deleteStudent));

router.get("/fees", asyncHandler(listFeeRecords));
router.post("/fees", asyncHandler(createFeeRecord));
router.put("/fees/:id/pay", paymentProofUpload.single("proof"), asyncHandler(markFeePaid));
router.delete("/fees/:id", asyncHandler(deleteFeeRecord));
router.get("/fee-reminders", asyncHandler(getAdminFeeReminderOverview));
router.put("/fee-reminders/settings", asyncHandler(updateAdminFeeReminderSettings));
router.post("/fee-reminders/run", asyncHandler(runAdminFeeReminders));

router.get("/materials", asyncHandler(listStudyMaterials));
router.post("/materials", studyMaterialUpload.single("file"), asyncHandler(createStudyMaterial));
router.put("/materials/:id", studyMaterialUpload.single("file"), asyncHandler(updateStudyMaterial));
router.delete("/materials/:id", asyncHandler(deleteStudyMaterial));

router.get("/gallery", asyncHandler(listAdminGalleryItems));
router.post("/gallery", galleryImageUpload.array("images", 12), asyncHandler(createGalleryItems));
router.put("/gallery/:id", galleryImageUpload.single("image"), asyncHandler(updateGalleryItem));
router.delete("/gallery/:id", asyncHandler(deleteGalleryItem));

router.get("/tests", asyncHandler(listTestSeries));
router.post("/tests", asyncHandler(createTestSeries));
router.put("/tests/:id", asyncHandler(updateTestSeries));
router.delete("/tests/:id", asyncHandler(deleteTestSeries));

router.get("/interviews", asyncHandler(listInterviewResources));
router.post("/interviews", pdfUpload.single("file"), asyncHandler(createInterviewResource));
router.delete("/interviews/:id", asyncHandler(deleteInterviewResource));

router.get("/certificates", asyncHandler(listCertificates));
router.post("/certificates", certificateUpload.single("file"), asyncHandler(createCertificate));
router.delete("/certificates/:id", asyncHandler(deleteCertificate));

router.get("/jobs", asyncHandler(listJobPostings));
router.post("/jobs", asyncHandler(createJobPosting));
router.put("/jobs/:id", asyncHandler(updateJobPosting));
router.post("/jobs/:id/applicants", asyncHandler(toggleJobApplicant));
router.delete("/jobs/:id", asyncHandler(deleteJobPosting));

router.get("/placements", asyncHandler(listPlacementRecords));
router.post(
  "/placements",
  placementAssetUpload.fields([
    { name: "offerLetter", maxCount: 1 },
    { name: "studentPhoto", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  asyncHandler(createPlacementRecord),
);
router.put(
  "/placements/:id",
  placementAssetUpload.fields([
    { name: "offerLetter", maxCount: 1 },
    { name: "studentPhoto", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
  ]),
  asyncHandler(updatePlacementRecord),
);
router.delete("/placements/:id", asyncHandler(deletePlacementRecord));

export default router;
