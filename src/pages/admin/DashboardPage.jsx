import { useEffect, useState } from "react";
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
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getDashboard } from "../../services/dashboardService";

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
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();

  /* ── data state ── */
  const [data,   setData]   = useState(null);
  const [error,  setError]  = useState("");

  /* ── period state ── */
  const now          = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [year,  setYear]  = useState(now.getFullYear());

  /* ── chart toggle ── */
  const [chartView,  setChartView]  = useState("bulan"); // "bulan" | "tahun"
  const [comparePrev, setComparePrev] = useState(false);
  const [compareYear, setCompareYear] = useState(year - 1);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return (
    <div className="p-8 text-red-600 font-medium">{error}</div>
  );
  if (!data)  return (
    <div className="p-8 text-[#5B6B61]">Memuat data…</div>
  );

  /* ── derived values ── */
  const isOpen    = data.status_operasional === "buka";
  const batchAktif = (data.batch_sedang_diolah ?? []).filter(
    (b) => b.status === "dalam_pengolahan"
  ).length;

  const aksi = data.action_required ?? [];

  const ringkasan = data.ringkasan_periode ?? {};
  const sampahTerkumpul = ringkasan.sampah_terkumpul ?? data.ringkasan_sampah_terkumpul?.berat ?? 0;
  const sampahTerolah   = ringkasan.sampah_terolah   ?? 0;
  const hasilOlahan     = ringkasan.hasil_olahan      ??
    (data.ringkasan_hasil_olahan ?? []).reduce((t, h) => t + (h.berat_hasil_olahan ?? 0), 0);
  const nilaiSampah     = ringkasan.nilai_sampah      ?? 0;

  const chartData       = data.chart_data             ?? [];
  const lastUpdated     = data.last_updated
    ? new Date(data.last_updated).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "–";

  /* ── period nav ── */
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }
  function goToday() {
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  }

  const periodLabel = `${MONTHS[month]} ${year}`;
  const isToday     = month === now.getMonth() && year === now.getFullYear();

  /* ═══ JSX ═══════════════════════════════════════════════ */
  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-6">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#14201A]">
            Ringkasan operasional bank sampah dan aktivitas pengelolaan hari ini
          </p>
        </div>

        {/* ── Row 1: Status Operasional + Batch ── */}
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
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
                {aksi.map((a) => {
                  const cfg = ACTION_CONFIG[a.jenis] ?? {
                    label: a.keterangan,
                    sub:   "",
                    Icon:  LuSquareCheck,
                    to:    "/dashboard",
                  };
                  return (
                    <button
                      key={`${a.jenis}-${a.id}`}
                      onClick={() => navigate(cfg.to)}
                      className="flex items-center gap-3 py-3 text-left hover:bg-[#F6F8F7]
                        rounded-lg px-2 -mx-2 transition-colors group"
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
          <h2 className="text-2xl font-bold text-[#14201A] font-jakarta">
            Ringkasan Periode
          </h2>
          <p className="mt-0.5 text-sm text-[#14201A]">
            Ringkasan {periodLabel} · akumulasi data per bulan
          </p>

          {/* Period controls */}
          <div className="flex items-center justify-between mt-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#14201A]">Menampilkan data periode</span>
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF]
                  bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44]"
              >
                <LuChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#DDE2DF]
                  bg-[#FFFFFF] text-sm font-medium text-[#14201A] hover:bg-[#F6F8F7] transition-colors"
              >
                {periodLabel}
                <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDE2DF]
                  bg-[#FFFFFF] hover:bg-[#F6F8F7] transition-colors text-[#3F4B44]"
              >
                <LuChevronRight size={18} strokeWidth={2} />
              </button>
              {!isToday && (
                <button
                  onClick={goToday}
                  className="px-3 h-8 rounded-lg border border-[#1F6B3F] text-sm font-medium
                    text-[#1F6B3F] bg-[#E3F1E8] hover:bg-[#d2eadb] transition-colors"
                >
                  Bulan Ini
                </button>
              )}
              {isToday && (
                <span className="px-3 h-8 flex items-center rounded-lg bg-[#E3F1E8]
                  text-sm font-medium text-[#1F6B3F]">
                  Bulan Ini
                </span>
              )}
            </div>
            <p className="inline-block rounded-md bg-white px-2 py-1 text-xs text-[#5B6B61]">
              Terakhir diperbarui hari ini, {lastUpdated}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4">
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

        {/* ── Data Perkembangan Sampah ── */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#14201A] font-jakarta">
                Data Perkembangan Sampah
              </h2>
              <p className="mt-0.5 text-sm text-[#5B6B61]">
                Ringkasan {periodLabel} · akumulasi data per {chartView === "bulan" ? "bulan" : "tahun"}
              </p>
            </div>

            {/* Chart controls */}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Per Bulan / Per Tahun */}
              <div className="flex rounded-lg border border-[#DDE2DF] overflow-hidden bg-[#FFFFFF]">
                {["bulan", "tahun"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-4 py-2 text-sm font-medium transition-colors
                      ${chartView === v
                        ? "bg-[#E3F1E8] text-[#1F6B3F]"
                        : "text-[#3F4B44] hover:bg-[#F6F8F7]"}`}
                  >
                    Per {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              {/* Bandingkan toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#3F4B44]">
                  Bandingkan dengan tahun lain
                </span>
                <button
                  type="button"
                  aria-label="Bandingkan dengan tahun lain"
                  aria-pressed={comparePrev}
                  onClick={() => setComparePrev((p) => !p)}
                  className={`relative w-10 h-5 rounded-full transition-colors
                    ${comparePrev ? "bg-[#1F6B3F]" : "bg-[#DDE2DF]"}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                      ${comparePrev ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Year dropdown */}
              <div className="flex items-center gap-1 px-3 h-8 rounded-lg border border-[#DDE2DF]
                bg-[#FFFFFF] text-sm font-medium text-[#14201A]">
                {year}
                <LuChevronDown size={16} strokeWidth={2} className="text-[#5B6B61]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE2DF] bg-[#F6F8F7] p-6">
            <h3 className="text-base font-semibold text-[#14201A] mb-4">
              Ringkasan {periodLabel}
            </h3>

            {chartData.length === 0 ? (
              <p className="text-sm text-[#5B6B61] leading-relaxed">
                Data perkembangan sampah pada {periodLabel} sudah tersedia.
                Gunakan kontrol di atas untuk mengubah periode atau membandingkan dengan tahun lain.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDE2DF" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#5B6B61", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#5B6B61", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    unit=" kg"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #DDE2DF",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value} kg`]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#5B6B61" }}
                  />
                  <Bar
                    dataKey="sampah_terkumpul"
                    name="Sampah Terkumpul"
                    fill="#1F6B3F"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="sampah_terolah"
                    name="Sampah Terolah"
                    fill="#5F9C78"
                    radius={[4, 4, 0, 0]}
                  />
                  {comparePrev && (
                    <Bar
                      dataKey="sampah_terkumpul_prev"
                      name={`Sampah Terkumpul ${compareYear}`}
                      fill="#B2D9C0"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
