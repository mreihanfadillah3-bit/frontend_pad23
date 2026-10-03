import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Pengaturan.css";

const menu = [
  { to: "data-sampah-olahan", label: "Data Sampah/Olahan" },
  { to: "data-warga", label: "Data Warga/Penyetor" },
  { to: "pic-pengolahan", label: "PIC Pengolahan" },
  { to: "status-operasional", label: "Status Operasional" },
  { to: "ubah-password", label: "Kelola Password" },
];

// sementara
const menuSuperAdmin = [
  { to: "kelola-admin", label: "Kelola Admin" },
  { to: "aktivitas-admin", label: "Aktivitas Admin" },
];

export default function PengaturanLayout() {
  const { user } = useAuth();
  const items = user?.role === "super_admin" ? [...menu, ...menuSuperAdmin] : menu;

  return (
    <div>
      <h2 className="set-title">Pengaturan</h2>
      <div className="set-wrap">
        <nav className="set-menu">
          {items.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) => (isActive ? "set-menu-link active" : "set-menu-link")}
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="set-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}