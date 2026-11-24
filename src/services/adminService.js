import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

// ───── Data Admin ─────

export async function getAdmins() {
  const result = await apiRequest("/admin");
  return toArray(result.data ?? result);
}

export async function createAdmin(payload) {
  // payload: { nama, username, password, konfirmasi_password }
  const result = await apiRequest("/admin", {
    method: "POST",
    body: payload,
  });
  return result.data ?? result;
}

export async function deleteAdmin(adminId) {
  return apiRequest(`/admin/${adminId}`, {
    method: "DELETE",
  });
}

export async function updateAdminPassword(adminId, payload) {
  // payload: { password_lama, password_baru, konfirmasi_password_baru }
  const result = await apiRequest(`/admin/${adminId}`, {
    method: "PATCH",
    body: payload,
  });
  return result.data ?? result;
}

// ───── Audit Log (Aktivitas Admin) ─────

export async function getAuditLog(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiRequest(`/audit-log${query ? "?" + query : ""}`);
  return toArray(result.data ?? result);
}
