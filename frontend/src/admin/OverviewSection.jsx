import AppIcon from "../components/AppIcon";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const monthLabel = (monthNumber) =>
  new Date(2000, Number(monthNumber) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });

function OverviewSection({ overview }) {
  const statItems = [
    { label: "Total Students", value: overview?.studentCount || 0, icon: "students" },
    { label: "Unpaid Fees", value: overview?.unpaidFees || 0, icon: "fees" },
    { label: "Late Fees", value: overview?.lateFees || 0, icon: "calendar" },
    { label: "Placed Students", value: overview?.placedStudents || 0, icon: "placements" },
    { label: "Placement Rate", value: `${overview?.placementRate || 0}%`, icon: "spark" },
    { label: "Total Leads", value: overview?.leadCount || 0, icon: "leads" },
  ];

  return (
    <div className="stack-lg">
      <section className="admin-stat-grid">
        {statItems.map((item) => (
          <article key={item.label} className="admin-stat-card">
            <div className="admin-stat-head">
              <div className="icon-chip">
                <AppIcon name={item.icon} />
              </div>
              <span>{item.label}</span>
            </div>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <p className="section-tag">Monthly Collection</p>
        <h3>
          {monthLabel(overview?.monthlyCollection?.month || new Date().getMonth() + 1)}{" "}
          {overview?.monthlyCollection?.year || new Date().getFullYear()}
        </h3>
        <div className="admin-mini-grid">
          <div className="info-card">
            <span className="label">Expected</span>
            <p>{formatCurrency(overview?.monthlyCollection?.totalExpected)}</p>
          </div>
          <div className="info-card">
            <span className="label">Collected</span>
            <p>{formatCurrency(overview?.monthlyCollection?.totalCollected)}</p>
          </div>
          <div className="info-card">
            <span className="label">Pending</span>
            <p>{formatCurrency(overview?.monthlyCollection?.pendingAmount)}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="section-tag">Academic Years</p>
        <h3>Student group buckets</h3>
        <div className="tag-row">
          {(overview?.academicYears || []).map((year) => (
            <span key={year} className="admin-tag">
              {year}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="section-tag">Quick Snapshot</p>
        <h3>Admin modules ready</h3>
        <div className="admin-mini-grid">
          <div className="info-card">
            <h4>Students</h4>
            <p>Academic year grouping, photo uploads, fees, and parent contacts.</p>
          </div>
          <div className="info-card">
            <h4>Fees</h4>
            <p>Monthly records, paid or unpaid status, and automatic late-fee visibility.</p>
          </div>
          <div className="info-card">
            <h4>Placements</h4>
            <p>Track student status, upload offer letters, and curate public success stories.</p>
          </div>
          <div className="info-card">
            <h4>Resources</h4>
            <p>Materials, test links, PDFs, and certificates are all centrally managed.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverviewSection;
