import { env } from "../config/env.js";

const capacitorOrigins = [
  "http://localhost",
  "https://localhost",
  "http://127.0.0.1",
  "https://127.0.0.1",
  "capacitor://localhost",
  "ionic://localhost",
];

const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

export const getAllowedOrigins = () => {
  const configuredOrigins = [
    ...env.corsOrigins,
    env.frontendUrl,
    ...capacitorOrigins,
  ].filter(Boolean);

  if (configuredOrigins.length) {
    return [...new Set(configuredOrigins)];
  }

  return env.isProduction ? capacitorOrigins : [...defaultDevOrigins, ...capacitorOrigins];
};

export const securityHeaders = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (env.isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: https:; frame-src 'self' https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:;");
  }

  next();
};

export const enforceHttps = (req, res, next) => {
  if (!env.forceHttps || !env.isProduction) {
    return next();
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure = req.secure || forwardedProto === "https";

  if (isSecure) {
    return next();
  }

  return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
};
