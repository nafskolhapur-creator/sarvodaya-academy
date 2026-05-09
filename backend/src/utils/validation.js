export const normalizePhoneNumber = (value) => String(value || "").trim().replace(/\s+/g, "");

export const isValidDateInput = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

export const normalizeDateOnly = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export const isNonNegativeNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;

export const isValidUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const sanitizeText = (value) => String(value || "").trim();
