import { useEffect, useMemo, useState } from "react";

import AppIcon from "../components/AppIcon";
import LoadingState from "../components/LoadingState";
import { formatGalleryDate, galleryCategories } from "../galleryUtils";
import { getGalleryItems } from "../services/api";

function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await getGalleryItems();
        setGalleryItems(response.items);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, []);

  useEffect(() => {
    if (!lightboxItem) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxItem]);

  const filteredItems = useMemo(
    () => galleryItems.filter((item) => (activeCategory ? item.category === activeCategory : true)),
    [activeCategory, galleryItems],
  );

  if (error) {
    return <section className="panel error-text">{error}</section>;
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading gallery"
        description="Preparing activity photos, placement media, and category filters."
      />
    );
  }

  return (
    <div className="stack-lg">
      <section className="panel courses-hero">
        <div>
          <p className="section-tag">Photo Gallery</p>
          <h2>Institute Activities and Placement Showcase</h2>
          <p>
            Explore student activities, industrial visits, fire drill training, certifications, and recent events through a mobile-friendly visual gallery.
          </p>
          <div className="course-hero-stats">
            <article className="metric-card slim">
              <AppIcon name="gallery" />
              <strong>{galleryItems.length}</strong>
              <span>Total gallery items</span>
            </article>
            <article className="metric-card slim">
              <AppIcon name="placements" />
              <strong>{galleryItems.filter((item) => item.category === "Placement Photos").length}</strong>
              <span>Placement photos</span>
            </article>
          </div>
        </div>
        <div className="filter-panel">
          <span className="label">Filter by category</span>
          <div className="filter-chip-row">
            <button
              type="button"
              className={!activeCategory ? "filter-chip active" : "filter-chip"}
              onClick={() => setActiveCategory("")}
            >
              All
            </button>
            {galleryCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "filter-chip active" : "filter-chip"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Gallery Grid</p>
            <h3>Visual highlights</h3>
            <p className="section-support-copy">
              Tap any image to enlarge it. {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} shown.
            </p>
          </div>
        </div>

        <div className="gallery-grid">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <button
                key={item._id}
                type="button"
                className="gallery-card"
                onClick={() => setLightboxItem(item)}
              >
                <img src={item.imageUrl} alt={item.title} className="gallery-card-image" loading="lazy" />
                <div className="gallery-card-overlay">
                  <span className="gallery-category-badge">{item.category}</span>
                  <h4>{item.title}</h4>
                  <p>{formatGalleryDate(item.activityDate)}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="info-card">No gallery items matched the selected category.</div>
          )}
        </div>
      </section>

      {lightboxItem ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxItem(null)}>
          <div className="gallery-lightbox-content" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gallery-lightbox-close" onClick={() => setLightboxItem(null)}>
              Close
            </button>
            <img src={lightboxItem.imageUrl} alt={lightboxItem.title} className="gallery-lightbox-image" />
            <div className="gallery-lightbox-copy">
              <div className="tag-row">
                <span className="gallery-category-badge">{lightboxItem.category}</span>
                <span className="admin-tag muted">{formatGalleryDate(lightboxItem.activityDate)}</span>
              </div>
              <h3>{lightboxItem.title}</h3>
              <p>{lightboxItem.description || "Gallery preview from Sarvodaya Academy."}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GalleryPage;
