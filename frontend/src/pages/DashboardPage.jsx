import { useEffect, useState } from "react";

import AppIcon from "../components/AppIcon";
import LoadingState from "../components/LoadingState";
import StudentPanelPage from "./StudentPanelPage";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/api";

const roleLabels = {
  admin: "Admin",
  student: "Student",
  "external-user": "External User",
};

function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role === "student") {
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await getDashboard(user.role);
        setDashboard(response.dashboard);
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadDashboard();
  }, [user.role]);

  if (user.role === "student") {
    return <StudentPanelPage />;
  }

  if (!dashboard && !error) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Preparing your role-based workspace and access shortcuts."
      />
    );
  }

  if (error) {
    return <section className="panel error-text">{error}</section>;
  }

  return (
    <div className="stack-lg">
      <section className="dashboard-hero panel">
        <div>
          <p className="section-tag">{roleLabels[user.role]} Portal</p>
          <h2>{dashboard.title}</h2>
          <p>{dashboard.summary}</p>
          <div className="dashboard-highlight-row">
            <span className="dashboard-pill">
              <AppIcon name="dashboard" size={16} />
              Unified portal
            </span>
            <span className="dashboard-pill">
              <AppIcon name="courses" size={16} />
              Academic workflows
            </span>
            <span className="dashboard-pill">
              <AppIcon name="placements" size={16} />
              Placement visibility
            </span>
          </div>
        </div>
        <div className="welcome-card">
          <p className="label">Signed in as</p>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <p className="section-tag">Quick Actions</p>
          <h3>Daily workspace shortcuts</h3>
          <div className="card-grid dashboard-actions-grid">
            {dashboard.actions.map((action, index) => {
              const iconNames = ["dashboard", "students", "fees", "placements"];
              return (
              <div key={action} className="info-card compact-card dashboard-action-card">
                <div className="icon-chip">
                  <AppIcon name={iconNames[index % iconNames.length]} />
                </div>
                <h4>{action}</h4>
                <p>Launch this workflow from the institute ERP shell as the modules continue expanding.</p>
              </div>
            );
            })}
          </div>
        </article>

        <article className="panel">
          <p className="section-tag">Modules</p>
          <h3>Core sections planned</h3>
          <div className="timeline">
            <div>
              <strong>Institute Profile</strong>
              <p>Manage logo, contact details, and location embed settings.</p>
            </div>
            <div>
              <strong>Courses</strong>
              <p>List and organize fire and safety programs for different audiences.</p>
            </div>
            <div>
              <strong>User Management</strong>
              <p>Role-based access keeps student views read-only while admins manage operations securely.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
