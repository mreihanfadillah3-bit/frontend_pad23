import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { createJenisOlahan, updateJenisOlahan } from "../../../services/jenisOlahanService";
import { formatError } from "../../../utils/format";

export default function PopUpTambahJenisOlahan({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [nama, setNama] = useState(item?.nama_olahan ?? "");
  const [tarif, setTarif] = useState(item?.tarif_nilai_olahan ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (Number(tarif) <= 0) {
      setError("Nominal tarif harus lebih besar dari 0.");
      return;
    }

    setSaving(true);
    const payload = {
      nama_olahan: nama,
      tarif_nilai_olahan: Number(tarif),
    };
    try {
      if (isEdit) await updateJenisOlahan(item.id_jenis_olahan, payload);
      else await createJenisOlahan(payload);
      onSaved();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Jenis Olahan" : "Tambah Jenis Olahan"}
      subtitle="Tentukan tarif dan nama untuk jenis olahan baru."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {/* Nama */}
        <div className="modal-field">
          <label className="modal-field-label">
            Nama <span className="required-hint">(wajib)</span>
          </label>
          <input
            className="modal-input"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama jenis olahan"
            required
          />
        </div>

        {/* Tarif */}
        <div className="modal-field">
          <label className="modal-field-label">
            Tarif <span className="required-hint">(wajib)</span>
          </label>
          <div className="modal-tarif-wrapper">
            <span className="modal-tarif-prefix">Rp</span>
            <input
              className="modal-input"
              type="number"
              min="1"
              value={tarif}
              onChange={(e) => setTarif(e.target.value)}
              placeholder="0"
              required
            />
            <span className="modal-tarif-suffix">/ kg</span>
          </div>
          <p className="modal-hint">Nominal tarif harus lebih besar dari 0.</p>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="modal-btn-submit" disabled={saving}>
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Jenis Olahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
