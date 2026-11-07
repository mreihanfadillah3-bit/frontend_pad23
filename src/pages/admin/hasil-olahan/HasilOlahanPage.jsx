import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LuPackage, LuWallet } from "react-icons/lu";
import { MdInfoOutline } from "react-icons/md";
import PopUpDetailHasilOlahan from "./PopUpDetailHasilOlahan";
import PopUpInfoPublikasi from "./PopUpInfoPublikasi";
import PopUpInfoSimpan from "./PopUpInfoSimpan";
import {
  getBatchSelesaiList,
  addOrUpdateBatchSelesai,
  publikasikanBatch,
  findBatchDetail,
} from "../../../utils/olahMock";

export default function HasilOlahanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catatBatchParam = searchParams.get("catatBatch");

  // State daftar batch selesai
  const [batchList, setBatchList] = useState(getBatchSelesaiList());

  // State untuk form catat hasil (Gambar 2)
  const [beratHasilInput, setBeratHasilInput] = useState("30");
  const [nilaiJualInput, setNilaiJualInput] = useState("90000");

  // Modal states
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [publishedBatchId, setPublishedBatchId] = useState(null);
  const [savedBatchId, setSavedBatchId] = useState(null);

  // Active batch yang sedang dicatat hasil jika ada di query param
  const activeBatchToRecord = catatBatchParam
    ? findBatchDetail(catatBatchParam)
    : null;

  function handlePublikasiBatch(batchId) {
    const updated = publikasikanBatch(batchId);
    setBatchList([...updated]);
    setPublishedBatchId(batchId);
  }

  function handleSimpanDraft(e) {
    e.preventDefault();
    if (!activeBatchToRecord) return;

    const rawNilai = String(nilaiJualInput).replace(/\D/g, "");
    const beratNum = Number(beratHasilInput) || 30;
    const nilaiNum = rawNilai ? Number(rawNilai) : 90000;

    const newEntry = {
      batchId: activeBatchToRecord.batchId,
      namaOlahan: activeBatchToRecord.namaOlahan,
      pic: activeBatchToRecord.pic,
      statusPublikasi: "belum",
      bahanBaku: activeBatchToRecord.bahanBaku,
      tanggalSelesai: activeBatchToRecord.tanggalSelesai,
      beratHasil: beratNum,
      nilaiJual: nilaiNum,
    };

    const updated = addOrUpdateBatchSelesai(newEntry);
    setBatchList([...updated]);
    setSavedBatchId(activeBatchToRecord.batchId);
  }

  function handleCloseSavedModal() {
    setSavedBatchId(null);
    navigate("/hasil-olahan");
  }

  function handlePublikasikanForm(e) {
    e.preventDefault();
    if (!activeBatchToRecord) return;

    const rawNilai = String(nilaiJualInput).replace(/\D/g, "");
    const beratNum = Number(beratHasilInput) || 30;
    const nilaiNum = rawNilai ? Number(rawNilai) : 90000;

    const newEntry = {
      batchId: activeBatchToRecord.batchId,
      namaOlahan: activeBatchToRecord.namaOlahan,
      pic: activeBatchToRecord.pic,
      statusPublikasi: "sudah",
      bahanBaku: activeBatchToRecord.bahanBaku,
      tanggalSelesai: activeBatchToRecord.tanggalSelesai,
      beratHasil: beratNum,
      nilaiJual: nilaiNum,
    };

    const updated = addOrUpdateBatchSelesai(newEntry);
    setBatchList([...updated]);
    setPublishedBatchId(activeBatchToRecord.batchId);
  }

  function handleClosePublishModal() {
    setPublishedBatchId(null);
    if (catatBatchParam) {
      navigate("/hasil-olahan");
    }
  }

  // Batch terkini untuk kartu ringkasan
  const latestBatch = batchList[0];

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
            Hasil Olahan
          </h1>
          <p className="mt-1 text-sm text-[#14201A]">
            Catat dan publikasikan hasil olahan setiap batch yang telah selesai
          </p>
        </div>

        {/* TAMPILAN GAMBAR 2: Form Catat Hasil (jika mode catatBatch aktif) */}
        {activeBatchToRecord ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Card Kiri: Detail Olahan Sampah */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h3 className="text-xs font-semibold text-[#5B6B61] mb-1">
                Detail Olahan Sampah – {activeBatchToRecord.batchId}
              </h3>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F2F4F3]">
                <h2 className="text-2xl font-bold text-[#14201A] font-jakarta">
                  {activeBatchToRecord.namaOlahan}
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
                    {activeBatchToRecord.batchId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5B6B61]">Bahan baku</span>
                  <span className="font-medium text-[#14201A]">
                    {activeBatchToRecord.bahanBaku}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5B6B61]">PIC Pengolah</span>
                  <span className="font-medium text-[#14201A]">
                    {activeBatchToRecord.pic}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5B6B61]">Tanggal selesai</span>
                  <span className="font-medium text-[#14201A]">
                    {activeBatchToRecord.tanggalSelesai}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4FAF6] border border-[#D8EBD7] flex items-center gap-2.5">
                <MdInfoOutline size={18} className="text-[#1F6B3F] shrink-0" />
                <p className="text-xs text-[#3F4B44] leading-relaxed">
                  Pengolahan telah selesai. Periksa berat dan nilai jual sebelum hasil ditampilkan kepada warga.
                </p>
              </div>
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
                      value={beratHasilInput}
                      onChange={(e) => setBeratHasilInput(e.target.value)}
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
                      type="text"
                      value={nilaiJualInput}
                      onChange={(e) => setNilaiJualInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-[#14201A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSimpanDraft}
                    className="w-full py-2.5 bg-white border border-[#1F6B3F] text-[#1F6B3F] text-sm font-semibold rounded-xl hover:bg-[#E3F1E8] transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={handlePublikasikanForm}
                    className="w-full py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-xs"
                  >
                    Publikasikan Hasil Olahan
                  </button>
                </div>

                <p className="text-[11px] text-[#5B6B61] text-center mt-1 leading-relaxed">
                  Simpan sebagai draft atau publikasikan hasil olahan pada halaman informasi warga.
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* TAMPILAN GAMBAR 1: Dashboard Ringkasan & Tabel Batch Selesai Diolah */
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
                    {latestBatch ? `${latestBatch.beratHasil} kg` : "30 kg"}
                  </p>
                  <p className="text-xs text-[#5B6B61] mt-1">
                    {latestBatch
                      ? `${latestBatch.namaOlahan} · hasil batch ${latestBatch.batchId}`
                      : "Kompos · hasil batch #O-A01"}
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
                    {latestBatch
                      ? `Rp ${Number(latestBatch.nilaiJual || 0).toLocaleString("id-ID")}`
                      : "Rp 90.000"}
                  </p>
                  <p className="text-xs text-[#5B6B61] mt-1">
                    {latestBatch
                      ? `Nilai jual hasil batch ${latestBatch.batchId}`
                      : "Nilai jual hasil batch #O-A01"}
                  </p>
                </div>
              </div>
            </div>

            {/* Card: Batch Selesai Diolah */}
            <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#14201A] font-jakarta mb-4">
                Batch Selesai Diolah
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                      <th className="py-3 px-4">ID Batch</th>
                      <th className="py-3 px-4">Jenis Olahan</th>
                      <th className="py-3 px-4">PIC</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchList.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                      >
                        <td className="py-3.5 px-4 text-sm font-semibold text-[#14201A]">
                          {item.batchId}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {item.namaOlahan}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                          {item.pic}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          {item.statusPublikasi === "sudah" ? (
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
                          {item.statusPublikasi === "belum" ? (
                            <button
                              type="button"
                              onClick={() => handlePublikasiBatch(item.batchId)}
                              className="w-20 py-1.5 bg-[#1F6B3F] text-white text-xs font-semibold rounded-lg hover:bg-[#185733] transition-colors text-center inline-block"
                            >
                              Publikasi
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedDetailItem(item)}
                              className="w-20 py-1.5 bg-white border border-[#DDE2DF] text-[#14201A] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center inline-block"
                            >
                              Lihat
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Pop Up Detail Hasil Olahan (Gambar 3) */}
      {selectedDetailItem && (
        <PopUpDetailHasilOlahan
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}

      {/* Pop Up Info Hasil Olahan Disimpan */}
      {savedBatchId && (
        <PopUpInfoSimpan
          batchId={savedBatchId}
          onClose={handleCloseSavedModal}
        />
      )}

      {/* Pop Up Info Hasil Olahan Sudah Dipublikasikan */}
      {publishedBatchId && (
        <PopUpInfoPublikasi
          batchId={publishedBatchId}
          onClose={handleClosePublishModal}
        />
      )}
    </div>
  );
}
