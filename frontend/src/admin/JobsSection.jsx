import { defaultJobForm, formatDate } from "./adminUtils";

function JobsSection({
  adminToken,
  createAdminJob,
  deleteAdminJob,
  jobApplicantSelection,
  jobForm,
  jobs,
  runMutation,
  setError,
  setJobApplicantSelection,
  setJobForm,
  studentOptions,
  submitting,
  toggleAdminJobApplicant,
  updateAdminJob,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      "job",
      () =>
        jobForm.id
          ? updateAdminJob(adminToken, jobForm.id, jobForm)
          : createAdminJob(adminToken, jobForm),
      () => setJobForm(defaultJobForm),
    );
  };

  const startEdit = (job) => {
    setJobForm({
      id: job._id,
      title: job.title,
      company: job.company,
      location: job.location || "",
      description: job.description || "",
      applyLink: job.applyLink || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Job Updates</p>
            <h3>{jobForm.id ? "Edit job posting" : "Add job posting"}</h3>
          </div>
          {jobForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setJobForm(defaultJobForm)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="admin-form-grid">
          <label className="field">
            <span>Title</span>
            <input
              value={jobForm.title}
              onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Company</span>
            <input
              value={jobForm.company}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, company: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Location</span>
            <input
              value={jobForm.location}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, location: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Deadline</span>
            <input
              type="date"
              value={jobForm.deadline}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, deadline: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Apply Link</span>
            <input
              type="url"
              value={jobForm.applyLink}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, applyLink: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              rows="3"
              value={jobForm.description}
              onChange={(event) =>
                setJobForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "job"}>
          {submitting === "job" ? "Saving..." : jobForm.id ? "Update job" : "Add job"}
        </button>
      </form>

      <div className="admin-card-grid">
        {jobs.map((job) => (
          <article key={job._id} className="admin-record-card">
            <h4>{job.title}</h4>
            <p>
              {job.company} {job.location ? `| ${job.location}` : ""}
            </p>
            <p>{job.description || "No description provided."}</p>
            <p>Deadline: {formatDate(job.deadline)}</p>
            <div className="job-applicants">
              <strong>Applicants</strong>
              <div className="tag-row">
                {job.applicants?.length ? (
                  job.applicants.map((applicant) => (
                    <span key={applicant._id} className="admin-tag">
                      {applicant.name}
                    </span>
                  ))
                ) : (
                  <span className="admin-tag muted">No applicants yet</span>
                )}
              </div>
            </div>
            <div className="admin-inline-actions stretch">
              <select
                value={jobApplicantSelection[job._id] || ""}
                onChange={(event) =>
                  setJobApplicantSelection((current) => ({
                    ...current,
                    [job._id]: event.target.value,
                  }))
                }
              >
                <option value="">Select student</option>
                {studentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  const studentId = jobApplicantSelection[job._id];

                  if (!studentId) {
                    setError("Select a student before toggling job application status.");
                    return;
                  }

                  runMutation("job-applicant", () =>
                    toggleAdminJobApplicant(adminToken, job._id, { studentId }),
                  );
                }}
              >
                Toggle applied
              </button>
            </div>
            <div className="admin-inline-actions">
              {job.applyLink ? (
                <a className="ghost-button" href={job.applyLink} target="_blank" rel="noreferrer">
                  Open post
                </a>
              ) : null}
              <button type="button" className="ghost-button" onClick={() => startEdit(job)}>
                Edit
              </button>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => runMutation("job-delete", () => deleteAdminJob(adminToken, job._id))}
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

export default JobsSection;
