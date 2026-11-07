import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuCheck } from "react-icons/lu";
import PopUpKonfirmasiSelesaiOlah from "./PopUpKonfirmasiSelesaiOlah";
import {
  getBatchSedangList,
  addBatchSedang,
  completeBatch,
} from "../../../utils/olahMock";

// Mock data awal
const INITIAL_STOK = [
  { id: 1, nama: "Botol Plastik", stok: 19 },
  { id: 2, nama: "Kertas", stok: 24 },
  { id: 3, nama: "Organik", stok: 80 },
];

const INITIAL_JENIS_OLAHAN = [
  { id: "kompos", nama: "Kompos" },
  { id: "vas-plastik", nama: "Vas Plastik" },
  { id: "kertas-daur-ulang", nama: "Kertas Daur Ulang" },
];

const INITIAL_PIC = [
  { id: 1, nama: "Budi Santoso" },
  { id: 2, nama: "Siti Aminah" },
  { id: 3, nama: "Sule" },
  { id: 4, nama: "Dewi Lestari" },
];

// Hanya batch yang sedang dalam proses pengolahan
const INITIAL_BATCH = [
  {
    id: "#O-A05",
    jenisOlahan: "Kompos",
    pic: "Budi Santoso",
    status: "dalam_pengolahan",
  },
  {
    id: "#O-A03",
    jenisOlahan: "Kertas Daur Ulang",
    pic: "Siti Aminah",
    status: "dalam_pengolahan",
  },
];

export default function OlahSampahPage() {
  const navigate = useNavigate();

  // State stok & master
  const [stokMaterial] = useState(INITIAL_STOK);
  const [jenisOlahanList] = useState(INITIAL_JENIS_OLAHAN);
  const [picList] = useState(INITIAL_PIC);

  // State form tambah olah
  const [selectedJenisOlahan, setSelectedJenisOlahan] = useState("Kompos");
  const [selectedPic, setSelectedPic] = useState("Budi Santoso");
  const [komposisiBahan, setKomposisiBahan] = useState({
    "Botol Plastik": 0,
    Kertas: 0,
    Organik: 25,
  });

  // State daftar batch (hanya yang sedang diolah)
  const [batchList, setBatchList] = useState(getBatchSedangList());

  // State modal konfirmasi selesai
  const [selectedBatchForComplete, setSelectedBatchForComplete] = useState(null);

  // Total bahan baku di form
  const totalBahanBaku = useMemo(() => {
    return Object.values(komposisiBahan).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
  }, [komposisiBahan]);

  function handleBahanChange(namaBahan, value) {
    const num = Math.max(0, Number(value) || 0);
    setKomposisiBahan((prev) => ({
      ...prev,
      [namaBahan]: num,
    }));
  }

  function handleMulaiPengolahan(e) {
    e.preventDefault();
    if (totalBahanBaku <= 0) {
      alert("Masukkan minimal satu bahan baku untuk pengolahan.");
      return;
    }

    const nextIdNum = batchList.length + 5;
    const newBatch = {
      id: `#O-A${String(nextIdNum).padStart(2, "0")}`,
      jenisOlahan: selectedJenisOlahan,
      pic: selectedPic,
      status: "dalam_pengolahan",
      bahanBaku: `${totalBahanBaku} kg ${
        selectedJenisOlahan === "Kompos"
          ? "Organik"
          : selectedJenisOlahan === "Vas Plastik"
          ? "Botol Plastik"
          : "Kertas"
      }`,
      tanggalSelesai: "6 September 2026",
    };

    addBatchSedang(newBatch);
    setBatchList([...getBatchSedangList()]);

    // Reset input form
    setKomposisiBahan({
      "Botol Plastik": 0,
      Kertas: 0,
      Organik: 0,
    });
  }

  function handleConfirmSelesai() {
    if (!selectedBatchForComplete) return;

    const targetId = selectedBatchForComplete.id;

    // Selesaikan batch dari daftar olah sampah
    completeBatch(targetId);
    setBatchList([...getBatchSedangList()]);

    setSelectedBatchForComplete(null);

    // Navigasi ke halaman hasil olahan dengan mode catat hasil
    navigate(`/hasil-olahan?catatBatch=${encodeURIComponent(targetId)}`);
  }

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
            Olah Sampah
          </h1>
          <p className="mt-1 text-sm text-[#14201A]">
            Pantau material siap olah dan kelola proses pengolahan batch
          </p>
        </div>

        {/* Baris Atas: Material Siap Olah (kiri) & Form Tambah Olah (kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card: Material Siap Olah (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
              Material Siap Olah
            </h2>

            <div className="overflow-hidden rounded-xl border border-[#DDE2DF]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                    <th className="py-2.5 px-4 font-medium">Jenis Sampah</th>
                    <th className="py-2.5 px-4 text-right font-medium">Stok kg</th>
                  </tr>
                </thead>
                <tbody>
                  {stokMaterial.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#F2F4F3] last:border-b-0 hover:bg-[#F9FAF9] transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#14201A]">
                        {item.nama}
                      </td>
                      <td className="py-3 px-4 text-right text-[#14201A] font-medium">
                        {item.stok} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Form Tambah Olah (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
              Form Tambah Olah
            </h2>

            <form onSubmit={handleMulaiPengolahan} className="flex flex-col gap-4">
              {/* Dropdowns row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                    Jenis Olahan
                  </label>
                  <select
                    value={selectedJenisOlahan}
                    onChange={(e) => setSelectedJenisOlahan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                  >
                    {jenisOlahanList.map((j) => (
                      <option key={j.id} value={j.nama}>
                        {j.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                    PIC Pengolah
                  </label>
                  <select
                    value={selectedPic}
                    onChange={(e) => setSelectedPic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                  >
                    {picList.map((p) => (
                      <option key={p.id} value={p.nama}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Input Komposisi Bahan Baku (horizontal 3 items) */}
              <div className="grid grid-cols-3 gap-3">
                {stokMaterial.map((m) => (
                  <div key={m.id}>
                    <label className="block text-xs font-medium text-[#5B6B61] mb-1 truncate">
                      {m.nama}
                    </label>
                    <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F] bg-white">
                      <input
                        type="number"
                        min="0"
                        max={m.stok}
                        value={komposisiBahan[m.nama] ?? 0}
                        onChange={(e) => handleBahanChange(m.nama, e.target.value)}
                        className="w-full px-3 py-2 text-sm text-[#14201A] focus:outline-none"
                      />
                      <span className="px-2.5 text-xs text-[#5B6B61] bg-[#F9FAF9] border-l border-[#DDE2DF] py-2.5 select-none">
                        kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-[#5B6B61]">
                Berat per bahan baku tidak boleh melebihi stok yang tersedia.
              </p>

              {/* Form Action & Total */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F3] mt-2">
                <span className="text-xs text-[#5B6B61]">
                  Total bahan baku:{" "}
                  <strong className="text-[#14201A] font-semibold">
                    {totalBahanBaku} kg
                  </strong>
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-xs"
                >
                  Mulai Pengolahan
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Baris Bawah: Card Batch Sedang Diolah (tanpa tabs filtering) */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
              Batch Sedang Diolah
            </h2>
            <span className="text-xs text-[#5B6B61]">
              {batchList.length} batch dalam proses
            </span>
          </div>

          {/* Table Batch */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                  <th className="py-3 px-4">ID Batch</th>
                  <th className="py-3 px-4">Jenis Olahan</th>
                  <th className="py-3 px-4">PIC</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right sm:text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {batchList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-[#5B6B61]"
                    >
                      Tidak ada batch yang sedang diolah.
                    </td>
                  </tr>
                ) : (
                  batchList.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                    >
                      <td className="py-3.5 px-4 text-sm font-semibold text-[#14201A]">
                        {b.id}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                        {b.jenisOlahan}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                        {b.pic}
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                          Dalam Pengolahan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        <button
                          type="button"
                          onClick={() => setSelectedBatchForComplete(b)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#1F6B3F] text-[#1F6B3F] text-xs font-semibold hover:bg-[#E3F1E8] transition-colors"
                        >
                          <LuCheck size={14} strokeWidth={2.5} />
                          Tandai Selesai
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Pop Up Konfirmasi Tandai Selesai */}
      {selectedBatchForComplete && (
        <PopUpKonfirmasiSelesaiOlah
          batch={selectedBatchForComplete}
          onClose={() => setSelectedBatchForComplete(null)}
          onConfirm={handleConfirmSelesai}
        />
      )}
    </div>
  );
}
