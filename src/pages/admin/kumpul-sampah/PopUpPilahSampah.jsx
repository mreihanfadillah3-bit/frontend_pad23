import { useState } from "react";
import { MdCheck } from "react-icons/md";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";
import { getNotaStage } from "../../../utils/statusHelper";

/**
 * PopUpPilahSampah — Modal Nota Pembayaran
 *
 * Gambar 4: status menunggu_bayar → tombol "Tutup" + "✓ Tandai Lunas"
 * Gambar 6: status selesai (readOnly) → hanya tombol "Tutup"
 *
 * Struktur nota dari API /pengumpulan-sampah/{id}/nota:
 *   { id_pengumpulan_sampah, tanggal, warga: { nama, nomor_wa },
 *     items: [{ nama_sampah, berat, nilai, ... }],
 *     total_biaya, status, pembayaran: { tanggal_bayar, ... } }
 */
export default function PopUpPilahSampah({
  nota,
  items = [],
  onClose,
  onLunas,
  readOnly = false,
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── data nota ──────────────────────────────────────────────
  const rawId = nota?.id_pengumpulan_sampah ?? nota?.id ?? "";
  const notaCode =
    typeof rawId === "number" || /^\d+$/.test(rawId)
      ? `#A${String(rawId).padStart(2, "0")}`
      : rawId;

  // Nama warga bisa dari nested .warga.nama atau flat .nama_warga
  const namaWarga =
    nota?.warga?.nama ?? nota?.nama_warga ?? nota?.nama ?? "";
  const nomorWa =
    nota?.warga?.nomor_wa ?? nota?.nomor_wa ?? "";

  const isLunas = getNotaStage(nota) === "lunas" || readOnly;

  // Tanggal header
  let headerSub = "";
  if (isLunas && nota?.pembayaran?.tanggal_bayar) {
    const d = new Date(nota.pembayaran.tanggal_bayar);
    if (!isNaN(d.getTime())) {
      headerSub = `Lunas pada ${d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    }
  } else if (nota?.tanggal) {
    const d = new Date(nota.tanggal);
    if (!isNaN(d.getTime())) {
      headerSub = `Rincian setoran sampah · ${d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
    }
  }

  // Harga per kg dari item: prioritaskan snapshot (harga_per_kg / tarif_per_kg) atau hitung dari nilai/berat yang sudah freeze
  const resolveHargaPerKg = (item) => {
    if (item.harga_per_kg != null) return Number(item.harga_per_kg);
    if (item.tarif_per_kg != null) return Number(item.tarif_per_kg);
    const berat = Number(item.berat) || 0;
    const rawNilai = item.nilai ?? item.harga;
    if (berat > 0 && rawNilai != null) return Math.round(Number(rawNilai) / berat);
    if (item.tarif_jasa_pengelolaan != null) return Number(item.tarif_jasa_pengelolaan);
    if (item.jenis_sampah?.tarif_jasa_pengelolaan != null) return Number(item.jenis_sampah.tarif_jasa_pengelolaan);
    return 0;
  };

  const safeItems = Array.isArray(items) ? items : [];
  const totalBerat = safeItems.reduce((s, i) => s + (Number(i.berat) || 0), 0);
  const total =
    nota?.total_biaya ??
    safeItems.reduce((s, i) => s + (Number(i.nilai) || Number(i.harga) || 0), 0);

  // ── aksi ───────────────────────────────────────────────────
  function handleClose() {
    if (!saving) onClose();
  }

  async function handleTandaiLunas() {
    setSaving(true);
    setError("");
    try {
      await onLunas();
      // onLunas menutup modal dari parent setelah berhasil
    } catch (err) {
      setError(formatError(err) || "Gagal memproses pembayaran.");
      setSaving(false);
    }
  }

  // ── render ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[560px] max-w-[95vw] bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div>
          <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
            Nota Pembayaran – {notaCode} {namaWarga}
          </h2>
          {headerSub && (
            <p className="text-sm text-[#5B6B61] mt-1">{headerSub}</p>
          )}
        </div>

        {/* ── Info Warga ── */}
        <div className="bg-[#F8FAF9] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#14201A]">
              {namaWarga} · {notaCode}
            </p>
            {nomorWa && (
              <p className="text-sm text-[#5B6B61] mt-0.5">
                WhatsApp: {nomorWa}
              </p>
            )}
          </div>
          {isLunas ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Selesai
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              Menunggu Bayar
            </span>
          )}
        </div>

        {/* ── Tabel Item ── */}
        <div className="overflow-x-auto rounded-xl border border-[#DDE2DF]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DDE2DF] text-xs text-[#5B6B61]">
                <th className="py-3 px-4 font-normal">Jenis Sampah</th>
                <th className="py-3 px-4 font-normal">Berat</th>
                <th className="py-3 px-4 font-normal">Harga / kg</th>
                <th className="py-3 px-4 text-right font-normal">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-xs text-[#5B6B61]"
                  >
                    Belum ada item sampah.
                  </td>
                </tr>
              ) : (
                items.map((i, idx) => {
                  const nama =
                    i.nama_sampah ??
                    i.jenis_sampah?.nama_sampah ??
                    i.jenis ??
                    "Sampah";
                  const berat = Number(i.berat) || 0;
                  const subtotal =
                    Number(i.nilai) || Number(i.harga) || 0;
                  const hargaPerKg = resolveHargaPerKg(i);

                  return (
                    <tr
                      key={i.id_detail_pengumpulan_sampah ?? i.id ?? idx}
                      className="border-b border-[#F2F4F3] last:border-b-0"
                    >
                      <td className="py-3.5 px-4 font-medium text-[#14201A]">
                        {nama}
                      </td>
                      <td className="py-3.5 px-4 text-[#3F4B44]">
                        {formatKg(berat)}
                      </td>
                      <td className="py-3.5 px-4 text-[#3F4B44]">
                        {hargaPerKg > 0 ? formatRupiah(hargaPerKg) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#14201A]">
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Total ── */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-sm font-bold text-[#14201A]">
              Total Pembayaran
            </p>
            <p className="text-xs text-[#5B6B61] mt-0.5">
              {items.length} jenis sampah · total berat {formatKg(totalBerat)}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-[#14201A] font-jakarta">
            {formatRupiah(total)}
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <p className="p-2.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </p>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-[#DDE2DF]" />

        {/* ── Tombol Aksi ── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-[#1F6B3F] bg-white border border-[#1F6B3F] rounded-xl hover:bg-[#E3F1E8] transition-colors cursor-pointer disabled:opacity-50"
          >
            Tutup
          </button>

          {!isLunas && (
            <button
              type="button"
              onClick={handleTandaiLunas}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors cursor-pointer disabled:opacity-60"
            >
              <MdCheck size={18} />
              {saving ? "Memproses..." : "Tandai Lunas"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
