import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import { getWarga, createWarga } from "../../../services/wargaService";
import { createPengumpulan } from "../../../services/pengumpulanSampahService";
import { formatError } from "../../../utils/format";
import PopUpSuksesTambahWarga from "./PopUpSuksesTambahWarga";

const EMPTY_FORM = { nama: "", whatsapp: "" };

export default function TambahSampahPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [sesi, setSesi] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastAddedNota, setLastAddedNota] = useState(null);
  const [showModal, setShowModal] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nama = form.nama.trim();
    const whatsapp = form.whatsapp.trim();

    if (!nama || !whatsapp) {
      setError("Nama warga dan nomor WhatsApp wajib diisi.");
      return;
    }
    if (!/^[0-9+\-\s]{9,20}$/.test(whatsapp)) {
      setError("Nomor WhatsApp tidak valid. Gunakan nomor berawalan 08 atau +62.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      // Backend POST /pengumpulan-sampah menerima langsung nama dan nomor_wa
      const res = await createPengumpulan({
        nama,
        nomor_wa: whatsapp,
      });
      const createdId = res?.id_pengumpulan_sampah ?? res?.id ?? res?.data?.id_pengumpulan_sampah;

      const notaBaru = {
        id: `#A${String(createdId).padStart(2, "0")}`,
        rawId: createdId,
        nama: res?.nama_warga || res?.nama || nama,
        whatsapp: res?.nomor_wa || whatsapp,
      };

      setSesi((prev) => [notaBaru, ...prev]);
      setForm(EMPTY_FORM);
      setLastAddedNota(notaBaru);
      setShowModal(true);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  function handleTambahLagi() {
    setShowModal(false);
  }

  function handleLanjutPilah() {
    setShowModal(false);
    if (lastAddedNota?.rawId) {
      navigate(`/kumpul-sampah/pilah?nota=${encodeURIComponent(lastAddedNota.rawId)}`);
    } else {
      navigate("/kumpul-sampah/pilah");
    }
  }

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Navigation & Header */}
        <div>
          <Link
            to="/kumpul-sampah"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1F6B3F] hover:text-[#185733] mb-2 transition-colors"
          >
            <MdChevronLeft size={20} />
            Kembali ke Ringkasan
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Tambah Sampah
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6B61]">
            Pencatatan data warga yang menyumbangkan sampah pada hari ini
          </p>
        </div>

        {/* Card 1: Input Warga Penyetor */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
              Input Warga Penyetor
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
              Isi data warga untuk membuat nota setoran baru. Semua isian wajib diisi.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Warga */}
              <div>
                <label className="block text-sm font-semibold text-[#3F4B44] mb-2">
                  Nama Warga <span className="font-normal text-[#5B6B61]">(wajib)</span>
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap warga"
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all"
                  required
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-sm font-semibold text-[#3F4B44] mb-2">
                  Nomor WhatsApp <span className="font-normal text-[#5B6B61]">(wajib)</span>
                </label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Contoh: 081234567890"
                  inputMode="tel"
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all"
                  required
                />
                <p className="text-xs text-[#5B6B61] mt-1.5">
                  Nomor aktif berawalan 08 atau +62.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 p-3 text-sm rounded-xl bg-red-50 text-red-700 border border-red-200">
                {error}
              </p>
            )}

            {/* Form Footer */}
            <div className="border-t border-[#DDE2DF] pt-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs text-[#5B6B61]">
                Nota baru akan masuk ke antrian Menunggu Pilah.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/kumpul-sampah")}
                  className="px-5 py-2 text-sm font-semibold text-[#14201A] bg-white border border-[#DDE2DF] rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Card 2: Warga yang Sudah Ditambahkan Sesi Ini */}
        <section className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
              Warga yang Sudah Ditambahkan Sesi Ini
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
              {todayStr} · {sesi.length} warga telah ditambahkan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs text-[#5B6B61]">
                  <th className="py-3 px-4 font-normal">ID Nota</th>
                  <th className="py-3 px-4 font-normal">Nama Warga</th>
                  <th className="py-3 px-4 font-normal">Nomor WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {sesi.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-[#5B6B61]">
                      Belum ada warga ditambahkan pada sesi ini.
                    </td>
                  </tr>
                ) : (
                  sesi.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[#F2F4F3] hover:bg-[#F9FAF9] transition-colors last:border-b-0"
                    >
                      <td className="py-3.5 px-4 text-sm font-bold text-[#14201A]">
                        {s.id}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-medium text-[#14201A]">
                        {s.nama}
                      </td>
                      <td className="py-3.5 px-4 text-sm text-[#3F4B44]">
                        {s.whatsapp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Pop Up Konfirmasi Tambah Warga Lain / Lanjut Pilah */}
      {showModal && (
        <PopUpSuksesTambahWarga
          onTambahLagi={handleTambahLagi}
          onLanjutPilah={handleLanjutPilah}
        />
      )}
    </div>
  );
}
