import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";

function LoginPage() {
  const [formState, setFormState] = useState({
    mobileNumber: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const { branding, resolvedBannerUrl, resolvedLogoUrl } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login({
        mobileNumber: formState.mobileNumber,
        dob: formState.dob,
      });
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="auth-shell">
      <div
        className="auth-panel intro-panel"
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
        <p className="section-tag">Secure Access</p>
        <h2>Sign in to the institute portal</h2>
        <p>
          Student access continues here, while the institute administration now has a dedicated
          secure admin panel with its own protected login flow.
        </p>
        <div className="info-card">
          <p className="label">Starter notes</p>
          <ul className="feature-list">
            <li>Login uses mobile number registered by admin and DOB</li>
            <li>Admin management now lives under a separate secure panel</li>
            <li>Student data is read-only except test submission and job application</li>
          </ul>
        </div>
        <Link className="secondary-button inline-link" to="/admin/login">
          Go to Admin Login
        </Link>
      </div>

      <form className="auth-panel form-panel" onSubmit={handleSubmit}>
        <div className="role-switch">
          <span className="role-pill active">Student Access</span>
        </div>

        <label className="field">
          <span>Mobile Number</span>
          <input
            type="tel"
            placeholder="Enter registered mobile number"
            value={formState.mobileNumber}
            onChange={(event) =>
              setFormState((current) => ({ ...current, mobileNumber: event.target.value }))
            }
            required
          />
        </label>

        <label className="field">
          <span>Date of Birth</span>
          <input
            type="date"
            value={formState.dob}
            onChange={(event) =>
              setFormState((current) => ({ ...current, dob: event.target.value }))
            }
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Continue as student"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
