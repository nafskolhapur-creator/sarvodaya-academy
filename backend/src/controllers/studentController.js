import Certificate from "../models/Certificate.js";
import FeeRecord from "../models/FeeRecord.js";
import JobPosting from "../models/JobPosting.js";
import PlacementRecord from "../models/PlacementRecord.js";
import Student from "../models/Student.js";
import StudyMaterial from "../models/StudyMaterial.js";
import TestSeries from "../models/TestSeries.js";
import TestSubmission from "../models/TestSubmission.js";
import { getFeeReminderSettings } from "../services/feeReminderService.js";
import { computeFeeState, normalizeFeeReminderSettings } from "../utils/feeUtils.js";

const buildCourseFilter = (student) => ({
  $or: [{ courseName: "" }, { courseName: student.courseEnrolled }],
});

const buildAcademicYearFilter = (student) => ({
  $or: [{ academicYear: "" }, { academicYear: student.academicYear }],
});

const getCurrentStudent = async (studentId) =>
  Student.findById(studentId).select(
    "name mobileNumber dob academicYear courseEnrolled courseFee installments fine parentContact photoUrl",
  );

export const getStudentProfile = async (req, res) => {
  const student = await getCurrentStudent(req.student.sub);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found.",
    });
  }

  return res.json({ success: true, profile: student });
};

export const getStudentFees = async (req, res) => {
  const settings = normalizeFeeReminderSettings(await getFeeReminderSettings());
  const feeRecords = await FeeRecord.find({ student: req.student.sub }).sort({
    year: -1,
    month: -1,
  });

  const normalizedFeeRecords = await Promise.all(
    feeRecords.map(async (feeRecord) => {
      const nextState = computeFeeState(feeRecord, settings);

      if (
        feeRecord.status !== nextState.status ||
        feeRecord.lateFee !== nextState.lateFee ||
        feeRecord.totalDue !== nextState.totalDue ||
        feeRecord.lateFeeAmount !== nextState.lateFeeAmount
      ) {
        feeRecord.status = nextState.status;
        feeRecord.lateFee = nextState.lateFee;
        feeRecord.totalDue = nextState.totalDue;
        feeRecord.lateFeeAmount = nextState.lateFeeAmount;
        await feeRecord.save();
      }

      return feeRecord;
    }),
  );

  return res.json({ success: true, feeRecords: normalizedFeeRecords });
};

export const getStudentMaterials = async (req, res) => {
  const student = await getCurrentStudent(req.student.sub);

  if (!student) {
    return res.status(404).json({ success: false, message: "Student profile not found." });
  }

  const materials = await StudyMaterial.find(buildCourseFilter(student)).sort({ createdAt: -1 });

  return res.json({ success: true, materials });
};

export const getStudentTests = async (req, res) => {
  const student = await getCurrentStudent(req.student.sub);
  if (!student) {
    return res.status(404).json({ success: false, message: "Student profile not found." });
  }

  const tests = await TestSeries.find({
    $and: [buildCourseFilter(student), buildAcademicYearFilter(student)],
  }).sort({ createdAt: -1 });

  const submissions = await TestSubmission.find({ student: student.id })
    .populate("testSeries", "title googleFormUrl courseName academicYear")
    .sort({ submittedAt: -1 });

  const submittedTestIds = new Set(submissions.map((entry) => entry.testSeries?._id?.toString()));
  const enrichedTests = tests.map((test) => ({
    ...test.toObject(),
    isSubmitted: submittedTestIds.has(test._id.toString()),
  }));

  return res.json({
    success: true,
    tests: enrichedTests,
    submissions,
  });
};

export const submitStudentTest = async (req, res) => {
  const student = await getCurrentStudent(req.student.sub);
  const test = await TestSeries.findById(req.params.id);

  if (!student || !test) {
    return res.status(404).json({
      success: false,
      message: "Student or test not found.",
    });
  }

  const submission = await TestSubmission.findOneAndUpdate(
    {
      student: student.id,
      testSeries: test.id,
    },
    {
      submittedAt: new Date(),
      status: "submitted",
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).populate("testSeries", "title googleFormUrl courseName academicYear");

  return res.json({ success: true, submission });
};

export const getStudentJobs = async (req, res) => {
  const jobs = await JobPosting.find()
    .populate("applicants", "name")
    .sort({ createdAt: -1 });

  const studentId = req.student.sub;
  const enrichedJobs = jobs.map((job) => ({
    ...job.toObject(),
    isApplied: job.applicants.some((applicant) => applicant._id.toString() === studentId),
  }));

  return res.json({ success: true, jobs: enrichedJobs });
};

export const applyForJob = async (req, res) => {
  const job = await JobPosting.findById(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job posting not found.",
    });
  }

  const studentId = req.student.sub;
  const alreadyApplied = job.applicants.some((applicant) => applicant.toString() === studentId);

  if (!alreadyApplied) {
    job.applicants.addToSet(studentId);
    await job.save();
  }

  await job.populate("applicants", "name");

  return res.json({
    success: true,
    job: {
      ...job.toObject(),
      isApplied: true,
    },
  });
};

export const getStudentCertificates = async (req, res) => {
  const certificates = await Certificate.find({ student: req.student.sub }).sort({ createdAt: -1 });
  return res.json({ success: true, certificates });
};

export const getStudentPlacements = async (req, res) => {
  const placements = await PlacementRecord.find({ student: req.student.sub })
    .populate("student", "name academicYear courseEnrolled photoUrl")
    .sort({ dateOfJoining: -1, createdAt: -1 });

  return res.json({ success: true, placements });
};
