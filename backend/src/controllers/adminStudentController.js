import Student from "../models/Student.js";
import { buildFileUrl } from "../utils/upload.js";
import { isNonNegativeNumber, isValidDateInput, normalizePhoneNumber, sanitizeText } from "../utils/validation.js";

const parseInstallments = (rawInstallments) => {
  if (!rawInstallments) {
    return [];
  }

  if (Array.isArray(rawInstallments)) {
    return rawInstallments;
  }

  try {
    const parsed = JSON.parse(rawInstallments);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

const groupStudentsByAcademicYear = (students) =>
  students.reduce((groups, student) => {
    const key = student.academicYear;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(student);
    return groups;
  }, {});

export const listStudents = async (_req, res) => {
  const students = await Student.find().sort({ academicYear: -1, name: 1 });

  res.json({
    success: true,
    students,
    groupedStudents: groupStudentsByAcademicYear(students),
  });
};

export const createStudent = async (req, res) => {
  if (
    !sanitizeText(req.body.name) ||
    !normalizePhoneNumber(req.body.mobileNumber) ||
    !req.body.dob ||
    !sanitizeText(req.body.academicYear) ||
    !sanitizeText(req.body.courseEnrolled) ||
    !req.body.parentContact
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile number, DOB, academic year, course, and parent contact are required.",
    });
  }

  if (!isValidDateInput(req.body.dob)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid date of birth.",
    });
  }

  if (!isNonNegativeNumber(req.body.courseFee) || !isNonNegativeNumber(req.body.fine || 0)) {
    return res.status(400).json({
      success: false,
      message: "Course fee and fine must be valid non-negative numbers.",
    });
  }

  const student = await Student.create({
    name: sanitizeText(req.body.name),
    mobileNumber: normalizePhoneNumber(req.body.mobileNumber),
    dob: req.body.dob,
    academicYear: sanitizeText(req.body.academicYear),
    courseEnrolled: sanitizeText(req.body.courseEnrolled),
    courseFee: Number(req.body.courseFee),
    installments: parseInstallments(req.body.installments),
    fine: Number(req.body.fine || 0),
    parentContact: normalizePhoneNumber(req.body.parentContact),
    photoUrl: buildFileUrl(req, req.file),
  });

  res.status(201).json({ success: true, student });
};

export const updateStudent = async (req, res) => {
  const existingStudent = await Student.findById(req.params.id);

  if (!existingStudent) {
    return res.status(404).json({
      success: false,
      message: "Student not found.",
    });
  }

  if (
    !sanitizeText(req.body.name) ||
    !normalizePhoneNumber(req.body.mobileNumber) ||
    !req.body.dob ||
    !sanitizeText(req.body.academicYear) ||
    !sanitizeText(req.body.courseEnrolled) ||
    !req.body.parentContact
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile number, DOB, academic year, course, and parent contact are required.",
    });
  }

  if (!isValidDateInput(req.body.dob)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid date of birth.",
    });
  }

  if (!isNonNegativeNumber(req.body.courseFee) || !isNonNegativeNumber(req.body.fine || 0)) {
    return res.status(400).json({
      success: false,
      message: "Course fee and fine must be valid non-negative numbers.",
    });
  }

  existingStudent.name = sanitizeText(req.body.name);
  existingStudent.mobileNumber = normalizePhoneNumber(req.body.mobileNumber);
  existingStudent.dob = req.body.dob;
  existingStudent.academicYear = sanitizeText(req.body.academicYear);
  existingStudent.courseEnrolled = sanitizeText(req.body.courseEnrolled);
  existingStudent.courseFee = Number(req.body.courseFee);
  existingStudent.installments = parseInstallments(req.body.installments);
  existingStudent.fine = Number(req.body.fine || 0);
  existingStudent.parentContact = normalizePhoneNumber(req.body.parentContact);

  if (req.file) {
    existingStudent.photoUrl = buildFileUrl(req, req.file);
  }

  await existingStudent.save();

  return res.json({ success: true, student: existingStudent });
};

export const deleteStudent = async (req, res) => {
  const deletedStudent = await Student.findByIdAndDelete(req.params.id);

  if (!deletedStudent) {
    return res.status(404).json({
      success: false,
      message: "Student not found.",
    });
  }

  return res.json({ success: true, message: "Student deleted." });
};
