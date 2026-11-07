import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { createJenisSampah, updateJenisSampah } from "../../../services/jenisSampahService";
import { SATUAN_OPTIONS, formatError } from "../../../utils/format";

export default function PopUpTambahJenisSampah({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [nama, setNama] = useState(item?.nama_sampah ?? "");
  const [satuan, setSatuan] = useState(item?.satuan_massa ?? SATUAN_OPTIONS[0]);
  const [tarif, setTarif] = useState(item?.tarif_jasa_pengelolaan ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = SATUAN_OPTIONS.includes(satuan) ? SATUAN_OPTIONS : [satuan, ...SATUAN_OPTIONS];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (Number(tarif) <= 0) {
      setError("Nominal tarif harus lebih besar dari 0.");
      return;
    }

    setSaving(true);
    const payload = {
      nama_sampah: nama,
      satuan_massa: satuan,
      tarif_jasa_pengelolaan: Number(tarif),
    };
    try {
      if (isEdit) await updateJenisSampah(item.id_jenis_sampah, payload);
      else await createJenisSampah(payload);
      onSaved();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Jenis Sampah" : "Tambah Jenis Sampah"}
      subtitle="Atur nama, satuan, dan tarif beli untuk setoran warga. Semua isian wajib diisi."
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
            placeholder="Masukkan nama jenis sampah"
            required
          />
        </div>

        {/* Satuan */}
        <div className="modal-field">
          <label className="modal-field-label">
            Satuan <span className="required-hint">(wajib)</span>
          </label>
          <select
            className="modal-select"
            value={satuan}
            onChange={(e) => setSatuan(e.target.value)}
          >
            {options.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Tarif */}
        <div className="modal-field">
          <label className="modal-field-label">
            Tarif/{satuan} <span className="required-hint">(wajib)</span>
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
          </div>
          <p className="modal-hint">Nominal tarif harus lebih besar dari 0.</p>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="modal-btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="modal-btn-submit" disabled={saving}>
            {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Jenis Sampah"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
