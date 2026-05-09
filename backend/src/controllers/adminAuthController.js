import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import AdminUser from "../models/AdminUser.js";
import { env } from "../config/env.js";
import { createActivityLog } from "../services/activityLogService.js";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_PASSWORD } from "../utils/adminConfig.js";
import { signAdminToken } from "../utils/token.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let adminUser = null;

  if (mongoose.connection.readyState === 1) {
    adminUser = await AdminUser.findOne({ email: normalizedEmail });
  }

  if (adminUser) {
    const isValid = await adminUser.comparePassword(password);

    if (!isValid) {
      await createActivityLog({
        category: "admin-login",
        status: "failed",
        actorRole: "unknown",
        actorId: "",
        message: "Admin login failed.",
        meta: {
          email: normalizedEmail,
          ip: req.ip,
        },
      });

      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    adminUser.lastLoginAt = new Date();
    await adminUser.save();
    await createActivityLog({
      category: "admin-login",
      status: "success",
      actorRole: "admin",
      actorId: adminUser.id,
      message: "Admin logged in successfully.",
      meta: {
        email: adminUser.email,
        ip: req.ip,
      },
    });

    const token = signAdminToken(adminUser);

    return res.json({
      success: true,
      token,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
  }

  if (env.isProduction) {
    await createActivityLog({
      category: "admin-login",
      status: "failed",
      actorRole: "unknown",
      actorId: "",
      message: "Admin login failed.",
      meta: {
        email: normalizedEmail,
        ip: req.ip,
      },
    });

    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials.",
    });
  }

  const fallbackMatches =
    normalizedEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
    (await bcrypt.compare(password, await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 8)));

  if (!fallbackMatches) {
    await createActivityLog({
      category: "admin-login",
      status: "failed",
      actorRole: "unknown",
      actorId: "",
      message: "Admin login failed.",
      meta: {
        email: normalizedEmail,
        ip: req.ip,
      },
    });

    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials.",
    });
  }

  const fallbackAdmin = {
    id: "fallback-admin",
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
  };

  await createActivityLog({
    category: "admin-login",
    status: "success",
    actorRole: "admin",
    actorId: fallbackAdmin.id,
    message: "Fallback admin logged in successfully.",
    meta: {
      email: fallbackAdmin.email,
      ip: req.ip,
    },
  });

  return res.json({
    success: true,
    token: signAdminToken(fallbackAdmin),
    admin: {
      ...fallbackAdmin,
      role: "admin",
    },
  });
};

export const getAdminSession = async (req, res) => {
  let admin = {
    id: req.admin.sub,
    name: req.admin.name,
    email: req.admin.email,
    role: "admin",
  };

  if (mongoose.connection.readyState === 1 && req.admin.sub !== "fallback-admin") {
    const adminUser = await AdminUser.findById(req.admin.sub);

    if (adminUser) {
      admin = {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      };
    }
  }

  res.json({ success: true, admin });
};
