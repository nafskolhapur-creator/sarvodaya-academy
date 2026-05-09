import Certificate from "../models/Certificate.js";
import InterviewResource from "../models/InterviewResource.js";
import JobPosting from "../models/JobPosting.js";
import Student from "../models/Student.js";
import StudyMaterial from "../models/StudyMaterial.js";
import TestSeries from "../models/TestSeries.js";
import { buildFileUrl } from "../utils/upload.js";
import { isValidUrl, sanitizeText } from "../utils/validation.js";

const updateDocumentFields = (document, fields) => {
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      document[key] = value;
    }
  });
};

export const listStudyMaterials = async (_req, res) => {
  const materials = await StudyMaterial.find().sort({ createdAt: -1 });
  res.json({ success: true, materials });
};

export const createStudyMaterial = async (req, res) => {
  if (!sanitizeText(req.body.title) || !req.file) {
    return res.status(400).json({ success: false, message: "Title and material file are required." });
  }

  const material = await StudyMaterial.create({
    title: sanitizeText(req.body.title),
    description: sanitizeText(req.body.description),
    courseName: sanitizeText(req.body.courseName),
    fileUrl: buildFileUrl(req, req.file),
    fileName: req.file?.originalname || "",
  });

  res.status(201).json({ success: true, material });
};

export const updateStudyMaterial = async (req, res) => {
  const material = await StudyMaterial.findById(req.params.id);

  if (!material) {
    return res.status(404).json({ success: false, message: "Study material not found." });
  }

  updateDocumentFields(material, {
    title: req.body.title !== undefined ? sanitizeText(req.body.title) : undefined,
    description: req.body.description !== undefined ? sanitizeText(req.body.description) : undefined,
    courseName: req.body.courseName !== undefined ? sanitizeText(req.body.courseName) : undefined,
  });

  if (!material.title) {
    return res.status(400).json({ success: false, message: "Study material title is required." });
  }

  if (req.file) {
    material.fileUrl = buildFileUrl(req, req.file);
    material.fileName = req.file.originalname;
  }

  await material.save();
  return res.json({ success: true, material });
};

export const deleteStudyMaterial = async (req, res) => {
  const deleted = await StudyMaterial.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Study material not found." });
  }

  return res.json({ success: true, message: "Study material deleted." });
};

export const listTestSeries = async (_req, res) => {
  const tests = await TestSeries.find().sort({ createdAt: -1 });
  res.json({ success: true, tests });
};

export const createTestSeries = async (req, res) => {
  if (!sanitizeText(req.body.title) || !isValidUrl(req.body.googleFormUrl)) {
    return res.status(400).json({
      success: false,
      message: "Test title and a valid Google Form URL are required.",
    });
  }

  const test = await TestSeries.create({
    title: sanitizeText(req.body.title),
    description: sanitizeText(req.body.description),
    courseName: sanitizeText(req.body.courseName),
    googleFormUrl: sanitizeText(req.body.googleFormUrl),
    academicYear: sanitizeText(req.body.academicYear),
  });

  res.status(201).json({ success: true, test });
};

export const updateTestSeries = async (req, res) => {
  const test = await TestSeries.findById(req.params.id);

  if (!test) {
    return res.status(404).json({ success: false, message: "Test series not found." });
  }

  updateDocumentFields(test, {
    title: req.body.title !== undefined ? sanitizeText(req.body.title) : undefined,
    description: req.body.description !== undefined ? sanitizeText(req.body.description) : undefined,
    courseName: req.body.courseName !== undefined ? sanitizeText(req.body.courseName) : undefined,
    googleFormUrl: req.body.googleFormUrl !== undefined ? sanitizeText(req.body.googleFormUrl) : undefined,
    academicYear: req.body.academicYear !== undefined ? sanitizeText(req.body.academicYear) : undefined,
  });

  if (!test.title || !isValidUrl(test.googleFormUrl)) {
    return res.status(400).json({
      success: false,
      message: "Test title and a valid Google Form URL are required.",
    });
  }

  await test.save();
  return res.json({ success: true, test });
};

export const deleteTestSeries = async (req, res) => {
  const deleted = await TestSeries.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Test series not found." });
  }

  return res.json({ success: true, message: "Test series deleted." });
};

export const listInterviewResources = async (_req, res) => {
  const resources = await InterviewResource.find().sort({ createdAt: -1 });
  res.json({ success: true, resources });
};

export const createInterviewResource = async (req, res) => {
  if (!sanitizeText(req.body.title) || !req.file) {
    return res.status(400).json({ success: false, message: "Title and PDF file are required." });
  }

  const resource = await InterviewResource.create({
    title: sanitizeText(req.body.title),
    description: sanitizeText(req.body.description),
    courseName: sanitizeText(req.body.courseName),
    fileUrl: buildFileUrl(req, req.file),
    fileName: req.file?.originalname || "",
  });

  res.status(201).json({ success: true, resource });
};

export const deleteInterviewResource = async (req, res) => {
  const deleted = await InterviewResource.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Interview resource not found." });
  }

  return res.json({ success: true, message: "Interview resource deleted." });
};

export const listCertificates = async (_req, res) => {
  const certificates = await Certificate.find()
    .populate("student", "name academicYear courseEnrolled")
    .sort({ createdAt: -1 });

  res.json({ success: true, certificates });
};

export const createCertificate = async (req, res) => {
  const student = await Student.findById(req.body.studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found." });
  }

  if (!sanitizeText(req.body.title) || !req.body.issueDate || !req.file) {
    return res.status(400).json({
      success: false,
      message: "Student, title, issue date, and certificate file are required.",
    });
  }

  const certificate = await Certificate.create({
    student: student.id,
    title: sanitizeText(req.body.title),
    issueDate: req.body.issueDate,
    fileUrl: buildFileUrl(req, req.file),
    fileName: req.file?.originalname || "",
  });

  const populated = await certificate.populate("student", "name academicYear courseEnrolled");

  res.status(201).json({ success: true, certificate: populated });
};

export const deleteCertificate = async (req, res) => {
  const deleted = await Certificate.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Certificate not found." });
  }

  return res.json({ success: true, message: "Certificate deleted." });
};

export const listJobPostings = async (_req, res) => {
  const jobs = await JobPosting.find()
    .populate("applicants", "name academicYear courseEnrolled")
    .sort({ createdAt: -1 });

  res.json({ success: true, jobs });
};

export const createJobPosting = async (req, res) => {
  if (!sanitizeText(req.body.title) || !sanitizeText(req.body.company)) {
    return res.status(400).json({
      success: false,
      message: "Job title and company are required.",
    });
  }

  if (req.body.applyLink && !isValidUrl(req.body.applyLink)) {
    return res.status(400).json({
      success: false,
      message: "Apply link must be a valid URL.",
    });
  }

  const job = await JobPosting.create({
    title: sanitizeText(req.body.title),
    company: sanitizeText(req.body.company),
    location: sanitizeText(req.body.location),
    description: sanitizeText(req.body.description),
    applyLink: sanitizeText(req.body.applyLink),
    deadline: req.body.deadline || null,
  });

  res.status(201).json({ success: true, job });
};

export const updateJobPosting = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ success: false, message: "Job posting not found." });
  }

  updateDocumentFields(job, {
    title: req.body.title !== undefined ? sanitizeText(req.body.title) : undefined,
    company: req.body.company !== undefined ? sanitizeText(req.body.company) : undefined,
    location: req.body.location !== undefined ? sanitizeText(req.body.location) : undefined,
    description: req.body.description !== undefined ? sanitizeText(req.body.description) : undefined,
    applyLink: req.body.applyLink !== undefined ? sanitizeText(req.body.applyLink) : undefined,
    deadline: req.body.deadline || null,
  });

  if (!job.title || !job.company) {
    return res.status(400).json({
      success: false,
      message: "Job title and company are required.",
    });
  }

  if (job.applyLink && !isValidUrl(job.applyLink)) {
    return res.status(400).json({
      success: false,
      message: "Apply link must be a valid URL.",
    });
  }

  await job.save();
  return res.json({ success: true, job });
};

export const toggleJobApplicant = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);
  const student = await Student.findById(req.body.studentId);

  if (!job || !student) {
    return res.status(404).json({
      success: false,
      message: "Job posting or student not found.",
    });
  }

  const hasApplied = job.applicants.some((applicantId) => applicantId.toString() === student.id);

  if (hasApplied) {
    job.applicants = job.applicants.filter((applicantId) => applicantId.toString() !== student.id);
  } else {
    job.applicants.push(student.id);
  }

  await job.save();
  await job.populate("applicants", "name academicYear courseEnrolled");

  return res.json({ success: true, job });
};

export const deleteJobPosting = async (req, res) => {
  const deleted = await JobPosting.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Job posting not found." });
  }

  return res.json({ success: true, message: "Job posting deleted." });
};
