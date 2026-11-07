import { useState } from "react";
import { MdAdd } from "react-icons/md";
import PopUpTambahDataWarga from "./PopUpTambahDataWarga";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";

const DUMMY = [
  { id: 1, nama: "Rina Wulandari", whatsapp: "0812 3456 7805" },
  { id: 2, nama: "Budi Santoso", whatsapp: "0813 5678 9004" },
  { id: 3, nama: "Umar", whatsapp: "0857 1234 5603" },
  { id: 4, nama: "Siti Aminah", whatsapp: "0812 3456 7890" },
  { id: 5, nama: "Dewi Lestari", whatsapp: "0812 3456 7801" },
];

export default function DataWargaPage() {
  const [warga, setWarga] = useState(DUMMY);
  const [modal, setModal] = useState(null); // null | {type:"tambah"} | {type:"edit", item} | {type:"hapus", item}
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function closeModal() {
    if (!deleting) setModal(null);
  }

  async function handleSave(data) {
    if (modal.type === "tambah") {
      setWarga((prev) => [...prev, { id: Date.now(), ...data }]);
    } else {
      setWarga((prev) => prev.map((w) => (w.id === modal.item.id ? { ...w, ...data } : w)));
    }
    setModal(null);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      setWarga((prev) => prev.filter((w) => w.id !== modal.item.id));
      setModal(null);
    } catch (err) {
      setDeleteError("Gagal menghapus data. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#DDE2DF] mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
            Data Warga/Penyetor
          </h2>
          <p className="mt-0.5 text-sm text-[#5B6B61]">
            Kelola data kontak warga untuk pencatatan setoran sampah.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors"
          onClick={() => setModal({ type: "tambah" })}
        >
          <MdAdd size={18} />
          Tambah Warga
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">WhatsApp</th>
              <th className="py-3 px-4">Aksi</th>
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
                  key={w.id}
                  className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                >
                  <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                    {w.nama}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                    {w.whatsapp}
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
                        className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:border-red-400 hover:bg-red-50 border border-[#DDE2DF] rounded-lg px-3 py-1 transition-colors"
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

      <div className="text-xs text-[#5B6B61] mt-4">
        Menampilkan {warga.length} dari {warga.length} warga
      </div>

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
            { label: "WhatsApp", value: modal.item.whatsapp },
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
