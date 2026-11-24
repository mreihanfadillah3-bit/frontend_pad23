import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

export async function getPengumpulan(params = {}) {
  const cleanedParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      cleanedParams[k] = v;
    }
  }
  const query = new URLSearchParams(cleanedParams).toString();
  const result = await apiRequest(`/pengumpulan-sampah${query ? "?" + query : ""}`);
  return {
    data: toArray(result.data ?? result),
    meta: result.meta ?? null,
  };
}

export async function getPengumpulanDetail(id) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}`);
  return result.data ?? result;
}

export async function createPengumpulan(payload) {
  const result = await apiRequest("/pengumpulan-sampah", {
    method: "POST",
    body: payload,
  });
  return result.data ?? result;
}

export async function addDetailPengumpulan(id, payload) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}/detail`, {
    method: "POST",
    body: payload,
  });
  return result.data ?? result;
}

export async function deleteDetailPengumpulan(id, idDetail) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}/detail/${idDetail}`, {
    method: "DELETE",
  });
  return result.data ?? result;
}

export async function deletePengumpulan(id) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}`, {
    method: "DELETE",
  });
  return result.data ?? result;
}

export async function selesaiPilah(id) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}/selesai-pilah`, {
    method: "PATCH",
  });
  return result.data ?? result;
}

export async function getNota(id) {
  const result = await apiRequest(`/pengumpulan-sampah/${id}/nota`);
  return result.data ?? result;
}
