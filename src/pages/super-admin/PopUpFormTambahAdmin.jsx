import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Modal from "../../components/common/Modal";
import { formatError } from "../../utils/format";

export default function PopUpFormTambahAdmin({ onClose, onSave }) {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleClose() {
    if (!saving) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanNama = nama.trim();
    const cleanUsername = username.trim();

    if (!cleanNama || !cleanUsername || !password || !konfirmasiPassword) {
      setError("Semua isian wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== konfirmasiPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        nama: cleanNama,
        username: cleanUsername,
        password,
        konfirmasi_password: konfirmasiPassword,
      });
    } catch (err) {
      setError(formatError(err) || "Gagal menambahkan akun admin. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Tambah Admin"
      subtitle="Tambahkan akun admin untuk mengelola operasional SumberArum. Semua isian wajib diisi."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-field-label">
            Nama <span className="required-hint">(wajib)</span>
          </label>
          <input
            type="text"
            className="modal-input"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Sari Wulandari"
            required
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label className="modal-field-label">
            Username <span className="required-hint">(wajib)</span>
          </label>
          <input
            type="text"
            className="modal-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="sari.admin04"
            required
            autoComplete="username"
          />
        </div>

        <div className="modal-field">
          <label className="modal-field-label">
            Password <span className="required-hint">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              className="modal-input pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              tabIndex={-1}
            >
              {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-field-label">
            Konfirmasi Password <span className="required-hint">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showKonfirmasiPassword ? "text" : "password"}
              className="modal-input pr-10"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowKonfirmasiPassword((p) => !p)}
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              aria-label={showKonfirmasiPassword ? "Sembunyikan password" : "Lihat password"}
              tabIndex={-1}
            >
              {showKonfirmasiPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={handleClose}
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="modal-btn-submit"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Tambah Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
