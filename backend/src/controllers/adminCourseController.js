import { runtimeInstituteSettings } from "../data/defaultCatalog.js";
import Course from "../models/Course.js";
import InstituteSettings from "../models/InstituteSettings.js";
import { sanitizeText } from "../utils/validation.js";

const normalizeCourse = (course) => ({
  id: course._id?.toString() || course.id,
  slug: course.slug,
  title: course.title,
  duration: course.duration,
  eligibility: course.eligibility,
  board: course.board,
  category: course.category,
  mode: course.mode,
  description: course.description || "",
  featured: Boolean(course.featured),
  popular: Boolean(course.popular),
  isPublished: course.isPublished !== false,
});

const normalizeSettings = (settings) => ({
  instituteName: settings.instituteName,
  instituteSubtitle: settings.instituteSubtitle,
  affiliation: settings.affiliation,
  logoUrl: settings.logoUrl,
  contactEmail: settings.contactEmail,
  contactPhone: settings.contactPhone,
  address: settings.address,
  mapEmbedUrl: settings.mapEmbedUrl,
  whatsappNumber: settings.whatsappNumber,
  heroDescription: settings.heroDescription || runtimeInstituteSettings.heroDescription,
});

const buildSlug = (value) =>
  sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureDatabaseReady = (res) => {
  if (Course.db.readyState === 1) {
    return true;
  }

  res.status(503).json({
    success: false,
    message: "Course management requires a database connection.",
  });

  return false;
};

const validateBoard = (value) => ["NAFS", "NBVTE", "MSBTE"].includes(value);

const buildCoursePayload = (body) => {
  const title = sanitizeText(body.title);
  const board = sanitizeText(body.board);
  const duration = sanitizeText(body.duration);
  const eligibility = sanitizeText(body.eligibility);
  const description = sanitizeText(body.description);
  const featured = body.featured === true || body.featured === "true";
  const popular = body.popular === true || body.popular === "true";
  const isPublished = body.isPublished === undefined ? true : body.isPublished === true || body.isPublished === "true";

  if (!title || !validateBoard(board) || !duration || !eligibility) {
    return {
      error: "Course name, board, duration, and eligibility are required.",
    };
  }

  return {
    data: {
      title,
      board,
      duration,
      eligibility,
      description,
      featured,
      popular,
      isPublished,
      category: `${board} Board`,
      mode: sanitizeText(body.mode),
    },
  };
};

const buildUniqueSlug = async (title, excludeId) => {
  const baseSlug = buildSlug(title) || "course";
  let candidateSlug = baseSlug;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Course.findOne({
      slug: candidateSlug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select("_id");

    if (!existing) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

export const getAdminCourses = async (_req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const courses = await Course.find().sort({ board: 1, title: 1 });

  res.json({
    success: true,
    courses: courses.map(normalizeCourse),
  });
};

export const createAdminCourse = async (req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const payload = buildCoursePayload(req.body);

  if (payload.error) {
    return res.status(400).json({ success: false, message: payload.error });
  }

  const slug = await buildUniqueSlug(payload.data.title);
  const course = await Course.create({
    slug,
    ...payload.data,
  });

  return res.status(201).json({ success: true, course: normalizeCourse(course) });
};

export const updateAdminCourse = async (req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found." });
  }

  const payload = buildCoursePayload(req.body);

  if (payload.error) {
    return res.status(400).json({ success: false, message: payload.error });
  }

  const nextTitle = payload.data.title;

  if (nextTitle !== course.title) {
    course.slug = await buildUniqueSlug(nextTitle, course._id);
  }

  Object.assign(course, payload.data);
  await course.save();

  return res.json({ success: true, course: normalizeCourse(course) });
};

export const deleteAdminCourse = async (req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const deleted = await Course.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Course not found." });
  }

  return res.json({ success: true, message: "Course deleted successfully." });
};

export const getCourseSettings = async (_req, res) => {
  if (Course.db.readyState === 1) {
    const settings = await InstituteSettings.findOne();

    if (settings) {
      return res.json({ success: true, settings: normalizeSettings(settings.toObject()) });
    }
  }

  return res.json({ success: true, settings: normalizeSettings(runtimeInstituteSettings) });
};

export const updateCourseSettings = async (req, res) => {
  const nextWhatsappNumber = String(req.body.whatsappNumber || "").trim();

  if (!nextWhatsappNumber) {
    return res.status(400).json({
      success: false,
      message: "WhatsApp number is required.",
    });
  }

  if (Course.db.readyState === 1) {
    let settings = await InstituteSettings.findOne();

    if (!settings) {
      settings = await InstituteSettings.create({
        ...runtimeInstituteSettings,
        whatsappNumber: nextWhatsappNumber,
        whatsappConfig: {
          ...runtimeInstituteSettings.whatsappConfig,
          phoneNumber: nextWhatsappNumber,
        },
      });
    } else {
      settings.whatsappNumber = nextWhatsappNumber;
      settings.whatsappConfig = {
        ...settings.whatsappConfig?.toObject?.(),
        phoneNumber: nextWhatsappNumber,
      };
      await settings.save();
    }

    return res.json({ success: true, settings: normalizeSettings(settings.toObject()) });
  }

  runtimeInstituteSettings.whatsappNumber = nextWhatsappNumber;
  runtimeInstituteSettings.whatsappConfig = {
    ...runtimeInstituteSettings.whatsappConfig,
    phoneNumber: nextWhatsappNumber,
  };
  return res.json({ success: true, settings: normalizeSettings(runtimeInstituteSettings) });
};
