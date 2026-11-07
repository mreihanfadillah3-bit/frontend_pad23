import { useState } from "react";
import { MdAdd } from "react-icons/md";
import PopupTambahPic from "./PopUpTambahPIC";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";

const DUMMY = [
  { id: 1, nama: "Budi Santoso", whatsapp: "0813 5678 9004" },
  { id: 2, nama: "Siti Aminah", whatsapp: "0812 3456 7890" },
  { id: 3, nama: "Dewi Lestari", whatsapp: "0812 3456 7801" },
  { id: 4, nama: "Umar", whatsapp: "0857 1234 5603" },
];

export default function PicPengolahanPage() {
  const [pic, setPic] = useState(DUMMY);
  const [modal, setModal] = useState(null); // null | {type:"tambah"} | {type:"edit", item} | {type:"hapus", item}
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function closeModal() {
    if (!deleting) setModal(null);
  }

  async function handleSave(data) {
    if (modal.type === "tambah") {
      setPic((prev) => [...prev, { id: Date.now(), ...data }]);
    } else {
      setPic((prev) => prev.map((p) => (p.id === modal.item.id ? { ...p, ...data } : p)));
    }
    setModal(null);
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      setPic((prev) => prev.filter((p) => p.id !== modal.item.id));
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
            PIC Pengolah
          </h2>
          <p className="mt-0.5 text-sm text-[#5B6B61]">
            Penanggung jawab kegiatan pengolahan sampah.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors"
          onClick={() => setModal({ type: "tambah" })}
        >
          <MdAdd size={18} />
          Tambah PIC
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
            {pic.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-sm text-[#5B6B61]">
                  Belum ada data PIC.
                </td>
              </tr>
            ) : (
              pic.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                >
                  <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                    {p.nama}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                    {p.whatsapp}
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
                        className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:border-red-400 hover:bg-red-50 border border-[#DDE2DF] rounded-lg px-3 py-1 transition-colors"
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

      <div className="text-xs text-[#5B6B61] mt-4">
        Menampilkan {pic.length} dari {pic.length} PIC pengolah
      </div>

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
            { label: "Data PIC", value: modal.item.nama },
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
