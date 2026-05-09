import { useEffect, useMemo, useState } from "react";

import AppIcon from "../components/AppIcon";
import CourseCard from "../components/CourseCard";
import LoadingState from "../components/LoadingState";
import { boardFilters, eligibilityFilters, matchesEligibilityFilter } from "../courseUtils";
import { getCourses, getSettings } from "../services/api";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState("+91-9730848101");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    eligibility: "",
    board: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [coursesResponse, settingsResponse] = await Promise.all([getCourses(), getSettings()]);
        setCourses(coursesResponse.courses);
        setWhatsappNumber(settingsResponse.settings.whatsappNumber);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => (filters.board ? course.board === filters.board : true)).filter((course) =>
        matchesEligibilityFilter(course.eligibility, filters.eligibility),
      ),
    [courses, filters],
  );

  if (error) {
    return <section className="panel error-text">{error}</section>;
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading course catalog"
        description="Preparing eligibility filters and board-wise course options."
      />
    );
  }

  return (
    <div className="stack-lg">
      <section className="panel courses-hero">
        <div>
          <p className="section-tag">Course Finder</p>
          <h2>Explore Fire and Safety Courses</h2>
          <p>
            Filter by eligibility and board to find the right path across NAFS, NBVTE, and MSBTE
            course options.
          </p>
          <div className="course-hero-stats">
            <article className="metric-card slim">
              <AppIcon name="courses" />
              <strong>{courses.length}</strong>
              <span>Total listed courses</span>
            </article>
            <article className="metric-card slim">
              <AppIcon name="message" />
              <strong>Instant</strong>
              <span>WhatsApp enquiry flow</span>
            </article>
          </div>
        </div>
        <div className="filter-panel">
          <div>
            <span className="label">Eligibility</span>
            <div className="filter-chip-row">
              <button
                type="button"
                className={!filters.eligibility ? "filter-chip active" : "filter-chip"}
                onClick={() => setFilters((current) => ({ ...current, eligibility: "" }))}
              >
                All
              </button>
              {eligibilityFilters.map((eligibility) => (
                <button
                  key={eligibility}
                  type="button"
                  className={filters.eligibility === eligibility ? "filter-chip active" : "filter-chip"}
                  onClick={() => setFilters((current) => ({ ...current, eligibility }))}
                >
                  {eligibility}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Board</span>
            <div className="filter-chip-row">
              <button
                type="button"
                className={!filters.board ? "filter-chip active" : "filter-chip"}
                onClick={() => setFilters((current) => ({ ...current, board: "" }))}
              >
                All
              </button>
              {boardFilters.map((board) => (
                <button
                  key={board}
                  type="button"
                  className={filters.board === board ? "filter-chip active" : "filter-chip"}
                  onClick={() => setFilters((current) => ({ ...current, board }))}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-tag">Filtered Results</p>
            <h3>Available course options</h3>
            <p className="section-support-copy">
              {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} matched your current filters.
            </p>
          </div>
        </div>
        <div className="course-grid">
        {filteredCourses.length ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} whatsappNumber={whatsappNumber} />
          ))
        ) : (
          <div className="info-card">No courses matched the selected filters.</div>
        )}
        </div>
      </section>
    </div>
  );
}

export default CoursesPage;
