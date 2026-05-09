import mongoose from "mongoose";

import Course from "../models/Course.js";
import InstituteSettings from "../models/InstituteSettings.js";
import { defaultCourses, defaultInstituteSettings } from "../data/defaultCatalog.js";

const ensureCatalogData = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const existingSettings = await InstituteSettings.findOne();

  if (!existingSettings) {
    await InstituteSettings.create(defaultInstituteSettings);
  }

  for (const course of defaultCourses) {
    const existingCourse = await Course.findOne({ slug: course.slug });

    if (!existingCourse) {
      await Course.create({
        slug: course.slug,
        title: course.title,
        duration: course.duration,
        eligibility: course.eligibility,
        board: course.board,
        category: course.category,
        mode: course.mode,
        description: course.description,
        featured: course.featured,
        popular: course.popular,
        isPublished: course.isPublished,
      });
    }
  }
};

export default ensureCatalogData;
