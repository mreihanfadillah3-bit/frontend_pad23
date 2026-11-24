export default function PopUpKonfirmasiBuatNota({ onBatal, onKonfirmasi, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[480px] max-w-[95vw] bg-white rounded-2xl shadow-xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[#14201A] font-jakarta mb-2">
          Buat nota sekarang?
        </h2>
        <p className="text-sm text-[#5B6B61] mb-8">
          Setelah nota dibuat, rincian sampah tidak bisa diubah.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onBatal}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-[#14201A] bg-white border border-[#DDE2DF] rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onKonfirmasi}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Buat Nota"}
          </button>
        </div>
      </div>
    </div>
  );
}
