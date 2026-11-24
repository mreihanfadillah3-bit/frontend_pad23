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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null); // { type: "sampah" | "olahan", item }
  const [deleteModal, setDeleteModal] = useState(null); // { type: "sampah" | "olahan", item }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function toArray(val) {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    if (Array.isArray(val?.items)) return val.items;
    return [];
  }

  async function load() {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([getJenisSampah(), getJenisOlahan()]);
      setSampah(toArray(s));
      setOlahan(toArray(o));
      setError("");
    } catch (err) {
      setError(formatError(err));
      setSampah([]);
      setOlahan([]);
    } finally {
      setLoading(false);
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
      if (type === "sampah") await deleteJenisSampah(item.id_jenis_sampah || item.id);
      else await deleteJenisOlahan(item.id_jenis_olahan || item.id);
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

  const listSampah = toArray(sampah);
  const listOlahan = toArray(olahan);

  return (
    <>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ── Jenis Sampah ── */}
      <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2DF] mb-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
              Jenis Sampah
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
              Atur satuan dan tarif beli untuk setoran warga.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            onClick={() => setPopup({ type: "sampah", item: null })}
          >
            <MdAdd size={18} />
            Tambah
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAF9] border-b border-[#DDE2DF]">
              <tr className="text-xs text-[#5B6B61]">
                <th className="py-3 px-4 font-normal">Nama</th>
                <th className="py-3 px-4 font-normal">Satuan</th>
                <th className="py-3 px-4 font-normal">Tarif</th>
                <th className="py-3 px-4 font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listSampah.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[#5B6B61]">
                    {loading ? "Memuat data jenis sampah..." : "Belum ada data."}
                  </td>
                </tr>
              ) : (
                listSampah.map((s) => (
                  <tr
                    key={s.id_jenis_sampah || s.id}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {s.nama_sampah || s.nama}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                      {s.satuan_massa || s.satuan || "kg"}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#14201A]">
                      {formatRupiah(s.tarif_jasa_pengelolaan ?? s.tarif ?? s.harga)}
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
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:bg-red-50 border border-red-500 rounded-lg px-3 py-1 transition-colors"
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
      <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6 max-w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2DF] mb-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
              Jenis Olahan
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
              Kelola komposisi bahan baku dan tarif hasil olahan.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            onClick={() => setPopup({ type: "olahan", item: null })}
          >
            <MdAdd size={18} />
            Tambah
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8FAF9] border-b border-[#DDE2DF]">
              <tr className="text-xs text-[#5B6B61]">
                <th className="py-3 px-4 font-normal">Nama</th>
                <th className="py-3 px-4 font-normal">Satuan</th>
                <th className="py-3 px-4 font-normal">Tarif</th>
                <th className="py-3 px-4 font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {listOlahan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[#5B6B61]">
                    {loading ? "Memuat data jenis olahan..." : "Belum ada data."}
                  </td>
                </tr>
              ) : (
                listOlahan.map((o) => (
                  <tr
                    key={o.id_jenis_olahan || o.id}
                    className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                      {o.nama_olahan || o.nama}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                      {o.satuan_massa || "kg"}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#14201A]">
                      {formatRupiah(o.tarif_nilai_olahan ?? o.tarif ?? o.harga)}
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
                          className="text-sm font-semibold text-[#14201A] hover:text-red-600 hover:bg-red-50 border border-red-500 rounded-lg px-3 py-1 transition-colors"
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
