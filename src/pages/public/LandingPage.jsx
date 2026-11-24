import { useState, useRef, useEffect } from "react";
import {
  getPublicStatusOperasional,
  getStatusOperasional,
  parseStatusOperasional,
} from "../../services/statusOperasionalService";
import { getPublicDashboard } from "../../services/publicService";
import {
  LuTrash2,
  LuRecycle,
  LuPackage,
  LuWallet,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuTruck,
  LuScale,
  LuImage,
  LuX,
  LuMenu,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ─── MONTH LABELS ────────────────────────────────────────── */
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default function LandingPage() {
  // Navigation active tab
  const [activeNav, setActiveNav] = useState("beranda");

  // Status operasional bank sampah (buka / tutup)
  const [statusOperasional, setStatusOperasional] = useState(() => {
    const cached = localStorage.getItem("status_operasional");
    return cached === "tutup" ? "tutup" : "buka";
  });

  useEffect(() => {
    async function fetchStatus() {
      try {
        let res = null;
        try {
          res = await getPublicStatusOperasional();
        } catch {
          res = await getStatusOperasional();
        }
        const parsed = parseStatusOperasional(res);
        if (parsed) {
          setStatusOperasional(parsed);
          localStorage.setItem("status_operasional", parsed);
        }
      } catch (e) {
        console.warn("Gagal memuat status operasional publik:", e);
      }
    }
    fetchStatus();

    function onStatusChange(e) {
      if (e.detail && (e.detail === "buka" || e.detail === "tutup")) {
        setStatusOperasional(e.detail);
      }
    }
    window.addEventListener("statusOperasionalChanged", onStatusChange);
    return () => window.removeEventListener("statusOperasionalChanged", onStatusChange);
  }, []);

  // Filter mode: "bulan" | "tahun"
  const now = new Date();
  const [filterMode, setFilterMode] = useState("bulan");
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  // Dashboard API state
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingDashboard(true);

    async function fetchDashboard() {
      try {
        const res = await getPublicDashboard({
          bulan: selectedMonth + 1,
          tahun: selectedYear,
          mode_grafik: filterMode, // Selalu ambil 12 bulan (Januari - Desember) pada tahun yang dipilih
        });
        if (isMounted && res) {
          setDashboardData(res);
        }
      } catch (err) {
        console.warn("Gagal memuat data public dashboard:", err);
      } finally {
        if (isMounted) setLoadingDashboard(false);
      }
    }

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear, filterMode]);

  // Popups visibility state
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Chart popup state:
  // - hoveredData: active only while mouse is hovering over a bar/chart item
  // - pinnedData: locked when clicked, stays until clicked outside
  const [hoveredData, setHoveredData] = useState(null);
  const [pinnedData, setPinnedData] = useState(null);

  // Refs for click outside detection
  const monthPickerRef = useRef(null);
  const periodFilterRef = useRef(null);
  const chartCardRef = useRef(null);
  const chartPopupRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Click outside listener:
  // Closes month picker, period mode dropdown, mobile menu, and pinned chart popup when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setIsMonthPickerOpen(false);
      }
      if (periodFilterRef.current && !periodFilterRef.current.contains(e.target)) {
        setIsPeriodFilterOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
      // If pinned popup is open, close it when clicking anywhere outside the chart card
      if (chartCardRef.current && !chartCardRef.current.contains(e.target)) {
        setPinnedData(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Smooth scroll handler
  const scrollToSection = (id, navName) => {
    setActiveNav(navName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Active chart popup (pinned takes priority, else hovered)
  const activeChartPopup = pinnedData || hoveredData;

  // Hero stats from API
  const heroData = dashboardData?.hero || {};
  const heroPercent = Number(heroData.persentase_sampah_diolah ?? 0);
  const heroBeratTerkumpul = Number(heroData.berat_terkumpul ?? 0);
  const heroBeratTerolah = Number(heroData.berat_terolah ?? 0);

  const periodButtonLabel =
    filterMode === "bulan"
      ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
      : `${selectedYear}`;

  // Chart dataset based on filter mode (Januari - Desember)
  const rawChartData = dashboardData?.grafik_perkembangan?.data;
  const chartData =
    rawChartData && rawChartData.length > 0
      ? rawChartData.map((item, idx) => {
          const monthIndex = item.bulan ? item.bulan - 1 : idx;
          const terkumpul = Number(item.sampah_terkumpul ?? 0);
          const terolah = Number(item.sampah_terolah ?? 0);
          const hasilOlahan = Number(item.hasil_olahan ?? 0);

          return {
            ...item,
            name:
              item.label ||
              (filterMode === "bulan"
                ? MONTH_SHORT[monthIndex]
                : String(item.tahun)),
            monthIdx: monthIndex,
            terkumpul,
            terolah,
            hasilOlahan,
            setoran:
              item.jumlah_setoran ??
              (terkumpul > 0 ? Math.max(1, Math.round(terkumpul * 0.86)) : 0),
            warga:
              item.jumlah_warga ??
              (terkumpul > 0 ? Math.max(1, Math.round(terkumpul * 0.54)) : 0),
            kompos: `${hasilOlahan} kg kompos`,
          };
        })
      : MONTH_SHORT.map((mShort, idx) => ({
          name: mShort,
          monthIdx: idx,
          terkumpul: 0,
          terolah: 0,
          hasilOlahan: 0,
          setoran: 0,
          warga: 0,
          kompos: "0 kg kompos",
        }));

  // Selected period data
  const ringkasan = dashboardData?.ringkasan_periode || {};

  // Jika mode tahun, ambil data akumulasi dari Januari sampai Desember tahun tersebut
  const totalTerkumpulTahun = chartData.reduce(
    (sum, d) => sum + (Number(d.terkumpul) || 0),
    0
  );
  const totalTerolahTahun = chartData.reduce(
    (sum, d) => sum + (Number(d.terolah) || 0),
    0
  );
  const totalHasilOlahanTahun = chartData.reduce(
    (sum, d) => sum + (Number(d.hasilOlahan) || 0),
    0
  );

  const statTerkumpul =
    filterMode === "tahun"
      ? totalTerkumpulTahun
      : Number(ringkasan.sampah_terkumpul?.berat ?? 0);

  const statTerolah =
    filterMode === "tahun"
      ? totalTerolahTahun
      : Number(ringkasan.sampah_terolah?.berat ?? 0);

  const statHasilOlahan =
    filterMode === "tahun"
      ? totalHasilOlahanTahun
      : Number(ringkasan.hasil_olahan?.berat ?? 0);

  const statNilaiSampah = Number(ringkasan.nilai_sampah ?? 0);

  const rawMax = chartData.length
    ? Math.max(
        ...chartData.map((d) =>
          Math.max(
            Number(d.terkumpul ?? 0),
            Number(d.terolah ?? 0),
            Number(d.hasilOlahan ?? 0)
          )
        )
      )
    : 0;
  const yDomainMax = rawMax > 0 ? Math.ceil(rawMax) : 50;
  const yStep = Math.ceil(yDomainMax / 3 / 10) * 10 || 100;
  const yTicks = [0, yStep, yStep * 2, yDomainMax];

  // Chart hover interaction (only active if not pinned)
  const handleBarHover = (entry) => {
    if (!pinnedData && entry) {
      const monthIndex = entry.monthIdx ?? (filterMode === "bulan" ? selectedMonth : null);
      setHoveredData({
        title: "Ringkasan pengelolaan sampah",
        period: filterMode === "bulan"
          ? `Perkembangan bulan ${MONTH_NAMES[monthIndex]} ${selectedYear}`
          : `Perkembangan tahun ${entry.name}`,
        setoran: entry.setoran,
        warga: entry.warga,
        kompos: `${entry.kompos} kg kompos`,
      });
    }
  };

  // Leave chart area -> hide hover popup immediately
  const handleBarLeave = () => {
    if (!pinnedData) {
      setHoveredData(null);
    }
  };

  // Chart bar click/press interaction -> locks (pins) the popup
  const handleBarClick = (entry) => {
    if (!entry) return;
    const monthIndex = entry.monthIdx ?? (filterMode === "bulan" ? selectedMonth : null);
    const targetPeriod = filterMode === "bulan"
      ? `Perkembangan bulan ${MONTH_NAMES[monthIndex]} ${selectedYear}`
      : `Perkembangan tahun ${entry.name}`;

    if (pinnedData && pinnedData.period === targetPeriod) {
      setPinnedData(null); // Click again to dismiss
    } else {
      setPinnedData({
        title: "Ringkasan pengelolaan sampah",
        period: targetPeriod,
        setoran: entry.setoran,
        warga: entry.warga,
        kompos: `${entry.kompos} kg kompos`,
      });
    }
  };

  // Period navigation (< and >)
  const handlePrevPeriod = () => {
    if (filterMode === "bulan") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((y) => y - 1);
      } else {
        setSelectedMonth((m) => m - 1);
      }
    } else {
      setSelectedYear((y) => y - 1);
    }
  };

  const handleNextPeriod = () => {
    if (filterMode === "bulan") {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear((y) => y + 1);
      } else {
        setSelectedMonth((m) => m + 1);
      }
    } else {
      setSelectedYear((y) => y + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF6] font-jakarta text-[#3F4B44] flex flex-col">
      {/* ─── SECTION 1: HEADER / NAVBAR (BG: WHITE) ──────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#DDE2DF]">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-1 cursor-pointer select-none"
            onClick={() => scrollToSection("beranda", "beranda")}
          >
            <span className="text-xl font-bold tracking-tight text-[#14201A]">
              Sumber<span className="text-[#1F6B3F]">Arum</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("beranda", "beranda")}
              className={`text-sm transition-colors relative py-1 cursor-pointer ${
                activeNav === "beranda"
                  ? "text-[#1F6B3F] font-semibold border-b-2 border-[#1F6B3F]"
                  : "text-[#5B6B61] hover:text-[#1F6B3F]"
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection("perkembangan", "perkembangan")}
              className={`text-sm transition-colors relative py-1 cursor-pointer ${
                activeNav === "perkembangan"
                  ? "text-[#1F6B3F] font-semibold border-b-2 border-[#1F6B3F]"
                  : "text-[#5B6B61] hover:text-[#1F6B3F]"
              }`}
            >
              Perkembangan
            </button>
            <button
              onClick={() => scrollToSection("transparansi", "transparansi")}
              className={`text-sm transition-colors relative py-1 cursor-pointer ${
                activeNav === "transparansi"
                  ? "text-[#1F6B3F] font-semibold border-b-2 border-[#1F6B3F]"
                  : "text-[#5B6B61] hover:text-[#1F6B3F]"
              }`}
            >
              Transparansi
            </button>
          </nav>

          {/* Mobile Menu Button & Dropdown */}
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="p-2 rounded-xl text-[#3F4B44] hover:bg-[#F4FAF6] border border-[#DDE2DF] transition-colors cursor-pointer"
              aria-label="Menu navigasi"
            >
              {isMobileMenuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
            </button>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-2xl border border-[#DDE2DF] shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    scrollToSection("beranda", "beranda");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeNav === "beranda"
                      ? "bg-[#E3F1E8] text-[#1F6B3F] font-semibold"
                      : "text-[#3F4B44] hover:bg-[#F6F8F7]"
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={() => {
                    scrollToSection("perkembangan", "perkembangan");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeNav === "perkembangan"
                      ? "bg-[#E3F1E8] text-[#1F6B3F] font-semibold"
                      : "text-[#3F4B44] hover:bg-[#F6F8F7]"
                  }`}
                >
                  Perkembangan
                </button>
                <button
                  onClick={() => {
                    scrollToSection("transparansi", "transparansi");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    activeNav === "transparansi"
                      ? "bg-[#E3F1E8] text-[#1F6B3F] font-semibold"
                      : "text-[#3F4B44] hover:bg-[#F6F8F7]"
                  }`}
                >
                  Transparansi
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── SECTION 2: HERO SECTION (BG: SOFT GREEN #F4FAF6) ── */}
      <section id="beranda" className="w-full bg-[#F4FAF6] border-b border-[#E3EDE7] py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-widest text-[#5F9C78] uppercase">
                — Dusun Sumberarum
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  statusOperasional === "buka"
                    ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusOperasional === "buka" ? "bg-[#16A34A] animate-pulse" : "bg-red-500"
                  }`}
                />
                {statusOperasional === "buka" ? "Layanan Buka" : "Layanan Tutup"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#14201A] leading-[1.2] tracking-tight">
              Dampak pengelolaan sampah<br />dusun, dipantau langsung .
            </h1>

            <p className="text-[#5B6B61] text-sm sm:text-base max-w-2xl leading-relaxed">
              Lihat perkembangan sampah yang terkumpul, proses pengolahan, dan hasilnya dalam satu tempat.
              Informasi yang terbuka untuk lingkungan yang lebih terjaga.
            </p>

            
          </div>

          {/* Right Card: Persentase Sampah Diolah Bulan Ini */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-sm flex flex-col items-center text-center">
              <h2 className="text-xs font-bold text-[#14201A] mb-5 tracking-tight">
                Persentase Sampah Diolah Bulan Ini
              </h2>

              {/* Donut Chart (SVG) */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    className="stroke-[#E3F1E8]"
                    strokeWidth="15"
                    fill="transparent"
                  />
                  {/* Foreground Ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    className="stroke-[#1F6B3F]"
                    strokeWidth="15"
                    strokeDasharray={339.29}
                    strokeDashoffset={339.29 * (1 - Math.min(100, Math.max(0, heroPercent)) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Inner Percentage */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-[#14201A] leading-none">{heroPercent}%</span>
                  <span className="text-[10px] text-[#5B6B61] mt-1 font-medium">Sampah Diolah</span>
                </div>
              </div>

              {/* Donut Legends */}
              <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-[#5B6B61]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-[#1F6B3F]"></span>
                  <span>Sampah Diolah {heroPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-[#E3F1E8]"></span>
                  <span>Belum Diolah {Math.max(0, 100 - heroPercent)}%</span>
                </div>
              </div>

              {/* Note */}
              <p className="text-[10px] text-[#8E9B93] mt-2.5">
                {heroPercent}% dari {heroBeratTerkumpul.toLocaleString("id-ID")} kg sampah telah diolah
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: RINGKASAN PERIODE & GRAFIK (BG: WHITE) ─ */}
      <section id="perkembangan" className="w-full bg-white border-b border-[#E3EDE7] py-14">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          {/* Header & Subtitle */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#14201A] tracking-tight">
              Ringkasan Periode
            </h2>
            <p className="text-xs text-[#5B6B61] mt-0.5">
              {filterMode === "tahun"
                ? `Ringkasan ${selectedYear}`
                : `Ringkasan ${periodButtonLabel} · akumulasi data per bulan`}
            </p>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1 relative z-30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-[#3F4B44] mr-1">
                Menampilkan data periode
              </span>

              {/* Prev Button */}
              <button
                onClick={handlePrevPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-white text-[#3F4B44] hover:bg-[#F6F8F7] transition cursor-pointer"
                aria-label="Periode sebelumnya"
              >
                <LuChevronLeft size={15} />
              </button>

              {/* ── BUTTON 1: Month/Year Picker (GAMBAR 1) ── */}
              <div className="relative" ref={monthPickerRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthPickerOpen(!isMonthPickerOpen);
                    setIsPeriodFilterOpen(false);
                  }}
                  className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#DDE2DF] bg-white text-xs font-semibold text-[#14201A] hover:bg-[#F6F8F7] transition cursor-pointer"
                >
                  <span>{periodButtonLabel}</span>
                  <LuChevronDown size={14} className="text-[#5B6B61]" />
                </button>

                {/* ── POP UP 1: Pemilih Bulan atau Tahun ── */}
                {isMonthPickerOpen && (
                  filterMode === "tahun" ? (
                    /* ── POP UP KETIKA MODE TAHUN: HANYA MENAMPILKAN PILIHAN TAHUN ── */
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-10 z-50 w-64 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F0F2F1]">
                        <button
                          type="button"
                          onClick={() => setSelectedYear((y) => y - 3)}
                          className="p-1 rounded-md text-[#5B6B61] hover:text-[#1F6B3F] hover:bg-[#F4FAF6] cursor-pointer"
                          title="Tahun sebelumnya"
                        >
                          <LuChevronLeft size={14} />
                        </button>
                        <span className="font-bold text-[#14201A] text-xs">
                          Pilih Tahun
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedYear((y) => y + 3)}
                          className="p-1 rounded-md text-[#5B6B61] hover:text-[#1F6B3F] hover:bg-[#F4FAF6] cursor-pointer"
                          title="Tahun berikutnya"
                        >
                          <LuChevronRight size={14} />
                        </button>
                      </div>

                      {/* Years Grid */}
                      <div className="grid grid-cols-3 gap-2 py-1">
                        {[
                          selectedYear - 2,
                          selectedYear - 1,
                          selectedYear,
                          selectedYear + 1,
                          selectedYear + 2,
                          selectedYear + 3,
                        ].map((yr) => {
                          const isSelected = selectedYear === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                setSelectedYear(yr);
                                setIsMonthPickerOpen(false);
                              }}
                              className={`py-2 text-xs font-medium rounded-lg transition text-center cursor-pointer ${
                                isSelected
                                  ? "bg-[#1F6B3F] text-white font-semibold shadow-xs"
                                  : "text-[#14201A] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                              }`}
                            >
                              {yr}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F0F2F1]">
                        <span className="text-xs font-semibold text-[#1F6B3F]">
                          Tahun
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsMonthPickerOpen(false)}
                          className="px-3 py-1 text-xs font-medium text-[#3F4B44] border border-[#DDE2DF] rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── POP UP KETIKA MODE BULAN: PEMILIH BULAN ── */
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 top-10 z-50 w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Header: Prev Year, Year Title, Next Year */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F0F2F1]">
                        <button
                          type="button"
                          onClick={() => setSelectedYear((y) => y - 1)}
                          className="p-1 rounded-md text-[#5B6B61] hover:text-[#1F6B3F] hover:bg-[#F4FAF6] cursor-pointer"
                        >
                          <LuChevronLeft size={14} />
                        </button>
                        <span className="font-bold text-[#14201A] text-xs">
                          {selectedYear}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedYear((y) => y + 1)}
                          className="p-1 rounded-md text-[#5B6B61] hover:text-[#1F6B3F] hover:bg-[#F4FAF6] cursor-pointer"
                        >
                          <LuChevronRight size={14} />
                        </button>
                      </div>

                      {/* Months Grid (3 columns x 4 rows) */}
                      <div className="grid grid-cols-3 gap-2 py-1">
                        {MONTH_SHORT.map((mShort, idx) => {
                          const isSelected = selectedMonth === idx;
                          const hasData = Boolean(
                            chartData.find(
                              (d) =>
                                d.monthIdx === idx &&
                                (d.terkumpul > 0 || d.terolah > 0)
                            )
                          );

                          return (
                            <button
                              key={mShort}
                              type="button"
                              onClick={() => {
                                setSelectedMonth(idx);
                                setIsMonthPickerOpen(false);
                              }}
                              className={`py-2 text-xs font-medium rounded-lg transition text-center cursor-pointer ${
                                isSelected
                                  ? "bg-[#1F6B3F] text-white font-semibold shadow-xs"
                                  : hasData
                                  ? "text-[#14201A] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                                  : "text-[#A0ABA5] hover:bg-gray-50"
                              }`}
                            >
                              {mShort}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend: Ada data / Tidak ada data */}
                      <div className="flex items-center gap-3 pt-3 mt-2 border-t border-[#F0F2F1] text-[11px] text-[#5B6B61]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B3F]"></span>
                          Ada data
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DDE2DF]"></span>
                          Tidak ada data
                        </span>
                      </div>

                      {/* Footer Actions: Bulan & Tutup */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F0F2F1]">
                        <span className="text-xs font-semibold text-[#1F6B3F]">
                          Bulan
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsMonthPickerOpen(false)}
                          className="px-3 py-1 text-xs font-medium text-[#3F4B44] border border-[#DDE2DF] rounded-lg bg-white hover:bg-gray-50 transition cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPeriod}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-white text-[#3F4B44] hover:bg-[#F6F8F7] transition cursor-pointer"
                aria-label="Periode berikutnya"
              >
                <LuChevronRight size={15} />
              </button>

              {/* ── BUTTON 2: Period Mode Dropdown Trigger (GAMBAR 2) ── */}
              <div className="relative" ref={periodFilterRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPeriodFilterOpen(!isPeriodFilterOpen);
                    setIsMonthPickerOpen(false);
                  }}
                  className="h-8 px-4 flex items-center justify-center rounded-lg border border-[#DDE2DF] bg-white text-xs font-semibold text-[#14201A] hover:bg-[#F6F8F7] transition cursor-pointer"
                >
                  <span className="capitalize">{filterMode === "bulan" ? "Bulan" : "Tahun"}</span>
                </button>

                {/* ── POP UP 2: Filtering Periode Bulan & Tahun (GAMBAR 2) ── */}
                {isPeriodFilterOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-10 z-50 w-28 bg-white rounded-xl border border-[#DDE2DF] shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      onClick={() => {
                        setFilterMode("tahun");
                        setIsPeriodFilterOpen(false);
                      }}
                      className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        filterMode === "tahun"
                          ? "bg-[#1F6B3F] text-white font-semibold"
                          : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                      }`}
                    >
                      Tahun
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode("bulan");
                        setIsPeriodFilterOpen(false);
                      }}
                      className={`w-full text-center py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        filterMode === "bulan"
                          ? "bg-[#1F6B3F] text-white font-semibold"
                          : "text-[#3F4B44] hover:bg-[#E3F1E8] hover:text-[#1F6B3F]"
                      }`}
                    >
                      Bulan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Timestamp */}
            <div className="text-[11px] text-[#5B6B61] self-center">
              Terakhir diperbarui hari ini 09:41
            </div>
          </div>

          {/* ── 4 STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
            {/* Card 1: Sampah Terkumpul */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#5B6B61]">Sampah Terkumpul</span>
                <div className="w-8 h-8 rounded-lg bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuTrash2 size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-[#14201A]">
                  {statTerkumpul.toLocaleString("id-ID")} kg
                </div>
                <div className="text-[11px] text-[#8E9B93] mt-1 leading-tight">
                  Akumulasi {periodButtonLabel}<br />Berat sampah yang terkumpul
                </div>
              </div>
            </div>

            {/* Card 2: Sampah Terolah */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#5B6B61]">Sampah Terolah</span>
                <div className="w-8 h-8 rounded-lg bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuRecycle size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-[#14201A]">
                  {statTerolah.toLocaleString("id-ID")} kg
                </div>
                <div className="text-[11px] text-[#8E9B93] mt-1 leading-tight">
                  Akumulasi {periodButtonLabel}<br />Berat sampah yang telah diolah
                </div>
              </div>
            </div>

            {/* Card 3: Hasil Olahan */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#5B6B61]">Hasil Olahan</span>
                <div className="w-8 h-8 rounded-lg bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuPackage size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-[#14201A]">
                  {statHasilOlahan.toLocaleString("id-ID")} kg
                </div>
                <div className="text-[11px] text-[#8E9B93] mt-1 leading-tight">
                  Akumulasi {periodButtonLabel}<br />Hasil olahan yang dihasilkan
                </div>
              </div>
            </div>

            {/* Card 4: Nilai Sampah */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#5B6B61]">Nilai Sampah</span>
                <div className="w-8 h-8 rounded-lg bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuWallet size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-extrabold text-[#14201A]">
                  Rp {statNilaiSampah.toLocaleString("id-ID")}
                </div>
                <div className="text-[11px] text-[#8E9B93] mt-1 leading-tight">
                  Akumulasi {periodButtonLabel}<br />Nilai sampah yang telah tercatat
                </div>
              </div>
            </div>
          </div>

          {/* ── GRAFIK PERKEMBANGAN & POP UP DETAIL DI DEPAN GRAFIK ── */}
          <div
            ref={chartCardRef}
            className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-xs relative select-none"
          >
            {/* Top Row: Y-axis Label & Legends */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#5B6B61]">
                  Berat sampah (kg)
                </span>
                {filterMode === "bulan" && (
                  <span className="text-[11px] text-[#8E9B93] md:hidden">
                    (Geser untuk bulan lain →)
                  </span>
                )}
              </div>

              {/* Legends */}
              <div className="flex items-center gap-5 text-xs text-[#5B6B61]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-2xs bg-[#1F6B3F]"></span>
                  <span>Terkumpul</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-2xs bg-[#5F9C78]"></span>
                  <span>Terolah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-2xs bg-[#A3C2B0]"></span>
                  <span>Hasil olahan</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart Container (Scrollable on mobile) */}
            <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
              <div
                className={`h-80 relative cursor-pointer ${
                  filterMode === "bulan" ? "min-w-[680px] md:min-w-full" : "w-full"
                }`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                    barGap={4}
                    onMouseMove={(state) => {
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
                    <CartesianGrid vertical={false} stroke="#DDE2DF" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: "#DDE2DF" }}
                      tick={{ fill: "#5B6B61", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#5B6B61", fontSize: 11 }}
                      domain={[0, yDomainMax]}
                      ticks={yTicks}
                    />

                    {/* 3 Bars per group with direct click & hover handlers */}
                    <Bar
                      dataKey="terkumpul"
                      fill="#1F6B3F"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                      onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                      onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                    />
                    <Bar
                      dataKey="terolah"
                      fill="#5F9C78"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                      onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                      onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                    />
                    <Bar
                      dataKey="hasilOlahan"
                      fill="#A3C2B0"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                      onClick={(data, index) => handleBarClick(data?.payload || chartData[index])}
                      onMouseEnter={(data, index) => handleBarHover(data?.payload || chartData[index])}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── POP UP DI DEPAN GRAFIK (MUNCUL SAAT HOVER ATAU DIKLIK) ── */}
            {activeChartPopup && (
              <div
                ref={chartPopupRef}
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-2xl border border-[#DDE2DF] shadow-2xl p-4 sm:p-6 w-[92%] sm:w-auto min-w-[280px] sm:min-w-[440px] max-w-[calc(100vw-32px)] animate-in fade-in zoom-in-95 duration-150 ${
                  pinnedData ? "pointer-events-auto" : "pointer-events-none"
                }`}
              >
                  {/* Header of Popup */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#F0F2F1]">
                    <div>
                      <h4 className="text-sm font-bold text-[#14201A]">
                        {activeChartPopup.title}
                      </h4>
                      <p className="text-xs text-[#5B6B61] mt-0.5">
                        {activeChartPopup.period}
                      </p>
                    </div>
                    {pinnedData && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPinnedData(null);
                        }}
                        className="text-[#8E9B93] hover:text-[#14201A] p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
                        title="Tutup ringkasan"
                      >
                        <LuX size={15} />
                      </button>
                    )}
                  </div>

                  {/* 3 Columns Divided by Vertical Borders */}
                  <div className="grid grid-cols-3 gap-2 pt-4 text-center divide-x divide-[#F0F2F1]">
                    <div className="px-2">
                      <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Setoran tercatat</p>
                      <p className="text-base sm:text-lg font-extrabold text-[#14201A]">
                        {activeChartPopup.setoran} setoran
                      </p>
                    </div>
                    <div className="px-2">
                      <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Warga berpartisipasi</p>
                      <p className="text-base sm:text-lg font-extrabold text-[#14201A]">
                        {activeChartPopup.warga} warga
                      </p>
                    </div>
                    <div className="px-2">
                      <p className="text-[11px] text-[#5B6B61] mb-1 font-medium">Hasil olahan</p>
                      <p className="text-base sm:text-lg font-extrabold text-[#14201A]">
                        {activeChartPopup.kompos}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Note / Disclaimer under chart */}
            <div className="flex items-start gap-2 pt-4 mt-2 border-t border-[#EDF1EE] text-xs text-[#5B6B61]">
              <span className="flex items-center gap-1.5 font-medium text-[#1F6B3F] shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full border-2 border-[#1F6B3F]"></span>
                Informasi
              </span>
              <span className="text-[#5B6B61] leading-relaxed text-[11px]">
                Data grafik diperbarui otomatis berdasarkan rekap operasional dan transaksi Bank Sampah Dusun Sumberarum.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: BAGAIMANA SAMPAH DIPROSES? (BG: SOFT GREEN #F4FAF6) ── */}
      <section id="transparansi" className="w-full bg-[#F4FAF6] border-b border-[#E3EDE7] py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14201A] tracking-tight">
              Bagaimana Sampah Diproses?
            </h2>
            <p className="text-xs text-[#5B6B61] mt-0.5">
              Empat langkah sederhana, dari setoran warga hingga kembali memberi manfaat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuTruck size={18} />
                </div>
                <span className="text-xs font-bold text-[#8E9B93]">01</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14201A] mb-1.5">
                  Dikumpulkan
                </h3>
                <p className="text-xs text-[#5B6B61] leading-relaxed">
                  Warga menyetorkan sampah kepada petugas pengumpulan sampah.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuScale size={18} />
                </div>
                <span className="text-xs font-bold text-[#8E9B93]">02</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14201A] mb-1.5">
                  Dipilah dan Ditimbang
                </h3>
                <p className="text-xs text-[#5B6B61] leading-relaxed">
                  Petugas memilah jenis sampah, menimbang, lalu mencatat setoran.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuRecycle size={18} />
                </div>
                <span className="text-xs font-bold text-[#8E9B93]">03</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14201A] mb-1.5">
                  Diolah
                </h3>
                <p className="text-xs text-[#5B6B61] leading-relaxed">
                  Sampah diproses sesuai jenisnya menjadi bahan yang bermanfaat.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] p-6 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                  <LuPackage size={18} />
                </div>
                <span className="text-xs font-bold text-[#8E9B93]">04</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#14201A] mb-1.5">
                  Jadi Produk
                </h3>
                <p className="text-xs text-[#5B6B61] leading-relaxed">
                  Hasil olahan menjadi kompos atau produk daur ulang yang bernilai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: DOKUMENTASI KEGIATAN (BG: WHITE) ─────── */}
      <section className="w-full bg-white border-b border-[#E3EDE7] py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14201A] tracking-tight">
              Dokumentasi Kegiatan
            </h2>
            <p className="text-xs text-[#5B6B61] mt-0.5">
              Ruang dokumentasi aktivitas bank sampah bersama warga Dusun Sumberarum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Foto 1 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] overflow-hidden shadow-xs flex flex-col">
              <div className="h-44 bg-[#F8FAF9] flex flex-col items-center justify-center text-[#8E9B93] border-b border-[#DDE2DF]">
                <LuImage size={28} className="mb-2 text-[#A3C2B0]" />
                <span className="text-xs font-medium text-[#8E9B93]">Placeholder foto kegiatan</span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-[#14201A]">
                  Pengumpulan sampah warga
                </h4>
                <p className="text-[11px] text-[#5B6B61] mt-1">
                  Setoran warga telah didokumentasi
                </p>
              </div>
            </div>

            {/* Foto 2 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] overflow-hidden shadow-xs flex flex-col">
              <div className="h-44 bg-[#F8FAF9] flex flex-col items-center justify-center text-[#8E9B93] border-b border-[#DDE2DF]">
                <LuImage size={28} className="mb-2 text-[#A3C2B0]" />
                <span className="text-xs font-medium text-[#8E9B93]">Placeholder foto kegiatan</span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-[#14201A]">
                  Pemilahan dan penimbangan
                </h4>
                <p className="text-[11px] text-[#5B6B61] mt-1">
                  Proses penimbangan telah didokumentasi
                </p>
              </div>
            </div>

            {/* Foto 3 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] overflow-hidden shadow-xs flex flex-col">
              <div className="h-44 bg-[#F8FAF9] flex flex-col items-center justify-center text-[#8E9B93] border-b border-[#DDE2DF]">
                <LuImage size={28} className="mb-2 text-[#A3C2B0]" />
                <span className="text-xs font-medium text-[#8E9B93]">Placeholder foto kegiatan</span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-[#14201A]">
                  Pengolahan kompos organik
                </h4>
                <p className="text-[11px] text-[#5B6B61] mt-1">
                  Pengolahan kompos telah didokumentasi
                </p>
              </div>
            </div>

            {/* Foto 4 */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] overflow-hidden shadow-xs flex flex-col">
              <div className="h-44 bg-[#F8FAF9] flex flex-col items-center justify-center text-[#8E9B93] border-b border-[#DDE2DF]">
                <LuImage size={28} className="mb-2 text-[#A3C2B0]" />
                <span className="text-xs font-medium text-[#8E9B93]">Placeholder foto kegiatan</span>
              </div>
              <div className="p-4">
                <h4 className="text-xs font-bold text-[#14201A]">
                  Hasil karya daur ulang
                </h4>
                <p className="text-[11px] text-[#5B6B61] mt-1">
                  Produk daur ulang telah didokumentasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FOOTER (BG: SOFT GREEN #F4FAF6) ──────── */}
      <footer className="w-full bg-[#F4FAF6] border-t border-[#DDE2DF] text-[#3F4B44]">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <span className="text-xl font-bold tracking-tight text-[#14201A]">
              Sumber<span className="text-[#1F6B3F]">Arum</span>
            </span>
            <p className="text-xs text-[#5B6B61] max-w-sm leading-relaxed">
              Sistem Informasi dan Pengelolaan Sampah Dusun Sumberarum. Bersama warga, menuju lingkungan yang lebih bersih.
            </p>
          </div>

          {/* Jelajahi */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-bold text-[#14201A] uppercase tracking-wider">
              Jelajahi
            </h5>
            <ul className="space-y-2 text-xs text-[#5B6B61]">
              <li>
                <button
                  onClick={() => scrollToSection("beranda", "beranda")}
                  className="hover:text-[#1F6B3F] transition cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("perkembangan", "perkembangan")}
                  className="hover:text-[#1F6B3F] transition cursor-pointer"
                >
                  Perkembangan
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("transparansi", "transparansi")}
                  className="hover:text-[#1F6B3F] transition cursor-pointer"
                >
                  Transparansi
                </button>
              </li>
            </ul>
          </div>

          {/* Hubungi Pengelola */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-bold text-[#14201A] uppercase tracking-wider">
              Hubungi Pengelola
            </h5>
            <div className="text-xs text-[#5B6B61] space-y-1">
              <p className="font-semibold text-[#14201A]">Bank Sampah Dusun Sumberarum</p>
              <p className="leading-relaxed">
                Informasi setoran dan jam layanan dapat ditanyakan kepada petugas dusun.
              </p>
              <p className="pt-1 text-[11px]">
                Status saat ini:{" "}
                <span className={`font-semibold ${statusOperasional === "buka" ? "text-[#1F6B3F]" : "text-red-600"}`}>
                  {statusOperasional === "buka" ? "Layanan Buka" : "Layanan Tutup"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-[#DDE2DF]/70 py-5">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8E9B93]">
            <p>© 2026 SumberArum. Seluruh hak dilindungi.</p>
            <p>Dikelola bersama warga Dusun Sumberarum</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
