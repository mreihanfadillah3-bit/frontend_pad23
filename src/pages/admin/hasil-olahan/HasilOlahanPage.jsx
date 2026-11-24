import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LuPackage, LuWallet } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import PopUpDetailHasilOlahan from "./PopUpDetailHasilOlahan";
import PopUpInfoPublikasi from "./PopUpInfoPublikasi";
import PopUpInfoSimpan from "./PopUpInfoSimpan";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";
import {
  getHasilOlahan,
  createHasilOlahan,
  publikasikanHasilOlahan,
} from "../../../services/hasilOlahanService";
import { getPengolahanDetail } from "../../../services/pengolahanSampahService";

const formatBatchCode = (id) => {
  if (!id) return "";
  return typeof id === "number" || /^\d+$/.test(id)
    ? `#O-A${String(id).padStart(2, "0")}`
    : String(id);
};

function formatTanggal(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HasilOlahanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catatBatchParam = searchParams.get("catatBatch");

  // State daftar hasil olahan
  const [hasilList, setHasilList] = useState([]);
  const [loadingHasil, setLoadingHasil] = useState(true);
  const [hasilMeta, setHasilMeta] = useState(null);

  // State form catat hasil (jika catatBatch aktif)
  const [activeBatchDetail, setActiveBatchDetail] = useState(null);
  const [loadingBatchDetail, setLoadingBatchDetail] = useState(false);
  const [beratHasilInput, setBeratHasilInput] = useState("");
  const [nilaiJualInput, setNilaiJualInput] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [publishedBatchCode, setPublishedBatchCode] = useState(null);
  const [savedBatchCode, setSavedBatchCode] = useState(null);

  // 1. Muat daftar hasil olahan dari API
  const loadHasilList = useCallback(async () => {
    setLoadingHasil(true);
    try {
      const res = await getHasilOlahan({ limit: 10 });
      setHasilList(res.data || []);
      setHasilMeta(res.meta || null);
    } catch (err) {
      console.error("Gagal memuat hasil olahan:", err);
    } finally {
      setLoadingHasil(false);
    }
  }, []);

  useEffect(() => {
    loadHasilList();
  }, [loadHasilList]);

  // 2. Jika ada query param `catatBatch`, ambil detail batch dari backend
  useEffect(() => {
    if (catatBatchParam) {
      setLoadingBatchDetail(true);
      setFormError("");
      getPengolahanDetail(catatBatchParam)
        .then((data) => {
          setActiveBatchDetail(data);
          // Set estimasi default berat dari total bahan baku jika ada
          const totalBahan = (data.bahan_baku || []).reduce(
            (sum, b) => sum + (Number(b.berat_digunakan) || 0),
            0
          );
          if (totalBahan > 0) {
            setBeratHasilInput(String(totalBahan));
          }
        })
        .catch((err) => {
          console.error("Gagal memuat detail batch pengolahan:", err);
          setFormError(formatError(err) || "Gagal memuat detail batch.");
        })
        .finally(() => {
          setLoadingBatchDetail(false);
        });
    } else {
      setActiveBatchDetail(null);
      setBeratHasilInput("");
      setNilaiJualInput("");
      setFormError("");
    }
  }, [catatBatchParam]);

  // Handle Simpan Draft (Belum Dipublikasi)
  async function handleSimpanDraft(e) {
    e.preventDefault();
    if (!catatBatchParam) return;

    const berat = parseFloat(beratHasilInput);
    if (!Number.isFinite(berat) || berat <= 0) {
      setFormError("Berat hasil olahan wajib diisi dan harus lebih dari 0.");
      return;
    }

    const rawNilai = String(nilaiJualInput).replace(/\D/g, "");
    const nilai = Number(rawNilai || 0);

    setSubmitting(true);
    setFormError("");
    try {
      await createHasilOlahan(catatBatchParam, {
        berat_hasil_olahan: berat,
        nilai_jual: nilai,
        status_publikasi: "Belum Dipublikasi",
      });
      setSavedBatchCode(formatBatchCode(catatBatchParam));
      await loadHasilList();
    } catch (err) {
      setFormError(formatError(err) || "Gagal menyimpan hasil olahan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Publikasikan Form Langsung
  async function handlePublikasikanForm(e) {
    e.preventDefault();
    if (!catatBatchParam) return;

    const berat = parseFloat(beratHasilInput);
    if (!Number.isFinite(berat) || berat <= 0) {
      setFormError("Berat hasil olahan wajib diisi dan harus lebih dari 0.");
      return;
    }

    const rawNilai = String(nilaiJualInput).replace(/\D/g, "");
    const nilai = Number(rawNilai || 0);

    setSubmitting(true);
    setFormError("");
    try {
      await createHasilOlahan(catatBatchParam, {
        berat_hasil_olahan: berat,
        nilai_jual: nilai,
        status_publikasi: "Sudah Dipublikasi",
      });
      setPublishedBatchCode(formatBatchCode(catatBatchParam));
      await loadHasilList();
    } catch (err) {
      setFormError(formatError(err) || "Gagal mempublikasikan hasil olahan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Publikasi dari tabel batch selesai
  async function handlePublikasiBatch(idHasil, idOlahSampah) {
    try {
      await publikasikanHasilOlahan(idHasil);
      setPublishedBatchCode(formatBatchCode(idOlahSampah));
      await loadHasilList();
    } catch (err) {
      alert(formatError(err) || "Gagal mempublikasikan hasil olahan.");
    }
  }

  function handleCloseSavedModal() {
    setSavedBatchCode(null);
    navigate("/hasil-olahan");
  }

  function handleClosePublishModal() {
    setPublishedBatchCode(null);
    if (catatBatchParam) {
      navigate("/hasil-olahan");
    }
  }

  // Hitung total ringkasan dari hasil olahan
  const totalRingkasan = useMemo(() => {
    const totalBerat = hasilList.reduce(
      (sum, item) => sum + (parseFloat(item.berat_hasil_olahan) || 0),
      0
    );
    const totalNilai = hasilList.reduce(
      (sum, item) => sum + (parseFloat(item.nilai_jual) || 0),
      0
    );
    return {
      totalBerat: Math.round(totalBerat * 100) / 100,
      totalNilai,
    };
  }, [hasilList]);

  const latestItem = hasilList[0];

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Hasil Olahan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#14201A]">
            Catat dan publikasikan hasil olahan setiap batch yang telah selesai
          </p>
        </div>

        {/* TAMPILAN MODE 1: Form Catat Hasil (jika mode catatBatch aktif) */}
        {catatBatchParam ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Card Kiri: Detail Olahan Sampah */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
              {loadingBatchDetail ? (
                <div className="py-12 text-center text-sm text-[#5B6B61]">
                  Memuat data batch pengolahan...
                </div>
              ) : activeBatchDetail ? (
                <>
                  <h3 className="text-xs font-semibold text-[#5B6B61] mb-1">
                    Detail Olahan Sampah – {formatBatchCode(activeBatchDetail.id_olah_sampah)}
                  </h3>

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F2F4F3]">
                    <h2 className="text-2xl font-bold text-[#14201A] font-jakarta">
                      {activeBatchDetail.nama_olahan}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      Selesai
                    </span>
                  </div>

                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B61]">ID Batch</span>
                      <span className="font-semibold text-[#14201A]">
                        {formatBatchCode(activeBatchDetail.id_olah_sampah)}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#5B6B61] shrink-0">Bahan baku</span>
                      <span className="font-medium text-[#14201A] text-right">
                        {(activeBatchDetail.bahan_baku || []).length > 0
                          ? activeBatchDetail.bahan_baku
                              .map(
                                (b) =>
                                  `${formatKg(b.berat_digunakan)} ${b.nama_sampah}`
                              )
                              .join(", ")
                          : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B61]">PIC Pengolah</span>
                      <span className="font-medium text-[#14201A]">
                        {activeBatchDetail.nama_pic || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#5B6B61]">Tanggal selesai</span>
                      <span className="font-medium text-[#14201A]">
                        {formatTanggal(activeBatchDetail.tgl_selesai || activeBatchDetail.tgl_mulai)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F4FAF6] border border-[#D8EBD7] flex items-center gap-2.5">
                    <MdInfoOutline size={18} className="text-[#1F6B3F] shrink-0" />
                    <p className="text-xs text-[#3F4B44] leading-relaxed">
                      Pengolahan telah selesai. Periksa berat dan nilai jual sebelum hasil ditampilkan kepada warga.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-sm text-red-600">
                  Batch tidak ditemukan atau sudah dicatat hasil olahannya.
                </div>
              )}
            </div>

            {/* Card Kanan: Form Catat Hasil */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#14201A] font-jakarta">
                  Form Catat Hasil
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Draft
                </span>
              </div>

              <form className="flex flex-col gap-4">
                {/* Berat Hasil */}
                <div>
                  <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                    Berat Hasil
                  </label>
                  <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F] bg-white">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,0"
                      value={beratHasilInput}
                      onChange={(e) => {
                        setBeratHasilInput(e.target.value);
                        setFormError("");
                      }}
                      disabled={submitting}
                      className="w-full px-3.5 py-2.5 text-sm text-[#14201A] focus:outline-none"
                    />
                    <span className="px-3 text-xs font-semibold text-[#5B6B61] bg-[#F9FAF9] border-l border-[#DDE2DF] py-3 select-none">
                      kg
                    </span>
                  </div>
                </div>

                {/* Nilai Jual */}
                <div>
                  <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                    Nilai Jual
                  </label>
                  <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F] bg-white">
                    <span className="px-3 text-xs font-semibold text-[#5B6B61] bg-[#F9FAF9] border-r border-[#DDE2DF] py-3 select-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      value={nilaiJualInput}
                      onChange={(e) => {
                        setNilaiJualInput(e.target.value);
                        setFormError("");
                      }}
                      disabled={submitting}
                      className="w-full px-3.5 py-2.5 text-sm text-[#14201A] focus:outline-none"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {formError}
                  </p>
                )}

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSimpanDraft}
                    disabled={submitting}
                    className="w-full py-2.5 bg-white border border-[#1F6B3F] text-[#1F6B3F] text-sm font-semibold rounded-xl hover:bg-[#E3F1E8] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePublikasikanForm}
                    disabled={submitting}
                    className="w-full py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Memproses..." : "Publikasikan Hasil Olahan"}
                  </button>
                </div>

                <p className="text-[11px] text-[#5B6B61] text-center mt-1 leading-relaxed">
                  Simpan sebagai draft atau publikasikan hasil olahan pada halaman informasi warga.
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* TAMPILAN MODE 2: Dashboard Ringkasan & Tabel Batch Selesai Diolah */
          <>
            {/* Stat Cards 2 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Hasil Olahan */}
              <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#3F4B44]">
                    Hasil Olahan
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                    <LuPackage size={22} strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-[#14201A] font-jakarta">
                    {formatKg(totalRingkasan.totalBerat)}
                  </p>
                  <p className="text-xs text-[#5B6B61] mt-1">
                    {latestItem
                      ? `Hasil terbaru: batch ${formatBatchCode(latestItem.id_olah_sampah)}`
                      : "Total berat hasil olahan yang telah dicatat"}
                  </p>
                </div>
              </div>

              {/* Card 2: Nilai Jual */}
              <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#3F4B44]">
                    Nilai Jual
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                    <LuWallet size={20} strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-[#14201A] font-jakarta">
                    {formatRupiah(totalRingkasan.totalNilai)}
                  </p>
                  <p className="text-xs text-[#5B6B61] mt-1">
                    Akumulasi nilai jual dari seluruh hasil olahan tercatat
                  </p>
                </div>
              </div>
            </div>

            {/* Card: Batch Selesai Diolah */}
            <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
                  Batch Selesai Diolah
                </h2>
                <span className="text-xs text-[#5B6B61]">
                  {hasilMeta?.total_data ?? hasilList.length} hasil olahan tercatat
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                      <th className="py-3 px-4">ID Batch</th>
                      <th className="py-3 px-4">Berat Hasil</th>
                      <th className="py-3 px-4">Nilai Jual</th>
                      <th className="py-3 px-4">Tanggal Rekap</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHasil ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-[#5B6B61]">
                          Memuat daftar hasil olahan...
                        </td>
                      </tr>
                    ) : hasilList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-[#5B6B61]">
                          Belum ada batch yang selesai dicatat hasil olahannya.
                        </td>
                      </tr>
                    ) : (
                      hasilList.map((item) => {
                        const idHasil = item.id_hasilolahan;
                        const idOlah = item.id_olah_sampah;
                        const isSudahPublikasi =
                          item.status_publikasi === "Sudah Dipublikasi";

                        return (
                          <tr
                            key={idHasil}
                            className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                          >
                            <td className="py-3.5 px-4 text-sm font-semibold text-[#14201A]">
                              {formatBatchCode(idOlah)}
                            </td>
                            <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                              {formatKg(item.berat_hasil_olahan)}
                            </td>
                            <td className="py-3.5 px-4 text-sm font-semibold text-[#14201A]">
                              {formatRupiah(item.nilai_jual)}
                            </td>
                            <td className="py-3.5 px-4 text-sm text-[#5B6B61]">
                              {formatTanggal(item.tanggal_direkap)}
                            </td>
                            <td className="py-3.5 px-4 text-sm">
                              {isSudahPublikasi ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                                  Sudah Dipublikasi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                                  Belum Dipublikasi
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                {!isSudahPublikasi ? (
                                  <button
                                    type="button"
                                    onClick={() => handlePublikasiBatch(idHasil, idOlah)}
                                    className="px-3.5 py-1.5 bg-[#1F6B3F] text-white text-xs font-semibold rounded-lg hover:bg-[#185733] transition-colors cursor-pointer"
                                  >
                                    Publikasi
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => setSelectedDetailItem(item)}
                                  className="px-3.5 py-1.5 bg-white border border-[#DDE2DF] text-[#14201A] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Lihat
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Pop Up Detail Hasil Olahan */}
      {selectedDetailItem && (
        <PopUpDetailHasilOlahan
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Pop Up Info Hasil Olahan Disimpan */}
      {savedBatchCode && (
        <PopUpInfoSimpan
          batchId={savedBatchCode}
          onClose={handleCloseSavedModal}
        />
      )}

      {/* Pop Up Info Hasil Olahan Sudah Dipublikasikan */}
      {publishedBatchCode && (
        <PopUpInfoPublikasi
          batchId={publishedBatchCode}
          onClose={handleClosePublishModal}
        />
      )}
    </div>
  );
}
