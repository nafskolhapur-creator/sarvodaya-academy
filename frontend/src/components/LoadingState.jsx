function LoadingState({
  title = "Loading",
  description = "Please wait while we prepare your workspace.",
  compact = false,
  className = "",
}) {
  return (
    <section className={`loading-state panel ${compact ? "compact" : ""} ${className}`.trim()}>
      <div className="loading-orbit">
        <span />
        <span />
        <span />
      </div>
      <div className="loading-copy">
        <p className="section-tag">Please wait</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="loading-skeleton" aria-hidden="true">
        <span className="skeleton-line long" />
        <span className="skeleton-line" />
        <span className="skeleton-line short" />
      </div>
    </section>
  );
}

export default LoadingState;
