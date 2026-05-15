import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getSettings } from "../services/api";

const defaultBranding = {
  instituteName: "Sarvodaya Academy",
  instituteSubtitle: "NAFS Fire and Safety College, Kolhapur",
  affiliation: "Affiliated with NAFS India",
  logoUrl: "",
  websiteBannerUrl: "",
  contactEmail: "info@sarvodayaacademy.edu",
  contactPhone: "+91 98765 43210",
  address: "Kolhapur, Maharashtra, India",
  mapEmbedUrl: "https://www.google.com/maps?q=Kolhapur&output=embed",
  whatsappNumber: "+91-9730848101",
  heroDescription:
    "A professional institute platform for fire, safety, and career-oriented education with role-based access for administration and learners.",
};

const BrandingContext = createContext(null);

const setFavicon = (href) => {
  if (typeof document === "undefined") {
    return;
  }

  let icon = document.querySelector("link[rel='icon']");

  if (!icon) {
    icon = document.createElement("link");
    icon.setAttribute("rel", "icon");
    document.head.appendChild(icon);
  }

  icon.setAttribute("href", href);
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [isBrandingLoading, setIsBrandingLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      const response = await getSettings();
      setBranding({ ...defaultBranding, ...(response.settings || {}) });
    } finally {
      setIsBrandingLoading(false);
    }
  };

  useEffect(() => {
    refreshBranding().catch(() => {
      setBranding(defaultBranding);
      setIsBrandingLoading(false);
    });
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = branding.instituteName || defaultBranding.instituteName;
    }

    setFavicon(branding.logoUrl || "/default-favicon.svg");
  }, [branding]);

  const value = useMemo(
    () => ({
      branding,
      defaultBranding,
      resolvedLogoUrl: branding.logoUrl || "/default-logo.svg",
      resolvedBannerUrl: branding.websiteBannerUrl || "",
      isBrandingLoading,
      refreshBranding,
    }),
    [branding, isBrandingLoading],
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const context = useContext(BrandingContext);

  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }

  return context;
}
