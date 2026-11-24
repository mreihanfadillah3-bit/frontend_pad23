import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MdChevronLeft,
  MdAdd,
  MdCheckCircle,
  MdInfoOutline,
} from "react-icons/md";
import { LuTrash2 } from "react-icons/lu";
import PopUpPilahSampah from "./PopUpPilahSampah";
import PopUpKonfirmasiBuatNota from "./PopUpKonfirmasiBuatNota";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";
import {
  getNotaStage,
  markNotaAsGenerated,
  getGeneratedNotaIds,
} from "../../../utils/statusHelper";
import { getJenisSampah } from "../../../services/jenisSampahService";
import {
  getPengumpulan,
  getPengumpulanDetail,
  addDetailPengumpulan,
  deleteDetailPengumpulan,
  selesaiPilah,
  getNota,
} from "../../../services/pengumpulanSampahService";
import { bayarSetoran } from "../../../services/pembayaranService";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu", label: "Menunggu Pilah" },
  { key: "sedang", label: "Menunggu Bayar" },
  { key: "lunas", label: "Selesai" },
];

const EMPTY_FORM = { jenisId: "", berat: "" };
const round3 = (n) => Math.round(n * 1000) / 1000;
let _localRowId = 0;
const nextLocalId = () => `local_${++_localRowId}`;

const formatNotaCode = (id) => {
  if (!id) return "";
  return typeof id === "number" || /^\d+$/.test(id)
    ? `#A${String(id).padStart(2, "0")}`
    : id;
};

function formatWaktu(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
}

function formatTanggalLunas(str) {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatTanggal(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PilahSampahPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState("semua");
  const [antrian, setAntrian] = useState([]);
  const [loadingAntrian, setLoadingAntrian] = useState(true);

  const [selectedId, setSelectedId] = useState(
    searchParams.get("nota") ? Number(searchParams.get("nota")) : null
  );
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [jenisList, setJenisList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Baris sampah lokal (belum disimpan ke backend, hanya ada saat status "Menunggu Pilah")
  const [localRows, setLocalRows] = useState([]);

  // Modal states
  const [showKonfirmasiBuatNota, setShowKonfirmasiBuatNota] = useState(false);
  const [showNota, setShowNota] = useState(false);
  const [notaData, setNotaData] = useState(null); // data dari GET /nota

  // 1. Muat master jenis sampah
  useEffect(() => {
    getJenisSampah()
      .then((data) => setJenisList(data || []))
      .catch((err) => console.error("Gagal memuat jenis sampah:", err));
  }, []);

  // 2. Muat antrian setoran
  const loadAntrian = useCallback(async () => {
    setLoadingAntrian(true);
    try {
      // Ambil antrian dari backend (maksimal limit per request adalah 10 sesuai validasi backend)
      const res1 = await getPengumpulan({ page: 1, limit: 10 });
      let allItems = Array.isArray(res1.data) ? [...res1.data] : [];

      // Ambil halaman berikutnya (hingga 3 halaman / 30 antrian) jika ada
      const totalPages = res1.meta?.total_page ?? res1.meta?.last_page ?? 1;
      if (totalPages > 1) {
        const extraPages = [];
        for (let p = 2; p <= Math.min(totalPages, 3); p++) {
          extraPages.push(
            getPengumpulan({ page: p, limit: 10 }).catch(() => ({ data: [] }))
          );
        }
        const extraRes = await Promise.all(extraPages);
        for (const er of extraRes) {
          if (Array.isArray(er.data)) {
            allItems = allItems.concat(er.data);
          }
        }
      }

      // Pastikan jika ada nota dari URL yang belum masuk di 3 halaman pertama, ambil langsung detailnya
      const urlNota = searchParams.get("nota")
        ? Number(searchParams.get("nota"))
        : null;
      if (
        urlNota &&
        !allItems.some(
          (item) => Number(item.id_pengumpulan_sampah ?? item.id) === urlNota
        )
      ) {
        try {
          const single = await getPengumpulanDetail(urlNota);
          if (single) {
            allItems.unshift(single);
          }
        } catch {
          // Abaikan jika tidak ditemukan
        }
      }

      // Urutkan setoran terbaru di depan (ID terbesar dahulu)
      const allList = allItems.sort((a, b) => {
        const idA = Number(a.id_pengumpulan_sampah ?? a.id ?? 0);
        const idB = Number(b.id_pengumpulan_sampah ?? b.id ?? 0);
        return idB - idA;
      });

      const generatedIds = getGeneratedNotaIds();
      const list =
        tab === "semua"
          ? allList
          : allList.filter((item) => getNotaStage(item, generatedIds) === tab);

      setAntrian(list);

      setSelectedId((prev) => {
        const target = urlNota || prev;
        if (
          target &&
          list.some(
            (item) =>
              Number(item.id_pengumpulan_sampah ?? item.id) === Number(target)
          )
        ) {
          return Number(target);
        }
        return list.length > 0
          ? Number(list[0].id_pengumpulan_sampah ?? list[0].id)
          : null;
      });
    } catch (err) {
      console.error("Gagal memuat antrian:", err);
    } finally {
      setLoadingAntrian(false);
    }
  }, [tab, searchParams]);

  useEffect(() => {
    loadAntrian();
  }, [loadAntrian]);

  // 3. Muat detail setoran yang dipilih
  const loadDetail = useCallback(async (id) => {
    if (!id) {
      setSelectedDetail(null);
      return;
    }
    setLoadingDetail(true);
    setFormError("");
    try {
      const detail = await getPengumpulanDetail(id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Gagal memuat detail setoran:", err);
      setFormError(formatError(err) || "Gagal memuat detail nota.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
      setSearchParams({ nota: selectedId }, { replace: true });
    } else {
      setSelectedDetail(null);
    }
  }, [selectedId, loadDetail, setSearchParams]);

  function pilihNota(id) {
    setSelectedId(id);
    setForm(EMPTY_FORM);
    setFormError("");
    setNotaData(null);
    setLocalRows([]); // reset baris lokal saat ganti nota
  }

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  }

  // Tambah baris penimbangan → simpan LOKAL dulu, belum ke API
  function handleTambahBaris(e) {
    e.preventDefault();
    if (!selectedId) return;

    if (!form.jenisId) {
      setFormError("Pilih jenis sampah terlebih dahulu.");
      return;
    }
    const berat = parseFloat(form.berat);
    if (!Number.isFinite(berat) || berat <= 0) {
      setFormError("Berat harus lebih dari 0.");
      return;
    }

    const jenis = jenisList.find(
      (j) => Number(j.id_jenis_sampah ?? j.id) === Number(form.jenisId)
    );
    const tarif = Number(
      jenis?.tarif_jasa_pengelolaan ?? jenis?.hargaPerKg ?? 0
    );
    const nilai = round3(berat * tarif);

    const baruRow = {
      _localId: nextLocalId(),
      id_jenis_sampah: Number(form.jenisId),
      nama_sampah: jenis?.nama_sampah ?? jenis?.nama ?? "Sampah",
      berat,
      harga_per_kg: tarif,
      nilai,
      _isLocal: true, // penanda: belum tersimpan di backend
    };

    setLocalRows((prev) => [...prev, baruRow]);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  // Hapus baris: jika lokal → hapus dari state, jika sudah di backend → DELETE ke API
  async function handleHapusBaris(itemDetailId, isLocal = false) {
    if (isLocal) {
      setLocalRows((prev) => prev.filter((r) => r._localId !== itemDetailId));
      return;
    }
    if (!selectedId || !itemDetailId) return;
    setActionLoading(true);
    try {
      await deleteDetailPengumpulan(selectedId, itemDetailId);
      await loadDetail(selectedId);
      await loadAntrian();
    } catch (err) {
      alert(formatError(err) || "Gagal menghapus baris sampah.");
    } finally {
      setActionLoading(false);
    }
  }

  // Klik "Buat Nota" → tampilkan konfirmasi
  function handleClickBuatNota() {
    setShowKonfirmasiBuatNota(true);
  }

  // Konfirmasi buat nota → POST semua baris lokal ke backend, lalu tandai nota sebagai generated
  async function handleKonfirmasiBuatNota() {
    if (!selectedId) return;
    // Harus ada minimal 1 baris (lokal atau sudah tersimpan di backend)
    if (localRows.length === 0 && savedItems.length === 0) {
      alert("Tambahkan minimal 1 jenis sampah terlebih dahulu.");
      return;
    }
    setActionLoading(true);
    try {
      // POST setiap baris lokal ke backend satu per satu
      for (const row of localRows) {
        await addDetailPengumpulan(selectedId, {
          id_jenis_sampah: row.id_jenis_sampah,
          berat: row.berat,
        });
      }
      // Bersihkan baris lokal setelah berhasil disimpan
      setLocalRows([]);
      markNotaAsGenerated(selectedId);
      await loadDetail(selectedId);
      await loadAntrian();
      setShowKonfirmasiBuatNota(false);
    } catch (err) {
      alert(formatError(err) || "Gagal membuat nota. Coba lagi.");
    } finally {
      setActionLoading(false);
    }
  }

  // Buka modal nota (ambil data nota dari API)
  async function handleLihatNota() {
    if (!selectedId) return;
    try {
      const data = await getNota(selectedId);
      setNotaData(data);
      setShowNota(true);
    } catch (err) {
      // Fallback: pakai selectedDetail
      setNotaData(null);
      setShowNota(true);
    }
  }

  // Tandai Lunas (dari dalam modal nota)
  async function handleLunas() {
    if (!selectedId || !selectedDetail) return;
    const totalHarga =
      selectedDetail.total_biaya ??
      (selectedDetail.items || []).reduce(
        (sum, i) => sum + (Number(i.nilai) || Number(i.harga) || 0),
        0
      );

    setActionLoading(true);
    try {
      await bayarSetoran(selectedId, { jumlah_dibayar: totalHarga });
      await loadDetail(selectedId);
      await loadAntrian();
      setShowNota(false);
      setNotaData(null);
    } catch (err) {
      throw err; // diteruskan ke modal
    } finally {
      setActionLoading(false);
    }
  }

  // ── computed ──────────────────────────────────────────────
  // Baris yang sudah tersimpan di backend
  const savedItems = useMemo(() => {
    const raw =
      selectedDetail?.detail_pengumpulan_sampah ??
      selectedDetail?.detail_pengumpulan ??
      selectedDetail?.items ??
      selectedDetail?.details ??
      selectedDetail?.detail ??
      [];
    return Array.isArray(raw) ? raw : [];
  }, [selectedDetail]);

  // Gabungan: saved (dari backend) + lokal (belum disimpan)
  // localRows hanya relevan saat status "Menunggu Pilah"
  const items = useMemo(() => {
    const currentStageCheck = getNotaStage(selectedDetail);
    if (currentStageCheck === "menunggu") {
      return [...savedItems, ...localRows];
    }
    return savedItems;
  }, [savedItems, localRows, selectedDetail]);

  const ringkasan = useMemo(() => {
    const totalBerat = round3(
      items.reduce((sum, i) => sum + (Number(i.berat) || 0), 0)
    );
    // Untuk total harga: gunakan total_biaya dari backend untuk baris tersimpan
    // lalu tambahkan nilai estimasi baris lokal
    const savedTotal =
      selectedDetail?.total_biaya ??
      selectedDetail?.total_biaya_final ??
      selectedDetail?.total_biaya_sementara ??
      savedItems.reduce(
        (sum, i) => sum + (Number(i.nilai) || Number(i.harga) || 0),
        0
      );
    const localTotal = localRows.reduce((sum, r) => sum + (r.nilai || 0), 0);
    const totalHarga = round3(Number(savedTotal) + localTotal);
    return { totalItem: items.length, totalBerat, totalHarga };
  }, [items, savedItems, localRows, selectedDetail]);

  const currentStage = getNotaStage(selectedDetail);
  const isBelumDipilah = currentStage === "menunggu";
  const isMenungguBayar = currentStage === "sedang";
  const isSelesai = currentStage === "lunas";

  // Label status pada kartu nota
  function labelStatus(status) {
    if (isSelesai) return "Selesai";
    if (isMenungguBayar) return "Menunggu Bayar";
    return "Menunggu Pilah";
  }

  // Sub-label kartu nota antrian (gambar 5: "Lunas · 22 Okt 2026")
  function subLabelKartu(item) {
    if (!item) return "Menunggu Pilah";
    const stage = getNotaStage(item);
    if (stage === "lunas") {
      const tgl = item.pembayaran?.tanggal_bayar ?? item.tanggal_lunas;
      return tgl ? `Lunas · ${formatTanggal(tgl)}` : "Selesai";
    }
    if (stage === "sedang") return "Menunggu Bayar";
    return "Menunggu Pilah";
  }

  // Data nota untuk modal (pakai notaData dari API jika ada, fallback selectedDetail)
  const notaForModal = notaData ?? selectedDetail;
  const itemsForModal = useMemo(() => {
    const raw =
      notaData?.items ??
      notaData?.detail_pengumpulan_sampah ??
      notaData?.detail_pengumpulan ??
      notaData?.details ??
      items;
    return Array.isArray(raw) ? raw : [];
  }, [notaData, items]);

  return (
    <div
      className="min-h-full"
      style={{ background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/kumpul-sampah"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] mb-2 transition-colors cursor-pointer"
          >
            <MdChevronLeft size={20} />
            Kembali ke Ringkasan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Pilah Sampah
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6B61]">
            Pilih nota antrian, catat jenis dan berat sampah, lalu siapkan pembayaran
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Card 1: Pilih Nota Antrian */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-3">
                Pilih Nota Antrian
              </h2>

              {/* Tabs Filter */}
              <div className="flex items-center gap-4 sm:gap-6 border-b border-[#DDE2DF] mb-4 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`pb-2.5 font-medium transition-colors cursor-pointer ${
                      tab === t.key
                        ? "font-semibold text-[#1F6B3F] border-b-2 border-[#1F6B3F] -mb-[1px]"
                        : "text-[#5B6B61] hover:text-[#14201A]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Kartu Nota */}
              {loadingAntrian ? (
                <div className="py-6 text-center text-xs text-[#5B6B61]">
                  Memuat antrian...
                </div>
              ) : antrian.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#5B6B61]">
                  Tidak ada antrian untuk kategori ini.
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {antrian.map((n) => {
                    const idNota = n.id_pengumpulan_sampah ?? n.id;
                    const isSelected = idNota === selectedId;

                    return (
                      <button
                        key={idNota}
                        type="button"
                        onClick={() => pilihNota(idNota)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between shrink-0 min-w-[200px] cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#1F6B3F] bg-white shadow-xs"
                            : "border-[#DDE2DF] bg-white hover:bg-[#F9FAF9]"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? "text-[#1F6B3F]" : "text-[#14201A]"
                            }`}
                          >
                            {formatNotaCode(idNota)} · {n.nama_warga ?? n.warga?.nama ?? n.nama ?? "Warga"}
                          </p>
                          <p className="text-xs text-[#5B6B61] mt-0.5">
                            {subLabelKartu(n)}
                          </p>
                        </div>
                        {isSelected && (
                          <MdCheckCircle
                            size={18}
                            className="text-[#1F6B3F] shrink-0 ml-2"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 2: Detail Antrian */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              {loadingDetail ? (
                <div className="py-12 text-center text-sm text-[#5B6B61]">
                  Memuat data setoran...
                </div>
              ) : !selectedDetail ? (
                <div className="py-12 text-center text-sm text-[#5B6B61]">
                  Silakan pilih nota antrian di atas untuk melihat rincian penimbangan.
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
                    Detail Antrian – {formatNotaCode(selectedDetail.id_pengumpulan_sampah)}{" "}
                    {selectedDetail.nama_warga ?? selectedDetail.warga?.nama ?? selectedDetail.nama ?? ""}
                  </h2>

                  {/* ── State: Menunggu Pilah → form tambah baris ── */}
                  {isBelumDipilah && (
                    <form onSubmit={handleTambahBaris} className="flex flex-col gap-4 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                            Jenis Sampah
                          </label>
                          <select
                            name="jenisId"
                            value={form.jenisId}
                            onChange={handleFormChange}
                            disabled={actionLoading}
                            className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                          >
                            <option value="">Pilih jenis sampah</option>
                            {jenisList.map((j) => {
                              const jId = j.id_jenis_sampah ?? j.id;
                              const jNama = j.nama_sampah ?? j.nama;
                              const jTarif =
                                j.tarif_jasa_pengelolaan ?? j.hargaPerKg ?? 0;
                              return (
                                <option key={jId} value={jId}>
                                  {jNama} (Rp{" "}
                                  {Number(jTarif).toLocaleString("id-ID")}/kg)
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                            Berat
                          </label>
                          <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F]">
                            <input
                              type="number"
                              name="berat"
                              min="0.01"
                              step="0.01"
                              placeholder="0,0"
                              value={form.berat}
                              onChange={handleFormChange}
                              disabled={actionLoading}
                              className="w-full px-3.5 py-2.5 text-sm text-[#14201A] focus:outline-none"
                            />
                            <span className="px-3 text-xs font-semibold text-[#5B6B61] bg-[#F9FAF9] border-l border-[#DDE2DF] py-3">
                              kg
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#1F6B3F] text-[#1F6B3F] text-sm font-semibold rounded-xl hover:bg-[#E3F1E8] transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                          >
                            <MdAdd size={16} />
                            {actionLoading ? "Menyimpan..." : "Tambah Baris"}
                          </button>
                        </div>
                      </div>

                      {formError && (
                        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                          {formError}
                        </p>
                      )}
                    </form>
                  )}

                  {/* ── State: Menunggu Bayar → info banner ── */}
                  {isMenungguBayar && (
                    <div className="mb-5 p-4 rounded-xl bg-[#EEF6FF] border border-[#BFDBFE] flex gap-3 items-start">
                      <MdInfoOutline
                        size={18}
                        className="text-[#2563EB] shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1D4ED8]">
                          Info · Menunggu pembayaran
                        </p>
                        <p className="text-xs text-[#1D4ED8] mt-0.5">
                          Nota {formatNotaCode(selectedDetail.id_pengumpulan_sampah)} sudah
                          dibuat dan belum dibayar. Tekan Lihat Nota &amp; Tandai
                          Lunas saat warga membayar.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── State: Selesai → banner lunas ── */}
                  {isSelesai && (
                    <div className="mb-5 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex gap-3 items-start">
                      <MdInfoOutline
                        size={18}
                        className="text-[#059669] shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#065F46]">
                          Nota lunas
                        </p>
                        <p className="text-xs text-[#065F46] mt-0.5">
                          Nota lunas pada{" "}
                          {formatTanggalLunas(
                            selectedDetail.pembayaran?.tanggal_bayar ??
                              selectedDetail.tanggal_lunas
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sub-section: Detail Sampah */}
                  <div className={isBelumDipilah ? "mt-0 pt-5 border-t border-[#DDE2DF]" : ""}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#14201A]">
                        Detail Sampah
                      </h3>
                      <span className="text-xs text-[#5B6B61]">
                        {items.length} jenis · {formatKg(ringkasan.totalBerat)}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs text-[#5B6B61]">
                            <th className="py-2.5 px-4 font-normal">
                              Jenis Sampah
                            </th>
                            <th className="py-2.5 px-4 font-normal">Berat</th>
                            <th className="py-2.5 px-4 font-normal">Harga</th>
                            {isBelumDipilah && (
                              <th className="py-2.5 px-2 text-right font-normal" />
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={isBelumDipilah ? 4 : 3}
                                className="py-6 text-center text-xs text-[#5B6B61]"
                              >
                                Belum ada baris sampah ditambahkan.
                              </td>
                            </tr>
                          ) : (
                            items.map((i) => {
                              const isLocal = Boolean(i._isLocal);
                              const itemId = isLocal
                                ? i._localId
                                : (i.id_detail_pengumpulan_sampah ?? i.id_detail ?? i.id);
                              const namaSampah =
                                i.nama_sampah ??
                                i.jenis_sampah?.nama_sampah ??
                                i.jenis ??
                                "Sampah";
                              const nilai = i.nilai ?? i.harga ?? i.total_harga ?? 0;
                              // Harga per kg (sub-label di tabel, gambar 1)
                              const hargaPerKg =
                                i.harga_per_kg ??
                                i.tarif_jasa_pengelolaan ??
                                i.tarif_per_kg ??
                                i.jenis_sampah?.tarif_jasa_pengelolaan ??
                                (Number(i.berat) > 0
                                  ? Math.round(Number(nilai) / Number(i.berat))
                                  : 0);

                              return (
                                <tr
                                  key={isLocal ? `local-${itemId}` : itemId}
                                  className={`border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0 ${isLocal ? "bg-[#F0FAF4]" : ""}`}
                                >
                                  <td className="py-3 px-4">
                                    <p className="text-sm font-medium text-[#14201A]">
                                      {namaSampah}
                                      {isLocal && (
                                        <span className="ml-2 text-[10px] font-normal text-[#1F6B3F] bg-[#D1FAE5] px-1.5 py-0.5 rounded-full">
                                          belum disimpan
                                        </span>
                                      )}
                                    </p>
                                    {hargaPerKg > 0 && (
                                      <p className="text-xs text-[#5B6B61]">
                                        Rp{" "}
                                        {Number(hargaPerKg).toLocaleString(
                                          "id-ID"
                                        )}
                                        / kg
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-[#14201A]">
                                    {formatKg(i.berat)}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-[#14201A]">
                                    {formatRupiah(nilai)}
                                  </td>
                                  {isBelumDipilah && (
                                    <td className="py-3 px-2 text-right">
                                      <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() =>
                                          isLocal
                                            ? handleHapusBaris(itemId, true)
                                            : handleHapusBaris(itemId, false)
                                        }
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                                        title="Hapus baris"
                                      >
                                        <LuTrash2 size={16} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Nota */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
                Ringkasan Nota
              </h2>

              {selectedDetail ? (
                <>
                  {/* Nomor Nota + Badge Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[#14201A] font-jakarta">
                      {formatNotaCode(selectedDetail.id_pengumpulan_sampah)}
                    </span>
                    {isBelumDipilah && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                        Menunggu Pilah
                      </span>
                    )}
                    {isMenungguBayar && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                        Menunggu Bayar
                      </span>
                    )}
                    {isSelesai && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                        Selesai
                      </span>
                    )}
                  </div>

                  {/* Info Warga */}
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-[#14201A]">
                      {selectedDetail.nama_warga ?? selectedDetail.warga?.nama ?? selectedDetail.nama ?? "Warga"}
                    </p>
                    <p className="text-xs text-[#5B6B61] mt-0.5">
                      {formatWaktu(selectedDetail.tanggal)}
                    </p>
                    <p className="text-xs text-[#5B6B61]">
                      {selectedDetail.nomor_wa ?? selectedDetail.warga?.nomor_wa ?? "—"}
                    </p>
                  </div>

                  <div className="border-t border-[#DDE2DF] my-5" />

                  {/* Total Berat */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-[#5B6B61]">Total berat</span>
                    <span className="font-bold text-[#14201A]">
                      {formatKg(ringkasan.totalBerat)}
                    </span>
                  </div>

                  {/* Total Biaya */}
                  <div className="mb-5">
                    <span className="text-sm text-[#5B6B61] block">
                      {isBelumDipilah
                        ? "Total biaya berjalan"
                        : isMenungguBayar
                        ? "Total biaya final"
                        : "Total biaya"}
                    </span>
                    <p className="text-3xl font-extrabold text-[#14201A] font-jakarta mt-1">
                      {formatRupiah(ringkasan.totalHarga)}
                    </p>
                  </div>

                  {/* ── CTA berdasarkan status ── */}
                  {isBelumDipilah && (
                    <>
                      <button
                        type="button"
                        disabled={items.length === 0 || actionLoading}
                        onClick={handleClickBuatNota}
                        className="w-full py-3 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Buat Nota
                      </button>
                      <p className="text-xs text-[#5B6B61] mt-3 leading-relaxed">
                        Lengkapi Detail Sampah sebelum membuat nota. Tombol
                        Generate Nota &amp; Lanjut nonaktif saat detail kosong.
                      </p>
                    </>
                  )}

                  {isMenungguBayar && (
                    <>
                      <button
                        type="button"
                        onClick={handleLihatNota}
                        className="w-full py-3 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors cursor-pointer"
                      >
                        Lihat Nota &amp; Tandai Lunas
                      </button>
                      <p className="text-xs text-[#5B6B61] mt-3 leading-relaxed">
                        Tandai lunas hanya setelah pembayaran kepada warga selesai.
                      </p>
                    </>
                  )}

                  {isSelesai && (
                    <>
                      <button
                        type="button"
                        onClick={handleLihatNota}
                        className="w-full py-3 bg-white text-[#1F6B3F] text-sm font-semibold rounded-xl border border-[#1F6B3F] hover:bg-[#E3F1E8] transition-colors cursor-pointer"
                      >
                        Lihat Nota
                      </button>
                      <p className="text-xs text-[#5B6B61] mt-3 leading-relaxed">
                        Nota sudah lunas. Gunakan tombol di atas untuk melihat
                        detail pembayaran.
                      </p>
                    </>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#5B6B61]">
                  Pilih nota untuk melihat ringkasan.
                </p>
              )}
            </div>

            {/* Callout Info */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE2DF] shadow-sm flex items-start gap-3">
              <MdInfoOutline
                size={20}
                className="text-[#1F6B3F] shrink-0 mt-0.5"
              />
              <p className="text-xs text-[#5B6B61] leading-relaxed">
                Harga dihitung dari berat × harga per kg. Periksa rincian
                sebelum membuat nota.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pop-up Konfirmasi Buat Nota ── */}
      {showKonfirmasiBuatNota && (
        <PopUpKonfirmasiBuatNota
          loading={actionLoading}
          onBatal={() => setShowKonfirmasiBuatNota(false)}
          onKonfirmasi={handleKonfirmasiBuatNota}
        />
      )}

      {/* ── Pop-up Nota Pembayaran ── */}
      {showNota && notaForModal && (
        <PopUpPilahSampah
          nota={notaForModal}
          items={itemsForModal}
          onClose={() => {
            setShowNota(false);
            setNotaData(null);
          }}
          onLunas={handleLunas}
          readOnly={isSelesai}
        />
      )}
    </div>
  );
}
