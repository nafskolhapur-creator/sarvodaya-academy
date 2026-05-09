import jwt from "jsonwebtoken";
import { env, requireEnv } from "../config/env.js";

const getJwtSecret = () =>
  env.jwtSecret || (env.isProduction ? requireEnv("JWT_SECRET", env.jwtSecret) : "sarvodaya-academy-dev-secret");

const signToken = (payload) =>
  jwt.sign(
    payload,
    getJwtSecret(),
    { expiresIn: "8h" },
  );

export const signAdminToken = (adminUser) =>
  signToken({
    sub: adminUser.id,
    role: "admin",
    email: adminUser.email,
    name: adminUser.name,
  });

export const signStudentToken = (student) =>
  signToken({
    sub: student.id,
    role: "student",
    name: student.name,
    mobileNumber: student.mobileNumber,
    academicYear: student.academicYear,
    courseEnrolled: student.courseEnrolled,
  });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());
