export const eligibilityFilters = ["8th Pass", "10th Pass", "12th Pass", "Graduate"];
export const boardFilters = ["NAFS", "NBVTE", "MSBTE"];

export const matchesEligibilityFilter = (courseEligibility, selectedEligibility) => {
  if (!selectedEligibility) {
    return true;
  }

  if (selectedEligibility === "12th Pass") {
    return courseEligibility === "12th Pass" || courseEligibility === "10+2 Pass";
  }

  return courseEligibility === selectedEligibility;
};

export const buildWhatsappUrl = (whatsappNumber, courseTitle) => {
  const sanitizedNumber = String(whatsappNumber || "")
    .replace(/[^\d]/g, "");

  if (!sanitizedNumber) {
    return "";
  }

  const message = `Hello, I want enquiry for ${courseTitle} at Sarvodaya Academy.`;

  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(message)}`;
};

export const getCourseBadges = (course) => {
  const badges = [];

  if (course.popular) {
    badges.push("Popular");
  }

  if (course.featured) {
    badges.push("Job Oriented");
  }

  return badges;
};
