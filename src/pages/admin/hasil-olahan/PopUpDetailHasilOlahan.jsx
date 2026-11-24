import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { formatKg, formatRupiah } from "../../../utils/format";
import { getPengolahanDetail } from "../../../services/pengolahanSampahService";

const formatBatchCode = (id) => {
  if (!id) return "";
  return typeof id === "number" || /^\d+$/.test(id)
    ? `#O-A${String(id).padStart(2, "0")}`
    : String(id);
};

function formatTanggal(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PopUpDetailHasilOlahan({ item, onClose }) {
  const [batchDetail, setBatchDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const idOlah = item?.id_olah_sampah ?? item?.pengolahan_sampah?.id_olah_sampah;

  useEffect(() => {
    if (idOlah) {
      setLoading(true);
      getPengolahanDetail(idOlah)
        .then((data) => setBatchDetail(data))
        .catch((err) => console.error("Gagal memuat detail batch pengolahan:", err))
        .finally(() => setLoading(false));
    }
  }, [idOlah]);

  if (!item) return null;

  const idBatchFormatted = formatBatchCode(idOlah ?? item.batchId);
  const namaOlahan =
    batchDetail?.nama_olahan ??
    item?.nama_olahan ??
    item?.namaOlahan ??
    item?.pengolahan_sampah?.nama_olahan ??
    "Olahan Sampah";

  const namaPic =
    batchDetail?.nama_pic ??
    item?.nama_pic ??
    item?.pic ??
    item?.pengolahan_sampah?.nama_pic ??
    "—";

  const bahanBakuStr =
    batchDetail?.bahan_baku?.length > 0
      ? batchDetail.bahan_baku
          .map((b) => `${formatKg(b.berat_digunakan)} ${b.nama_sampah}`)
          .join(", ")
      : item?.bahanBaku ?? "—";

  const tanggalSelesaiStr = formatTanggal(
    batchDetail?.tgl_selesai ?? item?.tanggal_direkap ?? item?.tanggalSelesai
  );

  const isSudahPublikasi =
    item.status_publikasi === "Sudah Dipublikasi" || item.statusPublikasi === "sudah";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-xl px-7 py-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close button */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F2F4F3]">
          <div>
            <h3 className="text-sm font-semibold text-[#5B6B61]">
              Detail Hasil Olahan – {idBatchFormatted}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
                {namaOlahan}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isSudahPublikasi
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "bg-[#DBEAFE] text-[#1E40AF]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSudahPublikasi ? "bg-[#16A34A]" : "bg-[#3B82F6]"
                  }`}
                />
                {isSudahPublikasi ? "Sudah Dipublikasi" : "Belum Dipublikasi"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5B6B61] hover:text-[#14201A] p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Data list rows */}
        <div className="py-4 space-y-3 text-sm">
          {loading && (
            <p className="text-xs text-[#5B6B61]">Memuat rincian batch...</p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">ID Batch</span>
            <span className="font-medium text-[#14201A]">{idBatchFormatted}</span>
          </div>

          <div className="flex justify-between items-start gap-4">
            <span className="text-[#5B6B61] shrink-0">Bahan baku</span>
            <span className="font-medium text-[#14201A] text-right">
              {bahanBakuStr}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">PIC Pengolah</span>
            <span className="font-medium text-[#14201A]">{namaPic}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Tanggal selesai</span>
            <span className="font-medium text-[#14201A]">{tanggalSelesaiStr}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Berat Hasil</span>
            <span className="font-medium text-[#14201A]">
              {formatKg(item.berat_hasil_olahan ?? item.beratHasil)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Nilai Jual</span>
            <span className="font-semibold text-[#14201A]">
              {formatRupiah(item.nilai_jual ?? item.nilaiJual)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
