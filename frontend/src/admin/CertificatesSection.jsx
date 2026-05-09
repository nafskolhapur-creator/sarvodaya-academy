import { defaultCertificateForm, formatDate } from "./adminUtils";

function CertificatesSection({
  adminToken,
  certificateForm,
  certificates,
  createAdminCertificate,
  deleteAdminCertificate,
  runMutation,
  setCertificateForm,
  studentOptions,
  submitting,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    payload.append("studentId", certificateForm.studentId);
    payload.append("title", certificateForm.title);
    payload.append("issueDate", certificateForm.issueDate);

    if (certificateForm.file) {
      payload.append("file", certificateForm.file);
    }

    await runMutation(
      "certificate",
      () => createAdminCertificate(adminToken, payload),
      () => setCertificateForm(defaultCertificateForm),
    );
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <p className="section-tag">Certification</p>
        <h3>Upload certificate</h3>
        <div className="admin-form-grid">
          <label className="field">
            <span>Student</span>
            <select
              value={certificateForm.studentId}
              onChange={(event) =>
                setCertificateForm((current) => ({ ...current, studentId: event.target.value }))
              }
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
            <span>Certificate Title</span>
            <input
              value={certificateForm.title}
              onChange={(event) =>
                setCertificateForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Issue Date</span>
            <input
              type="date"
              value={certificateForm.issueDate}
              onChange={(event) =>
                setCertificateForm((current) => ({ ...current, issueDate: event.target.value }))
              }
              required
            />
          </label>
          <label className="field field-span">
            <span>Certificate File</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(event) =>
                setCertificateForm((current) => ({ ...current, file: event.target.files?.[0] || null }))
              }
              required
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "certificate"}>
          {submitting === "certificate" ? "Uploading..." : "Upload certificate"}
        </button>
      </form>

      <div className="admin-card-grid">
        {certificates.map((certificate) => (
          <article key={certificate._id} className="admin-record-card">
            <h4>{certificate.title}</h4>
            <p>{certificate.student?.name}</p>
            <p>Issued on {formatDate(certificate.issueDate)}</p>
            <div className="admin-inline-actions">
              <a className="ghost-button" href={certificate.fileUrl} target="_blank" rel="noreferrer">
                Open file
              </a>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() =>
                  runMutation("certificate-delete", () =>
                    deleteAdminCertificate(adminToken, certificate._id),
                  )
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

export default CertificatesSection;
