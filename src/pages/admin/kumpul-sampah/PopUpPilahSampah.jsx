import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { formatKg, formatRupiah, formatError } from "../../../utils/format";

export default function PopUpPilahSampah({ nota, items, onClose, onLunas, readOnly = false }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, i) => sum + i.harga, 0);

  const tanggal = new Date(`${nota.tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleClose() {
    if (!saving) onClose();
  }

  async function handleLunas() {
    setSaving(true);
    setError("");
    try {
      await onLunas();
    } catch (err) {
      setError(formatError(err));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Nota Pembayaran – ${nota.id} ${nota.nama}`}
      subtitle={tanggal}
      onClose={handleClose}
    >
      <div className="overflow-x-auto rounded-xl border border-[#DDE2DF] mb-4">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8FAF9] border-b border-[#DDE2DF] text-xs font-semibold text-[#5B6B61]">
              <th className="py-2.5 px-4">Jenis Sampah</th>
              <th className="py-2.5 px-4">Berat</th>
              <th className="py-2.5 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-[#F2F4F3] last:border-b-0">
                <td className="py-2.5 px-4 font-medium text-[#14201A]">{i.jenis}</td>
                <td className="py-2.5 px-4 text-[#3F4B44]">{formatKg(i.berat)}</td>
                <td className="py-2.5 px-4 text-right font-medium text-[#14201A]">
                  {formatRupiah(i.harga)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#F9FAF9] border-t border-[#DDE2DF] font-bold text-[#14201A]">
              <td className="py-3 px-4">Total Biaya</td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4 text-right text-base text-[#1F6B3F]">
                {formatRupiah(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {error && (
        <p className="mb-4 p-2.5 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-[#DDE2DF]">
        {readOnly ? (
          <button
            type="button"
            className="px-5 py-2 text-sm font-semibold text-[#14201A] bg-white border border-[#DDE2DF] rounded-xl hover:bg-[#F6F8F7]"
            onClick={handleClose}
          >
            Tutup
          </button>
        ) : (
          <>
            <button
              type="button"
              className="px-5 py-2 text-sm font-semibold text-[#14201A] bg-white border border-[#DDE2DF] rounded-xl hover:bg-[#F6F8F7]"
              onClick={handleClose}
              disabled={saving}
            >
              Edit Item
            </button>
            <button
              type="button"
              className="px-6 py-2 text-sm font-semibold text-white bg-[#1F6B3F] rounded-xl hover:bg-[#185733] transition-colors disabled:opacity-60"
              onClick={handleLunas}
              disabled={saving}
            >
              {saving ? "Memproses..." : "Tandai Lunas"}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
