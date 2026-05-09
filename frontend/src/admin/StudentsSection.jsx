import { buildInstallments, defaultStudentForm, formatCurrency, formatDate } from "./adminUtils";

function StudentsSection({
  adminToken,
  deleteAdminStudent,
  groupedStudents,
  handleDelete,
  runMutation,
  setActiveSection,
  setStudentForm,
  studentForm,
  submitting,
  updateAdminStudent,
  createAdminStudent,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = new FormData();
    const installments = buildInstallments(studentForm.courseFee, studentForm.installmentsCount);

    payload.append("name", studentForm.name);
    payload.append("mobileNumber", studentForm.mobileNumber);
    payload.append("dob", studentForm.dob);
    payload.append("academicYear", studentForm.academicYear);
    payload.append("courseEnrolled", studentForm.courseEnrolled);
    payload.append("courseFee", studentForm.courseFee);
    payload.append("installments", JSON.stringify(installments));
    payload.append("fine", studentForm.fine);
    payload.append("parentContact", studentForm.parentContact);

    if (studentForm.photo) {
      payload.append("photo", studentForm.photo);
    }

    await runMutation(
      "student",
      () =>
        studentForm.id
          ? updateAdminStudent(adminToken, studentForm.id, payload)
          : createAdminStudent(adminToken, payload),
      () => setStudentForm(defaultStudentForm),
    );
  };

  const startEdit = (student) => {
    setStudentForm({
      id: student._id,
      name: student.name,
      mobileNumber: student.mobileNumber || "",
      dob: student.dob ? student.dob.slice(0, 10) : "",
      academicYear: student.academicYear,
      courseEnrolled: student.courseEnrolled,
      courseFee: String(student.courseFee),
      installmentsCount: String(student.installments?.length || 1),
      fine: String(student.fine || 0),
      parentContact: student.parentContact,
      photo: null,
      photoUrl: student.photoUrl,
    });
    setActiveSection("students");
  };

  return (
    <div className="stack-lg">
      <section className="admin-form-layout">
        <form className="panel admin-form-panel" onSubmit={handleSubmit}>
          <div className="section-head">
            <div>
              <p className="section-tag">Student Management</p>
              <h3>{studentForm.id ? "Edit Student" : "Add Student"}</h3>
            </div>
            {studentForm.id ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => setStudentForm(defaultStudentForm)}
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="admin-form-grid">
            <label className="field">
              <span>Name</span>
              <input
                value={studentForm.name}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Mobile Number</span>
              <input
                value={studentForm.mobileNumber}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, mobileNumber: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>DOB</span>
              <input
                type="date"
                value={studentForm.dob}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, dob: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Academic Year</span>
              <input
                value={studentForm.academicYear}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, academicYear: event.target.value }))
                }
                placeholder="2026-2027"
                required
              />
            </label>
            <label className="field">
              <span>Course Enrolled</span>
              <input
                value={studentForm.courseEnrolled}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, courseEnrolled: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Course Fee</span>
              <input
                type="number"
                min="0"
                value={studentForm.courseFee}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, courseFee: event.target.value }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Installments</span>
              <input
                type="number"
                min="1"
                value={studentForm.installmentsCount}
                onChange={(event) =>
                  setStudentForm((current) => ({
                    ...current,
                    installmentsCount: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="field">
              <span>Fine</span>
              <input
                type="number"
                min="0"
                value={studentForm.fine}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, fine: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Parent Contact</span>
              <input
                value={studentForm.parentContact}
                onChange={(event) =>
                  setStudentForm((current) => ({
                    ...current,
                    parentContact: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="field field-span">
              <span>Student Photo (jpeg/png)</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) =>
                  setStudentForm((current) => ({
                    ...current,
                    photo: event.target.files?.[0] || null,
                  }))
                }
              />
            </label>
          </div>

          <button type="submit" className="primary-button" disabled={submitting === "student"}>
            {submitting === "student"
              ? "Saving..."
              : studentForm.id
                ? "Update student"
                : "Add student"}
          </button>
        </form>

        <div className="panel">
          <p className="section-tag">Grouped by Academic Year</p>
          <h3>Student directory</h3>
          <div className="admin-group-stack">
            {Object.entries(groupedStudents).map(([year, yearStudents]) => (
              <section key={year} className="admin-year-group">
                <div className="year-heading">
                  <strong>{year}</strong>
                  <span>{yearStudents.length} students</span>
                </div>
                <div className="admin-card-grid">
                  {yearStudents.map((student) => (
                    <article key={student._id} className="admin-record-card">
                      <div className="student-record-header">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="student-avatar" />
                        ) : (
                          <div className="student-avatar placeholder">{student.name.slice(0, 1)}</div>
                        )}
                        <div>
                          <h4>{student.name}</h4>
                          <p>{student.courseEnrolled}</p>
                        </div>
                      </div>
                      <p>DOB: {formatDate(student.dob)}</p>
                      <p>Mobile: {student.mobileNumber}</p>
                      <p>Course Fee: {formatCurrency(student.courseFee)}</p>
                      <p>Fine: {formatCurrency(student.fine)}</p>
                      <p>Installments: {student.installments?.length || 0}</p>
                      <p>Parent Contact: {student.parentContact}</p>
                      <div className="admin-inline-actions">
                        <button type="button" className="ghost-button" onClick={() => startEdit(student)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ghost-button danger"
                          onClick={() =>
                            handleDelete("student", () => deleteAdminStudent(adminToken, student._id))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentsSection;
