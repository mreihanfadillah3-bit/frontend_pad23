const GENERATED_NOTAS_KEY = "sumberarum_generated_notas";

export function getGeneratedNotaIds() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = localStorage.getItem(GENERATED_NOTAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markNotaAsGenerated(id) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const list = getGeneratedNotaIds();
    const numId = Number(id);
    if (numId && !list.includes(numId)) {
      list.push(numId);
      localStorage.setItem(GENERATED_NOTAS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error("Gagal simpan status nota:", e);
  }
}

export function unmarkNotaAsGenerated(id) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const numId = Number(id);
    if (!numId) return;
    const list = getGeneratedNotaIds().filter((item) => item !== numId);
    localStorage.setItem(GENERATED_NOTAS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Gagal hapus status nota:", e);
  }
}

/**
 * Menentukan tahapan/status nota setoran:
 * - "lunas": Pembayaran sudah lunas
 * - "sedang": Menunggu Pembayaran (sudah dibuat nota / status menunggu bayar)
 * - "menunggu": Menunggu Pilah (belum ada detail atau belum dibuat nota)
 */
export function getNotaStage(item, customGeneratedIds) {
  if (!item || typeof item !== "object") return "menunggu";
  const id = Number(item.id_pengumpulan_sampah ?? item.id ?? 0);
  const statusUi = String(item.status_ui || "").toLowerCase().trim();
  const statusPembayaran = String(item.status_pembayaran || "").toLowerCase().trim();
  const statusDb = String(item.status || "").toLowerCase().trim();

  // 1. Cek LUNAS
  if (
    statusPembayaran === "lunas" ||
    statusUi === "lunas" ||
    statusDb === "lunas" ||
    item.pembayaran?.status === "lunas" ||
    Boolean(item.pembayaran?.tanggal_bayar || item.tanggal_lunas)
  ) {
    return "lunas";
  }

  // 2. Jika backend eksplisit menyatakan masih Menunggu Dipilah, jangan tertimpa localStorage lama
  if (statusUi === "menunggu dipilah") {
    return "menunggu";
  }

  // 3. Cek MENUNGGU PEMBAYARAN (nota sudah dibuat)
  const ids = Array.isArray(customGeneratedIds)
    ? customGeneratedIds
    : getGeneratedNotaIds();

  if (
    (id > 0 && Array.isArray(ids) && ids.includes(id)) ||
    statusPembayaran === "menunggu pembayaran" ||
    statusUi === "menunggu pembayaran" ||
    statusUi === "menunggu_bayar"
  ) {
    return "sedang";
  }

  // 3. Masih dalam proses penimbangan (Menunggu Pilah)
  return "menunggu";
}
