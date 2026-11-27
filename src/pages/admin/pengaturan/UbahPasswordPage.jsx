import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { changePassword } from "../../../services/authService";
import { formatError } from "../../../utils/format";

const EMPTY = { lama: "", baru: "", konfirmasi: "" };

export default function UbahPasswordPage() {
  const [form, setForm] = useState(EMPTY);
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.lama || !form.baru || !form.konfirmasi) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (form.baru.length < 8 || !/[a-zA-Z]/.test(form.baru) || !/\d/.test(form.baru)) {
      setError("Password baru minimal 8 karakter dengan kombinasi huruf dan angka.");
      return;
    }
    if (form.baru === form.lama) {
      setError("Password baru tidak boleh sama dengan password lama.");
      return;
    }
    if (form.baru !== form.konfirmasi) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await changePassword(form.lama, form.baru, form.konfirmasi);
      setSuccess(res?.message || "Password berhasil diubah.");
      setForm(EMPTY);
    } catch (err) {
      setError(formatError(err) || "Gagal mengubah password. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6 max-w-full overflow-hidden">
      {/* Header with Divider */}
      <div className="pb-4 border-b border-[#DDE2DF] mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
          Ubah Password
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
          Perbarui password secara berkala untuk menjaga keamanan akun Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Password Lama */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#3F4B44] mb-2">
            Password Lama <span className="font-normal text-[#5B6B61]">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all pr-10"
              type={showLama ? "text" : "password"}
              name="lama"
              value={form.lama}
              onChange={handleChange}
              placeholder="Masukkan password lama"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              onClick={() => setShowLama((p) => !p)}
              aria-label={showLama ? "Sembunyikan password" : "Lihat password"}
            >
              {showLama ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </button>
          </div>
        </div>

        {/* Password Baru */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#3F4B44] mb-2">
            Password Baru <span className="font-normal text-[#5B6B61]">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all pr-10"
              type={showBaru ? "text" : "password"}
              name="baru"
              value={form.baru}
              onChange={handleChange}
              placeholder="Masukkan password baru"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              onClick={() => setShowBaru((p) => !p)}
              aria-label={showBaru ? "Sembunyikan password" : "Lihat password"}
            >
              {showBaru ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </button>
          </div>
          <p className="text-xs text-[#5B6B61] mt-1.5">
            Minimal 8 karakter, gabungkan huruf dan angka.
          </p>
        </div>

        {/* Konfirmasi Password */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#3F4B44] mb-2">
            Konfirmasi Password <span className="font-normal text-[#5B6B61]">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              className="w-full px-4 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-2 focus:ring-[#1F6B3F]/15 transition-all pr-10"
              type={showKonfirmasi ? "text" : "password"}
              name="konfirmasi"
              value={form.konfirmasi}
              onChange={handleChange}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              onClick={() => setShowKonfirmasi((p) => !p)}
              aria-label={showKonfirmasi ? "Sembunyikan password" : "Lihat password"}
            >
              {showKonfirmasi ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </button>
          </div>
          <p className="text-xs text-[#5B6B61] mt-1.5">
            Ketik ulang password baru yang sama.
          </p>
        </div>

        {error && (
          <p className="mb-4 p-3 text-sm rounded-xl bg-red-50 text-red-700 border border-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 p-3 text-sm rounded-xl bg-green-50 text-green-800 border border-green-200">
            {success}
          </p>
        )}

        <div className="border-t border-[#DDE2DF] pt-5 mt-4 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-60 cursor-pointer text-center"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
