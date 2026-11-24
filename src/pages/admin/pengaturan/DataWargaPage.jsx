import { useState, useEffect, useCallback } from "react";
import { MdAdd } from "react-icons/md";
import PopUpTambahDataWarga from "./PopUpTambahDataWarga";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";
import { getWarga, createWarga, updateWarga, deleteWarga } from "../../../services/wargaService";
import { formatError } from "../../../utils/format";

const getWargaId = (item) => item?.id_warga ?? item?.id;

export default function DataWargaPage() {
  const [warga, setWarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState(null); // null | {type:"tambah"} | {type:"edit", item} | {type:"hapus", item}
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadWarga = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      // Panggil getWarga tanpa query parameter agar backend tidak error jika kolom status tidak diindeks/berbeda
      const data = await getWarga();
      // Saring di frontend: hanya tampilkan warga yang tidak berstatus nonaktif dan belum dihapus
      const activeWarga = (data || []).filter(
        (w) =>
          (!w.status || (w.status.toLowerCase() !== "nonaktif" && w.status.toLowerCase() !== "inactive")) &&
          !w.deleted_at
      );
      setWarga(activeWarga);
    } catch (err) {
      console.error("Gagal memuat data warga:", err);
      setFetchError(formatError(err) || "Gagal memuat data warga. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarga();
  }, [loadWarga]);

  function closeModal() {
    if (!deleting) setModal(null);
  }

  async function handleSave(data) {
    // data = { nama, nomor_wa } — dikirim dari PopUp
    if (modal.type === "tambah") {
      await createWarga(data);
    } else {
      const wargaId = getWargaId(modal.item);
      if (!wargaId) throw new Error("ID warga tidak ditemukan.");
      await updateWarga(wargaId, data);
    }
    setModal(null);
    await loadWarga();
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const wargaId = getWargaId(modal.item);
      if (!wargaId) throw new Error("ID warga tidak ditemukan.");
      await deleteWarga(wargaId);
      setModal(null);
      await loadWarga();
    } catch (err) {
      setDeleteError(formatError(err) || "Gagal menghapus data. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2DF] mb-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
            Data Warga/Penyetor
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
            Kelola data kontak warga untuk pencatatan setoran sampah.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          onClick={() => setModal({ type: "tambah" })}
        >
          <MdAdd size={18} />
          Tambah Warga
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-10 text-center text-sm text-[#5B6B61]">Memuat data warga...</div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div className="py-6 text-center">
          <p className="text-sm text-red-600 mb-3">{fetchError}</p>
          <button
            type="button"
            onClick={loadWarga}
            className="text-sm font-semibold text-[#1F6B3F] hover:underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !fetchError && (
        <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAF9] border-b border-[#DDE2DF]">
              <tr className="text-xs text-[#5B6B61]">
                <th className="py-3 px-4 font-normal">Nama</th>
                <th className="py-3 px-4 font-normal">WhatsApp</th>
                <th className="py-3 px-4 font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {warga.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-[#5B6B61]">
                    Belum ada data warga.
                  </td>
                </tr>
              ) : (
                warga.map((w) => (
                  <tr
                    key={getWargaId(w)}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {w.nama}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                      {w.nomor_wa ?? w.whatsapp ?? "-"}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                          onClick={() => setModal({ type: "edit", item: w })}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:bg-red-50 border border-red-500 rounded-lg px-3 py-1 transition-colors"
                          onClick={() => {
                            setDeleteError("");
                            setModal({ type: "hapus", item: w });
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !fetchError && (
        <div className="text-xs text-[#5B6B61] mt-4">
          Menampilkan {warga.length} dari {warga.length} warga
        </div>
      )}

      {modal?.type === "tambah" && (
        <PopUpTambahDataWarga onClose={closeModal} onSave={handleSave} />
      )}

      {modal?.type === "edit" && (
        <PopUpTambahDataWarga onClose={closeModal} onSave={handleSave} initialData={modal.item} />
      )}

      {modal?.type === "hapus" && (
        <PopUpKonfirmasiHapus
          title="Hapus Data Ini?"
          subtitle="Data yang dihapus tidak dapat dikembalikan"
          details={[
            { label: "Data warga", value: modal.item.nama },
            { label: "WhatsApp", value: modal.item.nomor_wa ?? "-" },
          ]}
          onClose={closeModal}
          onConfirm={handleDelete}
          loading={deleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
