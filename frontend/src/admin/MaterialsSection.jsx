import { defaultMaterialForm } from "./adminUtils";

function MaterialsSection({
  adminToken,
  createAdminMaterial,
  deleteAdminMaterial,
  materialForm,
  materials,
  runMutation,
  setMaterialForm,
  submitting,
  updateAdminMaterial,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    payload.append("title", materialForm.title);
    payload.append("description", materialForm.description);
    payload.append("courseName", materialForm.courseName);

    if (materialForm.file) {
      payload.append("file", materialForm.file);
    }

    await runMutation(
      "material",
      () =>
        materialForm.id
          ? updateAdminMaterial(adminToken, materialForm.id, payload)
          : createAdminMaterial(adminToken, payload),
      () => setMaterialForm(defaultMaterialForm),
    );
  };

  const startEdit = (material) => {
    setMaterialForm({
      id: material._id,
      title: material.title,
      description: material.description || "",
      courseName: material.courseName || "",
      file: null,
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Study Material</p>
            <h3>{materialForm.id ? "Edit material" : "Upload material"}</h3>
          </div>
          {materialForm.id ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setMaterialForm(defaultMaterialForm)}
            >
              Reset
            </button>
          ) : null}
        </div>
        <div className="admin-form-grid">
          <label className="field">
            <span>Title</span>
            <input
              value={materialForm.title}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="field">
            <span>Course Name</span>
            <input
              value={materialForm.courseName}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, courseName: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              value={materialForm.description}
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, description: event.target.value }))
              }
              rows="3"
            />
          </label>
          <label className="field field-span">
            <span>File Upload</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              onChange={(event) =>
                setMaterialForm((current) => ({ ...current, file: event.target.files?.[0] || null }))
              }
              required={!materialForm.id}
            />
          </label>
        </div>
        <button type="submit" className="primary-button" disabled={submitting === "material"}>
          {submitting === "material" ? "Saving..." : materialForm.id ? "Update material" : "Upload material"}
        </button>
      </form>

      <div className="admin-card-grid">
        {materials.map((material) => (
          <article key={material._id} className="admin-record-card">
            <h4>{material.title}</h4>
            <p>{material.courseName || "General material"}</p>
            <p>{material.description || "No description provided."}</p>
            <div className="admin-inline-actions">
              <a className="ghost-button" href={material.fileUrl} target="_blank" rel="noreferrer">
                Open
              </a>
              <button type="button" className="ghost-button" onClick={() => startEdit(material)}>
                Edit
              </button>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => runMutation("material-delete", () => deleteAdminMaterial(adminToken, material._id))}
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

export default MaterialsSection;
