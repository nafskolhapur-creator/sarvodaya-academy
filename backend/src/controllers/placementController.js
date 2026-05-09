import PlacementRecord from "../models/PlacementRecord.js";
import Student from "../models/Student.js";
import { buildFileUrl } from "../utils/upload.js";

const normalizePlacement = (placement) => ({
  _id: placement._id?.toString?.() || placement._id,
  student: placement.student
    ? {
        ...placement.student,
        _id: placement.student._id?.toString?.() || placement.student._id,
      }
    : null,
  course: placement.course,
  companyName: placement.companyName,
  jobRole: placement.jobRole,
  salaryAmount: placement.salaryAmount,
  salaryPeriod: placement.salaryPeriod,
  location: placement.location,
  dateOfJoining: placement.dateOfJoining,
  placementStatus: placement.placementStatus,
  offerLetterUrl: placement.offerLetterUrl,
  offerLetterFileName: placement.offerLetterFileName,
  successStoryDescription: placement.successStoryDescription,
  studentPhotoUrl: placement.studentPhotoUrl,
  companyLogoUrl: placement.companyLogoUrl,
  highlightOnHomepage: placement.highlightOnHomepage,
  createdAt: placement.createdAt,
  updatedAt: placement.updatedAt,
});

const getPlacementUploadUrls = (req) => ({
  offerLetterUrl: buildFileUrl(req, req.files?.offerLetter?.[0]),
  studentPhotoUrl: buildFileUrl(req, req.files?.studentPhoto?.[0]),
  companyLogoUrl: buildFileUrl(req, req.files?.companyLogo?.[0]),
});

export const listPlacementRecords = async (_req, res) => {
  const placements = await PlacementRecord.find()
    .populate("student", "name academicYear courseEnrolled photoUrl")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    placements: placements.map((placement) => normalizePlacement(placement.toObject())),
  });
};

export const createPlacementRecord = async (req, res) => {
  const student = await Student.findById(req.body.studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }

  const uploadUrls = getPlacementUploadUrls(req);
  const placement = await PlacementRecord.create({
    student: student.id,
    course: req.body.course || student.courseEnrolled,
    companyName: req.body.companyName,
    jobRole: req.body.jobRole,
    salaryAmount: Number(req.body.salaryAmount || 0),
    salaryPeriod: req.body.salaryPeriod || "monthly",
    location: req.body.location || "",
    dateOfJoining: req.body.dateOfJoining || null,
    placementStatus: req.body.placementStatus || "In Process",
    offerLetterUrl: uploadUrls.offerLetterUrl,
    offerLetterFileName: req.files?.offerLetter?.[0]?.originalname || "",
    successStoryDescription: req.body.successStoryDescription || "",
    studentPhotoUrl: uploadUrls.studentPhotoUrl || student.photoUrl || "",
    companyLogoUrl: uploadUrls.companyLogoUrl,
    highlightOnHomepage: req.body.highlightOnHomepage === "true" || req.body.highlightOnHomepage === true,
  });

  const populated = await placement.populate("student", "name academicYear courseEnrolled photoUrl");
  res.status(201).json({ success: true, placement: normalizePlacement(populated.toObject()) });
};

export const updatePlacementRecord = async (req, res) => {
  const placement = await PlacementRecord.findById(req.params.id).populate(
    "student",
    "name academicYear courseEnrolled photoUrl",
  );

  if (!placement) {
    return res.status(404).json({ success: false, message: "Placement record not found." });
  }

  const nextStudentId = req.body.studentId || placement.student?._id?.toString();
  const student = nextStudentId ? await Student.findById(nextStudentId) : null;

  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }

  const uploadUrls = getPlacementUploadUrls(req);

  placement.student = student.id;
  placement.course = req.body.course || student.courseEnrolled;
  placement.companyName = req.body.companyName ?? placement.companyName;
  placement.jobRole = req.body.jobRole ?? placement.jobRole;
  placement.salaryAmount = Number(req.body.salaryAmount ?? placement.salaryAmount ?? 0);
  placement.salaryPeriod = req.body.salaryPeriod || placement.salaryPeriod || "monthly";
  placement.location = req.body.location ?? placement.location;
  placement.dateOfJoining = req.body.dateOfJoining || placement.dateOfJoining;
  placement.placementStatus = req.body.placementStatus || placement.placementStatus;
  placement.successStoryDescription =
    req.body.successStoryDescription ?? placement.successStoryDescription;
  placement.highlightOnHomepage =
    req.body.highlightOnHomepage === undefined
      ? placement.highlightOnHomepage
      : req.body.highlightOnHomepage === "true" || req.body.highlightOnHomepage === true;

  if (uploadUrls.offerLetterUrl) {
    placement.offerLetterUrl = uploadUrls.offerLetterUrl;
    placement.offerLetterFileName = req.files?.offerLetter?.[0]?.originalname || "";
  }

  if (uploadUrls.studentPhotoUrl) {
    placement.studentPhotoUrl = uploadUrls.studentPhotoUrl;
  } else if (!placement.studentPhotoUrl) {
    placement.studentPhotoUrl = student.photoUrl || "";
  }

  if (uploadUrls.companyLogoUrl) {
    placement.companyLogoUrl = uploadUrls.companyLogoUrl;
  }

  await placement.save();
  await placement.populate("student", "name academicYear courseEnrolled photoUrl");

  res.json({ success: true, placement: normalizePlacement(placement.toObject()) });
};

export const deletePlacementRecord = async (req, res) => {
  const deleted = await PlacementRecord.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Placement record not found." });
  }

  res.json({ success: true, message: "Placement record deleted." });
};

export const getPlacementHighlights = async (_req, res) => {
  const highlights = await PlacementRecord.find({
    placementStatus: "Placed",
    highlightOnHomepage: true,
  })
    .populate("student", "name courseEnrolled photoUrl")
    .sort({ dateOfJoining: -1, createdAt: -1 })
    .limit(8);

  res.json({
    success: true,
    highlights: highlights.map((placement) => normalizePlacement(placement.toObject())),
  });
};

export const getStudentPlacements = async (req, res) => {
  const placements = await PlacementRecord.find({ student: req.student.sub })
    .populate("student", "name academicYear courseEnrolled photoUrl")
    .sort({ dateOfJoining: -1, createdAt: -1 });

  res.json({
    success: true,
    placements: placements.map((placement) => normalizePlacement(placement.toObject())),
  });
};
