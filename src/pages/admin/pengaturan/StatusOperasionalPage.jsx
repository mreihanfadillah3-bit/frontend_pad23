import { useState, useEffect } from "react";
import { MdInfoOutline } from "react-icons/md";
import {
  getStatusOperasional,
  updateStatusOperasional,
  parseStatusOperasional,
} from "../../../services/statusOperasionalService";
import { formatError } from "../../../utils/format";

export default function StatusOperasionalPage() {
  const [isOpen, setIsOpen] = useState(() => {
    const cached = localStorage.getItem("status_operasional");
    return cached === "tutup" ? false : true;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoading(true);
        const res = await getStatusOperasional();
        const parsed = parseStatusOperasional(res);
        if (parsed) {
          setIsOpen(parsed === "buka");
          localStorage.setItem("status_operasional", parsed);
        } else {
          const cached = localStorage.getItem("status_operasional");
          if (cached === "buka" || cached === "tutup") {
            setIsOpen(cached === "buka");
          }
        }
      } catch (err) {
        console.warn("Gagal memuat status operasional:", err);
        const cached = localStorage.getItem("status_operasional");
        if (cached === "buka" || cached === "tutup") {
          setIsOpen(cached === "buka");
        }
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  function handleToggle() {
    setIsOpen((prev) => !prev);
    setFeedback("");
  }

  async function handleSave() {
    setSaving(true);
    setFeedback("");
    try {
      const newStatus = isOpen ? "buka" : "tutup";
      await updateStatusOperasional(newStatus);
      setFeedback("Status operasional berhasil diperbarui.");
      // Trigger event agar komponen lain bisa memperbarui status secara realtime
      window.dispatchEvent(new CustomEvent("statusOperasionalChanged", { detail: newStatus }));
      localStorage.setItem("status_operasional", newStatus);
    } catch (err) {
      setFeedback(formatError(err) || "Gagal memperbarui status operasional.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6 max-w-full">
      {/* Header with Divider */}
      <div className="pb-4 border-b border-[#DDE2DF] mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
          Status Operasional
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-[#5B6B61]">
          Atur ketersediaan layanan bank sampah untuk warga.
        </p>
      </div>

      {/* Row: Status Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[#14201A]">
            Status Tempat Bank Sampah
          </h3>
          <p className="text-sm text-[#5B6B61] mt-0.5">
            {isOpen
              ? "Layanan saat ini menerima setoran sampah warga."
              : "Layanan saat ini tidak menerima setoran sampah warga."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span
            className={`text-sm select-none ${
              !isOpen ? "font-semibold text-[#14201A]" : "font-medium text-[#5B6B61]"
            }`}
          >
            Tutup
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isOpen}
            aria-label="Ubah status tempat bank sampah"
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
              isOpen ? "bg-[#1F6B3F]" : "bg-[#9CA3AF]"
            }`}
            onClick={handleToggle}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                isOpen ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm select-none ${
              isOpen ? "font-semibold text-[#14201A]" : "font-medium text-[#5B6B61]"
            }`}
          >
            Buka
          </span>
        </div>
      </div>

      {/* Info Callout */}
      <div className="flex items-start sm:items-center gap-3 mt-6 p-4 rounded-xl bg-[#F4FAF6] border border-[#D8EBD7]">
        <MdInfoOutline size={20} className="text-[#1F6B3F] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-xs text-[#3F4B44] leading-relaxed">
          Status Buka/Tutup ditampilkan pada halaman informasi warga. Simpan perubahan untuk
          memperbarui status layanan.
        </p>
      </div>

      {feedback && (
        <div className="mt-4">
          <p
            className={`p-3 text-sm rounded-xl ${
              feedback.includes("Gagal")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {feedback}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="border-t border-[#DDE2DF] pt-5 mt-8 flex justify-end">
        <button
          type="button"
          className="w-full sm:w-auto px-6 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-60 cursor-pointer text-center"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
