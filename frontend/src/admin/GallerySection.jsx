import { defaultGalleryForm } from "./adminUtils";
import { formatGalleryDate, galleryCategories } from "../galleryUtils";
import { compressImageFile, compressImageFiles } from "../utils/imageUpload";

function GallerySection({
  adminToken,
  createAdminGallery,
  deleteAdminGallery,
  galleryForm,
  galleryItems,
  handleDelete,
  runMutation,
  setGalleryForm,
  submitting,
  updateAdminGallery,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    payload.append("title", galleryForm.title);
    payload.append("description", galleryForm.description);
    payload.append("category", galleryForm.category);
    payload.append("activityDate", galleryForm.activityDate);

    if (galleryForm.id) {
      if (galleryForm.image) {
        const compressedImage = await compressImageFile(galleryForm.image);
        payload.append("image", compressedImage);
      }

      await runMutation(
        "gallery",
        () => updateAdminGallery(adminToken, galleryForm.id, payload),
        () => setGalleryForm(defaultGalleryForm),
      );

      return;
    }

    const compressedFiles = await compressImageFiles(galleryForm.files);

    compressedFiles.forEach((file) => {
      payload.append("images", file);
    });

    await runMutation(
      "gallery",
      () => createAdminGallery(adminToken, payload),
      () => setGalleryForm(defaultGalleryForm),
    );
  };

  const startEdit = (item) => {
    setGalleryForm({
      id: item._id,
      title: item.title,
      description: item.description || "",
      category: item.category,
      activityDate: item.activityDate ? item.activityDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      files: [],
      image: null,
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Photo Gallery</p>
            <h3>{galleryForm.id ? "Edit gallery item" : "Upload activity photos"}</h3>
            <p className="section-support-copy">
              Multiple uploads are supported. Large images are compressed in the browser before upload.
            </p>
          </div>
          {galleryForm.id ? (
            <button type="button" className="ghost-button" onClick={() => setGalleryForm(defaultGalleryForm)}>
              Reset
            </button>
          ) : null}
        </div>

        <div className="admin-form-grid">
          <label className="field">
            <span>Title</span>
            <input
              value={galleryForm.title}
              onChange={(event) => setGalleryForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Activity title"
              required
            />
          </label>
          <label className="field">
            <span>Category</span>
            <select
              value={galleryForm.category}
              onChange={(event) => setGalleryForm((current) => ({ ...current, category: event.target.value }))}
            >
              {galleryCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={galleryForm.activityDate}
              onChange={(event) => setGalleryForm((current) => ({ ...current, activityDate: event.target.value }))}
              required
            />
          </label>
          <label className="field field-span">
            <span>Description</span>
            <textarea
              rows="3"
              value={galleryForm.description}
              onChange={(event) => setGalleryForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="field field-span">
            <span>{galleryForm.id ? "Replace Image" : "Upload Images"}</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              multiple={!galleryForm.id}
              onChange={(event) =>
                setGalleryForm((current) => ({
                  ...current,
                  files: Array.from(event.target.files || []),
                  image: event.target.files?.[0] || null,
                }))
              }
              required={!galleryForm.id}
            />
          </label>
        </div>

        <button type="submit" className="primary-button" disabled={submitting === "gallery"}>
          {submitting === "gallery"
            ? "Saving..."
            : galleryForm.id
              ? "Update gallery item"
              : "Upload gallery items"}
        </button>
      </form>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Published Media</p>
            <h3>Gallery items</h3>
          </div>
        </div>

        <div className="gallery-admin-grid">
          {galleryItems.length ? (
            galleryItems.map((item) => (
              <article key={item._id} className="admin-record-card gallery-admin-card">
                <img src={item.imageUrl} alt={item.title} className="gallery-admin-image" loading="lazy" />
                <div className="tag-row">
                  <span className="admin-tag">{item.category}</span>
                  <span className="admin-tag muted">{formatGalleryDate(item.activityDate)}</span>
                </div>
                <h4>{item.title}</h4>
                <p>{item.description || "No description added yet."}</p>
                <div className="admin-inline-actions">
                  <button type="button" className="ghost-button" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ghost-button danger"
                    onClick={() => handleDelete("gallery item", () => deleteAdminGallery(adminToken, item._id))}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="info-card">No gallery items uploaded yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default GallerySection;
