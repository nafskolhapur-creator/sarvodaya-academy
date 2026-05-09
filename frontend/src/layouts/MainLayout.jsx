import { NavLink, Outlet, useNavigate } from "react-router-dom";

import AppIcon from "../components/AppIcon";
import { useAuth } from "../context/AuthContext";

const publicNavItems = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/courses", label: "Courses", icon: "courses" },
  { to: "/gallery", label: "Gallery", icon: "gallery" },
  { to: "/login", label: "Student Login", icon: "login" },
  { to: "/admin/login", label: "Admin Login", icon: "admin" },
];

function MainLayout() {
  const { user, logout, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate("/dashboard");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar-shell">
        <div className="app-brand-card">
          <div className="logo-badge compact">
            <AppIcon name="spark" size={26} />
          </div>
          <div>
            <p className="eyebrow">Sarvodaya Academy</p>
            <h1 className="brand-title">Institute ERP</h1>
            <p className="sidebar-copy">NAFS Fire and Safety College, Kolhapur</p>
          </div>
        </div>

        <nav className="app-nav">
          {publicNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "app-nav-item active" : "app-nav-item")}>
              <AppIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {user ? (
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "app-nav-item active" : "app-nav-item")}>
              <AppIcon name="dashboard" />
              <span>Dashboard</span>
            </NavLink>
          ) : null}
        </nav>

        <div className="app-utility-card">
          <p className="section-tag">Quick Access</p>
          <h3>Admissions and student services</h3>
          <p>Explore courses publicly, then move students into secure portal access with role-based modules.</p>
          {!user ? (
            <button type="button" className="primary-button" onClick={handleGuestAccess}>
              External User Preview
            </button>
          ) : (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      <div className="app-main-shell">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">Modern Institute Portal</p>
            <h2 className="shell-title">Sarvodaya Academy</h2>
            <p className="shell-subtitle">Placements, academics, finance, and admissions on one streamlined workspace.</p>
          </div>
          <div className="app-topbar-meta">
            <div className="topbar-meta-card">
              <span className="label">Portal</span>
              <strong>{user ? "Authenticated Workspace" : "Public Experience"}</strong>
            </div>
            <div className="topbar-meta-card">
              <span className="label">Access</span>
              <strong>{user ? `${user.role} account` : "Open preview and enquiry"}</strong>
            </div>
          </div>
        </header>
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
