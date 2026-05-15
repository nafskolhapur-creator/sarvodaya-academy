import AppIcon from "./AppIcon";
import { buildWhatsappUrl, getCourseBadges } from "../courseUtils";
import { useBranding } from "../context/BrandingContext";

function CourseCard({ course, whatsappNumber }) {
  const { branding } = useBranding();
  const badges = getCourseBadges(course);
  const enquiryUrl = buildWhatsappUrl(whatsappNumber, course.title, branding.instituteName);

  return (
    <article className="course-card">
      <div className="course-card-head">
        <div className="tag-row">
          <span className="course-board-tag">{course.board}</span>
          {badges.map((badge) => (
            <span key={badge} className="course-badge">
              {badge}
            </span>
          ))}
        </div>
        <h3>{course.title}</h3>
      </div>

      <div className="course-meta">
        <p>
          <AppIcon name="calendar" />
          <span className="label">Duration</span>
          {course.duration}
        </p>
        <p>
          <AppIcon name="profile" />
          <span className="label">Eligibility</span>
          {course.eligibility}
        </p>
      </div>

      <p className="course-description">{course.description || "Career-focused fire and safety training."}</p>

      <div className="admin-inline-actions">
        {enquiryUrl ? (
          <a
            className="primary-button inline-link"
            href={enquiryUrl}
            target="_blank"
            rel="noreferrer"
          >
            <AppIcon name="whatsapp" />
            Enquire Now
          </a>
        ) : (
          <span className="ghost-button disabled">WhatsApp unavailable</span>
        )}
      </div>
    </article>
  );
}

export default CourseCard;
