import { useEffect, useState } from "react";

import { useBranding } from "../context/BrandingContext";
import { updateInstituteBranding } from "../services/api";

function BrandingSection({ adminToken, runMutation, submitting }) {
  const { branding, refreshBranding, resolvedBannerUrl, resolvedLogoUrl } = useBranding();
  const [formState, setFormState] = useState({
    instituteName: "",
    instituteSubtitle: "",
    affiliation: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    mapEmbedUrl: "",
    logoUrl: "",
    websiteBannerUrl: "",
    logoFile: null,
    bannerFile: null,
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      instituteName: branding.instituteName || "",
      instituteSubtitle: branding.instituteSubtitle || "",
      affiliation: branding.affiliation || "",
      contactEmail: branding.contactEmail || "",
      contactPhone: branding.contactPhone || "",
      address: branding.address || "",
      mapEmbedUrl: branding.mapEmbedUrl || "",
      logoUrl: branding.logoUrl || "",
      websiteBannerUrl: branding.websiteBannerUrl || "",
      logoFile: null,
      bannerFile: null,
    }));
    setLogoPreview("");
    setBannerPreview("");
  }, [branding]);

  useEffect(
    () => () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    },
    [logoPreview, bannerPreview],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = new FormData();

    payload.append("instituteName", formState.instituteName);
    payload.append("instituteSubtitle", formState.instituteSubtitle);
    payload.append("affiliation", formState.affiliation);
    payload.append("contactEmail", formState.contactEmail);
    payload.append("contactPhone", formState.contactPhone);
    payload.append("address", formState.address);
    payload.append("mapEmbedUrl", formState.mapEmbedUrl);
    payload.append("logoUrl", formState.logoUrl);
    payload.append("websiteBannerUrl", formState.websiteBannerUrl);

    if (formState.logoFile) {
      payload.append("logo", formState.logoFile);
    }

    if (formState.bannerFile) {
      payload.append("banner", formState.bannerFile);
    }

    await runMutation("branding", async () => {
      await updateInstituteBranding(adminToken, payload);
      await refreshBranding();
    });
  };

  return (
    <div className="stack-lg">
      <form className="panel admin-form-panel" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <p className="section-tag">Branding</p>
            <h3>Institute branding settings</h3>
            <p className="section-support-copy">
              Upload logo and website banner, then update institute identity details used across the web app and mobile shell.
            </p>
          </div>
        </div>

        <div className="branding-preview-grid">
          <article className="branding-preview-card">
            <span className="label">Logo Preview</span>
            <img src={logoPreview || resolvedLogoUrl} alt={branding.instituteName} className="branding-logo-preview" />
          </article>
          <article className="branding-preview-card banner">
            <span className="label">Banner Preview</span>
            {bannerPreview || resolvedBannerUrl ? (
              <img
                src={bannerPreview || resolvedBannerUrl}
                alt={`${branding.instituteName} banner`}
                className="branding-banner-preview"
              />
            ) : (
              <div className="branding-banner-fallback">
                <strong>{branding.instituteName}</strong>
                <p>{branding.instituteSubtitle}</p>
              </div>
            )}
          </article>
        </div>

        <div className="admin-form-grid">
          <label className="field">
            <span>Institute Name</span>
            <input
              value={formState.instituteName}
              onChange={(event) => setFormState((current) => ({ ...current, instituteName: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Institute Subtitle</span>
            <input
              value={formState.instituteSubtitle}
              onChange={(event) =>
                setFormState((current) => ({ ...current, instituteSubtitle: event.target.value }))
              }
            />
          </label>
          <label className="field field-span">
            <span>Affiliation</span>
            <input
              value={formState.affiliation}
              onChange={(event) => setFormState((current) => ({ ...current, affiliation: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Contact Email</span>
            <input
              type="email"
              value={formState.contactEmail}
              onChange={(event) => setFormState((current) => ({ ...current, contactEmail: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Contact Phone</span>
            <input
              value={formState.contactPhone}
              onChange={(event) => setFormState((current) => ({ ...current, contactPhone: event.target.value }))}
            />
          </label>
          <label className="field field-span">
            <span>Address</span>
            <textarea
              rows="3"
              value={formState.address}
              onChange={(event) => setFormState((current) => ({ ...current, address: event.target.value }))}
            />
          </label>
          <label className="field field-span">
            <span>Google Map URL</span>
            <input
              value={formState.mapEmbedUrl}
              onChange={(event) => setFormState((current) => ({ ...current, mapEmbedUrl: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Upload Logo</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setFormState((current) => ({ ...current, logoFile: file, logoUrl: "" }));
                setLogoPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </label>
          <label className="field">
            <span>Upload Website Banner</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setFormState((current) => ({ ...current, bannerFile: file, websiteBannerUrl: "" }));
                setBannerPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </label>
          <label className="field">
            <span>Logo URL (optional)</span>
            <input
              value={formState.logoUrl}
              onChange={(event) => setFormState((current) => ({ ...current, logoUrl: event.target.value, logoFile: null }))}
              placeholder="https://..."
            />
          </label>
          <label className="field">
            <span>Banner URL (optional)</span>
            <input
              value={formState.websiteBannerUrl}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  websiteBannerUrl: event.target.value,
                  bannerFile: null,
                }))
              }
              placeholder="https://..."
            />
          </label>
        </div>

        <button type="submit" className="primary-button" disabled={submitting === "branding"}>
          {submitting === "branding" ? "Saving branding..." : "Save branding settings"}
        </button>
      </form>
    </div>
  );
}

export default BrandingSection;
