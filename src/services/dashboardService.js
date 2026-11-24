import { apiRequest } from "./apiClient";

const DEFAULT_EMPTY_DASHBOARD = {
  status_operasional: "buka",
  last_updated: new Date().toISOString(),
  batch_sedang_diolah: [],
  action_required: [],
  ringkasan_periode: {
    sampah_terkumpul: 0,
    sampah_terolah: 0,
    hasil_olahan: 0,
    nilai_sampah: 0,
  },
  ringkasan_sampah_terkumpul: {
    berat: 0,
    nilai: 0,
  },
  chart_data: [],
};

export async function getDashboard(params = {}) {
  const query = new URLSearchParams(params).toString();
  const qStr = query ? `?${query}` : "";
  let rawData = null;

  try {
    // Endpoint backend Laravel yang aktif adalah /admin-dashboard
    const result = await apiRequest(`/admin-dashboard${qStr}`);
    rawData = result.data ?? result;
  } catch (err) {
    try {
      const fallback = await apiRequest(`/dashboard${qStr}`);
      rawData = fallback.data ?? fallback;
    } catch {
      console.warn("Gagal memuat admin-dashboard:", err.message);
      const cachedStatus = localStorage.getItem("status_operasional");
      return {
        ...DEFAULT_EMPTY_DASHBOARD,
        status_operasional: cachedStatus === "tutup" ? "tutup" : "buka",
      };
    }
  }

  // Normalisasi data dari AdminDashboardController backend
  const ringkasan = rawData?.ringkasan_periode || {};
  const operasional = rawData?.operasional || {};

  // Backend mengirim sampah_terkumpul sebagai objek { berat, jumlah_setoran }
  const beratTerkumpul =
    typeof ringkasan.sampah_terkumpul === "object"
      ? Number(ringkasan.sampah_terkumpul?.berat ?? 0)
      : Number(ringkasan.sampah_terkumpul ?? rawData?.ringkasan_sampah_terkumpul?.berat ?? 0);

  const nilaiTerkumpul = Number(
    ringkasan.nilai_sampah ?? rawData?.ringkasan_sampah_terkumpul?.nilai ?? 0
  );

  const beratTerolah =
    typeof ringkasan.sampah_terolah === "object"
      ? Number(ringkasan.sampah_terolah?.berat ?? 0)
      : Number(ringkasan.sampah_terolah ?? 0);

  const beratHasilOlahan =
    typeof ringkasan.hasil_olahan === "object"
      ? Number(ringkasan.hasil_olahan?.berat ?? 0)
      : Number(ringkasan.hasil_olahan ?? 0);

  // Buat action_required dari operasional jika belum ada
  const actionRequired = rawData?.action_required ?? [];
  if (actionRequired.length === 0 && rawData?.operasional) {
    if (operasional.antrean_pemilahan > 0) {
      actionRequired.push({
        status_ui: "Menunggu Dipilah",
        jenis: "antrean_pemilahan",
        jumlah: operasional.antrean_pemilahan,
        keterangan: `${operasional.antrean_pemilahan} setoran sampah menunggu dipilah`,
      });
    }
    if (operasional.pembayaran_menunggu > 0) {
      actionRequired.push({
        status_ui: "Menunggu Pembayaran",
        jenis: "pembayaran_nota",
        jumlah: operasional.pembayaran_menunggu,
        keterangan: `${operasional.pembayaran_menunggu} nota setoran menunggu pembayaran`,
      });
    }
    if (operasional.batch_sedang_diolah > 0) {
      actionRequired.push({
        status_ui: "batch_pengolahan",
        jenis: "batch_pengolahan",
        jumlah: operasional.batch_sedang_diolah,
        keterangan: `${operasional.batch_sedang_diolah} batch sampah sedang diolah`,
      });
    }
  }

  return {
    ...rawData,
    ringkasan_sampah_terkumpul: {
      berat: beratTerkumpul,
      nilai: nilaiTerkumpul,
    },
    ringkasan_periode: {
      ...ringkasan,
      sampah_terkumpul: beratTerkumpul,
      sampah_terkumpul_detail: ringkasan.sampah_terkumpul,
      sampah_terolah: beratTerolah,
      hasil_olahan: beratHasilOlahan,
      nilai_sampah: nilaiTerkumpul,
    },
    action_required: actionRequired,
    chart_data: rawData?.grafik_perkembangan?.data ?? rawData?.chart_data ?? [],
  };
}
