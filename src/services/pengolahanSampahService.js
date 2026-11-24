import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  return [];
}

/**
 * Mengambil material sampah siap olah (stok dari setoran yang sudah lunas & belum terpakai batch)
 * GET /api/v1/material-siap-olah
 */
export async function getMaterialSiapOlah() {
  const result = await apiRequest("/material-siap-olah");
  return toArray(result.data ?? result);
}

/**
 * Mengambil daftar batch pengolahan sampah
 * GET /api/v1/pengolahan-sampah
 * Params: status ("Sedang Diolah" | "Selesai Diolah"), page, limit (max 10)
 */
export async function getPengolahan(params = {}) {
  const cleanedParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      cleanedParams[k] = v;
    }
  }
  const query = new URLSearchParams(cleanedParams).toString();
  const result = await apiRequest(`/pengolahan-sampah${query ? "?" + query : ""}`);
  return {
    data: toArray(result.data ?? result),
    meta: result.meta ?? null,
  };
}

/**
 * Mengambil detail batch pengolahan sampah
 * GET /api/v1/pengolahan-sampah/{id}
 */
export async function getPengolahanDetail(id) {
  const result = await apiRequest(`/pengolahan-sampah/${id}`);
  return result.data ?? result;
}

/**
 * Membuat batch pengolahan sampah baru
 * POST /api/v1/pengolahan-sampah
 * Body: { id_jenis_olahan, id_pic, bahan_baku: [{ id_komposisi, berat_digunakan }] }
 */
export async function createPengolahan(payload) {
  const result = await apiRequest("/pengolahan-sampah", {
    method: "POST",
    body: payload,
  });
  return result.data ?? result;
}

/**
 * Menghapus batch pengolahan sampah yang masih berstatus 'Sedang Diolah'
 * DELETE /api/v1/pengolahan-sampah/{id}
 */
export async function deletePengolahan(id) {
  const result = await apiRequest(`/pengolahan-sampah/${id}`, {
    method: "DELETE",
  });
  return result.data ?? result;
}
