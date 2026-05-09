import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { env } from "./config/env.js";
import courseRoutes from "./routes/courseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import { enforceHttps, getAllowedOrigins, securityHeaders } from "./middleware/securityMiddleware.js";
import placementRoutes from "./routes/placementRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.set("trust proxy", env.trustProxy);
app.use(securityHeaders);
app.use(enforceHttps);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS policy."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Sarvodaya Academy API is running.",
    environment: env.nodeEnv,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/admin", adminRoutes);

if (env.serveFrontend) {
  const frontendDist = path.resolve(process.cwd(), "..", "frontend", "dist");

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }

      return res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
