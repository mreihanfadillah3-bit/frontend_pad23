import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

export async function getPicPengolah(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiRequest(`/pic-pengolah${query ? "?" + query : ""}`);
  return toArray(result.data ?? result);
}

export async function createPicPengolah(payload) {
  const result = await apiRequest("/pic-pengolah", { method: "POST", body: payload });
  return result.data ?? result;
}

export async function updatePicPengolah(id, payload) {
  const result = await apiRequest(`/pic-pengolah/${id}`, { method: "PUT", body: payload });
  return result.data ?? result;
}

export async function deletePicPengolah(id) {
  return apiRequest(`/pic-pengolah/${id}`, { method: "DELETE" });
}
