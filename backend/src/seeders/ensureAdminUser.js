import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import AdminUser from "../models/AdminUser.js";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  DEFAULT_ADMIN_PASSWORD,
} from "../utils/adminConfig.js";

const ensureAdminUser = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const existingAdmin = await AdminUser.findOne({ email: DEFAULT_ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  await AdminUser.create({
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL.toLowerCase(),
    passwordHash,
  });

  console.log(`Seeded admin user for ${DEFAULT_ADMIN_EMAIL}`);
};

export default ensureAdminUser;
