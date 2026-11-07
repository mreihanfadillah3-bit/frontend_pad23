import { MdWarningAmber } from "react-icons/md";
import "./Modal.css";

export default function PopUpKonfirmasiHapus({
  title = "Hapus Data Ini?",
  subtitle = "Data yang dihapus tidak dapat dikembalikan",
  details = [],
  onClose,
  onConfirm,
  loading = false,
  error = "",
}) {
  return (
    <div className="modal-backdrop" onClick={loading ? undefined : onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-box">
          <MdWarningAmber size={28} />
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-desc">{subtitle}</p>

        {details && details.length > 0 && (
          <div className="confirm-detail-box">
            {details.map((item, idx) => (
              <p key={idx} className="confirm-detail-item">
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
          </div>
        )}

        {error && <p className="modal-error" style={{ marginTop: 16 }}>{error}</p>}

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
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

