import { MdLogout } from "react-icons/md";
import "./Modal.css";

export default function PopUpKonfirmasiKeluar({
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <div className="modal-backdrop" onClick={loading ? undefined : onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-box">
          <MdLogout size={26} />
        </div>

        <h2 className="confirm-title">Keluar dari Akun?</h2>
        <p className="confirm-desc">
          Sesi admin akan diakhiri. Pastikan perubahan sudah disimpan. Anda perlu
          masuk kembali untuk mengelola data.
        </p>

        <div className="confirm-actions">
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="button"
            className="modal-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}

