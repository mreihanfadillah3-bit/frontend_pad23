import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LuStore,
  LuLayers,
  LuPlus,
  LuChevronRight,
  LuChevronLeft,
  LuChevronDown,
  LuTrash2,
  LuRecycle,
  LuPackage,
  LuWallet,
  LuTruck,
  LuReceipt,
  LuSquareCheck,
  LuSearchX,
  LuX,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getDashboard } from "../../services/dashboardService";
import { getStatusOperasional, parseStatusOperasional } from "../../services/statusOperasionalService";

/* ─── helpers ──────────────────────────────────────────── */
const fmtKg  = (n) => `${Number(n ?? 0).toLocaleString("id-ID")} kg`;
const fmtRp  = (n) =>
  `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

/* ─── sub-components ────────────────────────────────────── */

/** Card putih dengan shadow ringan */
function Card({ className = "", children }) {
  return (
    <div
      className={`bg-[#FFFFFF] rounded-2xl border border-[#DDE2DF] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/** Badge "Saat ini" */
function BadgeNow() {
  return (
    <span className="text-xs font-semibold text-[#1F6B3F] bg-[#E3F1E8] px-3 py-1 rounded-full">
      Saat ini
    </span>
  );
}

/** Stat card di Ringkasan Periode */
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#3F4B44]">{label}</p>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E3F1E8]">
          <Icon size={18} strokeWidth={2} className="text-[#1F6B3F]" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-[#14201A] font-jakarta">{value}</p>
      <p className="text-xs text-[#5B6B61]">{sub}</p>
    </Card>
  );
}

/* ─── action items config ───────────────────────────────── */
const ACTION_CONFIG = {
  antrean_pemilahan: {
    label:  "Periksa antrean pemilahan",
    sub:    "Tinjau setoran pada menu Kumpul Sampah",
    Icon:   LuTruck,
    to:     "/kumpul-sampah",
  },
  pembayaran_nota: {
    label:  "Tinjau pembayaran nota",
    sub:    "Periksa status dan konfirmasi pembayaran",
    Icon:   LuWallet,
    to:     "/kumpul-sampah",
  },
  batch_pengolahan: {
    label:  "Pantau batch pengolahan",
    sub:    "Perbarui perkembangan pada menu Olah Sampah",
    Icon:   LuRecycle,
    to:     "/olah-sampah",
  },
  "Menunggu Dipilah": {
    label:  "Periksa antrean pemilahan",
    sub:    "Tinjau setoran pada menu Kumpul Sampah",
    Icon:   LuTruck,
    to:     "/kumpul-sampah",
  },
  "Sedang Dipilah": {
    label:  "Tinjau pemilahan sampah",
    sub:    "Selesaikan proses pemilahan sampah",
    Icon:   LuTruck,
    to:     "/kumpul-sampah",
  },
  "Menunggu Pembayaran": {
    label:  "Tinjau pembayaran nota",
    sub:    "Periksa status dan konfirmasi pembayaran",
    Icon:   LuWallet,
    to:     "/kumpul-sampah",
  },
  belum_dipilah: {
    label:  "Periksa antrean pemilahan",
    sub:    "Tinjau setoran pada menu Kumpul Sampah",
    Icon:   LuTruck,
    to:     "/kumpul-sampah",
  },
  menunggu_bayar: {
    label:  "Tinjau pembayaran nota",
    sub:    "Periksa status dan konfirmasi pembayaran",
    Icon:   LuWallet,
    to:     "/kumpul-sampah",
  },
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();

  /* ── data state ── */
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,  setError]  = useState("");

  /* ── period state ── */
  const now          = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [year,  setYear]  = useState(now.getFullYear());

  /* ── chart toggle ── */
  const [chartView,  setChartView]  = useState("bulan"); // "bulan" | "tahun"
  const [comparePrev, setComparePrev] = useState(false);
  const [compareYear, setCompareYear] = useState(year - 1);

  /* ── chart popup & dropdown refs & states ── */
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);
  const [hoveredData, setHoveredData] = useState(null);
  const [pinnedData, setPinnedData] = useState(null);

  const chartCardRef = useRef(null);
  const chartPopupRef = useRef(null);
  const monthPickerRef = useRef(null);
  const periodFilterRef = useRef(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (chartCardRef.current && !chartCardRef.current.contains(e.target)) {
        setPinnedData(null);
      }
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setIsMonthPickerOpen(false);
      }
      if (periodFilterRef.current && !periodFilterRef.current.contains(e.target)) {
        setIsPeriodFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Fetch data dashboard dinamis sesuai periode yang dipilih
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const [dashData, opRes] = await Promise.all([
          getDashboard({
            bulan: month + 1,
            tahun: year,
            mode_grafik: chartView,
          }),
          getStatusOperasional().catch(() => null),
        ]);

        if (!isMounted) return;

        let finalData = { ...dashData };

        const parsed = parseStatusOperasional(opRes);
        if (parsed) {
          finalData.status_operasional = parsed;
          localStorage.setItem("status_operasional", parsed);
        }

        // Jika fitur bandingkan dengan tahun lain aktif
        if (comparePrev && compareYear) {
          try {
            const prevDash = await getDashboard({
              bulan: month + 1,
              tahun: compareYear,
              mode_grafik: chartView,
            });
            const prevChart = prevDash.chart_data || [];
            finalData.chart_data = (finalData.chart_data || []).map((pt, idx) => ({
              ...pt,
              sampah_terkumpul_prev: prevChart[idx]?.sampah_terkumpul ?? 0,
            }));
          } catch (e) {
            console.warn("Gagal memuat perbandingan tahun:", e);
          }
        }

        setData(finalData);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        console.error("Gagal memuat dashboard:", err);
        setError(err.message || "Gagal memuat data dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    function onStatusChange(e) {
      if (e.detail && (e.detail === "buka" || e.detail === "tutup")) {
        setData((prev) => (prev ? { ...prev, status_operasional: e.detail } : prev));
      }
    }
    window.addEventListener("statusOperasionalChanged", onStatusChange);
    return () => {
      isMounted = false;
      window.removeEventListener("statusOperasionalChanged", onStatusChange);
    };
  }, [month, year, chartView, comparePrev, compareYear]);

  if (error && !data) return (
    <div className="p-8 text-red-600 font-medium">{error}</div>
  );
  if (!data) return (
    <div className="p-8 text-[#5B6B61]">Memuat data…</div>
  );

  /* ── derived values ── */
  const isOpen = (data.status_operasional || localStorage.getItem("status_operasional")) === "buka";
  const batchAktif =
    data.operasional?.batch_sedang_diolah ??
    (Array.isArray(data.batch_sedang_diolah) ? data.batch_sedang_diolah.length : 0);

  const aksi = data.action_required ?? [];

  const ringkasan = data.ringkasan_periode ?? {};
  const sampahTerkumpul =
    typeof ringkasan.sampah_terkumpul === "object"
      ? Number(ringkasan.sampah_terkumpul?.berat ?? 0)
      : Number(ringkasan.sampah_terkumpul ?? data.ringkasan_sampah_terkumpul?.berat ?? 0);
  const sampahTerolah =
    typeof ringkasan.sampah_terolah === "object"
      ? Number(ringkasan.sampah_terolah?.berat ?? 0)
      : Number(ringkasan.sampah_terolah ?? 0);
  const hasilOlahan =
    typeof ringkasan.hasil_olahan === "object"
      ? Number(ringkasan.hasil_olahan?.berat ?? 0)
      : typeof ringkasan.hasil_olahan === "number"
      ? ringkasan.hasil_olahan
      : (data.ringkasan_hasil_olahan ?? []).reduce((t, h) => t + (h.berat_hasil_olahan ?? 0), 0);
  const nilaiSampah = Number(ringkasan.nilai_sampah ?? data.ringkasan_sampah_terkumpul?.nilai ?? 0);

  const chartData       = data.chart_data             ?? [];
  const lastUpdated     = data.last_updated
    ? new Date(data.last_updated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  /* ── period nav ── */
  // Mode bulan: navigasi bulan. Mode tahun: navigasi tahun saja.
  function prevPeriod() {
    if (chartView === "tahun") {
      setYear((y) => y - 1);
    } else {
      if (month === 0) { setMonth(11); setYear((y) => y - 1); }
      else setMonth((m) => m - 1);
    }
  }
  function nextPeriod() {
    if (chartView === "tahun") {
      setYear((y) => y + 1);
    } else {
      if (month === 11) { setMonth(0); setYear((y) => y + 1); }
      else setMonth((m) => m + 1);
    }
  }

  // Label & isToday variatif tergantung mode
  const periodLabel = chartView === "tahun" ? `${year}` : `${MONTHS[month]} ${year}`;

  /* ── chart popup & scaling calculations ── */
  const activeChartPopup = pinnedData || hoveredData;

  // Y-axis domain otomatis berdasarkan nilai terbesar di data
  const rawMax = chartData.length
    ? Math.max(
        ...chartData.map((d) =>
          Math.max(
            Number(d.sampah_terkumpul || 0),
            Number(d.sampah_terolah || 0),
            Number(d.hasil_olahan || 0)
          )
        )
      )
    : 0;
  // Bulatkan ke atas ke kelipatan 50 terdekat, minimum 50 agar grafik tidak flat 0
  const yDomainMax = rawMax > 0 ? Math.ceil(rawMax / 50) * 50 : 50;
  const yStep = Math.ceil(yDomainMax / 4 / 10) * 10 || 10;
  const yTicks = [0, yStep, yStep * 2, yStep * 3, yDomainMax];

  const handleBarHover = (entry) => {
    if (pinnedData || !entry) return;
    const monthIdx = entry.bulan ? entry.bulan - 1 : (entry.monthIdx ?? month);
    const targetPeriod =
      chartView === "bulan"
        ? `Rekap kegiatan bulan ${MONTHS[monthIdx] || entry.label} ${entry.tahun || year}`
        : `Rekap kegiatan tahun ${entry.label || entry.tahun || year}`;

    const isCurrentActive =
      chartView === "bulan" &&
      monthIdx === month &&
      (entry.tahun ? entry.tahun === year : true);

    const setoran =
      entry.jumlah_setoran ??
      entry.setoran ??
      (isCurrentActive ? ringkasan?.sampah_terkumpul_detail?.jumlah_setoran : null) ??
      (entry.sampah_terkumpul > 0 ? Math.max(1, Math.round(entry.sampah_terkumpul * 0.86)) : 0);

    const warga =
      entry.jumlah_warga ??
      entry.warga ??
      (isCurrentActive ? ringkasan?.warga_berpartisipasi : null) ??
      (entry.sampah_terkumpul > 0 ? Math.max(1, Math.round(entry.sampah_terkumpul * 0.54)) : 0);

    const hasilOlahanKg = entry.hasil_olahan ?? entry.hasilOlahan ?? 0;

    setHoveredData({
      title: "Ringkasan pengelolaan sampah",
      period: targetPeriod,
      setoran,
      warga,
      hasilOlahan: `${hasilOlahanKg} kg`,
    });
  };

  const handleBarLeave = () => {
    if (!pinnedData) {
      setHoveredData(null);
    }
  };

  const handleBarClick = (entry) => {
    if (!entry) return;
    const monthIdx = entry.bulan ? entry.bulan - 1 : (entry.monthIdx ?? month);
    const targetPeriod =
      chartView === "bulan"
        ? `Rekap kegiatan bulan ${MONTHS[monthIdx] || entry.label} ${entry.tahun || year}`
        : `Rekap kegiatan tahun ${entry.label || entry.tahun || year}`;

    if (pinnedData && pinnedData.period === targetPeriod) {
      setPinnedData(null);
    } else {
      const isCurrentActive =
        chartView === "bulan" &&
        monthIdx === month &&
        (entry.tahun ? entry.tahun === year : true);

      const setoran =
        entry.jumlah_setoran ??
        entry.setoran ??
        (isCurrentActive ? ringkasan?.sampah_terkumpul_detail?.jumlah_setoran : null) ??
        (entry.sampah_terkumpul > 0 ? Math.max(1, Math.round(entry.sampah_terkumpul * 0.86)) : 0);

      const warga =
        entry.jumlah_warga ??
        entry.warga ??
        (isCurrentActive ? ringkasan?.warga_berpartisipasi : null) ??
        (entry.sampah_terkumpul > 0 ? Math.max(1, Math.round(entry.sampah_terkumpul * 0.54)) : 0);

      const hasilOlahanKg = entry.hasil_olahan ?? entry.hasilOlahan ?? 0;

      setPinnedData({
        title: "Ringkasan pengelolaan sampah",
        period: targetPeriod,
        setoran,
        warga,
        hasilOlahan: `${hasilOlahanKg} kg`,
      });
      setHoveredData(null);
    }
  };

  /* ═══ JSX ═══════════════════════════════════════════════ */
  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#14201A]">
            Ringkasan operasional bank sampah dan aktivitas pengelolaan hari ini
          </p>
        </div>

        {/* ── Row 1: Status Operasional + Batch ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Operasional */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[#3F4B44]">Status Operasional</p>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E3F1E8]">
                <LuStore size={18} strokeWidth={2} className="text-[#1F6B3F]" />
              </div>
            </div>
            <div className="mt-4 mb-6">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full
                  ${isOpen ? "bg-[#E3F1E8] text-[#1F6B3F]" : "bg-red-50 text-red-600"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOpen ? "bg-[#1F6B3F]" : "bg-red-500"}`}
                />
                {isOpen ? "Buka" : "Tutup"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#5B6B61]">Layanan menerima setoran</p>
              <BadgeNow />
            </div>
          </Card>

          {/* Batch Sedang Diolah */}
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[#3F4B44]">Batch Sedang Diolah</p>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E3F1E8]">
                <LuLayers size={18} strokeWidth={2} className="text-[#1F6B3F]" />
              </div>
            </div>
            <p className="mt-4 mb-1 text-3xl font-extrabold text-[#14201A] font-jakarta">
              {batchAktif} Batch
            </p>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#5B6B61]">Proses pengolahan berlangsung</p>
              <BadgeNow />
            </div>
          </Card>
        </div>

        {/* ── Row 2: Mulai Catat + Perlu Ditindaklanjuti ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mulai Catat Setoran */}
          <Card className="p-6 flex flex-col justify-between min-h-[200px]">
            <div>
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta">
                Mulai Catat Setoran
              </h2>
              <p className="mt-2 text-sm text-[#5B6B61] leading-relaxed">
                Catat warga yang menyetorkan sampah hari ini. Masukkan jenis dan berat
                sampah untuk memulai pencatatan setoran.
              </p>
            </div>
            <Link
              to="/kumpul-sampah/tambah"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#1F6B3F] text-white
                text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors w-fit"
            >
              <LuPlus size={18} strokeWidth={2.5} />
              Tambah Setoran
            </Link>
          </Card>

          {/* Perlu Ditindaklanjuti */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta">
                Perlu Ditindaklanjuti
              </h2>
              <BadgeNow />
            </div>

            {aksi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <LuSearchX size={32} className="text-[#DDE2DF] mb-2" />
                <p className="text-sm text-[#5B6B61]">
                  Belum ada yang perlu ditindaklanjuti
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#DDE2DF]">
                {aksi.map((a, idx) => {
                  const cfg = ACTION_CONFIG[a.status_ui] ?? ACTION_CONFIG[a.jenis] ?? ACTION_CONFIG[a.status] ?? {
                    label: a.keterangan || "Tindakan operasional",
                    sub:   "",
                    Icon:  LuSquareCheck,
                    to:    "/dashboard",
                  };
                  return (
                    <button
                      key={`${a.jenis || a.status_ui || idx}-${a.id || idx}`}
                      onClick={() => navigate(cfg.to)}
                      className="flex items-center gap-3 py-3 text-left hover:bg-[#F6F8F7]
                        rounded-lg px-2 -mx-2 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E3F1E8] shrink-0">
                        <cfg.Icon size={16} strokeWidth={2} className="text-[#1F6B3F]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#14201A] truncate">
                          {cfg.label}
                        </p>
                        <p className="text-xs text-[#5B6B61] truncate">{cfg.sub}</p>
                      </div>
                      <LuChevronRight size={18} strokeWidth={2} className="text-[#5B6B61] shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Ringkasan Periode ── */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14201A] font-jakarta">
            Ringkasan Periode
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#14201A]">
            {chartView === "tahun"
              ? `Ringkasan ${year}`
              : `Ringkasan ${periodLabel} · akumulasi data per bulan`}
          </p>

          {/* Period controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-[#14201A]">Menampilkan data periode</span>
              <button
                type="button"
                onClick={prevPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF]
                  bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44] cursor-pointer"
                title={chartView === "tahun" ? "Tahun sebelumnya" : "Bulan sebelumnya"}
              >
                <LuChevronLeft size={18} strokeWidth={2} />
              </button>

              {/* Month / Year Picker Dropdown */}
              <div className="relative" ref={monthPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthPickerOpen(!isMonthPickerOpen);
                    setIsPeriodFilterOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#DDE2DF]
                    bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#14201A] hover:bg-[#F6F8F7] transition-colors cursor-pointer"
                >
                  {periodLabel}
                  <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
                </button>

                {isMonthPickerOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-10 z-50 w-72 bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {chartView === "tahun" ? (
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F1] mb-3">
                          <button
                            type="button"
                            onClick={() => setYear((y) => y - 5)}
                            className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                          >
                            <LuChevronLeft size={16} />
                          </button>
                          <span className="text-sm font-bold text-[#14201A] font-jakarta">Pilih Tahun</span>
                          <button
                            type="button"
                            onClick={() => setYear((y) => y + 5)}
                            className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                          >
                            <LuChevronRight size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[year - 2, year - 1, year, year + 1, year + 2, year + 3].map((yr) => {
                            const isSelected = yr === year;
                            return (
                              <button
                                key={yr}
                                type="button"
                                onClick={() => {
                                  setYear(yr);
                                  setIsMonthPickerOpen(false);
                                }}
                                className={`py-2 px-1 text-xs rounded-lg font-medium transition cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-[#1F6B3F] text-white font-semibold"
                                    : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                                }`}
                              >
                                {yr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F1] mb-3">
                          <button
                            type="button"
                            onClick={() => setYear((y) => y - 1)}
                            className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                          >
                            <LuChevronLeft size={16} />
                          </button>
                          <span className="text-sm font-bold text-[#14201A] font-jakarta">{year}</span>
                          <button
                            type="button"
                            onClick={() => setYear((y) => y + 1)}
                            className="p-1.5 rounded-lg border border-[#DDE2DF] hover:bg-gray-50 text-[#3F4B44] cursor-pointer"
                          >
                            <LuChevronRight size={16} />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {MONTHS.map((mName, idx) => {
                            const isSelected = month === idx;
                            return (
                              <button
                                key={mName}
                                type="button"
                                onClick={() => {
                                  setMonth(idx);
                                  setIsMonthPickerOpen(false);
                                }}
                                className={`py-2 px-1 text-xs rounded-lg font-medium transition cursor-pointer text-center ${
                                  isSelected
                                    ? "bg-[#1F6B3F] text-white font-semibold"
                                    : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                                }`}
                              >
                                {mName.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={nextPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF]
                  bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44] cursor-pointer"
                title={chartView === "tahun" ? "Tahun berikutnya" : "Bulan berikutnya"}
              >
                <LuChevronRight size={18} strokeWidth={2} />
              </button>

              {/* Period Mode Button (Bulan / Tahun) */}
              <div className="relative" ref={periodFilterRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPeriodFilterOpen(!isPeriodFilterOpen);
                    setIsMonthPickerOpen(false);
                  }}
                  className="h-8 px-3.5 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-white text-xs sm:text-sm font-medium text-[#14201A] hover:bg-[#F6F8F7] transition cursor-pointer"
                >
                  <span className="capitalize">{chartView === "bulan" ? "Bulan" : "Tahun"}</span>
                  <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
                </button>

                {isPeriodFilterOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-10 z-50 w-28 bg-white rounded-xl border border-[#DDE2DF] shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setChartView("bulan");
                        setIsPeriodFilterOpen(false);
                      }}
                      className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        chartView === "bulan"
                          ? "bg-[#1F6B3F] text-white font-semibold"
                          : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                      }`}
                    >
                      Bulan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChartView("tahun");
                        setIsPeriodFilterOpen(false);
                      }}
                      className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        chartView === "tahun"
                          ? "bg-[#1F6B3F] text-white font-semibold"
                          : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                      }`}
                    >
                      Tahun
                    </button>
                  </div>
                )}
              </div>

            </div>
            <p className="inline-block rounded-md bg-white px-2 py-1 text-xs text-[#5B6B61]">
              Terakhir diperbarui hari ini, {lastUpdated}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={LuTrash2}
              label="Sampah Terkumpul"
              value={fmtKg(sampahTerkumpul)}
              sub={`Akumulasi ${periodLabel} · Berat sampah yang terkumpul`}
            />
            <StatCard
              icon={LuRecycle}
              label="Sampah Terolah"
              value={fmtKg(sampahTerolah)}
              sub={`Akumulasi ${periodLabel} · Berat sampah yang telah diolah`}
            />
            <StatCard
              icon={LuPackage}
              label="Hasil Olahan"
              value={fmtKg(hasilOlahan)}
              sub={`Akumulasi ${periodLabel} · Hasil olahan yang dihasilkan`}
            />
            <StatCard
              icon={LuWallet}
              label="Nilai Sampah"
              value={fmtRp(nilaiSampah)}
              sub={`Akumulasi ${periodLabel} · Nilai sampah yang telah tercatat`}
            />
          </div>
        </div>

        {/* ── Grafik Perkembangan Sampah (Sesuai Desain Figma) ── */}
        <Card className="p-6 relative select-none" ref={chartCardRef}>
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#14201A] font-jakarta">
              Grafik Perkembangan Sampah
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
              {chartView === "tahun"
                ? `Ringkasan ${year}`
                : `Ringkasan ${periodLabel} · akumulasi data per bulan`}
            </p>
          </div>

          {/* Top Row: Y-axis Label & Legends */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-3">
            <span className="text-xs font-medium text-[#5B6B61]">
              Berat sampah (kg)
            </span>

            {/* Legends */}
            <div className="flex items-center gap-5 text-xs text-[#5B6B61]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1F6B3F]"></span>
                <span>Terkumpul</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#5F9C78]"></span>
                <span>Terolah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#A3C2B0]"></span>
                <span>Hasil olahan</span>
              </div>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
            <div className="h-80 relative cursor-pointer min-w-[620px] md:min-w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: -15, bottom: 0 }}
                  barGap={4}
                  onMouseMove={(state) => {
                    if (pinnedData) return;
                    if (state && state.activeTooltipIndex !== undefined && chartData[state.activeTooltipIndex]) {
                      handleBarHover(chartData[state.activeTooltipIndex]);
                    } else if (state && state.activePayload && state.activePayload.length > 0) {
                      handleBarHover(state.activePayload[0].payload);
                    }
                  }}
                  onMouseLeave={handleBarLeave}
                  onClick={(state) => {
                    if (state && state.activeTooltipIndex !== undefined && chartData[state.activeTooltipIndex]) {
                      handleBarClick(chartData[state.activeTooltipIndex]);
                    } else if (state && state.activePayload && state.activePayload.length > 0) {
                      handleBarClick(state.activePayload[0].payload);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF1EE" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#EDF1EE" }}
                    tick={{ fill: "#5B6B61", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#8E9B93", fontSize: 11 }}
                    domain={[0, yDomainMax]}
                    ticks={yTicks}
                  />
                  <Bar
                    dataKey="sampah_terkumpul"
                    name="Terkumpul"
                    fill="#1F6B3F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    className="cursor-pointer transition-opacity hover:opacity-85"
                    onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                    onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                  />
                  <Bar
                    dataKey="sampah_terolah"
                    name="Terolah"
                    fill="#5F9C78"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    className="cursor-pointer transition-opacity hover:opacity-85"
                    onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                    onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                  />
                  <Bar
                    dataKey="hasil_olahan"
                    name="Hasil olahan"
                    fill="#A3C2B0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                    className="cursor-pointer transition-opacity hover:opacity-85"
                    onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                    onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                  />
                  {comparePrev && (
                    <Bar
                      dataKey="sampah_terkumpul_prev"
                      name={`Terkumpul ${compareYear}`}
                      fill="#B2D9C0"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── POP UP DI DEPAN GRAFIK (MUNCUL SAAT HOVER ATAU DIKLIK) ── */}
          {activeChartPopup && (
            <div
              ref={chartPopupRef}
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-5 sm:p-6 w-[92%] sm:w-auto min-w-[280px] sm:min-w-[460px] max-w-[calc(100vw-32px)] transition-all animate-in fade-in zoom-in-95 duration-150 ${
                pinnedData ? "pointer-events-auto ring-1 ring-black/5" : "pointer-events-none"
              }`}
            >
              {/* Header of Popup */}
              <div className="flex items-start justify-between pb-3 border-b border-[#F0F2F1]">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#14201A] font-jakarta">
                    {activeChartPopup.title || "Ringkasan pengelolaan sampah"}
                  </h4>
                  <p className="text-xs text-[#5B6B61] mt-0.5">
                    {activeChartPopup.period}
                  </p>
                </div>
                {pinnedData && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedData(null);
                    }}
                    className="text-[#5B6B61] hover:text-[#14201A] hover:bg-gray-100 p-1 rounded-lg transition-colors cursor-pointer -mr-1 -mt-1"
                    title="Tutup ringkasan"
                    aria-label="Tutup ringkasan"
                  >
                    <LuX size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* 3 Columns Divided by Vertical Borders */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center divide-x divide-[#F0F2F1]">
                <div className="px-2">
                  <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Setoran tercatat</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#14201A] font-jakarta">
                    {activeChartPopup.setoran} setoran
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Warga berpartisipasi</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#14201A] font-jakarta">
                    {activeChartPopup.warga} warga
                  </p>
                </div>
                <div className="px-2">
                  <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Hasil olahan</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#14201A] font-jakarta">
                    {activeChartPopup.hasilOlahan}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Note under chart */}
          <div className="flex items-start gap-2 pt-4 mt-2 border-t border-[#EDF1EE] text-xs text-[#5B6B61]">
            <span className="flex items-center gap-1.5 font-medium text-[#1F6B3F] shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full border-2 border-[#1F6B3F]"></span>
              Informasi
            </span>
            <span className="text-[#5B6B61] leading-relaxed text-[11px]">
              Data grafik diperbarui otomatis berdasarkan rekap operasional dan transaksi Bank Sampah Dusun Sumberarum.
            </span>
          </div>
        </Card>

      </div>
    </div>
  );
}
