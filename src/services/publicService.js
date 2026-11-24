import { apiRequest } from "./apiClient";

/**
 * Fetch data statistik public dashboard dari backend
 * @param {Object} params - { bulan, tahun, mode_grafik }
 * @returns {Promise<Object>}
 */
export async function getPublicDashboard({ bulan, tahun, mode_grafik = "bulan" } = {}) {
  const params = {};
  if (bulan) params.bulan = bulan;
  if (tahun) params.tahun = tahun;
  if (mode_grafik) params.mode_grafik = mode_grafik;

  const query = new URLSearchParams(params).toString();
  const qStr = query ? `?${query}` : "";

  const response = await apiRequest(`/public-dashboard${qStr}`);
  return response?.data ?? response;
}
