import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { createJenisSampah, updateJenisSampah } from "../../../services/jenisSampahService";
import { SATUAN_OPTIONS, formatError } from "../../../utils/format";

export default function PopUpTambahJenisSampah({ item, onClose, onSaved }) {
  const [nama, setNama] = useState(item?.nama_sampah ?? "");
  const [satuan, setSatuan] = useState(item?.satuan_massa ?? SATUAN_OPTIONS[0]);
  const [tarif, setTarif] = useState(item?.tarif_jasa_pengelolaan ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = SATUAN_OPTIONS.includes(satuan) ? SATUAN_OPTIONS : [satuan, ...SATUAN_OPTIONS];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      nama_sampah: nama,
      satuan_massa: satuan,
      tarif_jasa_pengelolaan: Number(tarif),
    };
    try {
      if (item) await updateJenisSampah(item.id_jenis_sampah, payload);
      else await createJenisSampah(payload);
      onSaved();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={item ? "Edit Jenis Sampah" : "Tambah Jenis Sampah"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          Nama Jenis Sampah
          <input value={nama} onChange={(e) => setNama(e.target.value)} required />
        </label>
        <label>
          Satuan Massa
          <select value={satuan} onChange={(e) => setSatuan(e.target.value)}>
            {options.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Tarif Per Satuan
          <input type="number" min="0" value={tarif} onChange={(e) => setTarif(e.target.value)} required />
        </label>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-soft" onClick={onClose}>Batal</button>
          <button type="submit" className="btn-soft" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}