import { LuCheck } from "react-icons/lu";

export default function PopUpInfoPublikasi({ batchId, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[450px] max-w-[95vw] bg-white rounded-2xl shadow-xl px-7 py-7 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
          <LuCheck size={26} strokeWidth={2.5} />
        </div>

        <h2 className="text-xl font-bold text-[#14201A] font-jakarta mb-1.5">
          Hasil Olahan Dipublikasikan!
        </h2>
        <p className="text-xs text-[#5B6B61] leading-relaxed mb-6 max-w-[340px]">
          Hasil olahan untuk batch <strong className="text-[#14201A]">{batchId}</strong> telah berhasil dipublikasikan dan kini dapat dilihat oleh warga.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}

