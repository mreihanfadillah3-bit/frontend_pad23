// DATA SEMENTARA (in-memory, hilang saat refresh).
// Ganti isi fungsi-fungsi ini dengan panggilan API setelah API contract fix;
// halaman cukup memanggil fungsi yang sama.

const JENIS_SAMPAH = [
  { id: 1, nama: "Plastik PET", hargaPerKg: 5000 },
  { id: 2, nama: "Kertas", hargaPerKg: 3000 },
  { id: 3, nama: "Logam", hargaPerKg: 7000 },
  { id: 4, nama: "Organik", hargaPerKg: 1000 },
];

let notaList = [
  { id: "#A05", nama: "Rina Wulandari", whatsapp: "0812 3456 7805", status: "menunggu", tanggal: "2026-10-22" },
  { id: "#A04", nama: "Budi Santoso", whatsapp: "0813 5678 9004", status: "menunggu", tanggal: "2026-10-22" },
  { id: "#A03", nama: "Umar", whatsapp: "0857 1234 5603", status: "sedang", tanggal: "2026-10-22" },
  { id: "#A02", nama: "Siti Aminah", whatsapp: "0812 3456 7890", status: "sedang", tanggal: "2026-10-21" },
  { id: "#A01", nama: "Dewi Lestari", whatsapp: "0812 3456 7801", status: "lunas", tanggal: "2026-10-21" },
];

let itemsByNota = {
  "#A03": [
    { id: 1, jenisId: 1, jenis: "Plastik PET", hargaPerKg: 5000, berat: 8.0, harga: 40000 },
    { id: 2, jenisId: 2, jenis: "Kertas", hargaPerKg: 3000, berat: 7.2, harga: 21600 },
    { id: 3, jenisId: 3, jenis: "Logam", hargaPerKg: 7000, berat: 3.4, harga: 23800 },
  ],
  "#A02": [
    { id: 4, jenisId: 1, jenis: "Plastik PET", hargaPerKg: 5000, berat: 12.0, harga: 60000 },
  ],
  "#A01": [
    { id: 5, jenisId: 3, jenis: "Logam", hargaPerKg: 7000, berat: 6.0, harga: 42000 },
  ],
};

let nextNotaNo = 6;
let nextItemId = 6;

const round3 = (n) => Math.round(n * 1000) / 1000;

function setStatus(notaId, status) {
  notaList = notaList.map((n) => (n.id === notaId ? { ...n, status } : n));
}

function requireOpen(notaId) {
  const nota = notaList.find((n) => n.id === notaId);
  if (!nota) throw new Error("Nota tidak ditemukan.");
  if (nota.status === "lunas") throw new Error("Nota sudah lunas dan tidak bisa diubah.");
  return nota;
}

function buildItem(id, { jenisId, berat }) {
  const jenis = JENIS_SAMPAH.find((j) => j.id === Number(jenisId));
  if (!jenis) throw new Error("Jenis sampah tidak ditemukan.");
  const kg = Number(berat);
  if (!Number.isFinite(kg) || kg <= 0) throw new Error("Berat harus lebih dari 0.");
  return {
    id,
    jenisId: jenis.id,
    jenis: jenis.nama,
    hargaPerKg: jenis.hargaPerKg,
    berat: kg,
    harga: Math.round(kg * jenis.hargaPerKg),
  };
}

export const getJenisSampah = () => JENIS_SAMPAH;
export const getNotaList = () => notaList;
export const getItems = (notaId) => itemsByNota[notaId] ?? [];

export function getRingkasanTotal() {
  const semua = Object.values(itemsByNota).flat();
  return {
    totalKg: 999999, // disesuaikan tampilan ringkasan
    totalNilai: 19000000,
  };
}

export function addNota({ nama, whatsapp }) {
  const nota = {
    id: `#A${String(nextNotaNo++).padStart(2, "0")}`,
    nama,
    whatsapp,
    status: "menunggu",
    tanggal: new Date().toLocaleDateString("sv-SE"),
  };
  notaList = [nota, ...notaList];
  return nota;
}

export function addItem(notaId, data) {
  const nota = requireOpen(notaId);
  const item = buildItem(nextItemId, data);
  nextItemId++;
  itemsByNota = { ...itemsByNota, [notaId]: [...getItems(notaId), item] };
  if (nota.status === "menunggu") setStatus(notaId, "sedang");
  return item;
}

export function updateItem(notaId, itemId, data) {
  requireOpen(notaId);
  const item = buildItem(itemId, data);
  itemsByNota = {
    ...itemsByNota,
    [notaId]: getItems(notaId).map((i) => (i.id === itemId ? item : i)),
  };
  return item;
}

export function deleteItem(notaId, itemId) {
  requireOpen(notaId);
  const sisa = getItems(notaId).filter((i) => i.id !== itemId);
  itemsByNota = { ...itemsByNota, [notaId]: sisa };
  if (sisa.length === 0) setStatus(notaId, "menunggu");
}

export function deleteNota(notaId) {
  notaList = notaList.filter((n) => n.id !== notaId);
  delete itemsByNota[notaId];
}

export function tandaiLunas(notaId) {
  requireOpen(notaId);
  if (getItems(notaId).length === 0) throw new Error("Nota belum punya item sampah.");
  setStatus(notaId, "lunas");
}
