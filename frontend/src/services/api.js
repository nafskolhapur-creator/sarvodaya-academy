import { Capacitor, CapacitorHttp } from "@capacitor/core";

const stableBackendUrl = "https://sarvodaya-backend.onrender.com";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || stableBackendUrl).replace(/\/+$/, "");
const isNativePlatform = typeof Capacitor.isNativePlatform === "function" ? Capacitor.isNativePlatform() : false;

const buildUrl = (path) => `${apiBaseUrl}${path}`;

const normalizeErrorMessage = (error) => {
  const message = String(error?.message || "").trim();

  if (/failed to fetch/i.test(message) || /network/i.test(message) || /load failed/i.test(message)) {
    return "Unable to reach the Sarvodaya Academy server. Please check your internet connection and try again.";
  }

  return message || "Something went wrong.";
};

const parseNativeResponseData = (data) => {
  if (typeof data !== "string") {
    return data ?? {};
  }

  try {
    return JSON.parse(data);
  } catch {
    return { message: data || "Unexpected server response." };
  }
};

const ensureSuccess = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: "Unexpected server response." };

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const ensureNativeSuccess = (response) => {
  const data = parseNativeResponseData(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const createHeaders = (body, token) => {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const createRequestOptions = (method, body, token) => ({
  method,
  headers: createHeaders(body, token),
  body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
});

const request = async (path, { method = "GET", body, token } = {}) => {
  const url = buildUrl(path);

  if (isNativePlatform && !(body instanceof FormData)) {
    try {
      const response = await CapacitorHttp.request({
        url,
        method,
        headers: createHeaders(body, token),
        data: body || undefined,
        connectTimeout: 15000,
        readTimeout: 30000,
      });

      return ensureNativeSuccess(response);
    } catch (error) {
      throw new Error(normalizeErrorMessage(error));
    }
  }

  try {
    const response = await fetch(url, createRequestOptions(method, body, token));
    return await ensureSuccess(response);
  } catch (error) {
    throw new Error(normalizeErrorMessage(error));
  }
};

export const getSettings = async () => {
  return request("/api/settings");
};

export const updateInstituteBranding = async (token, body) =>
  request("/api/settings", { method: "PUT", body, token });

export const getCourses = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.eligibility) {
    searchParams.set("eligibility", params.eligibility);
  }

  if (params.board) {
    searchParams.set("board", params.board);
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/api/courses${suffix}`);
};

export const getFeaturedCourses = async () => {
  return request("/api/courses/featured");
};

export const getPlacementHighlights = async () => {
  return request("/api/placements/highlights");
};

export const getGalleryItems = async (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.limit) {
    searchParams.set("limit", params.limit);
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request(`/api/gallery${suffix}`);
};

export const loginRequest = async (payload) => request("/api/auth/login", { method: "POST", body: payload });

export const getStudentSessionRequest = async (token) => request("/api/auth/me", { token });

export const getDashboard = async (role) => {
  return request(`/api/dashboard/${role}`);
};

export const adminLoginRequest = async (payload) =>
  request("/api/admin/auth/login", { method: "POST", body: payload });

export const getAdminSessionRequest = async (token) => request("/api/admin/auth/me", { token });

const adminRequest = async (path, options = {}) => request(`/api/admin${path}`, options);

export const getAdminOverview = (token) => adminRequest("/overview", { token });
export const getAdminCourseSettings = (token) => adminRequest("/course-settings", { token });
export const updateAdminCourseSettings = (token, body) =>
  adminRequest("/course-settings", { method: "PUT", token, body });
export const getAdminWhatsApp = (token) => adminRequest("/whatsapp", { token });
export const updateAdminWhatsApp = (token, body) =>
  adminRequest("/whatsapp", { method: "PUT", token, body });
export const sendAdminWhatsAppMessage = (token, body) =>
  adminRequest("/whatsapp/send", { method: "POST", token, body });
export const getAdminLeads = (token) => adminRequest("/leads", { token });
export const updateAdminLead = (token, leadId, body) =>
  adminRequest(`/leads/${leadId}`, { method: "PUT", token, body });
export const getAdminCourses = (token) => adminRequest("/courses", { token });
export const createAdminCourse = (token, body) =>
  adminRequest("/courses", { method: "POST", token, body });
export const updateAdminCourse = (token, courseId, body) =>
  adminRequest(`/courses/${courseId}`, { method: "PUT", token, body });
export const deleteAdminCourse = (token, courseId) =>
  adminRequest(`/courses/${courseId}`, { method: "DELETE", token });
export const getAdminStudents = (token) => adminRequest("/students", { token });
export const createAdminStudent = (token, body) =>
  adminRequest("/students", { method: "POST", token, body });
export const updateAdminStudent = (token, studentId, body) =>
  adminRequest(`/students/${studentId}`, { method: "PUT", token, body });
export const deleteAdminStudent = (token, studentId) =>
  adminRequest(`/students/${studentId}`, { method: "DELETE", token });

export const getAdminFees = (token) => adminRequest("/fees", { token });
export const createAdminFee = (token, body) => adminRequest("/fees", { method: "POST", token, body });
export const markAdminFeePaid = (token, feeId, body) =>
  adminRequest(`/fees/${feeId}/pay`, { method: "PUT", token, body });
export const deleteAdminFee = (token, feeId) =>
  adminRequest(`/fees/${feeId}`, { method: "DELETE", token });
export const getAdminFeeReminders = (token) => adminRequest("/fee-reminders", { token });
export const updateAdminFeeReminderSettings = (token, body) =>
  adminRequest("/fee-reminders/settings", { method: "PUT", token, body });
export const runAdminFeeReminderCycle = (token, body = {}) =>
  adminRequest("/fee-reminders/run", { method: "POST", token, body });

export const getAdminMaterials = (token) => adminRequest("/materials", { token });
export const createAdminMaterial = (token, body) =>
  adminRequest("/materials", { method: "POST", token, body });
export const updateAdminMaterial = (token, materialId, body) =>
  adminRequest(`/materials/${materialId}`, { method: "PUT", token, body });
export const deleteAdminMaterial = (token, materialId) =>
  adminRequest(`/materials/${materialId}`, { method: "DELETE", token });

export const getAdminGallery = (token) => adminRequest("/gallery", { token });
export const createAdminGallery = (token, body) =>
  adminRequest("/gallery", { method: "POST", token, body });
export const updateAdminGallery = (token, galleryId, body) =>
  adminRequest(`/gallery/${galleryId}`, { method: "PUT", token, body });
export const deleteAdminGallery = (token, galleryId) =>
  adminRequest(`/gallery/${galleryId}`, { method: "DELETE", token });

export const getAdminTests = (token) => adminRequest("/tests", { token });
export const createAdminTest = (token, body) => adminRequest("/tests", { method: "POST", token, body });
export const updateAdminTest = (token, testId, body) =>
  adminRequest(`/tests/${testId}`, { method: "PUT", token, body });
export const deleteAdminTest = (token, testId) =>
  adminRequest(`/tests/${testId}`, { method: "DELETE", token });

export const getAdminInterviews = (token) => adminRequest("/interviews", { token });
export const createAdminInterview = (token, body) =>
  adminRequest("/interviews", { method: "POST", token, body });
export const deleteAdminInterview = (token, interviewId) =>
  adminRequest(`/interviews/${interviewId}`, { method: "DELETE", token });

export const getAdminCertificates = (token) => adminRequest("/certificates", { token });
export const createAdminCertificate = (token, body) =>
  adminRequest("/certificates", { method: "POST", token, body });
export const deleteAdminCertificate = (token, certificateId) =>
  adminRequest(`/certificates/${certificateId}`, { method: "DELETE", token });

export const getAdminJobs = (token) => adminRequest("/jobs", { token });
export const createAdminJob = (token, body) => adminRequest("/jobs", { method: "POST", token, body });
export const updateAdminJob = (token, jobId, body) =>
  adminRequest(`/jobs/${jobId}`, { method: "PUT", token, body });
export const toggleAdminJobApplicant = (token, jobId, body) =>
  adminRequest(`/jobs/${jobId}/applicants`, { method: "POST", token, body });
export const deleteAdminJob = (token, jobId) =>
  adminRequest(`/jobs/${jobId}`, { method: "DELETE", token });
export const getAdminPlacements = (token) => adminRequest("/placements", { token });
export const createAdminPlacement = (token, body) =>
  adminRequest("/placements", { method: "POST", token, body });
export const updateAdminPlacement = (token, placementId, body) =>
  adminRequest(`/placements/${placementId}`, { method: "PUT", token, body });
export const deleteAdminPlacement = (token, placementId) =>
  adminRequest(`/placements/${placementId}`, { method: "DELETE", token });

const studentRequest = async (path, options = {}) => request(`/api/student${path}`, options);

export const getStudentProfile = (token) => studentRequest("/profile", { token });
export const getStudentFees = (token) => studentRequest("/fees", { token });
export const getStudentMaterials = (token) => studentRequest("/materials", { token });
export const getStudentTests = (token) => studentRequest("/tests", { token });
export const submitStudentTest = (token, testId) =>
  studentRequest(`/tests/${testId}/submit`, { method: "POST", token });
export const getStudentJobs = (token) => studentRequest("/jobs", { token });
export const applyStudentJob = (token, jobId) =>
  studentRequest(`/jobs/${jobId}/apply`, { method: "POST", token });
export const getStudentCertificates = (token) => studentRequest("/certificates", { token });
export const getStudentPlacements = (token) => studentRequest("/placements", { token });
