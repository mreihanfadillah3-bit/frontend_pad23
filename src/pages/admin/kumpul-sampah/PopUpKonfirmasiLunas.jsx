import { MdCheck } from "react-icons/md";

export default function PopUpKonfirmasiLunas({
  title = "Konfirmasi Pelunasan?",
  subtitle = "Pastikan pembayaran untuk nota ini sudah diterima.",
  details = [],
  onClose,
  onConfirm,
  loading = false,
  error = "",
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="w-[460px] max-w-[95vw] bg-white rounded-2xl shadow-xl p-7 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E3F1E8] text-[#1F6B3F] mb-4">
          <MdCheck size={26} />
        </div>

        <h2 className="text-xl font-bold text-[#14201A] font-jakarta">
          {title}
        </h2>
        <p className="text-sm text-[#5B6B61] mt-1.5">
          {subtitle}
        </p>

        {details && details.length > 0 && (
          <div className="mt-5 bg-[#F6F8F7] border border-[#EEF2F0] rounded-xl p-4 text-left flex flex-col gap-1.5">
            {details.map((item, idx) => (
              <p key={idx} className="text-sm text-[#334155]">
                <span className="font-semibold text-[#14201A]">{item.label}:</span>{" "}
                {item.value}
              </p>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 p-2.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200 text-left">
            {error}
          </p>
        )}

        <div className="border-t border-[#E5E7EB] my-6" />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-[#1F6B3F] bg-white border border-[#1F6B3F] rounded-xl hover:bg-[#E3F1E8] transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}
