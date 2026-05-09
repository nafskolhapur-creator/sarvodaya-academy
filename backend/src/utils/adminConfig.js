import { env, requireEnv } from "../config/env.js";

export const DEFAULT_ADMIN_EMAIL =
  env.adminEmail || (env.isProduction ? requireEnv("ADMIN_EMAIL", env.adminEmail) : "nafskolhapur@gmail.com");
export const DEFAULT_ADMIN_PASSWORD =
  env.adminPassword ||
  (env.isProduction ? requireEnv("ADMIN_PASSWORD", env.adminPassword) : "Radhakrishna093$");
export const DEFAULT_ADMIN_NAME = "NAFS Kolhapur Admin";
