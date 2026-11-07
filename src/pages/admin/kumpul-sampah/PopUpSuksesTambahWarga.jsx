import { MdInfoOutline } from "react-icons/md";

export default function PopUpSuksesTambahWarga({
  onTambahLagi,
  onLanjutPilah,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div
        className="w-[490px] max-w-[95vw] bg-white rounded-2xl shadow-xl px-8 pt-7 pb-8 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon bulat lembut */}
        <div className="w-12 h-12 rounded-2xl bg-[#EAF5FE] text-[#38BDF8] flex items-center justify-center mb-4">
          <MdInfoOutline size={26} className="text-[#0284C7]" />
        </div>

        {/* Subtitle / Label atas */}
        <p className="text-[11px] font-semibold tracking-wider text-[#0284C7] uppercase mb-1">
          Warga Ditambahkan ke Antrian
        </p>

        {/* Title */}
        <h2 className="text-xl font-bold text-[#14201A] font-jakarta mb-2">
          Mau Tambah Warga Lain?
        </h2>

        {/* Description */}
        <p className="text-[13px] text-[#5B6B61] leading-relaxed max-w-[390px] mx-auto mb-6">
          Simpan data warga. Anda dapat menambahkan warga baru apabila masih terdapat
          antrian atau lanjut ke halaman pilah.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-[#1F6B3F] bg-white border border-[#1F6B3F] rounded-xl hover:bg-[#E3F1E8] transition-colors"
            onClick={onTambahLagi}
          >
            Tambah Warga Lain
          </button>
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors"
            onClick={onLanjutPilah}
          >
            Lanjut Pilah
          </button>
        </div>
      </div>
    </div>
  );
}
