import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { getJenisSampah, deleteJenisSampah } from "../../../services/jenisSampahService";
import { getJenisOlahan, deleteJenisOlahan } from "../../../services/jenisOlahanService";
import { formatRupiah, formatError } from "../../../utils/format";
import PopUpTambahJenisSampah from "./PopUpTambahJenisSampah";
import PopUpTambahJenisOlahan from "./PopUpTambahJenisOlahan";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";

export default function DataSampahOlahanPage() {
  const [sampah, setSampah] = useState([]);
  const [olahan, setOlahan] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null); // { type: "sampah" | "olahan", item }
  const [deleteModal, setDeleteModal] = useState(null); // { type: "sampah" | "olahan", item }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function load() {
    try {
      const [s, o] = await Promise.all([getJenisSampah(), getJenisOlahan()]);
      setSampah(s ?? []);
      setOlahan(o ?? []);
    } catch (err) {
      setError(formatError(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirmDelete() {
    if (!deleteModal) return;
    const { type, item } = deleteModal;
    setDeleting(true);
    setDeleteError("");
    try {
      if (type === "sampah") await deleteJenisSampah(item.id_jenis_sampah);
      else await deleteJenisOlahan(item.id_jenis_olahan);
      setDeleteModal(null);
      load();
    } catch (err) {
      setDeleteError(formatError(err));
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved() {
    setPopup(null);
    load();
  }

  return (
    <>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ── Jenis Sampah ── */}
      <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE2DF] mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
              Jenis Sampah
            </h2>
            <p className="mt-0.5 text-sm text-[#5B6B61]">
              Atur satuan dan tarif beli untuk setoran warga.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors"
            onClick={() => setPopup({ type: "sampah", item: null })}
          >
            <MdAdd size={18} />
            Tambah
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sampah.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[#5B6B61]">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                sampah.map((s) => (
                  <tr
                    key={s.id_jenis_sampah}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {s.nama_sampah}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                      {s.satuan_massa}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#14201A]">
                      {formatRupiah(s.tarif_jasa_pengelolaan)}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                          onClick={() => setPopup({ type: "sampah", item: s })}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:border-red-400 hover:bg-red-50 border border-[#DDE2DF] rounded-lg px-3 py-1 transition-colors"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteModal({ type: "sampah", item: s });
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
      </section>

      {/* ── Jenis Olahan ── */}
      <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE2DF] mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
              Jenis Olahan
            </h2>
            <p className="mt-0.5 text-sm text-[#5B6B61]">
              Kelola komposisi bahan baku dan tarif hasil olahan.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors"
            onClick={() => setPopup({ type: "olahan", item: null })}
          >
            <MdAdd size={18} />
            Tambah
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {olahan.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-[#5B6B61]">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                olahan.map((o) => (
                  <tr
                    key={o.id_jenis_olahan}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {o.nama_olahan}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#14201A]">
                      {formatRupiah(o.tarif_nilai_olahan)}
                    </td>
                    <td className="py-3.5 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                          onClick={() => setPopup({ type: "olahan", item: o })}
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:border-red-400 hover:bg-red-50 border border-[#DDE2DF] rounded-lg px-3 py-1 transition-colors"
                          onClick={() => {
                            setDeleteError("");
                            setDeleteModal({ type: "olahan", item: o });
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
      </section>

      {popup?.type === "sampah" && (
        <PopUpTambahJenisSampah
          item={popup.item}
          onClose={() => setPopup(null)}
          onSaved={handleSaved}
        />
      )}
      {popup?.type === "olahan" && (
        <PopUpTambahJenisOlahan
          item={popup.item}
          onClose={() => setPopup(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteModal && (
        <PopUpKonfirmasiHapus
          title="Hapus Data Ini?"
          subtitle="Data yang dihapus tidak dapat dikembalikan"
          details={
            deleteModal.type === "sampah"
              ? [
                  { label: "Jenis sampah", value: deleteModal.item.nama_sampah },
                  { label: "Tarif", value: formatRupiah(deleteModal.item.tarif_jasa_pengelolaan) },
                ]
              : [
                  { label: "Jenis olahan", value: deleteModal.item.nama_olahan },
                  { label: "Tarif", value: formatRupiah(deleteModal.item.tarif_nilai_olahan) },
                ]
          }
          onClose={() => setDeleteModal(null)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
          error={deleteError}
        />
      )}
    </>
  );
}
