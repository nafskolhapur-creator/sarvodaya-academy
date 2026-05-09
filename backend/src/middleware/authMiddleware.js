import { verifyToken } from "../utils/token.js";

const extractToken = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

const requireRole = (role, propertyName, missingMessage) => (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: missingMessage,
    });
  }

  try {
    const payload = verifyToken(token);

    if (payload.role !== role) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    req[propertyName] = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or token is invalid.",
    });
  }
};

export const requireAdminAuth = requireRole("admin", "admin", "Admin authentication required.");
export const requireStudentAuth = requireRole(
  "student",
  "student",
  "Student authentication required.",
);
