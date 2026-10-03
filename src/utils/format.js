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
  if (err?.errors) return Object.values(err.errors).flat().join(" ");
  return err?.message || "Terjadi kesalahan";
}