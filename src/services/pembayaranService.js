import { apiRequest } from "./apiClient";

export async function bayarSetoran(idPengumpulan) {
  // Sesuai implementasi backend: PATCH /pengumpulan-sampah/{id}/pembayaran tanpa body
  const result = await apiRequest(`/pengumpulan-sampah/${idPengumpulan}/pembayaran`, {
    method: "PATCH",
  });
  return result.data ?? result;
}

export async function getPembayaran(params = {}) {
  const query = new URLSearchParams(params).toString();
  const result = await apiRequest(`/pembayaran${query ? "?" + query : ""}`);
  return result.data ?? result;
}
