import { defaultInterviewForm } from "./adminUtils";

function InterviewsSection({
  adminToken,
  createAdminInterview,
  deleteAdminInterview,
  interviewForm,
  interviews,
  runMutation,
  setInterviewForm,
  submitting,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    payload.append("title", interviewForm.title);
    payload.append("description", interviewForm.description);
    payload.append("courseName", interviewForm.courseName);

    if (interviewForm.file) {
      payload.append("file", interviewForm.file);
    }

    await runMutation(
      "interview",
      () => createAdminInterview(adminToken, payload),
      () => setInterviewForm(defaultInterviewForm),
    );
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <p className="section-tag">Interview Q&A</p>
        <h3>Upload interview PDF</h3>
        <div className="admin-form-grid">
          <label className="field">
            <span>Title</span>
            <input
              value={interviewForm.title}
              onChange={(event) =>
                setInterviewForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Course Name</span>
            <input
              value={interviewForm.courseName}
              onChange={(event) =>
                setInterviewForm((current) => ({ ...current, courseName: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              rows="3"
              value={interviewForm.description}
              onChange={(event) =>
                setInterviewForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>PDF Upload</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setInterviewForm((current) => ({ ...current, file: event.target.files?.[0] || null }))
              }
              required
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "interview"}>
          {submitting === "interview" ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      <div className="admin-card-grid">
        {interviews.map((resource) => (
          <article key={resource._id} className="admin-record-card">
            <h4>{resource.title}</h4>
            <p>{resource.courseName || "General"}</p>
            <p>{resource.description || "No description provided."}</p>
            <div className="admin-inline-actions">
              <a className="ghost-button" href={resource.fileUrl} target="_blank" rel="noreferrer">
                Open PDF
              </a>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() =>
                  runMutation("interview-delete", () => deleteAdminInterview(adminToken, resource._id))
                }
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default InterviewsSection;
