import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdVisibility,
  MdCheck,
  MdRecycling,
  MdAccountBalanceWallet,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";
import PopUpKonfirmasiLunas from "./PopUpKonfirmasiLunas";
import PeriodFilter, { MONTHS_ID } from "../../../components/common/PeriodFilter";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";
import { getPengumpulan, deletePengumpulan } from "../../../services/pengumpulanSampahService";
import { bayarSetoran } from "../../../services/pembayaranService";
import { getDashboard } from "../../../services/dashboardService";
import { getNotaStage } from "../../../utils/statusHelper";

const TABS = [
  { key: "semua", label: "Semua", statusParam: "" },
  { key: "menunggu", label: "Menunggu Pilah", statusParam: "Menunggu Dipilah" },
  { key: "sedang", label: "Menunggu Bayar", statusParam: "Menunggu Pembayaran" },
  { key: "lunas", label: "Selesai", statusParam: "Lunas" },
];

// Status dari API: backend bisa mengembalikan "Menunggu Dipilah", "Sedang Dipilah", "Selesai Dipilah"
// atau format snake_case "belum_dipilah", "menunggu_bayar", "selesai"
function normalizeStatus(item) {
  return String(item?.status || item?.status_ui || "").toLowerCase().trim();
}

function matchesTab(item, tabKey) {
  if (!tabKey || tabKey === "semua") return true;
  return getNotaStage(item) === tabKey;
}

function hasMonthSampahData(entry) {
  const val = entry?.sampah_terkumpul;
  const berat = Number(typeof val === "object" ? val?.berat ?? val?.jumlah_setoran : val);
  const nilai = Number(entry?.nilai_sampah ?? 0);
  return berat > 0 || nilai > 0;
}

export default function KumpulSampahPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("semua");
  const [notaList, setNotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [payingId, setPayingId] = useState(null);
  const [notaToPay, setNotaToPay] = useState(null);
  const [payError, setPayError] = useState("");
  const [notaToDelete, setNotaToDelete] = useState(null);
  const [stats, setStats] = useState({ totalKg: 0, totalNilai: 0 });
  const rawListRef = useRef([]);

  // Filter periode untuk 2 stat card
  const now = new Date();
  const [periodMode, setPeriodMode] = useState("semua"); // "semua" | "bulan" | "tahun"
  const [filterMonth, setFilterMonth] = useState(now.getMonth());
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [availableMonths, setAvailableMonths] = useState(() => new Set());
  const [availableYears, setAvailableYears] = useState(() => new Set());

  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];

  const loadStats = useCallback(async () => {
    if (periodMode === "semua") {
      try {
        const firstRes = await getPengumpulan({ status: "Lunas", limit: 10, page: 1 });
        const totalPages =
          Number(firstRes.meta?.total_page ?? firstRes.meta?.last_page ?? 1) || 1;
        let allLunas = [...(firstRes.data || [])];

        if (totalPages > 1) {
          const restPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, idx) =>
              getPengumpulan({ status: "Lunas", limit: 10, page: idx + 2 }).catch(() => ({
                data: [],
              }))
            )
          );
          for (const res of restPages) {
            allLunas = allLunas.concat(res.data || []);
          }
        }

        const totalKg = allLunas.reduce(
          (sum, item) => sum + (Number(item.total_berat) || 0),
          0
        );
        const totalNilai = allLunas.reduce(
          (sum, item) => sum + (Number(item.total_biaya) || 0),
          0
        );

        setStats({
          totalKg: Math.round(totalKg * 100) / 100,
          totalNilai,
        });
      } catch (err) {
        console.warn("Gagal memuat ringkasan all-time:", err);
      }
      return;
    }

    if (periodMode === "tahun") {
      const monthlyResults = await Promise.all(
        Array.from({ length: 12 }, (_, idx) =>
          getDashboard({
            bulan: idx + 1,
            tahun: filterYear,
            mode_grafik: "bulan",
          }).catch(() => null)
        )
      );

      let totalKg = 0;
      let totalNilai = 0;
      for (const res of monthlyResults) {
        if (!res) continue;
        const kg =
          res?.ringkasan_sampah_terkumpul?.berat ??
          (typeof res?.ringkasan_periode?.sampah_terkumpul === "object"
            ? res.ringkasan_periode.sampah_terkumpul?.berat
            : res?.ringkasan_periode?.sampah_terkumpul) ??
          0;
        const nilai =
          res?.ringkasan_sampah_terkumpul?.nilai ??
          res?.ringkasan_periode?.nilai_sampah ??
          0;
        totalKg += Number(kg) || 0;
        totalNilai += Number(nilai) || 0;
      }

      setStats({
        totalKg: Math.round(totalKg * 100) / 100,
        totalNilai,
      });
      return;
    }

    const dashboardRes = await getDashboard({
      bulan: filterMonth + 1,
      tahun: filterYear,
      mode_grafik: "bulan",
    }).catch(() => null);

    const totalKg =
      dashboardRes?.ringkasan_sampah_terkumpul?.berat ??
      (typeof dashboardRes?.ringkasan_periode?.sampah_terkumpul === "object"
        ? dashboardRes.ringkasan_periode.sampah_terkumpul?.berat
        : dashboardRes?.ringkasan_periode?.sampah_terkumpul) ??
      0;

    const totalNilai =
      dashboardRes?.ringkasan_sampah_terkumpul?.nilai ??
      dashboardRes?.ringkasan_periode?.nilai_sampah ??
      0;

    setStats({
      totalKg: Number(totalKg) || 0,
      totalNilai: Number(totalNilai) || 0,
    });
  }, [periodMode, filterMonth, filterYear]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Selalu ambil semua tanpa filter status ke API (hindari validasi 422),
      // lalu saring di frontend berdasarkan tab aktif.
      const pengumpulanRes = await getPengumpulan({ page, limit: 10 });

      // Urutkan ID terbesar (terbaru) di atas agar setoran yang baru disimpan langsung terlihat
      const rawList = [...(pengumpulanRes.data || [])].sort((a, b) => {
        const idA = Number(a.id_pengumpulan_sampah ?? a.id ?? 0);
        const idB = Number(b.id_pengumpulan_sampah ?? b.id ?? 0);
        return idB - idA;
      });
      rawListRef.current = rawList;

      // Filter client-side sesuai tab; "semua" tidak difilter
      const list = activeTab.key === "semua"
        ? rawList
        : rawList.filter((item) => matchesTab(item, activeTab.key));

      setNotaList(list);

      // Gunakan meta dari server jika tidak ada filter (normalisasi format BE & Laravel), atau buat sendiri
      if (pengumpulanRes.meta && activeTab.key === "semua") {
        const m = pengumpulanRes.meta;
        const total = Number(m.total ?? m.total_data ?? list.length) || 0;
        const currentPage = Number(m.current_page ?? m.page ?? page) || 1;
        const perPage = Number(m.per_page ?? m.limit ?? 10) || 10;
        const lastPage =
          Number(m.last_page ?? m.total_page ?? Math.max(1, Math.ceil(total / perPage))) || 1;
        setMeta({
          current_page: currentPage,
          last_page: lastPage,
          total,
          per_page: perPage,
        });
      } else {
        setMeta({
          current_page: 1,
          last_page: 1,
          total: list.length,
          per_page: list.length || 10,
        });
      }
    } catch (err) {
      console.error("Gagal memuat data kumpul sampah:", err);
      setError(formatError(err) || "Gagal memuat data setoran.");
    } finally {
      setLoading(false);
    }
  }, [activeTab.key, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Cek ketersediaan data per bulan / per tahun untuk indikator picker (sama seperti Dashboard)
  useEffect(() => {
    if (periodMode === "semua") return;
    let active = true;

    if (periodMode === "bulan") {
      getDashboard({ tahun: filterYear, mode_grafik: "bulan" })
        .then((res) => {
          if (!active) return;
          const chart = Array.isArray(res?.chart_data) ? res.chart_data : [];
          const months = new Set();
          chart.forEach((entry, idx) => {
            const mIdx = entry.bulan ? Number(entry.bulan) - 1 : (entry.monthIdx ?? idx);
            if (hasMonthSampahData(entry)) {
              months.add(mIdx);
            }
          });
          setAvailableMonths(months);
        })
        .catch(() => {
          if (active) setAvailableMonths(new Set());
        });
    } else if (periodMode === "tahun") {
      const targetYears = [filterYear - 1, filterYear, filterYear + 1];
      Promise.all(
        targetYears.map((yr) =>
          getDashboard({ tahun: yr, mode_grafik: "bulan" })
            .then((res) => {
              const chart = Array.isArray(res?.chart_data) ? res.chart_data : [];
              return chart.some(hasMonthSampahData) ? yr : null;
            })
            .catch(() => null)
        )
      ).then((results) => {
        if (!active) return;
        setAvailableYears(new Set(results.filter((yr) => yr !== null)));
      });
    }

    return () => {
      active = false;
    };
  }, [periodMode, filterYear]);

  function handleTabChange(newTabKey) {
    setTab(newTabKey);
    setPage(1);
  }

  async function confirmTandaiLunas() {
    if (!notaToPay) return;
    const id = notaToPay.id_pengumpulan_sampah ?? notaToPay.id;
    setPayingId(id);
    setPayError("");
    try {
      await bayarSetoran(id, {
        jumlah_dibayar: notaToPay.total_biaya || 0,
      });
      await Promise.all([loadData(), loadStats()]);
      setNotaToPay(null);
    } catch (err) {
      setPayError(formatError(err) || "Gagal mencatat pembayaran.");
    } finally {
      setPayingId(null);
    }
  }

  async function confirmHapusNota() {
    if (notaToDelete) {
      const id = notaToDelete.id_pengumpulan_sampah ?? notaToDelete.id;
      try {
        await deletePengumpulan(id);
        await Promise.all([loadData(), loadStats()]);
      } catch (err) {
        console.warn("Gagal menghapus via API:", err);
      }
      setNotaToDelete(null);
    }
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

  const formatNotaCode = (id) => {
    if (!id) return "";
    return typeof id === "number" || /^\d+$/.test(id)
      ? `#A${String(id).padStart(2, "0")}`
      : id;
  };

  const totalMeta = Number(meta?.total) || 0;
  const currentPageMeta = Number(meta?.current_page) || 1;
  const perPageMeta = Number(meta?.per_page) || 10;
  const fromIndex = totalMeta === 0 ? 0 : (currentPageMeta - 1) * perPageMeta + 1;
  const toIndex = Math.min(totalMeta, currentPageMeta * perPageMeta);

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
              Kumpul Sampah
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#14201A]">
              Catat setoran sampah warga, lihat status nota dan pembayarannya
            </p>
          </div>
          <Link
            to="/kumpul-sampah/tambah"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <MdAdd size={18} />
            Tambah Setoran
          </Link>
        </div>

        {/* Card: Daftar Antrian Nota */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
              Daftar Antrian Nota
            </h2>
            <span className="text-xs text-[#5B6B61]">
              {meta?.total ?? 0} nota tercatat
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-[#DDE2DF] mt-2 mb-4 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabChange(t.key)}
                className={`pb-3 font-medium transition-colors cursor-pointer ${
                  tab === t.key
                    ? "font-semibold text-[#1F6B3F] border-b-2 border-[#1F6B3F] -mb-[1px]"
                    : "text-[#5B6B61] hover:text-[#14201A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAF9] border-b border-[#DDE2DF]">
                <tr className="text-xs text-[#5B6B61]">
                  <th className="py-3 px-4 font-normal">ID Nota</th>
                  <th className="py-3 px-4 font-normal">Nama Warga</th>
                  <th className="py-3 px-4 font-normal">Tanggal</th>
                  <th className="py-3 px-4 font-normal">Total Biaya</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#5B6B61]">
                      Memuat antrian nota...
                    </td>
                  </tr>
                ) : notaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#5B6B61]">
                      Belum ada nota untuk kategori ini.
                    </td>
                  </tr>
                ) : (
                  notaList.map((n) => {
                    const idNota = n.id_pengumpulan_sampah ?? n.id;
                    const namaWarga =
                      n.nama_warga ??
                      n.warga?.nama ??
                      n.warga_nama ??
                      n.nama ??
                      "—";
                    const stage = getNotaStage(n);
                    const isMenungguPilah = stage === "menunggu";
                    const isMenungguBayar = stage === "sedang";
                    const isSelesai       = stage === "lunas";

                    return (
                      <tr
                        key={idNota}
                        className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                      >
                        <td className="py-3.5 px-4 text-sm font-bold text-[#14201A]">
                          {formatNotaCode(idNota)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {namaWarga}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#5B6B61]">
                          {formatTanggal(n.tanggal)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {!n.total_biaya || n.total_biaya <= 0
                            ? "—"
                            : formatRupiah(n.total_biaya)}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          {isMenungguPilah && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                              Menunggu Pilah
                            </span>
                          )}
                          {isMenungguBayar && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                              Menunggu Bayar
                            </span>
                          )}
                          {isSelesai && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                              Selesai
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            {isMenungguPilah ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/kumpul-sampah/pilah?nota=${encodeURIComponent(idNota)}`)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors cursor-pointer"
                              >
                                <LuPencil size={16} />
                                Pilah
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/kumpul-sampah/pilah?nota=${encodeURIComponent(idNota)}`)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors cursor-pointer"
                              >
                                <MdVisibility size={16} />
                                Lihat
                              </button>
                            )}

                            {isMenungguBayar ? (
                              <button
                                type="button"
                                disabled={payingId === idNota}
                                onClick={() => {
                                  setPayError("");
                                  setNotaToPay(n);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#1F6B3F] text-[#1F6B3F] text-xs font-semibold hover:bg-[#E3F1E8] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <MdCheck size={14} />
                                {payingId === idNota ? "Memproses..." : "Tandai Lunas"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#DDE2DF] text-[#9CA3AF] text-xs font-semibold cursor-not-allowed bg-gray-50/50"
                              >
                                <MdCheck size={14} />
                                Tandai Lunas
                              </button>
                            )}

                            {(isMenungguPilah || isMenungguBayar) && (
                              <button
                                type="button"
                                onClick={() => setNotaToDelete(n)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
                                title="Hapus Nota"
                              >
                                <LuTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[#5B6B61]">
              Menampilkan {meta.total === 0 ? 0 : fromIndex}–{toIndex} dari {meta?.total ?? 0} nota
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDE2DF] text-xs text-[#5B6B61] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <MdChevronLeft size={16} />
              </button>
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#E3F1E8] text-xs font-semibold text-[#1F6B3F]">
                {meta.current_page || 1}
              </span>
              <button
                type="button"
                disabled={page >= (meta.last_page || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDE2DF] text-xs text-[#5B6B61] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <MdChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Filter Periode + Stat Cards: Sampah Terkumpul & Nilai Sampah */}
        <div className="flex flex-col gap-3">
          <PeriodFilter
            mode={periodMode}
            onModeChange={setPeriodMode}
            month={filterMonth}
            onMonthChange={setFilterMonth}
            year={filterYear}
            onYearChange={setFilterYear}
            availableMonths={availableMonths}
            availableYears={availableYears}
            placement="top"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Sampah Terkumpul */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3F4B44]">
                  Sampah Terkumpul
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <MdRecycling size={22} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-[#14201A] font-jakarta">
                  {formatKg(stats.totalKg)}
                </p>
                <p className="text-xs text-[#5B6B61] mt-1">
                  {periodMode === "bulan"
                    ? `Total sampah dari nota lunas pada ${MONTHS_ID[filterMonth]} ${filterYear}`
                    : periodMode === "tahun"
                    ? `Total sampah dari nota lunas pada tahun ${filterYear}`
                    : "Total sampah dari nota yang sudah dibayar"}
                </p>
              </div>
            </div>

            {/* Card 2: Nilai Sampah Tercatat */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#3F4B44]">
                  Nilai Sampah Tercatat
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <MdAccountBalanceWallet size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-[#14201A] font-jakarta">
                  {formatRupiah(stats.totalNilai)}
                </p>
                <p className="text-xs text-[#5B6B61] mt-1">
                  {periodMode === "bulan"
                    ? `Akumulasi nilai nota lunas pada ${MONTHS_ID[filterMonth]} ${filterYear}`
                    : periodMode === "tahun"
                    ? `Akumulasi nilai nota lunas pada tahun ${filterYear}`
                    : "Akumulasi nilai dari nota yang sudah dibayar"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notaToPay && (
        <PopUpKonfirmasiLunas
          title="Konfirmasi Pelunasan?"
          subtitle="Pastikan pembayaran untuk nota ini sudah diterima."
          details={[
            { label: "ID Nota", value: formatNotaCode(notaToPay.id_pengumpulan_sampah ?? notaToPay.id) },
            { label: "Nama Warga", value: notaToPay.nama_warga ?? notaToPay.warga?.nama ?? notaToPay.warga_nama ?? notaToPay.nama ?? "—" },
            { label: "Total Biaya", value: !notaToPay.total_biaya || notaToPay.total_biaya <= 0 ? "—" : formatRupiah(notaToPay.total_biaya) },
          ]}
          loading={payingId === (notaToPay.id_pengumpulan_sampah ?? notaToPay.id)}
          error={payError}
          onClose={() => {
            if (!payingId) {
              setNotaToPay(null);
              setPayError("");
            }
          }}
          onConfirm={confirmTandaiLunas}
        />
      )}

      {notaToDelete && (
        <PopUpKonfirmasiHapus
          title="Hapus Nota Ini?"
          subtitle="Nota yang dihapus tidak dapat dikembalikan"
          details={[
            { label: "ID Nota", value: formatNotaCode(notaToDelete.id_pengumpulan_sampah ?? notaToDelete.id) },
            { label: "Nama Warga", value: notaToDelete.nama_warga ?? notaToDelete.warga?.nama ?? notaToDelete.nama ?? "—" },
          ]}
          onClose={() => setNotaToDelete(null)}
          onConfirm={confirmHapusNota}
        />
      )}
    </div>
  );
}
