import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { formatError } from "../../../utils/format";

export default function PopUpTambahDataWarga({ onClose, onSave, initialData = null }) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    nama: initialData?.nama ?? "",
    // BE menyimpan field ini sebagai nomor_wa
    nomor_wa: initialData?.nomor_wa ?? initialData?.whatsapp ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleClose() {
    if (!saving) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nama = form.nama.trim();
    const nomor_wa = form.nomor_wa.trim();

    if (!nama || !nomor_wa) {
      setError("Nama dan WhatsApp wajib diisi.");
      return;
    }
    if (!/^[0-9+\-\s]{9,20}$/.test(nomor_wa)) {
      setError("Nomor WhatsApp tidak valid. Gunakan nomor berawalan 08 atau +62.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({ nama, nomor_wa });
    } catch (err) {
      setError(formatError(err) || "Gagal menyimpan data. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Warga" : "Tambah Warga"}
      subtitle="Tambahkan data warga untuk pencatatan setoran sampah. Semua isian wajib diisi."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label className="modal-field-label">
            Nama <span className="required-hint">(wajib)</span>
          </label>
          <input
            className="modal-input"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Sari Wulandari"
            required
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label className="modal-field-label">
            WhatsApp <span className="required-hint">(wajib)</span>
          </label>
          <input
            className="modal-input"
            name="nomor_wa"
            value={form.nomor_wa}
            onChange={handleChange}
            placeholder="0812 3456 7806"
            required
            inputMode="tel"
          />
          <p className="modal-hint">Nomor aktif untuk informasi setoran warga.</p>
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
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Warga"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
