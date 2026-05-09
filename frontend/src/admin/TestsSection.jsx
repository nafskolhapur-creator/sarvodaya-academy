import { defaultTestForm } from "./adminUtils";

function TestsSection({
  adminToken,
  createAdminTest,
  deleteAdminTest,
  runMutation,
  setTestForm,
  submitting,
  testForm,
  tests,
  updateAdminTest,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    await runMutation(
      "test",
      () =>
        testForm.id
          ? updateAdminTest(adminToken, testForm.id, testForm)
          : createAdminTest(adminToken, testForm),
      () => setTestForm(defaultTestForm),
    );
  };

  const startEdit = (test) => {
    setTestForm({
      id: test._id,
      title: test.title,
      description: test.description || "",
      courseName: test.courseName || "",
      academicYear: test.academicYear || "",
      googleFormUrl: test.googleFormUrl,
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Test Series</p>
            <h3>{testForm.id ? "Edit test link" : "Add MCQ test link"}</h3>
          </div>
          {testForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setTestForm(defaultTestForm)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="admin-form-grid">
          <label className="field">
            <span>Title</span>
            <input
              value={testForm.title}
              onChange={(event) =>
                setTestForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Course Name</span>
            <input
              value={testForm.courseName}
              onChange={(event) =>
                setTestForm((current) => ({ ...current, courseName: event.target.value }))
              }
            />
          </label>
          <label className="field">
            <span>Academic Year</span>
            <input
              value={testForm.academicYear}
              onChange={(event) =>
                setTestForm((current) => ({ ...current, academicYear: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Google Form URL</span>
            <input
              type="url"
              value={testForm.googleFormUrl}
              onChange={(event) =>
                setTestForm((current) => ({ ...current, googleFormUrl: event.target.value }))
              }
              required
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              rows="3"
              value={testForm.description}
              onChange={(event) =>
                setTestForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "test"}>
          {submitting === "test" ? "Saving..." : testForm.id ? "Update test" : "Add test"}
        </button>
      </form>

      <div className="admin-card-grid">
        {tests.map((test) => (
          <article key={test._id} className="admin-record-card">
            <h4>{test.title}</h4>
            <p>{test.courseName || "General"}</p>
            <p>{test.academicYear || "Open year"}</p>
            <p>{test.description || "No description provided."}</p>
            <div className="admin-inline-actions">
              <a className="ghost-button" href={test.googleFormUrl} target="_blank" rel="noreferrer">
                Open form
              </a>
              <button type="button" className="ghost-button" onClick={() => startEdit(test)}>
                Edit
              </button>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => runMutation("test-delete", () => deleteAdminTest(adminToken, test._id))}
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

export default TestsSection;
