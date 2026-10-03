import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import KumpulSampahPage from "../pages/admin/kumpul-sampah/KumpulSampahPage";
import TambahSampahPage from "../pages/admin/kumpul-sampah/TambahSampahPage";
import PilahSampahPage from "../pages/admin/kumpul-sampah/PilahSampahPage";
import OlahSampahPage from "../pages/admin/olah-sampah/OlahSampahPage";
import HasilOlahanPage from "../pages/admin/hasil-olahan/HasilOlahanPage";
import PengaturanLayout from "../pages/admin/pengaturan/PengaturanLayout";
import DataWargaPage from "../pages/admin/pengaturan/DataWargaPage";
import DataSampahOlahanPage from "../pages/admin/pengaturan/DataSampahOlahanPage";
import PicPengolahanPage from "../pages/admin/pengaturan/PicPengolahanPage";
import StatusOperasionalPage from "../pages/admin/pengaturan/StatusOperasionalPage";
import UbahPasswordPage from "../pages/admin/pengaturan/UbahPasswordPage";
import KelolaAdminPage from "../pages/super-admin/KelolaAdminPage";
import AktivitasAdminPage from "../pages/super-admin/AktivitasAdminPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/kumpul-sampah" element={<KumpulSampahPage />} />
          <Route path="/kumpul-sampah/tambah" element={<TambahSampahPage />} />
          <Route path="/kumpul-sampah/pilah" element={<PilahSampahPage />} />

          <Route path="/olah-sampah" element={<OlahSampahPage />} />
          <Route path="/hasil-olahan" element={<HasilOlahanPage />} />

          <Route path="/pengaturan" element={<PengaturanLayout />}>
            <Route index element={<Navigate to="data-warga" replace />} />
            <Route path="data-warga" element={<DataWargaPage />} />
            <Route path="data-sampah-olahan" element={<DataSampahOlahanPage />} />
            <Route path="pic-pengolahan" element={<PicPengolahanPage />} />
            <Route path="status-operasional" element={<StatusOperasionalPage />} />
            <Route path="ubah-password" element={<UbahPasswordPage />} />

            {/* Khusus super admin */}
            <Route element={<ProtectedRoute roles={["super_admin"]} />}>
              <Route path="kelola-admin" element={<KelolaAdminPage />} />
              <Route path="aktivitas-admin" element={<AktivitasAdminPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}