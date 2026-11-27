export const SATUAN_OPTIONS = ["kg"]; // tambah opsi lain kalau tim sepakat

export function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(angka ?? 0));
}

// Mengubah error dari apiClient jadi teks untuk ditampilkan
export function formatError(err) {
  if (err?.errors) {
    // Gabungkan semua pesan error per field menjadi satu kalimat
    const fieldMessages = Object.entries(err.errors)
      .map(([field, msgs]) => {
        const msgStr = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        return `${field}: ${msgStr}`;
      })
      .join(" | ");
    return fieldMessages || err?.message || "Terjadi kesalahan";
  }
  return err?.message || "Terjadi kesalahan";
}

export function formatKg(angka) {
  return `${Number(angka ?? 0).toLocaleString("id-ID")} kg`;
}

/**
 * Validasi nomor WhatsApp: harus berawalan 08 atau +62 dengan panjang digit yang valid.
 */
export function isValidWhatsappNumber(value) {
  if (typeof value !== "string") return false;
  const cleaned = value.trim().replace(/[\s-]/g, "");
  return /^(08\d{7,13}|\+62\d{8,13})$/.test(cleaned);
}