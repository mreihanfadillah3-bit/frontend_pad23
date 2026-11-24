import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

export async function getJenisSampah() {
  const result = await apiRequest("/jenis-sampah");
  return toArray(result.data ?? result);
}

export async function createJenisSampah(payload) {
  const result = await apiRequest("/jenis-sampah", { method: "POST", body: payload });
  return result.data;
}

export async function updateJenisSampah(id, payload) {
  const result = await apiRequest(`/jenis-sampah/${id}`, { method: "PUT", body: payload });
  return result.data;
}

export async function deleteJenisSampah(id) {
  return apiRequest(`/jenis-sampah/${id}`, { method: "DELETE" });
}