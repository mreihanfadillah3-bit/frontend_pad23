import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import PopUpFormTambahAdmin from "./PopUpFormTambahAdmin";
import PopUpEditPasswordAdmin from "./PopUpEditPasswordAdmin";
import PopUpKonfirmasiHapus from "../../components/common/PopUpKonfirmasiHapus";
import { getAdmins, createAdmin, deleteAdmin, updateAdminPassword, getAuditLog } from "../../services/adminService";

// Helper: format ISO date-time ke string lokal yang lebih rapi
function formatTanggal(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    const months = [
      "Jan","Feb","Mar","Apr","Mei","Jun",
      "Jul","Agu","Sep","Okt","Nov","Des",
    ];
    const tgl = d.getDate();
    const bln = months[d.getMonth()];
    const jam = String(d.getHours()).padStart(2, "0");
    const mnt = String(d.getMinutes()).padStart(2, "0");
    return `${tgl} ${bln}, ${jam}:${mnt}`;
  } catch {
    return isoString;
  }
}

// Badge warna per aksi
const AKSI_STYLE = {
  tambah: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  ubah:   { bg: "bg-blue-100",  text: "text-blue-700",  dot: "bg-blue-500"  },
  hapus:  { bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500"   },
};

function AksiBadge({ aksi }) {
  const style = AKSI_STYLE[aksi] ?? { bg: "bg-[#F2F4F3]", text: "text-[#3F4B44]", dot: "bg-[#5B6B61]" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {aksi}
    </span>
  );
}

export default function OlahAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "aktivitas" ? "aktivitas" : "data";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // modal: null | { type: "tambah" } | { type: "editPassword", admin } | { type: "hapus", admin }
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [adminsData, logsData] = await Promise.all([
        getAdmins(),
        getAuditLog(),
      ]);
      setAdmins(adminsData ?? []);
      setLogs(logsData ?? []);
    } catch (err) {
      console.error("Gagal memuat data admin/log:", err);
      setFetchError("Gagal memuat data. Periksa koneksi ke server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearchParams(tab === "aktivitas" ? { tab: "aktivitas" } : {});
  }

  function closeModal() {
    if (!actionLoading) {
      setModal(null);
      setActionError("");
    }
  }

  async function handleSaveAdmin(payload) {
    // payload: { nama, username, password, konfirmasi_password }
    await createAdmin(payload);
    await loadData();
    closeModal();
  }

  async function handleSavePassword(payload) {
    // payload: { password_lama, password_baru, konfirmasi_password_baru }
    if (!modal?.admin) return;
    await updateAdminPassword(modal.admin.id_admin, payload);
    await loadData();
    closeModal();
  }

  async function handleDeleteAdmin() {
    if (!modal?.admin) return;
    setActionLoading(true);
    setActionError("");
    try {
      await deleteAdmin(modal.admin.id_admin);
      await loadData();
      closeModal();
    } catch (err) {
      setActionError(err.message || "Gagal menghapus admin. Coba lagi.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div
      className="min-h-full"
      style={{ background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Olah Admin
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5B6B61]">
            Tambah, hapus, dan pantau aktivitas akun admin
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-[#DDE2DF]/80 overflow-x-auto whitespace-nowrap">
          {["data", "aktivitas"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === tab
                  ? "text-[#1F6B3F]"
                  : "text-[#5B6B61] hover:text-[#14201A]"
              }`}
            >
              {tab === "data" ? "Data Admin" : "Aktivitas Admin"}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F6B3F] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Error state global */}
        {!loading && fetchError && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 text-center">
            <p className="text-sm text-red-600 mb-3">{fetchError}</p>
            <button
              type="button"
              onClick={loadData}
              className="text-sm font-semibold text-[#1F6B3F] hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* ─── Tab: Data Admin ─── */}
        {activeTab === "data" && !fetchError && (
          <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
                  Data Admin
                </h2>
                <p className="mt-0.5 text-xs text-[#5B6B61]">
                  Kelola akun admin yang memiliki akses operasional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal({ type: "tambah" })}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1F6B3F] text-white text-sm font-semibold rounded-xl hover:bg-[#185733] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <LuPlus size={18} strokeWidth={2.5} />
                <span>Tambah Admin</span>
              </button>
            </div>

            <div className="border border-[#E5EAE7] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5EAE7] bg-[#FAFCFA] text-xs font-semibold text-[#5B6B61]">
                    <th className="py-3.5 px-6">Nama</th>
                    <th className="py-3.5 px-6">Username</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F3]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[#5B6B61]">
                        Memuat data admin...
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-[#5B6B61]">
                        Belum ada data admin.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id_admin} className="hover:bg-[#F9FAF9] transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-[#14201A]">
                          {admin.nama}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#3F4B44]">
                          {admin.username}
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              admin.status?.trim().toLowerCase() === "aktif"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {admin.status ?? "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <div className="flex items-center justify-end gap-2.5">
                            {admin.status?.trim().toLowerCase() === "aktif" && (
                              <button
                                type="button"
                                onClick={() => setModal({ type: "editPassword", admin })}
                                className="px-3.5 py-1.5 border border-[#1F6B3F] text-[#1F6B3F] bg-white hover:bg-[#E3F1E8] rounded-xl text-xs font-semibold transition-colors"
                              >
                                Edit Password
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={admin.status?.trim().toLowerCase() !== "aktif"}
                              onClick={() => {
                                setActionError("");
                                setModal({ type: "hapus", admin });
                              }}
                              className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold transition-colors ${
                                admin.status?.trim().toLowerCase() !== "aktif"
                                  ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                                  : "border-[#E05252] text-[#E05252] bg-white hover:bg-[#FDF2F2]"
                              }`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && (
              <div className="text-xs text-[#5B6B61] mt-4">
                Menampilkan {admins.length} admin
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Aktivitas Admin ─── */}
        {activeTab === "aktivitas" && !fetchError && (
          <div className="bg-white rounded-2xl border border-[#DDE2DF] shadow-sm p-4 sm:p-6">
            <div className="pb-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#14201A] font-jakarta">
                Log Aktivitas
              </h2>
              <p className="mt-0.5 text-xs text-[#5B6B61]">
                Riwayat perubahan data oleh admin · terbaru lebih dulu
              </p>
            </div>

            <div className="border border-[#E5EAE7] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5EAE7] bg-[#FAFCFA] text-xs font-semibold text-[#5B6B61]">
                    <th className="py-3.5 px-6">Tanggal</th>
                    <th className="py-3.5 px-6">Admin</th>
                    <th className="py-3.5 px-6">Aksi</th>
                    <th className="py-3.5 px-6">Entitas</th>
                    <th className="py-3.5 px-6">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F3]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-[#5B6B61]">
                        Memuat riwayat aktivitas...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-[#5B6B61]">
                        Belum ada log aktivitas.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id_log} className="hover:bg-[#F9FAF9] transition-colors">
                        <td className="py-4 px-6 text-sm text-[#3F4B44] whitespace-nowrap">
                          {formatTanggal(log.created_at)}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-[#14201A] whitespace-nowrap">
                          {log.nama_admin ?? "-"}
                        </td>
                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                          <AksiBadge aksi={log.aksi} />
                        </td>
                        <td className="py-4 px-6 text-sm text-[#3F4B44] whitespace-nowrap capitalize">
                          {log.entitas ?? "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#3F4B44]">
                          {log.keterangan ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && (
              <div className="text-xs text-[#5B6B61] mt-4">
                Menampilkan {logs.length} aktivitas
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Tambah Admin */}
      {modal?.type === "tambah" && (
        <PopUpFormTambahAdmin onClose={closeModal} onSave={handleSaveAdmin} />
      )}

      {/* Modal Edit Password */}
      {modal?.type === "editPassword" && (
        <PopUpEditPasswordAdmin
          admin={modal.admin}
          onClose={closeModal}
          onSave={handleSavePassword}
        />
      )}

      {/* Modal Konfirmasi Hapus */}
      {modal?.type === "hapus" && (
        <PopUpKonfirmasiHapus
          title="Hapus Akun Admin Ini?"
          subtitle="Akun admin yang dihapus tidak akan dapat masuk kembali."
          details={[
            { label: "Nama Admin", value: modal.admin?.nama },
            { label: "Username", value: modal.admin?.username },
          ]}
          onClose={closeModal}
          onConfirm={handleDeleteAdmin}
          loading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  );
}
