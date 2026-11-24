import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import {
  createJenisOlahan,
  updateJenisOlahan,
  getKomposisiOlahan,
  addKomposisiOlahan,
  deleteKomposisiOlahan,
} from "../../../services/jenisOlahanService";
import { getJenisSampah } from "../../../services/jenisSampahService";
import { formatError, SATUAN_OPTIONS } from "../../../utils/format";
import { LuCheck } from "react-icons/lu";

export default function PopUpTambahJenisOlahan({ item, onClose, onSaved }) {
  const isEdit = !!item;

  const [nama, setNama] = useState(item?.nama_olahan ?? "");
  const [satuan, setSatuan] = useState(item?.satuan_massa ?? "kg");
  const [tarif, setTarif] = useState(item?.tarif_nilai_olahan ?? "");
  const [deskripsi, setDeskripsi] = useState(item?.deskripsi ?? "");
  
  // Daftar master jenis sampah untuk checkbox komposisi
  const [sampahList, setSampahList] = useState([]);
  const [selectedKomposisi, setSelectedKomposisi] = useState([]);
  const [initialKomposisiRecords, setInitialKomposisiRecords] = useState([]); // untuk tracking saat edit
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Opsi satuan massa
  const satuanOptions = ["kg", "gram", "liter", "pcs"];
  if (satuan && !satuanOptions.includes(satuan)) {
    satuanOptions.push(satuan);
  }

  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoadingData(true);
      try {
        // 1. Ambil semua jenis sampah dari database
        const resSampah = await getJenisSampah();
        const list = Array.isArray(resSampah)
          ? resSampah
          : Array.isArray(resSampah?.data)
          ? resSampah.data
          : [];

        if (isMounted) setSampahList(list);

        // 2. Jika edit, ambil komposisi bahan baku saat ini
        if (isEdit && (item?.id_jenis_olahan || item?.id)) {
          const idOlahan = item.id_jenis_olahan || item.id;
          const komps = await getKomposisiOlahan(idOlahan);
          const listKomps = Array.isArray(komps)
            ? komps
            : Array.isArray(komps?.data)
            ? komps.data
            : [];

          if (isMounted) {
            setInitialKomposisiRecords(listKomps);
            const selectedIds = listKomps.map(
              (k) => Number(k.id_jenis_sampah || k.jenis_sampah?.id_jenis_sampah)
            ).filter(Boolean);
            setSelectedKomposisi(selectedIds);
          }
        }
      } catch (err) {
        console.warn("Gagal memuat master sampah / komposisi:", err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [isEdit, item]);

  function toggleKomposisi(idSampah) {
    const numId = Number(idSampah);
    setSelectedKomposisi((prev) =>
      prev.includes(numId) ? prev.filter((id) => id !== numId) : [...prev, numId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama jenis olahan wajib diisi.");
      return;
    }

    if (!satuan.trim()) {
      setError("Satuan massa wajib diisi.");
      return;
    }

    if (Number(tarif) <= 0) {
      setError("Nominal tarif harus lebih besar dari 0.");
      return;
    }

    if (selectedKomposisi.length === 0) {
      setError("Pilih minimal 1 bahan baku untuk komposisi jenis olahan.");
      return;
    }

    setSaving(true);

    const payload = {
      nama_olahan: nama.trim(),
      satuan_massa: satuan.trim(),
      tarif_nilai_olahan: Number(tarif),
      deskripsi: deskripsi.trim() || null,
      komposisi: selectedKomposisi, // sertakan langsung jika backend mendukung
    };

    try {
      if (isEdit) {
        const idOlahan = item.id_jenis_olahan || item.id;
        await updateJenisOlahan(idOlahan, payload);

        // Sinkronisasi tabel komposisi jika backend menggunakan endpoint terpisah
        const oldIds = initialKomposisiRecords.map((k) =>
          Number(k.id_jenis_sampah || k.jenis_sampah?.id_jenis_sampah)
        );

        // Cari yang baru dipilih untuk ditambah
        const toAdd = selectedKomposisi.filter((id) => !oldIds.includes(id));
        // Cari yang di-uncheck untuk dihapus
        const toDelete = initialKomposisiRecords.filter(
          (k) => !selectedKomposisi.includes(Number(k.id_jenis_sampah))
        );

        await Promise.allSettled([
          ...toAdd.map((idSampah) => addKomposisiOlahan(idOlahan, idSampah)),
          ...toDelete.map((k) =>
            deleteKomposisiOlahan(idOlahan, k.id_komposisi || k.id)
          ),
        ]);
      } else {
        const created = await createJenisOlahan(payload);
        const newId =
          created?.id_jenis_olahan ||
          created?.data?.id_jenis_olahan ||
          created?.id;

        // Jika backend membutuhkan penambahan komposisi via sub-endpoint
        if (newId && selectedKomposisi.length > 0) {
          await Promise.allSettled(
            selectedKomposisi.map((idSampah) =>
              addKomposisiOlahan(newId, idSampah)
            )
          );
        }
      }

      onSaved();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Jenis Olahan" : "Tambah Jenis Olahan"}
      subtitle="Tentukan tarif dan pilih bahan baku yang digunakan untuk jenis olahan baru."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Nama Olahan */}
        <div>
          <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
            Nama <span className="font-normal text-[#5B6B61]">(wajib)</span>
          </label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F] transition-all"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bijih Plastik"
            required
          />
        </div>

        {/* Baris Satuan & Tarif */}
        <div className="grid grid-cols-2 gap-3">
          {/* Satuan Massa */}
          <div>
            <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
              Satuan Massa <span className="font-normal text-[#5B6B61]">(wajib)</span>
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F] transition-all"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              required
            >
              {satuanOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Tarif */}
          <div>
            <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
              Tarif <span className="font-normal text-[#5B6B61]">(wajib)</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm text-[#5B6B61] font-medium pointer-events-none">
                Rp
              </span>
              <input
                type="number"
                min="1"
                className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F] transition-all"
                value={tarif}
                onChange={(e) => setTarif(e.target.value)}
                placeholder="0"
                required
              />
              <span className="absolute right-3.5 text-xs text-[#5B6B61] pointer-events-none">
                / {satuan || "kg"}
              </span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
            Deskripsi <span className="font-normal text-[#5B6B61]">(opsional)</span>
          </label>
          <textarea
            rows={2}
            className="w-full px-3.5 py-2 bg-white border border-[#DDE2DF] rounded-xl text-sm text-[#14201A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1F6B3F] focus:ring-1 focus:ring-[#1F6B3F] transition-all resize-none"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Keterangan singkat spesifikasi atau proses hasil olahan..."
          />
        </div>

        {/* Komposisi Bahan Baku (Checkbox) */}
        <div>
          <label className="block text-xs font-semibold text-[#3F4B44] mb-1.5">
            Komposisi bahan baku <span className="font-normal text-[#5B6B61]">(wajib)</span>
          </label>

          <div className="border border-[#DDE2DF] rounded-xl overflow-hidden divide-y divide-[#F2F4F3] max-h-48 overflow-y-auto bg-white">
            {loadingData ? (
              <div className="p-4 text-center text-xs text-[#5B6B61]">
                Memuat daftar jenis sampah...
              </div>
            ) : sampahList.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#5B6B61]">
                Belum ada data jenis sampah di database. Tambahkan jenis sampah terlebih dahulu.
              </div>
            ) : (
              sampahList.map((s) => {
                const sId = Number(s.id_jenis_sampah || s.id);
                const isChecked = selectedKomposisi.includes(sId);
                const sNama = s.nama_sampah || s.nama;

                return (
                  <label
                    key={sId}
                    onClick={() => toggleKomposisi(sId)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors select-none ${
                      isChecked ? "bg-[#F4FAF6]" : "hover:bg-[#F9FAF9]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isChecked
                          ? "bg-[#1F6B3F] border-[#1F6B3F] text-white"
                          : "border-[#DDE2DF] bg-white"
                      }`}
                    >
                      {isChecked && <LuCheck size={14} strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium text-[#14201A]">
                      {sNama}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <p className="mt-1.5 text-xs text-[#5B6B61]">
            {selectedKomposisi.length} bahan dipilih · Anda dapat memilih lebih dari satu bahan.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DDE2DF] mt-1">
          <button
            type="button"
            className="px-4 py-2 border border-[#DDE2DF] rounded-xl text-sm font-semibold text-[#3F4B44] hover:bg-[#F6F8F7] transition-colors"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#1F6B3F] hover:bg-[#185733] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Tambah Jenis Olahan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
