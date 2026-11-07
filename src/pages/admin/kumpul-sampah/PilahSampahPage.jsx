import { useMemo, useReducer, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  MdChevronLeft,
  MdAdd,
  MdCheck,
  MdCheckCircle,
  MdInfoOutline,
} from "react-icons/md";
import { LuTrash2 } from "react-icons/lu";
import PopUpPilahSampah from "./PopUpPilahSampah";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";
import {
  addItem,
  deleteItem,
  getItems,
  getJenisSampah,
  getNotaList,
  tandaiLunas,
} from "../../../utils/notaMock";

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu", label: "Menunggu Pilah" },
  { key: "sedang", label: "Menunggu Bayar" },
  { key: "lunas", label: "Selesai" },
];

const EMPTY_FORM = { jenisId: "", berat: "" };
const round3 = (n) => Math.round(n * 1000) / 1000;

export default function PilahSampahPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [, refresh] = useReducer((x) => x + 1, 0);

  const jenisList = getJenisSampah();
  const allNota = getNotaList();

  const [tab, setTab] = useState("semua");
  const [notaId, setNotaId] = useState(searchParams.get("nota") ?? allNota[0]?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [showNota, setShowNota] = useState(false);

  const antrianFiltered = useMemo(() => {
    if (tab === "semua") return allNota;
    return allNota.filter((n) => n.status === tab);
  }, [allNota, tab]);

  const nota = allNota.find((n) => n.id === notaId) ?? allNota[0];
  const items = nota ? getItems(nota.id) : [];

  const ringkasan = useMemo(
    () => ({
      totalItem: items.length,
      totalBerat: round3(items.reduce((sum, i) => sum + i.berat, 0)),
      totalHarga: items.reduce((sum, i) => sum + i.harga, 0),
    }),
    [items]
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setError("");
  }

  function pilihNota(id) {
    setNotaId(id);
    resetForm();
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleTambahBaris(e) {
    e.preventDefault();
    if (!form.jenisId) {
      setError("Pilih jenis sampah terlebih dahulu.");
      return;
    }
    const berat = parseFloat(form.berat);
    if (!Number.isFinite(berat) || berat <= 0) {
      setError("Berat harus lebih dari 0.");
      return;
    }

    try {
      addItem(nota.id, form);
      resetForm();
      refresh();
    } catch (err) {
      setError(formatError(err));
    }
  }

  function handleHapusBaris(itemId) {
    try {
      deleteItem(nota.id, itemId);
      refresh();
    } catch (err) {
      setError(formatError(err));
    }
  }

  function handleLunas() {
    try {
      tandaiLunas(nota.id);
      refresh();
    } catch (err) {
      setError(formatError(err));
    }
  }

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/kumpul-sampah"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] mb-2 transition-colors"
          >
            <MdChevronLeft size={20} />
            Kembali ke Ringkasan
          </Link>
          <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
            Pilah Sampah
          </h1>
          <p className="mt-1 text-sm text-[#5B6B61]">
            Pilih nota antrian, catat jenis dan berat sampah, lalu siapkan pembayaran
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Card 1: Pilih Nota Antrian */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-3">
                Pilih Nota Antrian
              </h2>

              {/* Tabs Filter */}
              <div className="flex items-center gap-6 border-b border-[#DDE2DF] mb-4 text-sm">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`pb-2.5 font-medium transition-colors ${
                      tab === t.key
                        ? "font-semibold text-[#1F6B3F] border-b-2 border-[#1F6B3F] -mb-[1px]"
                        : "text-[#5B6B61] hover:text-[#14201A]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Horizontal / Grid Nota Cards */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {antrianFiltered.map((n) => {
                  const isSelected = n.id === nota?.id;
                  const labelStatus =
                    n.status === "menunggu"
                      ? "Menunggu Pilah"
                      : n.status === "sedang"
                      ? "Menunggu Bayar"
                      : "Selesai";

                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => pilihNota(n.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between shrink-0 min-w-[200px] ${
                        isSelected
                          ? "border-2 border-[#1F6B3F] bg-white shadow-xs"
                          : "border-[#DDE2DF] bg-white hover:bg-[#F9FAF9]"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isSelected ? "text-[#1F6B3F]" : "text-[#14201A]"
                          }`}
                        >
                          {n.id} · {n.nama}
                        </p>
                        <p className="text-xs text-[#5B6B61] mt-0.5">
                          {labelStatus}
                        </p>
                      </div>
                      {isSelected && (
                        <MdCheckCircle
                          size={18}
                          className="text-[#1F6B3F] shrink-0 ml-2"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Detail Antrian Form & Table */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
                Detail Antrian – {nota?.id} {nota?.nama}
              </h2>

              {/* Input Row */}
              <form onSubmit={handleTambahBaris} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                      Jenis Sampah
                    </label>
                    <select
                      name="jenisId"
                      value={form.jenisId}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F]"
                    >
                      <option value="">Pilih jenis sampah</option>
                      {jenisList.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nama} (Rp {j.hargaPerKg.toLocaleString("id-ID")}/kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
                      Berat
                    </label>
                    <div className="flex items-center border border-[#DDE2DF] rounded-xl overflow-hidden focus-within:border-[#1F6B3F] focus-within:ring-1 focus-within:ring-[#1F6B3F]">
                      <input
                        type="number"
                        name="berat"
                        min="0"
                        step="0.1"
                        placeholder="0,0"
                        value={form.berat}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 text-sm text-[#14201A] focus:outline-none"
                      />
                      <span className="px-3 text-xs font-semibold text-[#5B6B61] bg-[#F9FAF9] border-l border-[#DDE2DF] py-3">
                        kg
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#1F6B3F] text-[#1F6B3F] text-sm font-semibold rounded-xl hover:bg-[#E3F1E8] transition-colors whitespace-nowrap"
                    >
                      <MdAdd size={16} />
                      Tambah Baris
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {error}
                  </p>
                )}
              </form>

              {/* Sub-section: Detail Sampah */}
              <div className="mt-6 pt-5 border-t border-[#DDE2DF]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#14201A]">
                    Detail Sampah
                  </h3>
                  <span className="text-xs text-[#5B6B61]">
                    {items.length} jenis · {formatKg(ringkasan.totalBerat)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
                        <th className="py-2.5 px-4">Jenis Sampah</th>
                        <th className="py-2.5 px-4">Berat</th>
                        <th className="py-2.5 px-4">Harga</th>
                        <th className="py-2.5 px-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-xs text-[#5B6B61]"
                          >
                            Belum ada baris sampah ditambahkan.
                          </td>
                        </tr>
                      ) : (
                        items.map((i) => (
                          <tr
                            key={i.id}
                            className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                          >
                            <td className="py-3 px-4">
                              <p className="text-sm font-medium text-[#14201A]">
                                {i.jenis}
                              </p>
                              <p className="text-xs text-[#5B6B61]">
                                Rp {(i.hargaPerKg ?? 0).toLocaleString("id-ID")} / kg
                              </p>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#14201A]">
                              {formatKg(i.berat)}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-[#14201A]">
                              {formatRupiah(i.harga)}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleHapusBaris(i.id)}
                                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Hapus item"
                              >
                                <LuTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Nota (Side Panel) */}
          <div className="flex flex-col gap-4">
            {/* Card: Ringkasan Nota */}
            <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#14201A] font-jakarta mb-4">
                Ringkasan Nota
              </h2>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#14201A] font-jakarta">
                  {nota?.id}
                </span>
                {nota?.status === "menunggu" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                    Menunggu Pilah
                  </span>
                )}
                {nota?.status === "sedang" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                    Menunggu Bayar
                  </span>
                )}
                {nota?.status === "lunas" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    Selesai
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-[#14201A]">{nota?.nama}</p>
                <p className="text-xs text-[#5B6B61] mt-0.5">
                  {nota?.tanggal} · 09.30 WIB
                </p>
                <p className="text-xs text-[#5B6B61]">{nota?.whatsapp}</p>
              </div>

              <div className="border-t border-[#DDE2DF] my-5" />

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-[#5B6B61]">Total berat</span>
                <span className="font-bold text-[#14201A]">
                  {formatKg(ringkasan.totalBerat)}
                </span>
              </div>

              <div className="mb-6">
                <span className="text-sm text-[#5B6B61] block">Total biaya</span>
                <p className="text-3xl font-extrabold text-[#14201A] font-jakarta mt-1">
                  {formatRupiah(ringkasan.totalHarga)}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => setShowNota(true)}
                  className="w-full py-3 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-50"
                >
                  Generate Nota & Lanjut
                </button>

                <button
                  type="button"
                  onClick={handleLunas}
                  disabled={nota?.status === "lunas" || items.length === 0}
                  className="w-full py-2.5 border border-[#1F6B3F] text-[#1F6B3F] text-sm font-semibold rounded-xl hover:bg-[#E3F1E8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-[#DDE2DF] disabled:text-[#9CA3AF]"
                >
                  <MdCheck size={18} />
                  Tandai Lunas
                </button>
              </div>

              <p className="text-xs text-[#5B6B61] text-center mt-3 leading-relaxed">
                Tandai lunas hanya setelah pembayaran kepada warga selesai.
              </p>
            </div>

            {/* Callout Info */}
            <div className="p-4 rounded-xl bg-white border border-[#DDE2DF] shadow-sm flex items-start gap-3">
              <MdInfoOutline size={20} className="text-[#1F6B3F] shrink-0 mt-0.5" />
              <p className="text-xs text-[#5B6B61] leading-relaxed">
                Harga dihitung dari berat × harga per kg. Periksa rincian sebelum
                membuat nota.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showNota && (
        <PopUpPilahSampah
          nota={nota}
          items={items}
          onClose={() => setShowNota(false)}
          onLunas={handleLunas}
        />
      )}
    </div>
  );
}
