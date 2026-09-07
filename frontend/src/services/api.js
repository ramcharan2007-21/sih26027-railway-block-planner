const API_HOSTNAME = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
const API_BASE = `http://${API_HOSTNAME}:8000/api`;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = "API Error";
    try {
      const err = await response.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getDemoUsers: () => request("/auth/users"),

  // Trains
  getTrains: (sectionId, priority) => {
    const params = new URLSearchParams();
    if (sectionId) params.append("section_id", sectionId);
    if (priority) params.append("priority", priority);
    const qs = params.toString();
    return request(`/trains${qs ? `?${qs}` : ""}`);
  },
  addTrain: (data) =>
    request("/trains", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTrain: (id, data) =>
    request(`/trains/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTrain: (id) =>
    request(`/trains/${id}`, {
      method: "DELETE",
    }),

  // Assets
  getAssets: (sectionId, status) => {
    const params = new URLSearchParams();
    if (sectionId) params.append("section_id", sectionId);
    if (status) params.append("status", status);
    const qs = params.toString();
    return request(`/assets${qs ? `?${qs}` : ""}`);
  },
  getAssetsNeedingMaintenance: () => request("/assets/needing-maintenance"),
  addAsset: (data) =>
    request("/assets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAsset: (id, data) =>
    request(`/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteAsset: (id) =>
    request(`/assets/${id}`, {
      method: "DELETE",
    }),

  // Sections
  getSections: () => request("/sections"),
  getSectionDetail: (sectionId) => request(`/sections/${sectionId}`),
  updateSectionStatus: (sectionId, status) =>
    request(`/sections/${sectionId}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    }),

  // Maintenance Requests
  getMaintenanceRequests: (sectionId, status) => {
    const params = new URLSearchParams();
    if (sectionId) params.append("section_id", sectionId);
    if (status) params.append("status", status);
    const qs = params.toString();
    return request(`/maintenance-requests${qs ? `?${qs}` : ""}`);
  },
  createMaintenanceRequest: (data) =>
    request("/maintenance-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMaintenanceRequest: (id, data) =>
    request(`/maintenance-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMaintenanceRequest: (id) =>
    request(`/maintenance-requests/${id}`, {
      method: "DELETE",
    }),

  // Blocks
  getBlocks: (sectionId, status) => {
    const params = new URLSearchParams();
    if (sectionId) params.append("section_id", sectionId);
    if (status) params.append("status", status);
    const qs = params.toString();
    return request(`/blocks${qs ? `?${qs}` : ""}`);
  },
  createOrApproveBlock: (data) =>
    request("/blocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBlock: (id, data) =>
    request(`/blocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteBlock: (id) =>
    request(`/blocks/${id}`, {
      method: "DELETE",
    }),

  // AI Optimizer
  evaluateSlots: (payload) =>
    request("/optimizer/evaluate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  autoPlanPending: () => request("/optimizer/auto-plan-pending"),

  // Conflicts
  getConflicts: () => request("/conflicts"),
  checkSlot: (payload) =>
    request("/conflicts/check-slot", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Analytics & KPIs
  getKPIs: () => request("/analytics/kpis"),
  getChartData: () => request("/analytics/charts"),

  // Demo
  resetDemo: () =>
    request("/demo/reset", {
      method: "POST",
    }),
  getDemoScenario: () => request("/demo/scenario"),
};
