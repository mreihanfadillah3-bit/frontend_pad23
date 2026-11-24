import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

export async function getWarga(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiRequest(`/warga${query ? "?" + query : ""}`);
  return toArray(result.data ?? result);
}

export async function createWarga(payload) {
  const result = await apiRequest("/warga", { method: "POST", body: payload });
  return result.data ?? result;
}

export async function updateWarga(id, payload) {
  const result = await apiRequest(`/warga/${id}`, { method: "PUT", body: payload });
  return result.data ?? result;
}

export async function deleteWarga(id) {
  return apiRequest(`/warga/${id}`, { method: "DELETE" });
}
