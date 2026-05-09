export const galleryCategories = [
  "Placement Photos",
  "Student Activities",
  "Industrial Visits",
  "Fire Drill Training",
  "Certifications",
  "Events & Seminars",
];

export const formatGalleryDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date not set";

export const activityCategories = galleryCategories.filter((category) => category !== "Placement Photos");
