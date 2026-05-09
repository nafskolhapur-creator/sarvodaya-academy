import Course from "../models/Course.js";

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

const ensureDatabaseReady = (res) => {
  if (Course.db.readyState === 1) {
    return true;
  }

  res.status(503).json({
    success: false,
    message: "Course catalog is temporarily unavailable. Please connect the database and try again.",
  });

  return false;
};

export const getCourses = async (req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const { eligibility, board } = req.query;
  const query = { isPublished: true };

  if (eligibility) {
    query.eligibility = eligibility;
  }

  if (board) {
    query.board = board;
  }
  const courses = await Course.find(query).sort({ popular: -1, featured: -1, title: 1 });

  res.json({
    success: true,
    courses: courses.map(normalizeCourse),
  });
};

export const getFeaturedCourses = async (_req, res) => {
  if (!ensureDatabaseReady(res)) {
    return;
  }

  const courses = await Course.find({ isPublished: true, $or: [{ featured: true }, { popular: true }] }).sort({
    popular: -1,
    featured: -1,
    title: 1,
  });

  res.json({
    success: true,
    courses: courses.map(normalizeCourse),
  });
};
