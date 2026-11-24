import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LuCheck, LuTrash2 } from "react-icons/lu";
import PopUpKonfirmasiSelesaiOlah from "./PopUpKonfirmasiSelesaiOlah";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";
import { formatKg, formatError } from "../../../utils/format";
import {
  getMaterialSiapOlah,
  getPengolahan,
  createPengolahan,
  deletePengolahan,
} from "../../../services/pengolahanSampahService";
import {
  getJenisOlahan,
  getKomposisiOlahan,
} from "../../../services/jenisOlahanService";
import { getPicPengolah } from "../../../services/picPengolahService";

const formatBatchCode = (id) => {
  if (!id) return "";
  return typeof id === "number" || /^\d+$/.test(id)
    ? `#O-A${String(id).padStart(2, "0")}`
    : String(id);
};

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (Array.isArray(val?.data)) return val.data;
  if (Array.isArray(val?.items)) return val.items;
  return [];
}

export default function OlahSampahPage() {
  const navigate = useNavigate();

  // Data master & stok
  const [stokMaterial, setStokMaterial] = useState([]);
  const [loadingMaterial, setLoadingMaterial] = useState(true);

  const [jenisOlahanList, setJenisOlahanList] = useState([]);
  const [selectedJenisOlahanId, setSelectedJenisOlahanId] = useState("");

  const [picList, setPicList] = useState([]);
  const [selectedPicId, setSelectedPicId] = useState("");

  // Komposisi bahan untuk jenis olahan terpilih
  const [komposisiList, setKomposisiList] = useState([]);
  const [komposisiInput, setKomposisiInput] = useState({});
  const [loadingKomposisi, setLoadingKomposisi] = useState(false);

  // Form submission & error states
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Daftar batch yang sedang diolah
  const [batchList, setBatchList] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [batchPage, setBatchPage] = useState(1);
  const [batchMeta, setBatchMeta] = useState(null);

  // Modal konfirmasi selesai
  const [selectedBatchForComplete, setSelectedBatchForComplete] = useState(null);

  // Modal konfirmasi hapus batch
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // 1. Muat Material Siap Olah
  const loadMaterial = useCallback(async () => {
    setLoadingMaterial(true);
    try {
      const data = await getMaterialSiapOlah();
      setStokMaterial(toArray(data));
    } catch (err) {
      console.error("Gagal memuat material siap olah:", err);
    } finally {
      setLoadingMaterial(false);
    }
  }, []);

  // 2. Muat Master Jenis Olahan
  const loadJenisOlahan = useCallback(async () => {
    try {
      const data = await getJenisOlahan();
      const list = toArray(data);
      setJenisOlahanList(list);
      if (list.length > 0) {
        setSelectedJenisOlahanId(String(list[0].id_jenis_olahan ?? list[0].id));
      }
    } catch (err) {
      console.error("Gagal memuat jenis olahan:", err);
    }
  }, []);

  // 3. Muat Master PIC Aktif
  const loadPic = useCallback(async () => {
    try {
      const data = await getPicPengolah({ status: "aktif" });
      const list = toArray(data);
      setPicList(list);
      if (list.length > 0) {
        setSelectedPicId(String(list[0].id_pic ?? list[0].id));
      }
    } catch (err) {
      console.error("Gagal memuat PIC pengolah:", err);
    }
  }, []);

  // 4. Muat Batch Sedang Diolah
  const loadBatchList = useCallback(async (page = 1) => {
    setLoadingBatch(true);
    try {
      const res = await getPengolahan({ status: "Sedang Diolah", page, limit: 10 });
      setBatchList(res.data || []);
      setBatchMeta(res.meta || null);
    } catch (err) {
      console.error("Gagal memuat batch pengolahan:", err);
    } finally {
      setLoadingBatch(false);
    }
  }, []);

  // Inisialisasi awal
  useEffect(() => {
    loadMaterial();
    loadJenisOlahan();
    loadPic();
    loadBatchList(batchPage);
  }, [loadMaterial, loadJenisOlahan, loadPic, loadBatchList, batchPage]);

  // 5. Setiap jenis olahan berganti, muat komposisinya
  useEffect(() => {
    if (!selectedJenisOlahanId) {
      setKomposisiList([]);
      setKomposisiInput({});
      return;
    }

    setLoadingKomposisi(true);
    setFormError("");
    getKomposisiOlahan(selectedJenisOlahanId)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setKomposisiList(list);
        // Reset input per komposisi
        const initialInputs = {};
        list.forEach((k) => {
          initialInputs[k.id_komposisi] = "";
        });
        setKomposisiInput(initialInputs);
      })
      .catch((err) => {
        console.error("Gagal memuat komposisi:", err);
        setKomposisiList([]);
      })
      .finally(() => {
        setLoadingKomposisi(false);
      });
  }, [selectedJenisOlahanId]);

  // Helper pencocokan stok material berdasarkan id_jenis_sampah
  const getStokForJenisSampah = useCallback(
    (idJenisSampah) => {
      const found = stokMaterial.find(
        (m) => Number(m.id_jenis_sampah) === Number(idJenisSampah)
      );
      return found ? Number(found.berat_tersedia || 0) : 0;
    },
    [stokMaterial]
  );

  // Total bahan baku dihitung dari input
  const totalBahanBaku = useMemo(() => {
    return Object.values(komposisiInput).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
  }, [komposisiInput]);

  function handleInputChange(idKomposisi, value) {
    setKomposisiInput((prev) => ({
      ...prev,
      [idKomposisi]: value,
    }));
    setFormError("");
  }

  // Submit Buat Batch Pengolahan
  async function handleMulaiPengolahan(e) {
    e.preventDefault();
    if (!selectedJenisOlahanId) {
      setFormError("Pilih jenis olahan terlebih dahulu.");
      return;
    }
    if (!selectedPicId) {
      setFormError("Pilih PIC pengolah aktif.");
      return;
    }
    if (komposisiList.length === 0) {
      setFormError("Jenis olahan ini belum memiliki komposisi bahan baku.");
      return;
    }

    // Validasi semua komposisi harus terisi > 0 dan tidak melebihi stok
    const bahanBakuPayload = [];
    for (const k of komposisiList) {
      const val = parseFloat(komposisiInput[k.id_komposisi]);
      const namaSampah = k.jenis_sampah?.nama_sampah || k.nama_sampah || "Bahan";
      const stokTersedia = getStokForJenisSampah(k.id_jenis_sampah);

      if (!Number.isFinite(val) || val <= 0) {
        setFormError(`Masukkan berat untuk bahan "${namaSampah}" (harus > 0).`);
        return;
      }
      if (val > stokTersedia) {
        setFormError(
          `Berat "${namaSampah}" (${val} kg) melebihi stok tersedia (${stokTersedia} kg).`
        );
        return;
      }

      bahanBakuPayload.push({
        id_komposisi: Number(k.id_komposisi),
        berat_digunakan: val,
      });
    }

    setSubmitting(true);
    setFormError("");
    try {
      await createPengolahan({
        id_jenis_olahan: Number(selectedJenisOlahanId),
        id_pic: Number(selectedPicId),
        bahan_baku: bahanBakuPayload,
      });

      // Reset form input
      const resetInputs = {};
      komposisiList.forEach((k) => {
        resetInputs[k.id_komposisi] = "";
      });
      setKomposisiInput(resetInputs);

      // Refresh material siap olah dan daftar batch
      await Promise.all([loadMaterial(), loadBatchList(1)]);
    } catch (err) {
      setFormError(formatError(err) || "Gagal membuat batch pengolahan.");
    } finally {
      setSubmitting(false);
    }
  }

  // Hapus Batch Sedang Diolah
  async function handleHapusBatch(idOlahSampah) {
    setDeletingBatch(true);
    setDeleteError("");
    try {
      await deletePengolahan(idOlahSampah);
      setBatchToDelete(null);
      await Promise.all([loadMaterial(), loadBatchList(batchPage)]);
    } catch (err) {
      setDeleteError(formatError(err) || "Gagal menghapus batch.");
    } finally {
      setDeletingBatch(false);
    }
  }

  // Konfirmasi Tandai Selesai -> Navigasi ke Hasil Olahan
  function handleConfirmSelesai() {
    if (!selectedBatchForComplete) return;
    const targetId =
      selectedBatchForComplete.id_olah_sampah ?? selectedBatchForComplete.id;
    setSelectedBatchForComplete(null);
    navigate(`/hasil-olahan?catatBatch=${encodeURIComponent(targetId)}`);
  }

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Olah Sampah
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#14201A]">
            Pantau material siap olah dan kelola proses pengolahan batch
          </p>
        </div>

        {/* Baris Atas: Material Siap Olah (kiri) & Form Tambah Olah (kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card: Material Siap Olah (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta">
                Material Siap Olah
              </h2>
              <span className="text-xs text-[#5B6B61]">
                {stokMaterial.length} jenis sampah
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#DDE2DF]">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                    <th className="py-2.5 px-4 font-medium">Jenis Sampah</th>
                    <th className="py-2.5 px-4 text-right font-medium">Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMaterial ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-xs text-[#5B6B61]">
                        Memuat stok material...
                      </td>
                    </tr>
                  ) : stokMaterial.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-xs text-[#5B6B61]">
                        Belum ada material yang siap diolah.
                      </td>
                    </tr>
                  ) : (
                    stokMaterial.map((item) => (
                      <tr
                        key={item.id_jenis_sampah}
                        className="border-b border-[#F2F4F3] last:border-b-0 hover:bg-[#F9FAF9] transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-[#14201A]">
                          {item.nama_sampah}
                        </td>
                        <td className="py-3 px-4 text-right text-[#14201A] font-semibold">
                          {formatKg(item.berat_tersedia)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#5B6B61] mt-3">
              Stok dihitung dari setoran sampah warga yang sudah lunas dan belum terpakai batch lain.
            </p>
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
                    value={selectedJenisOlahanId}
                    onChange={(e) => setSelectedJenisOlahanId(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                  >
                    {jenisOlahanList.length === 0 ? (
                      <option value="">Memuat jenis olahan...</option>
                    ) : (
                      jenisOlahanList.map((j) => {
                        const jId = j.id_jenis_olahan ?? j.id;
                        return (
                          <option key={jId} value={jId}>
                            {j.nama_olahan ?? j.nama}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                    PIC Pengolah
                  </label>
                  <select
                    value={selectedPicId}
                    onChange={(e) => setSelectedPicId(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                  >
                    {picList.length === 0 ? (
                      <option value="">Memuat PIC pengolah...</option>
                    ) : (
                      picList.map((p) => {
                        const pId = p.id_pic ?? p.id;
                        return (
                          <option key={pId} value={pId}>
                            {p.nama}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>

              {/* Komposisi Bahan Baku sesuai Jenis Olahan */}
              <div>
                <label className="block text-xs font-semibold text-[#3F4B44] mb-2">
                  Komposisi Bahan Baku yang Dibutuhkan
                </label>

                {loadingKomposisi ? (
                  <p className="text-xs text-[#5B6B61] py-3">Memuat komposisi bahan...</p>
                ) : komposisiList.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Jenis olahan ini belum memiliki konfigurasi komposisi bahan baku.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {komposisiList.map((k) => {
                      const namaSampah =
                        k.jenis_sampah?.nama_sampah ?? k.nama_sampah ?? "Bahan";
                      const stokTersedia = getStokForJenisSampah(k.id_jenis_sampah);

                      return (
                        <div key={k.id_komposisi} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#14201A] truncate">
                              {namaSampah}
                            </label>
                            <span className="text-[10px] text-[#5B6B61]">
                              Stok: {stokTersedia} kg
                            </span>
                          </div>
                          <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F] bg-white">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              max={stokTersedia}
                              placeholder="0,0"
                              value={komposisiInput[k.id_komposisi] ?? ""}
                              onChange={(e) =>
                                handleInputChange(k.id_komposisi, e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 text-sm text-[#14201A] focus:outline-none"
                            />
                            <span className="px-2.5 text-xs text-[#5B6B61] bg-[#F9FAF9] border-l border-[#DDE2DF] py-2 select-none">
                              kg
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#5B6B61]">
                Semua komposisi bahan baku wajib diisi dan tidak boleh melebihi stok yang tersedia.
              </p>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {formError}
                </p>
              )}

              {/* Form Action & Total */}
              <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F3] mt-2">
                <span className="text-xs text-[#5B6B61]">
                  Total bahan baku:{" "}
                  <strong className="text-[#14201A] font-semibold">
                    {Math.round(totalBahanBaku * 100) / 100} kg
                  </strong>
                </span>

                <button
                  type="submit"
                  disabled={submitting || komposisiList.length === 0}
                  className="px-5 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Mulai Pengolahan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Baris Bawah: Card Batch Sedang Diolah */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
              Batch Sedang Diolah
            </h2>
            <span className="text-xs text-[#5B6B61]">
              {batchMeta?.total_data ?? batchList.length} batch dalam proses
            </span>
          </div>

          {/* Table Batch */}
          <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                  <th className="py-3 px-4">ID Batch</th>
                  <th className="py-3 px-4">Jenis Olahan</th>
                  <th className="py-3 px-4">PIC</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right sm:text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loadingBatch ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-[#5B6B61]">
                      Memuat daftar batch...
                    </td>
                  </tr>
                ) : batchList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-[#5B6B61]">
                      Tidak ada batch yang sedang diolah.
                    </td>
                  </tr>
                ) : (
                  batchList.map((b) => {
                    const idOlah = b.id_olah_sampah ?? b.id;
                    const namaOlahan = b.nama_olahan ?? b.jenisOlahan ?? "—";
                    const namaPic = b.nama_pic ?? b.pic ?? "—";

                    return (
                      <tr
                        key={idOlah}
                        className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                      >
                        <td className="py-3.5 px-4 text-sm font-semibold text-[#14201A]">
                          {formatBatchCode(idOlah)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {namaOlahan}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                          {namaPic}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                            Sedang Diolah
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBatchForComplete(b)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#1F6B3F] text-[#1F6B3F] text-xs font-semibold hover:bg-[#E3F1E8] transition-colors cursor-pointer"
                            >
                              <LuCheck size={14} strokeWidth={2.5} />
                              Tandai Selesai
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError("");
                                setBatchToDelete(b);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus batch"
                            >
                              <LuTrash2 size={16} />
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
      </div>

      {/* Pop Up Konfirmasi Tandai Selesai */}
      {selectedBatchForComplete && (
        <PopUpKonfirmasiSelesaiOlah
          batch={selectedBatchForComplete}
          onClose={() => setSelectedBatchForComplete(null)}
          onConfirm={handleConfirmSelesai}
        />
      )}

      {/* Pop Up Konfirmasi Hapus Batch */}
      {batchToDelete && (
        <PopUpKonfirmasiHapus
          title="Hapus Batch Ini?"
          subtitle="Batch yang dihapus tidak dapat dikembalikan"
          details={[
            { label: "ID Batch", value: formatBatchCode(batchToDelete.id_olah_sampah ?? batchToDelete.id) },
            { label: "Jenis Olahan", value: batchToDelete.nama_olahan ?? batchToDelete.jenisOlahan ?? "—" },
            { label: "PIC", value: batchToDelete.nama_pic ?? batchToDelete.pic ?? "—" },
          ]}
          loading={deletingBatch}
          error={deleteError}
          onClose={() => { setBatchToDelete(null); setDeleteError(""); }}
          onConfirm={() => handleHapusBatch(batchToDelete.id_olah_sampah ?? batchToDelete.id)}
        />
      )}
    </div>
  );
}
