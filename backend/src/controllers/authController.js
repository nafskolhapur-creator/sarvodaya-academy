import Student from "../models/Student.js";
import { createActivityLog } from "../services/activityLogService.js";
import { signStudentToken } from "../utils/token.js";
import { isValidDateInput, normalizeDateOnly, normalizePhoneNumber } from "../utils/validation.js";

export const login = async (req, res) => {
  const { mobileNumber, dob } = req.body;

  if (!mobileNumber || !dob) {
    return res.status(400).json({
      success: false,
      message: "Mobile number and DOB are required.",
    });
  }

  if (!isValidDateInput(dob)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid date of birth.",
    });
  }

  const normalizedMobile = normalizePhoneNumber(mobileNumber);
  const student = await Student.findOne({ mobileNumber: normalizedMobile });

  if (!student || normalizeDateOnly(student.dob) !== normalizeDateOnly(dob)) {
    await createActivityLog({
      category: "student-login",
      status: "failed",
      actorRole: "unknown",
      actorId: "",
      message: "Student login failed.",
      meta: {
        mobileNumber: normalizedMobile,
        ip: req.ip,
      },
    });

    return res.status(401).json({
      success: false,
      message: "Invalid student login details.",
    });
  }

  await createActivityLog({
    category: "student-login",
    status: "success",
    actorRole: "student",
    actorId: student.id,
    message: "Student logged in successfully.",
    meta: {
      mobileNumber: student.mobileNumber,
      ip: req.ip,
    },
  });

  const token = signStudentToken(student);

  return res.json({
    success: true,
    token,
    user: {
      id: student.id,
      name: student.name,
      mobileNumber: student.mobileNumber,
      academicYear: student.academicYear,
      courseEnrolled: student.courseEnrolled,
      role: "student",
    },
  });
};

export const getStudentSession = async (req, res) => {
  const student = await Student.findById(req.student.sub).select(
    "name mobileNumber academicYear courseEnrolled",
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student session not found.",
    });
  }

  return res.json({
    success: true,
    user: {
      id: student.id,
      name: student.name,
      mobileNumber: student.mobileNumber,
      academicYear: student.academicYear,
      courseEnrolled: student.courseEnrolled,
      role: "student",
    },
  });
};
