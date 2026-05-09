import { useMemo, useState } from "react";

import { defaultCourseForm } from "./adminUtils";

const boardFilters = ["All", "NAFS", "NBVTE", "MSBTE"];

function CoursesSection({
  adminToken,
  courseForm,
  courseSettings,
  courseSettingsForm,
  createAdminCourse,
  courses,
  deleteAdminCourse,
  handleDelete,
  runMutation,
  setCourseForm,
  setCourseSettingsForm,
  submitting,
  updateAdminCourse,
  updateAdminCourseSettings,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBoard, setActiveBoard] = useState("All");

  const filteredCourses = useMemo(
    () =>
      courses
        .filter((course) => (activeBoard === "All" ? true : course.board === activeBoard))
        .filter((course) => {
          const query = searchQuery.trim().toLowerCase();

          if (!query) {
            return true;
          }

          return [course.title, course.board, course.eligibility, course.duration]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        }),
    [activeBoard, courses, searchQuery],
  );

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();

    await runMutation("course-settings", () =>
      updateAdminCourseSettings(adminToken, {
        whatsappNumber: courseSettingsForm.whatsappNumber,
      }),
    );
  };

  const handleCourseSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: courseForm.title,
      board: courseForm.board,
      duration: courseForm.duration,
      eligibility: courseForm.eligibility,
      description: courseForm.description,
      featured: courseForm.featured,
      popular: courseForm.popular,
      isPublished: courseForm.isPublished,
    };

    await runMutation(
      "course-form",
      () =>
        courseForm.id
          ? updateAdminCourse(adminToken, courseForm.id, payload)
          : createAdminCourse(adminToken, payload),
      () => setCourseForm(defaultCourseForm),
    );
  };

  const startEdit = (course) => {
    setCourseForm({
      id: course.id,
      title: course.title,
      board: course.board,
      duration: course.duration || "",
      eligibility: course.eligibility || "",
      description: course.description || "",
      featured: Boolean(course.featured),
      popular: Boolean(course.popular),
      isPublished: course.isPublished !== false,
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleCourseSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Course Management</p>
            <h3>{courseForm.id ? "Edit course" : "Add new course"}</h3>
            <p className="section-support-copy">
              Create and manage public courses directly from the database-backed catalog.
            </p>
          </div>
          {courseForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setCourseForm(defaultCourseForm)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="admin-form-grid">
          <label className="field">
            <span>Course Name</span>
            <input
              value={courseForm.title}
              onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Board</span>
            <select
              value={courseForm.board}
              onChange={(event) => setCourseForm((current) => ({ ...current, board: event.target.value }))}
            >
              <option value="NAFS">NAFS</option>
              <option value="NBVTE">NBVTE</option>
              <option value="MSBTE">MSBTE</option>
            </select>
          </label>
          <label className="field">
            <span>Duration</span>
            <input
              value={courseForm.duration}
              onChange={(event) => setCourseForm((current) => ({ ...current, duration: event.target.value }))}
              placeholder="1 Year"
              required
            />
          </label>
          <label className="field">
            <span>Eligibility</span>
            <input
              value={courseForm.eligibility}
              onChange={(event) => setCourseForm((current) => ({ ...current, eligibility: event.target.value }))}
              placeholder="10th Pass"
              required
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              rows="3"
              value={courseForm.description}
              onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={courseForm.featured}
              onChange={(event) => setCourseForm((current) => ({ ...current, featured: event.target.checked }))}
            />
            <span>Featured / Job Oriented</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={courseForm.popular}
              onChange={(event) => setCourseForm((current) => ({ ...current, popular: event.target.checked }))}
            />
            <span>Popular</span>
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={courseForm.isPublished}
              onChange={(event) => setCourseForm((current) => ({ ...current, isPublished: event.target.checked }))}
            />
            <span>Visible on public site</span>
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "course-form"}>
          {submitting === "course-form" ? "Saving..." : courseForm.id ? "Update course" : "Add course"}
        </button>
      </form>

      <form className="panel admin-form-panel" onSubmit={handleSettingsSubmit}>
        <p className="section-tag">Course Settings</p>
        <h3>WhatsApp enquiry control</h3>
        <div className="admin-form-grid">
          <label className="field field-span">
            <span>WhatsApp Number</span>
            <input
              value={courseSettingsForm.whatsappNumber}
              onChange={(event) =>
                setCourseSettingsForm((current) => ({
                  ...current,
                  whatsappNumber: event.target.value,
                }))
              }
              required
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "course-settings"}>
          {submitting === "course-settings" ? "Saving..." : "Update WhatsApp Number"}
        </button>
        <p className="label">Current public number: {courseSettings?.whatsappNumber}</p>
      </form>

      <section className="panel">
        <p className="section-tag">Course Controls</p>
        <h3>Search, filter, and quick edit</h3>
        <div className="admin-form-grid">
          <label className="field">
            <span>Search Courses</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by course name, board, duration, or eligibility"
            />
          </label>
          <label className="field">
            <span>Filter by Board</span>
            <select value={activeBoard} onChange={(event) => setActiveBoard(event.target.value)}>
              {boardFilters.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="admin-card-grid">
          {filteredCourses.map((course) => (
            <article key={course.id} className="admin-record-card">
              <div className="tag-row">
                <span className="course-board-tag">{course.board}</span>
                <span className="admin-tag">{course.eligibility}</span>
                {course.featured ? <span className="success-badge">Featured</span> : null}
                {course.popular ? <span className="course-badge">Popular</span> : null}
                {course.isPublished === false ? <span className="admin-tag muted">Hidden</span> : null}
              </div>
              <h4>{course.title}</h4>
              <p>{course.duration}</p>
              <p>{course.description || "No description added yet."}</p>
              <div className="admin-inline-actions">
                <button type="button" className="ghost-button" onClick={() => startEdit(course)}>
                  Quick edit
                </button>
                <button
                  type="button"
                  className="ghost-button danger"
                  onClick={() => handleDelete("course", () => deleteAdminCourse(adminToken, course.id))}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!filteredCourses.length ? <div className="info-card">No courses matched the current search or board filter.</div> : null}
        </div>
      </section>
    </div>
  );
}

export default CoursesSection;
