import { apiRequest } from "./apiClient";

export async function getJenisOlahan() {
  const result = await apiRequest("/jenis-olahan");
  return result.data;
}

export async function createJenisOlahan(payload) {
  const result = await apiRequest("/jenis-olahan", { method: "POST", body: payload });
  return result.data;
}

export async function updateJenisOlahan(id, payload) {
  const result = await apiRequest(`/jenis-olahan/${id}`, { method: "PUT", body: payload });
  return result.data;
}

export async function deleteJenisOlahan(id) {
  return apiRequest(`/jenis-olahan/${id}`, { method: "DELETE" });
}