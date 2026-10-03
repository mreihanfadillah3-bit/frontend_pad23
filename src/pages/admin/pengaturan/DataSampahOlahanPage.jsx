import { useEffect, useState } from "react";
import { getJenisSampah, deleteJenisSampah } from "../../../services/jenisSampahService";
import { getJenisOlahan, deleteJenisOlahan } from "../../../services/jenisOlahanService";
import { formatRupiah, formatError } from "../../../utils/format";
import PopUpTambahJenisSampah from "./PopUpTambahJenisSampah";
import PopUpTambahJenisOlahan from "./PopUpTambahJenisOlahan";

export default function DataSampahOlahanPage() {
  const [sampah, setSampah] = useState([]);
  const [olahan, setOlahan] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null); // { type: "sampah" | "olahan", item }

  async function load() {
    try {
      const [s, o] = await Promise.all([getJenisSampah(), getJenisOlahan()]);
      setSampah(s ?? []);
      setOlahan(o ?? []);
    } catch (err) {
      setError(formatError(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(type, item) {
    const nama = type === "sampah" ? item.nama_sampah : item.nama_olahan;
    if (!window.confirm(`Hapus "${nama}"?`)) return;
    try {
      if (type === "sampah") await deleteJenisSampah(item.id_jenis_sampah);
      else await deleteJenisOlahan(item.id_jenis_olahan);
      load();
    } catch (err) {
      setError(formatError(err));
    }
  }

  function handleSaved() {
    setPopup(null);
    load();
  }

  return (
    <>
      {error && <p className="set-error">{error}</p>}

      <section className="set-card">
        <div className="set-card-head">
          <h2>Jenis Sampah</h2>
          <button className="btn-soft btn-green" onClick={() => setPopup({ type: "sampah", item: null })}>
            Tambah Jenis Sampah +
          </button>
        </div>
        <table className="set-table">
          <thead>
            <tr>
              <th>Jenis Sampah</th>
              <th>Satuan</th>
              <th>Tarif Per Satuan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sampah.length === 0 && (
              <tr><td colSpan="4">Belum ada data.</td></tr>
            )}
            {sampah.map((s) => (
              <tr key={s.id_jenis_sampah}>
                <td>{s.nama_sampah}</td>
                <td>{s.satuan_massa}</td>
                <td>{formatRupiah(s.tarif_jasa_pengelolaan)}</td>
                <td className="set-actions">
                  <button className="btn-soft" onClick={() => setPopup({ type: "sampah", item: s })}>Edit</button>
                  <button className="btn-soft" onClick={() => handleDelete("sampah", s)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="set-card">
        <div className="set-card-head">
          <h2>Jenis Olahan</h2>
          <button className="btn-soft btn-green" onClick={() => setPopup({ type: "olahan", item: null })}>
            Tambah Jenis Olahan +
          </button>
        </div>
        <table className="set-table">
          <thead>
            <tr>
              <th>Jenis Olahan</th>
              <th>Satuan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {olahan.length === 0 && (
              <tr><td colSpan="3">Belum ada data.</td></tr>
            )}
            {olahan.map((o) => (
              <tr key={o.id_jenis_olahan}>
                <td>{o.nama_olahan}</td>
                <td>{o.satuan_massa}</td>
                <td className="set-actions">
                  <button className="btn-soft" onClick={() => setPopup({ type: "olahan", item: o })}>Edit</button>
                  <button className="btn-soft" onClick={() => handleDelete("olahan", o)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {popup?.type === "sampah" && (
        <PopUpTambahJenisSampah item={popup.item} onClose={() => setPopup(null)} onSaved={handleSaved} />
      )}
      {popup?.type === "olahan" && (
        <PopUpTambahJenisOlahan item={popup.item} onClose={() => setPopup(null)} onSaved={handleSaved} />
      )}
    </>
  );
}