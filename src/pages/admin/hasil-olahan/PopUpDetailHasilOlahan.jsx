import { MdClose, MdInfoOutline } from "react-icons/md";

export default function PopUpDetailHasilOlahan({ item, onClose }) {
  if (!item) return null;

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
              Detail Hasil Olahan – {item.batchId}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
                {item.namaOlahan}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Selesai
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5B6B61] hover:text-[#14201A] p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Data list rows */}
        <div className="py-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">ID Batch</span>
            <span className="font-medium text-[#14201A]">{item.batchId}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Bahan baku</span>
            <span className="font-medium text-[#14201A]">{item.bahanBaku}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">PIC Pengolah</span>
            <span className="font-medium text-[#14201A]">{item.pic}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Tanggal selesai</span>
            <span className="font-medium text-[#14201A]">{item.tanggalSelesai}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Berat Hasil</span>
            <span className="font-medium text-[#14201A]">{item.beratHasil} kg</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5B6B61]">Nilai Jual</span>
            <span className="font-semibold text-[#14201A]">
              Rp {Number(item.nilaiJual || 0).toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Info callout at bottom 
        <div className="mt-2 p-3 rounded-xl bg-[#F4FAF6] border border-[#D8EBD7] flex items-center gap-2.5">
          <MdInfoOutline size={18} className="text-[#1F6B3F] shrink-0" />
          <p className="text-xs text-[#3F4B44] leading-relaxed">
            Pengolahan telah selesai. Periksa berat dan nilai jual sebelum hasil ditampilkan kepada warga.
          </p>
        </div>*/}
      </div>
    </div>
  );
}

