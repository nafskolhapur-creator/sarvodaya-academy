import { env } from "../config/env.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (error, _req, res, _next) => {
  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with these unique details already exists.",
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors)
        .map((entry) => entry.message)
        .join(", "),
    });
  }

  if (error?.message === "Unsupported file type.") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: env.isProduction ? "Unexpected server error." : error.message || "Unexpected server error.",
  });
};
