import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { createJenisOlahan, updateJenisOlahan } from "../../../services/jenisOlahanService";
import { SATUAN_OPTIONS, formatError } from "../../../utils/format";

export default function PopUpTambahJenisOlahan({ item, onClose, onSaved }) {
  const [nama, setNama] = useState(item?.nama_olahan ?? "");
  const [satuan, setSatuan] = useState(item?.satuan_massa ?? SATUAN_OPTIONS[0]);
  const [nilai, setNilai] = useState(item?.tarif_nilai_olahan ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const options = SATUAN_OPTIONS.includes(satuan) ? SATUAN_OPTIONS : [satuan, ...SATUAN_OPTIONS];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      nama_olahan: nama,
      satuan_massa: satuan,
      tarif_nilai_olahan: Number(nilai),
    };
    try {
      if (item) await updateJenisOlahan(item.id_jenis_olahan, payload);
      else await createJenisOlahan(payload);
      onSaved();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={item ? "Edit Jenis Olahan" : "Tambah Jenis Olahan"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          Nama Jenis Olahan
          <input value={nama} onChange={(e) => setNama(e.target.value)} required />
        </label>
        <label>
          Satuan Masa
          <select value={satuan} onChange={(e) => setSatuan(e.target.value)}>
            {options.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        {/* Tidak ada di desain, tapi wajib menurut kontrak API */}
        <label>
          Nilai Per Satuan
          <input type="number" min="0" value={nilai} onChange={(e) => setNilai(e.target.value)} required />
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