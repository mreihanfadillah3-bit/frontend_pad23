import { useState, useEffect, useCallback } from "react";
import { MdAdd } from "react-icons/md";
import PopupTambahPic from "./PopUpTambahPIC";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";
import { getPicPengolah, createPicPengolah, updatePicPengolah, deletePicPengolah } from "../../../services/picPengolahService";
import { formatError } from "../../../utils/format";

// Helper ID: BE bisa mengembalikan id_pic (sesuai Swagger), id_pic_pengolah, atau id
const getPicId = (item) => item?.id_pic ?? item?.id_pic_pengolah ?? item?.id;

export default function PicPengolahanPage() {
  const [pic, setPic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modal, setModal] = useState(null); // null | {type:"tambah"} | {type:"edit", item} | {type:"hapus", item}
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadPic = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      // Panggil tanpa query parameter agar backend tidak error jika query status tidak didukung
      const data = await getPicPengolah();
      // Saring di frontend: hanya tampilkan PIC yang tidak berstatus nonaktif dan belum dihapus
      const activePic = (data || []).filter(
        (p) =>
          (!p.status || (p.status.toLowerCase() !== "nonaktif" && p.status.toLowerCase() !== "inactive")) &&
          !p.deleted_at
      );
      setPic(activePic);
    } catch (err) {
      console.error("Gagal memuat data PIC:", err);
      setFetchError(formatError(err) || "Gagal memuat data PIC. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPic();
  }, [loadPic]);

  function closeModal() {
    if (!deleting) setModal(null);
  }

  async function handleSave(data) {
    // data = { nama, nomor_wa }
    if (modal.type === "tambah") {
      await createPicPengolah(data);
    } else {
      const picId = getPicId(modal.item);
      if (!picId) throw new Error("ID PIC tidak ditemukan.");
      await updatePicPengolah(picId, data);
    }
    setModal(null);
    await loadPic();
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      const picId = getPicId(modal.item);
      if (!picId) throw new Error("ID PIC tidak ditemukan.");
      await deletePicPengolah(picId);
      setModal(null);
      await loadPic();
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
            PIC Pengolah
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
            Penanggung jawab kegiatan pengolahan sampah.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          onClick={() => setModal({ type: "tambah" })}
        >
          <MdAdd size={18} />
          Tambah PIC
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-10 text-center text-sm text-[#5B6B61]">Memuat data PIC...</div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div className="py-6 text-center">
          <p className="text-sm text-red-600 mb-3">{fetchError}</p>
          <button
            type="button"
            onClick={loadPic}
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
              {pic.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-[#5B6B61]">
                    Belum ada data PIC.
                  </td>
                </tr>
              ) : (
                pic.map((p) => (
                  <tr
                    key={getPicId(p)}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {p.nama}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                      {p.nomor_wa ?? p.whatsapp ?? "-"}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                          onClick={() => setModal({ type: "edit", item: p })}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:bg-red-50 border border-red-500 rounded-lg px-3 py-1 transition-colors"
                          onClick={() => {
                            setDeleteError("");
                            setModal({ type: "hapus", item: p });
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
          Menampilkan {pic.length} dari {pic.length} PIC
        </div>
      )}

      {modal?.type === "tambah" && (
        <PopupTambahPic onClose={closeModal} onSave={handleSave} />
      )}

      {modal?.type === "edit" && (
        <PopupTambahPic onClose={closeModal} onSave={handleSave} initialData={modal.item} />
      )}

      {modal?.type === "hapus" && (
        <PopUpKonfirmasiHapus
          title="Hapus Data Ini?"
          subtitle="Data yang dihapus tidak dapat dikembalikan"
          details={[
            { label: "Data PIC", value: modal.item?.nama },
            { label: "WhatsApp", value: modal.item?.nomor_wa ?? modal.item?.whatsapp ?? "-" },
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
