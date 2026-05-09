import { env } from "../config/env.js";

const bucket = new Map();

const getKey = (req) => `${req.ip}:${req.originalUrl}`;

const purgeExpired = (now) => {
  for (const [key, value] of bucket.entries()) {
    if (value.expiresAt <= now) {
      bucket.delete(key);
    }
  }
};

export const authRateLimit = (req, res, next) => {
  const now = Date.now();
  purgeExpired(now);

  const key = getKey(req);
  const current = bucket.get(key) || {
    count: 0,
    expiresAt: now + env.authRateLimitWindowMs,
  };

  if (current.expiresAt <= now) {
    current.count = 0;
    current.expiresAt = now + env.authRateLimitWindowMs;
  }

  current.count += 1;
  bucket.set(key, current);

  if (current.count > env.authRateLimitMaxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
    });
  }

  return next();
};
