import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Halaman yang butuh login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Contoh halaman khusus super admin, ditambah nanti:
      <Route element={<ProtectedRoute roles={["super_admin"]} />}>
        ...
      </Route> */}
    </Routes>
  );
}