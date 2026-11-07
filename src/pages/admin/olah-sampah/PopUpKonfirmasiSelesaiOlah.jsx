import { LuCheck } from "react-icons/lu";

export default function PopUpKonfirmasiSelesaiOlah({
  batch,
  onClose,
  onConfirm,
}) {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[490px] max-w-[95vw] bg-white rounded-2xl shadow-xl px-8 pt-7 pb-8 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon bulat lembut centang hijau */}
        <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
          <LuCheck size={26} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#14201A] font-jakarta mb-1">
          Tandai Selesai ?
        </h2>

        {/* Subtitle / Desc */}
        <p className="text-xs text-[#5B6B61] mb-5">
          Catat hasil olahan untuk tandai selesai
        </p>

        {/* Batch Details Card */}
        <div className="w-full bg-[#F8FAF9] border border-[#E8ECE9] rounded-xl p-4 text-left text-xs text-[#3F4B44] space-y-1 mb-6">
          <p>
            <span className="text-[#5B6B61]">ID Batch:</span>{" "}
            <span className="font-semibold text-[#14201A]">{batch.id}</span>
          </p>
          <p>
            <span className="text-[#5B6B61]">Jenis Olahan:</span>{" "}
            <span className="font-semibold text-[#14201A]">{batch.jenisOlahan}</span>
          </p>
          <p>
            <span className="text-[#5B6B61]">PIC:</span>{" "}
            <span className="font-semibold text-[#14201A]">{batch.pic}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-[#14201A] bg-white border border-[#DDE2DF] rounded-xl hover:bg-[#F6F8F7] transition-colors"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors"
            onClick={onConfirm}
          >
            Catat Hasil Olahan
          </button>
        </div>
      </div>
    </div>
  );
}

