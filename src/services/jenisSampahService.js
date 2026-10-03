import { apiRequest } from "./apiClient";

export async function getJenisSampah() {
  const result = await apiRequest("/jenis-sampah");
  return result.data;
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