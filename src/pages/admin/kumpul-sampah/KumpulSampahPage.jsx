import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdVisibility,
  MdCheck,
  MdRecycling,
  MdAccountBalanceWallet,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import {LuPencil} from "react-icons/lu";
import { LuTrash2 } from "react-icons/lu";
import PopUpKonfirmasiHapus from "../../../components/common/PopUpKonfirmasiHapus";
import { formatKg, formatRupiah } from "../../../utils/format";
import {
  getItems,
  getNotaList,
  getRingkasanTotal,
  tandaiLunas,
  deleteNota,
} from "../../../utils/notaMock";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu", label: "Menunggu Pilah" },
  { key: "sedang", label: "Menunggu Bayar" },
  { key: "lunas", label: "Selesai" },
];

export default function KumpulSampahPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("semua");
  const [, setTick] = useState(0);
  const [notaToDelete, setNotaToDelete] = useState(null);

  const ringkasan = getRingkasanTotal();
  const nota = getNotaList();

  const filtered = useMemo(() => {
    if (tab === "semua") return nota;
    return nota.filter((n) => n.status === tab);
  }, [nota, tab]);

  function handleTandaiLunas(notaId) {
    tandaiLunas(notaId);
    setTick((t) => t + 1);
  }

  function confirmHapusNota() {
    if (notaToDelete) {
      deleteNota(notaToDelete.id);
      setNotaToDelete(null);
      setTick((t) => t + 1);
    }
  }

  function formatTanggal(str) {
    if (!str) return "—";
    const d = new Date(str);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
              Kumpul Sampah
            </h1>
            <p className="mt-1 text-sm text-[#14201A]">
              Catat setoran sampah warga, lihat status nota dan pembayarannya
            </p>
          </div>
          <Link
            to="/kumpul-sampah/tambah"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-sm"
          >
            <MdAdd size={18} />
            Tambah Setoran
          </Link>
        </div>

        {/* Card: Daftar Antrian Nota */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
              Daftar Antrian Nota
            </h2>
            <span className="text-xs text-[#5B6B61]">
              {nota.length} nota tercatat
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-[#DDE2DF] mt-2 mb-4 text-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`pb-3 font-medium transition-colors ${
                  tab === t.key
                    ? "font-semibold text-[#1F6B3F] border-b-2 border-[#1F6B3F] -mb-[1px]"
                    : "text-[#5B6B61] hover:text-[#14201A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                  <th className="py-3 px-4">ID Nota</th>
                  <th className="py-3 px-4">Nama Warga</th>
                  <th className="py-3 px-4">Tanggal ↓</th>
                  <th className="py-3 px-4">Total Biaya</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#5B6B61]">
                      Belum ada nota untuk kategori ini.
                    </td>
                  </tr>
                ) : (
                  filtered.map((n) => {
                    const items = getItems(n.id);
                    const totalBiaya = items.reduce((sum, i) => sum + i.harga, 0);

                    return (
                      <tr
                        key={n.id}
                        className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                      >
                        <td className="py-3.5 px-4 text-sm font-bold text-[#14201A]">
                          {n.id}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {n.nama}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-[#5B6B61]">
                          {formatTanggal(n.tanggal)}
                        </td>
                        <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                          {items.length === 0 ? "—" : formatRupiah(totalBiaya)}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          {n.status === "menunggu" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                              Menunggu Pilah
                            </span>
                          )}
                          {n.status === "sedang" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                              Menunggu Bayar
                            </span>
                          )}
                          {n.status === "lunas" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                              Selesai
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            {n.status === "menunggu" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/kumpul-sampah/pilah?nota=${encodeURIComponent(n.id)}`)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                              >
                                <LuPencil size={16} />
                                Pilah
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/kumpul-sampah/pilah?nota=${encodeURIComponent(n.id)}`)
                                }
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6B3F] hover:text-[#185733] px-2 py-1 transition-colors"
                              >
                                <MdVisibility size={16} />
                                Lihat
                              </button>
                            )}

                            {n.status === "sedang" ? (
                              <button
                                type="button"
                                onClick={() => handleTandaiLunas(n.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#1F6B3F] text-[#1F6B3F] text-xs font-semibold hover:bg-[#E3F1E8] transition-colors"
                              >
                                <MdCheck size={14} />
                                Tandai Lunas
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#DDE2DF] text-[#9CA3AF] text-xs font-semibold cursor-not-allowed bg-gray-50/50"
                              >
                                <MdCheck size={14} />
                                Tandai Lunas
                              </button>
                            )}

                            {(n.status === "menunggu" || n.status === "lunas") && (
                              <button
                                type="button"
                                onClick={() => setNotaToDelete(n)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                title="Hapus Nota"
                              >
                                <LuTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F2F4F3]">
            <span className="text-xs text-[#5B6B61]">
              Menampilkan 1–{filtered.length} dari {nota.length} nota
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDE2DF] text-xs text-[#5B6B61] hover:bg-gray-50"
              >
                <MdChevronLeft size={16} />
              </button>
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#E3F1E8] text-xs font-semibold text-[#1F6B3F]">
                1
              </span>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#DDE2DF] text-xs text-[#5B6B61] hover:bg-gray-50"
              >
                <MdChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Stat Cards: Sampah Terkumpul & Nilai Sampah */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#3F4B44]">
                Sampah Terkumpul
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                <MdRecycling size={22} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#14201A] font-jakarta mt-4">
              {formatKg(ringkasan.totalKg)}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#3F4B44]">
                Nilai Sampah Tercatat
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#E3F1E8] flex items-center justify-center text-[#1F6B3F]">
                <MdAccountBalanceWallet size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#14201A] font-jakarta mt-4">
              {formatRupiah(ringkasan.totalNilai)}
            </p>
          </div>
        </div>
      </div>

      {notaToDelete && (
        <PopUpKonfirmasiHapus
          title="Hapus Nota Ini?"
          subtitle="Nota yang dihapus tidak dapat dikembalikan"
          details={[
            { label: "ID Nota", value: notaToDelete.id },
            { label: "Nama Warga", value: notaToDelete.nama },
          ]}
          onClose={() => setNotaToDelete(null)}
          onConfirm={confirmHapusNota}
        />
      )}
    </div>
  );
}
