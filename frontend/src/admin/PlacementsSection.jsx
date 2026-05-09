import { defaultPlacementForm, formatCurrency, formatDate } from "./adminUtils";

function PlacementsSection({
  adminToken,
  createAdminPlacement,
  deleteAdminPlacement,
  handleDelete,
  placementForm,
  placements,
  runMutation,
  setPlacementForm,
  studentOptions,
  submitting,
  updateAdminPlacement,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("studentId", placementForm.studentId);
    payload.append("course", placementForm.course);
    payload.append("companyName", placementForm.companyName);
    payload.append("jobRole", placementForm.jobRole);
    payload.append("salaryAmount", placementForm.salaryAmount);
    payload.append("salaryPeriod", placementForm.salaryPeriod);
    payload.append("location", placementForm.location);
    payload.append("dateOfJoining", placementForm.dateOfJoining);
    payload.append("placementStatus", placementForm.placementStatus);
    payload.append("successStoryDescription", placementForm.successStoryDescription);
    payload.append("highlightOnHomepage", String(placementForm.highlightOnHomepage));

    if (placementForm.offerLetter) {
      payload.append("offerLetter", placementForm.offerLetter);
    }

    if (placementForm.studentPhoto) {
      payload.append("studentPhoto", placementForm.studentPhoto);
    }

    if (placementForm.companyLogo) {
      payload.append("companyLogo", placementForm.companyLogo);
    }

    await runMutation(
      "placement",
      () =>
        placementForm.id
          ? updateAdminPlacement(adminToken, placementForm.id, payload)
          : createAdminPlacement(adminToken, payload),
      () => setPlacementForm(defaultPlacementForm),
    );
  };

  const startEdit = (placement) => {
    setPlacementForm({
      id: placement._id,
      studentId: placement.student?._id || "",
      course: placement.course || placement.student?.courseEnrolled || "",
      companyName: placement.companyName,
      jobRole: placement.jobRole,
      salaryAmount: String(placement.salaryAmount || 0),
      salaryPeriod: placement.salaryPeriod || "monthly",
      location: placement.location || "",
      dateOfJoining: placement.dateOfJoining ? placement.dateOfJoining.slice(0, 10) : "",
      placementStatus: placement.placementStatus,
      offerLetter: null,
      studentPhoto: null,
      companyLogo: null,
      successStoryDescription: placement.successStoryDescription || "",
      highlightOnHomepage: Boolean(placement.highlightOnHomepage),
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Placement Tracking</p>
            <h3>{placementForm.id ? "Update placement record" : "Add placement record"}</h3>
          </div>
          {placementForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setPlacementForm(defaultPlacementForm)}>
              Reset
            </button>
          ) : null}
        </div>

        <div className="admin-form-grid">
          <label className="field">
            <span>Student Name</span>
            <select
              value={placementForm.studentId}
              onChange={(event) => setPlacementForm((current) => ({ ...current, studentId: event.target.value }))}
              required
            >
              <option value="">Select student</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Course</span>
            <input
              value={placementForm.course}
              onChange={(event) => setPlacementForm((current) => ({ ...current, course: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Company Name</span>
            <input
              value={placementForm.companyName}
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, companyName: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Job Role</span>
            <input
              value={placementForm.jobRole}
              onChange={(event) => setPlacementForm((current) => ({ ...current, jobRole: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Salary</span>
            <input
              type="number"
              min="0"
              value={placementForm.salaryAmount}
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, salaryAmount: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Salary Type</span>
            <select
              value={placementForm.salaryPeriod}
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, salaryPeriod: event.target.value }))
              }
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
          <label className="field">
            <span>Location</span>
            <input
              value={placementForm.location}
              onChange={(event) => setPlacementForm((current) => ({ ...current, location: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Date of Joining</span>
            <input
              type="date"
              value={placementForm.dateOfJoining}
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, dateOfJoining: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Placement Status</span>
            <select
              value={placementForm.placementStatus}
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, placementStatus: event.target.value }))
              }
            >
              <option value="Not Placed">Not Placed</option>
              <option value="In Process">In Process</option>
              <option value="Placed">Placed</option>
            </select>
          </label>
          <label className="field field-span">
            <span>Offer Letter (PDF/Image)</span>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, offerLetter: event.target.files?.[0] || null }))
              }
            />
          </label>
          <label className="field">
            <span>Student Photo</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, studentPhoto: event.target.files?.[0] || null }))
              }
            />
          </label>
          <label className="field">
            <span>Company Logo</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(event) =>
                setPlacementForm((current) => ({ ...current, companyLogo: event.target.files?.[0] || null }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Success Story Description</span>
            <textarea
              rows="3"
              value={placementForm.successStoryDescription}
              onChange={(event) =>
                setPlacementForm((current) => ({
                  ...current,
                  successStoryDescription: event.target.value,
                }))
              }
            />
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={placementForm.highlightOnHomepage}
              onChange={(event) =>
                setPlacementForm((current) => ({
                  ...current,
                  highlightOnHomepage: event.target.checked,
                }))
              }
            />
            <span>Show in Placement Highlights</span>
          </label>
        </div>

        <button type="submit" className="primary-button" disabled={submitting === "placement"}>
          {submitting === "placement"
            ? "Saving..."
            : placementForm.id
              ? "Update placement"
              : "Add placement"}
        </button>
      </form>

      <section className="panel">
        <p className="section-tag">Success Stories</p>
        <h3>Placement records</h3>
        <div className="admin-card-grid">
          {placements.map((placement) => (
            <article key={placement._id} className="admin-record-card placement-card">
              <div className="placement-card-head">
                <div className="placement-avatar-row">
                  {placement.studentPhotoUrl || placement.student?.photoUrl ? (
                    <img
                      src={placement.studentPhotoUrl || placement.student?.photoUrl}
                      alt={placement.student?.name}
                      className="placement-student-photo"
                    />
                  ) : (
                    <div className="student-avatar placeholder">
                      {(placement.student?.name || "S").slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="tag-row">
                      <span className="admin-tag">{placement.placementStatus}</span>
                      {placement.placementStatus === "Placed" ? (
                        <span className="placement-badge">Placed Student</span>
                      ) : null}
                      {placement.highlightOnHomepage ? (
                        <span className="success-badge">Success Story</span>
                      ) : null}
                    </div>
                    <h4>{placement.student?.name}</h4>
                    <p>{placement.course}</p>
                  </div>
                </div>
                {placement.companyLogoUrl ? (
                  <img src={placement.companyLogoUrl} alt={placement.companyName} className="placement-company-logo" />
                ) : null}
              </div>
              <p>
                <strong>{placement.companyName}</strong> | {placement.jobRole}
              </p>
              <p>
                {placement.location || "Location pending"} | Joining: {formatDate(placement.dateOfJoining)}
              </p>
              <p>
                Salary: {placement.salaryAmount ? formatCurrency(placement.salaryAmount) : "Not shared"}{" "}
                {placement.salaryAmount ? `/${placement.salaryPeriod}` : ""}
              </p>
              <p>{placement.successStoryDescription || "No success story summary added yet."}</p>
              <div className="admin-inline-actions">
                {placement.offerLetterUrl ? (
                  <a className="ghost-button" href={placement.offerLetterUrl} target="_blank" rel="noreferrer">
                    View offer letter
                  </a>
                ) : null}
                <button type="button" className="ghost-button" onClick={() => startEdit(placement)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="ghost-button danger"
                  onClick={() => handleDelete("placement", () => deleteAdminPlacement(adminToken, placement._id))}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PlacementsSection;
