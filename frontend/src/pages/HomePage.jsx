import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppIcon from "../components/AppIcon";
import CourseCard from "../components/CourseCard";
import LoadingState from "../components/LoadingState";
import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";
import { activityCategories, formatGalleryDate } from "../galleryUtils";
import { getFeaturedCourses, getGalleryItems, getPlacementHighlights } from "../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [placementHighlights, setPlacementHighlights] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState("");
  const { continueAsGuest } = useAuth();
  const { branding, resolvedBannerUrl, resolvedLogoUrl, isBrandingLoading } = useBranding();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [featuredResponse, placementResponse, galleryResponse] = await Promise.all([
          getFeaturedCourses(),
          getPlacementHighlights(),
          getGalleryItems({ limit: 12 }),
        ]);
        setFeaturedCourses(featuredResponse.courses);
        setPlacementHighlights(placementResponse.highlights);
        setRecentActivities(
          (galleryResponse.items || [])
            .filter((item) => activityCategories.includes(item.category))
            .slice(0, 6),
        );
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadSettings();
  }, []);

  if (isBrandingLoading && !error) {
    return (
      <LoadingState
        title="Loading institute profile"
        description="Fetching branding, featured courses, and placement highlights."
      />
    );
  }

  if (error) {
    return <section className="panel error-text">{error}</section>;
  }

  return (
    <div className="stack-lg">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="section-tag">{branding.affiliation}</span>
          <h2>{branding.instituteName}</h2>
          <p className="hero-subtitle">{branding.instituteSubtitle}</p>
          <p>{branding.heroDescription}</p>
          <div className="hero-points-grid">
            <article className="mini-feature-card">
              <AppIcon name="placements" />
              <div>
                <strong>Placement-driven</strong>
                <p>Programs aligned to jobs, interview prep, and employer-facing outcomes.</p>
              </div>
            </article>
            <article className="mini-feature-card">
              <AppIcon name="courses" />
              <div>
                <strong>Multiple boards</strong>
                <p>NAFS, NBVTE, and industry-ready courses from workshop to diploma level.</p>
              </div>
            </article>
          </div>
          <div className="action-row">
            <button type="button" className="primary-button" onClick={() => navigate("/login")}>
              Admin / Student Login
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                continueAsGuest();
                navigate("/dashboard");
              }}
            >
              Explore as External User
            </button>
          </div>
        </div>

        <div
          className="hero-card"
          style={
            resolvedBannerUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15, 95, 141, 0.08), rgba(255, 255, 255, 0.95)), url(${resolvedBannerUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="logo-badge">
            <img src={resolvedLogoUrl} alt="Institute logo" className="logo-image" />
          </div>
          <div className="info-card">
            <p className="label">Editable institute fields</p>
            <ul className="feature-list">
              <li>Institute logo</li>
              <li>Contact details</li>
              <li>Google map location</li>
            </ul>
          </div>
          <div className="hero-metric-grid">
            <article className="metric-card accent">
              <AppIcon name="placements" />
              <strong>100%</strong>
              <span>Job assistance focus</span>
            </article>
            <article className="metric-card">
              <AppIcon name="courses" />
              <strong>{featuredCourses.length || 7}+</strong>
              <span>Featured pathways</span>
            </article>
            <article className="metric-card">
              <AppIcon name="whatsapp" />
              <strong>Instant</strong>
              <span>WhatsApp enquiry support</span>
            </article>
          </div>
        </div>
      </section>

      <section className="marketing-block">
        <div className="marketing-copy">
          <p className="section-tag">Career Direction</p>
          <h3>12th ke baad kya kare?</h3>
          <p>
            Bahut students 12th ke baad career confusion face karte hain. Fire and Safety ek
            strong professional option hai jahan practical training, fast-track diploma paths, and
            industry demand dono milte hain.
          </p>
          <div className="marketing-points">
            <span>100% Job Assistance</span>
            <span>Short-term and Diploma courses</span>
            <span>High demand industry</span>
          </div>
          <button type="button" className="primary-button" onClick={() => navigate("/courses")}>
            Explore Courses
          </button>
        </div>
        <div className="marketing-side-card">
          <p className="label">Why students choose this path</p>
          <div className="timeline">
            <div>
              <strong>Clear Career Route</strong>
              <p>Move from confusion to a job-oriented skill path with structured training.</p>
            </div>
            <div>
              <strong>Fast Employability</strong>
              <p>Choose short-term programs or one-year diplomas based on your eligibility.</p>
            </div>
            <div>
              <strong>Industry Demand</strong>
              <p>Fire and safety roles continue to be relevant across plants, projects, and sites.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel spotlight-panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Programs</p>
            <h3>Featured Courses</h3>
            <p className="section-support-copy">Highlighted career programs with direct enquiry access.</p>
          </div>
          <button type="button" className="ghost-button" onClick={() => navigate("/courses")}>
            View All Courses
          </button>
        </div>
        <div className="course-grid">
          {featuredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              whatsappNumber={branding.whatsappNumber}
            />
          ))}
        </div>
      </section>

      <section className="panel spotlight-panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Recent Activities</p>
            <h3>Training, visits, and institute moments</h3>
            <p className="section-support-copy">
              A quick look at practical exposure across drills, events, certifications, and field visits.
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={() => navigate("/gallery")}>
            <AppIcon name="gallery" />
            Open Gallery
          </button>
        </div>
        <div className="gallery-showcase-grid">
          {recentActivities.length ? (
            recentActivities.map((item) => (
              <article key={item._id} className="activity-showcase-card">
                <img src={item.imageUrl} alt={item.title} className="activity-showcase-image" loading="lazy" />
                <div className="activity-showcase-copy">
                  <span className="gallery-category-badge">{item.category}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || "Practical learning and student engagement at Sarvodaya Academy."}</p>
                  <span className="activity-date">{formatGalleryDate(item.activityDate)}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="info-card">Recent activities will appear here after gallery uploads.</div>
          )}
        </div>
      </section>

      <section className="panel spotlight-panel placements-panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Placement Highlights</p>
            <h3>Recently placed students</h3>
            <p className="section-support-copy">Success stories that strengthen admissions confidence and trust.</p>
          </div>
        </div>
        <div className="placement-grid">
          {placementHighlights.length ? (
            placementHighlights.map((placement) => (
              <article key={placement._id} className="placement-story-card">
                <div className="placement-story-head">
                  {placement.studentPhotoUrl || placement.student?.photoUrl ? (
                    <img
                      src={placement.studentPhotoUrl || placement.student?.photoUrl}
                      alt={placement.student?.name}
                      className="placement-story-photo"
                    />
                  ) : (
                    <div className="student-avatar placeholder">
                      {(placement.student?.name || "S").slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="tag-row">
                      <span className="placement-badge">Placed Student</span>
                      <span className="success-badge">Success Story</span>
                    </div>
                    <h4>{placement.student?.name}</h4>
                    <p>{placement.companyName}</p>
                  </div>
                </div>
                <p>{placement.jobRole}</p>
                <p>{placement.location || "Location shared after joining"}</p>
                {placement.salaryAmount ? (
                  <p>
                    {formatCurrency(placement.salaryAmount)} / {placement.salaryPeriod}
                  </p>
                ) : null}
                <p>{placement.successStoryDescription || "Our students continue moving into industry roles."}</p>
              </article>
            ))
          ) : (
            <div className="info-card">Placement highlights will appear here as students get placed.</div>
          )}
        </div>
      </section>

      <section className="contact-grid">
        <article className="panel">
          <p className="section-tag">Contact</p>
          <h3>Reach the Institute</h3>
          <div className="contact-list">
            <p>{branding.contactEmail}</p>
            <p>{branding.contactPhone}</p>
            <p>{branding.address}</p>
          </div>
        </article>

        <article className="panel">
          <p className="section-tag">Location</p>
          <h3>Campus Map</h3>
          <div className="map-frame">
            <iframe
              title="Sarvodaya Academy map"
              src={branding.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>
    </div>
  );
}

export default HomePage;
