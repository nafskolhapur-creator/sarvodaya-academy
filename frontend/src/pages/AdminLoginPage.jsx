import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";

function AdminLoginPage() {
  const { adminLogin, isAdminLoading } = useAuth();
  const { branding, resolvedBannerUrl, resolvedLogoUrl } = useBranding();
  const [formState, setFormState] = useState({
    email: "nafskolhapur@gmail.com",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/admin";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await adminLogin(formState);
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="admin-login-shell">
      <div
        className="admin-login-card admin-hero-card"
        style={
          resolvedBannerUrl
            ? {
                backgroundImage: `linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url(${resolvedBannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="auth-brand-row">
          <div className="logo-badge compact branding-logo-frame">
            <img src={resolvedLogoUrl} alt={branding.instituteName} className="logo-image" />
          </div>
          <div>
            <p className="section-tag">{branding.instituteName}</p>
            <p className="auth-brand-copy">{branding.instituteSubtitle}</p>
          </div>
        </div>
        <p className="section-tag">Admin Panel</p>
        <h2>Secure institute operations</h2>
        <p>
          This panel is designed for Sarvodaya Academy administration, covering student management,
          fee records, study resources, certifications, and placement updates from one dashboard.
        </p>
        <div className="admin-note-card">
          <p className="label">Protected areas</p>
          <ul className="feature-list">
            <li>Student records grouped by academic year</li>
            <li>Fee tracking with unpaid and late-fee visibility</li>
            <li>Uploads for materials, interview PDFs, and certificates</li>
          </ul>
        </div>
        <Link className="ghost-button inline-link" to="/">
          Back to public site
        </Link>
      </div>

      <form className="admin-login-card admin-form-card" onSubmit={handleSubmit}>
        <p className="section-tag">Authorized Access</p>
        <h3>Admin sign in</h3>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={formState.password}
            onChange={(event) =>
              setFormState((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Enter admin password"
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={isAdminLoading}>
          {isAdminLoading ? "Signing in..." : "Open admin dashboard"}
        </button>
      </form>
    </section>
  );
}

export default AdminLoginPage;
