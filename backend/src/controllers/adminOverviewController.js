import Certificate from "../models/Certificate.js";
import FeeRecord from "../models/FeeRecord.js";
import InterviewResource from "../models/InterviewResource.js";
import JobPosting from "../models/JobPosting.js";
import Lead from "../models/Lead.js";
import PlacementRecord from "../models/PlacementRecord.js";
import Student from "../models/Student.js";
import StudyMaterial from "../models/StudyMaterial.js";
import TestSeries from "../models/TestSeries.js";

export const getAdminOverview = async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [
    studentCount,
    unpaidFees,
    lateFees,
    materialCount,
    testCount,
    interviewCount,
    certificateCount,
    jobCount,
    leadCount,
    academicYears,
    monthlyExpected,
    monthlyCollected,
    placedStudentIds,
  ] = await Promise.all([
    Student.countDocuments(),
    FeeRecord.countDocuments({ status: { $ne: "paid" } }),
    FeeRecord.countDocuments({ status: { $ne: "paid" }, dueDate: { $lt: today } }),
    StudyMaterial.countDocuments(),
    TestSeries.countDocuments(),
    InterviewResource.countDocuments(),
    Certificate.countDocuments(),
    JobPosting.countDocuments(),
    Lead.countDocuments(),
    Student.distinct("academicYear"),
    FeeRecord.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: "$totalDue" } } },
    ]),
    FeeRecord.aggregate([
      { $match: { month: currentMonth, year: currentYear, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$payment.amountPaid" } } },
    ]),
    PlacementRecord.distinct("student", { placementStatus: "Placed" }),
  ]);

  const totalExpected = monthlyExpected[0]?.total || 0;
  const totalCollected = monthlyCollected[0]?.total || 0;
  const placedStudents = placedStudentIds.length;
  const placementRate = studentCount ? Number(((placedStudents / studentCount) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    overview: {
      studentCount,
      unpaidFees,
      lateFees,
      materialCount,
      testCount,
      interviewCount,
      certificateCount,
      jobCount,
      leadCount,
      placedStudents,
      placementRate,
      academicYears,
      monthlyCollection: {
        month: currentMonth,
        year: currentYear,
        totalExpected,
        totalCollected,
        pendingAmount: Math.max(totalExpected - totalCollected, 0),
      },
    },
  });
};
