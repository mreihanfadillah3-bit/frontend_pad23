import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/dashboardService";
import "./DashboardPage.css";

const formatKg = (n) => `${Number(n ?? 0).toLocaleString("id-ID")} kg`;

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Memuat...</p>;

  const batchAktif = (data.batch_sedang_diolah ?? []).filter(
    (b) => b.status === "dalam_pengolahan"
  ).length;

  // TODO: tanyakan ke backend, field mana untuk "Sampah Diolah"
  const sampahDiolah = (data.ringkasan_hasil_olahan ?? []).reduce(
    (total, h) => total + (h.berat_hasil_olahan ?? 0),
    0
  );

  const aksi = data.action_required ?? [];

  return (
    <div className="dash">
      <div className="dash-stats">
        <div className="card stat">
          <strong>{data.status_operasional === "buka" ? "Buka" : "Tutup"}</strong>
          <span>Status Operasional</span>
        </div>
        <div className="card stat">
          <strong>{formatKg(data.ringkasan_sampah_terkumpul?.berat)}</strong>
          <span>Sampah Terkumpul</span>
        </div>
        <div className="card stat">
          <strong>{formatKg(sampahDiolah)}</strong>
          <span>Sampah Diolah</span>
        </div>
        <div className="card stat">
          <strong>{batchAktif} Batch</strong>
          <span>Sedang Diolah</span>
        </div>
      </div>

      <div className="dash-panels">
        <div className="card panel">
          <h2>Mulai Catat Setoran</h2>
          <p>Catat warga yang menyetorkan sampah hari ini</p>
          <Link className="panel-button" to="/kumpul-sampah/tambah">
            Tambah Sampah +
          </Link>
        </div>

        <div className="card panel">
          <h2>Perlu Ditindaklanjuti</h2>
          {aksi.length === 0 ? (
            <p>Tidak ada yang perlu ditindaklanjuti.</p>
          ) : (
            <ul>
              {aksi.map((a) => (
                <li key={`${a.jenis}-${a.id}`}>{a.keterangan}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}