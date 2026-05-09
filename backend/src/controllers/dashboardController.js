const dashboardContent = {
  admin: {
    title: "Admin Dashboard",
    summary:
      "Manage admissions, institute branding, contact information, and course visibility from one place.",
    actions: [
      "Update logo and institute profile",
      "Review student enrollment list",
      "Edit map location and contact details",
    ],
  },
  student: {
    title: "Student Dashboard",
    summary:
      "Track your enrolled programs, class updates, and quick access to support resources.",
    actions: [
      "View enrolled courses",
      "Check notices and schedules",
      "Reach institute support",
    ],
  },
  "external-user": {
    title: "External User Dashboard",
    summary:
      "Explore course offerings, admission guidance, and institute contact details before registering.",
    actions: [
      "Browse available programs",
      "Review admission support details",
      "Find the campus on the map",
    ],
  },
};

export const getDashboardByRole = (req, res) => {
  const role = req.params.role;
  const content = dashboardContent[role];

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Dashboard configuration not found for the requested role.",
    });
  }

  return res.json({ success: true, dashboard: content });
};
