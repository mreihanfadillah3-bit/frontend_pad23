import { apiRequest } from "./apiClient";

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  if (Array.isArray(val?.items)) return val.items;
  return [];
}

export async function getJenisOlahan(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiRequest(`/jenis-olahan${query ? "?" + query : ""}`);
  return toArray(result.data ?? result);
}

export async function createJenisOlahan(payload) {
  const result = await apiRequest("/jenis-olahan", { method: "POST", body: payload });
  return result.data ?? result;
}

export async function updateJenisOlahan(id, payload) {
  const result = await apiRequest(`/jenis-olahan/${id}`, { method: "PUT", body: payload });
  return result.data ?? result;
}

export async function deleteJenisOlahan(id) {
  return apiRequest(`/jenis-olahan/${id}`, { method: "DELETE" });
}

export async function getKomposisiOlahan(idJenisOlahan) {
  try {
    const result = await apiRequest(`/jenis-olahan/${idJenisOlahan}/komposisi`);
    return toArray(result.data ?? result);
  } catch (err) {
    console.warn("Gagal mengambil komposisi:", err);
    return [];
  }
}

export async function addKomposisiOlahan(idJenisOlahan, idJenisSampah) {
  return apiRequest(`/jenis-olahan/${idJenisOlahan}/komposisi`, {
    method: "POST",
    body: { id_jenis_sampah: Number(idJenisSampah) },
  });
}

export async function deleteKomposisiOlahan(idJenisOlahan, idKomposisi) {
  return apiRequest(`/jenis-olahan/${idJenisOlahan}/komposisi/${idKomposisi}`, {
    method: "DELETE",
  });
}
