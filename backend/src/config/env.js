import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const parseOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  frontendUrl: process.env.FRONTEND_URL || "",
  forceHttps: process.env.FORCE_HTTPS === "true",
  trustProxy: process.env.TRUST_PROXY || "loopback",
  serveFrontend: process.env.SERVE_FRONTEND === "true",
  authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  authRateLimitMaxAttempts: Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || 10),
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  whatsappApiUrl: process.env.WHATSAPP_API_URL || "",
  whatsappApiKey: process.env.WHATSAPP_API_KEY || "",
  whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER || "",
};

export const requireEnv = (name, value) => {
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
};

export const assertProductionEnv = () => {
  if (!isProduction) {
    return;
  }

  requireEnv("MONGODB_URI", env.mongoUri);
  requireEnv("JWT_SECRET", env.jwtSecret);
  requireEnv("ADMIN_EMAIL", env.adminEmail);
  requireEnv("ADMIN_PASSWORD", env.adminPassword);

  if (!env.serveFrontend && !env.frontendUrl && env.corsOrigins.length === 0) {
    throw new Error(
      "Set FRONTEND_URL or CORS_ORIGINS in production when the frontend is hosted separately.",
    );
  }
};
