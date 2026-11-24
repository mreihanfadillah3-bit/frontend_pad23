import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

/**
 * Mengambil daftar hasil olahan
 * GET /api/v1/hasil-olahan
 * Params: status_publikasi ("Belum Dipublikasi" | "Sudah Dipublikasi"), tanggal_direkap, page, limit (max 10)
 */
export async function getHasilOlahan(params = {}) {
  const cleanedParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      cleanedParams[k] = v;
    }
  }
  const query = new URLSearchParams(cleanedParams).toString();
  const result = await apiRequest(`/hasil-olahan${query ? "?" + query : ""}`);
  return {
    data: toArray(result.data ?? result),
    meta: result.meta ?? null,
  };
}

/**
 * Mengambil detail hasil olahan
 * GET /api/v1/hasil-olahan/{id}
 */
export async function getHasilOlahanDetail(id) {
  const result = await apiRequest(`/hasil-olahan/${id}`);
  return result.data ?? result;
}

/**
 * Mencatat hasil olahan dari batch yang telah selesai
 * POST /api/v1/pengolahan-sampah/{idOlahSampah}/hasil-olahan
 * Body: { berat_hasil_olahan, nilai_jual, status_publikasi }
 */
export async function createHasilOlahan(idOlahSampah, payload) {
  const result = await apiRequest(`/pengolahan-sampah/${idOlahSampah}/hasil-olahan`, {
    method: "POST",
    body: payload,
  });
  return result.data ?? result;
}

/**
 * Mempublikasikan hasil olahan ke publik
 * PATCH /api/v1/hasil-olahan/{idHasil}/publikasikan
 */
export async function publikasikanHasilOlahan(idHasil) {
  const result = await apiRequest(`/hasil-olahan/${idHasil}/publikasikan`, {
    method: "PATCH",
  });
  return result.data ?? result;
}
