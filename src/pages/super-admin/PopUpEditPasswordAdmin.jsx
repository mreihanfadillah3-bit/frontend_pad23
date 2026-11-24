import { useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Modal from "../../components/common/Modal";
import { formatError } from "../../utils/format";

export default function PopUpEditPasswordAdmin({ admin, onClose, onSave }) {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleClose() {
    if (!saving) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      setError("Semua isian wajib diisi.");
      return;
    }

    if (passwordBaru.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password_baru: konfirmasiPassword,
      });
    } catch (err) {
      setError(formatError(err) || "Gagal mengubah password. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Edit Password - ${admin?.nama ?? "Admin"}`}
      subtitle={`Perbarui password akun ${admin?.username ?? ""} untuk menjaga keamanan akses.`}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-field-label">
            Password Lama <span className="required-hint">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPasswordLama ? "text" : "password"}
              className="modal-input pr-10"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPasswordLama((p) => !p)}
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              aria-label={showPasswordLama ? "Sembunyikan password" : "Lihat password"}
              tabIndex={-1}
            >
              {showPasswordLama ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>
        </div>

        <div className="modal-field">
          <label className="modal-field-label">
            Password Baru <span className="required-hint">(wajib)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPasswordBaru ? "text" : "password"}
              className="modal-input pr-10"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordBaru((p) => !p)}
              className="absolute right-3 text-[#5B6B61] hover:text-[#14201A] transition-colors p-1"
              aria-label={showPasswordBaru ? "Sembunyikan password" : "Lihat password"}
              tabIndex={-1}
            >
              {showPasswordBaru ? <LuEyeOff size={18} /> : <LuEye size={18} />}
            </button>
          </div>
          <p className="modal-hint">Minimal 8 karakter, gabungkan huruf dan angka.</p>
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
            {saving ? "Menyimpan..." : "Simpan Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
