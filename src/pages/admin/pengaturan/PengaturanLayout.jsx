import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const tabs = [
  { to: "data-warga", label: "Data Warga" },
  { to: "data-sampah-olahan", label: "Data Sampah/Olahan" },
  { to: "pic-pengolahan", label: "PIC Pengolahan" },
  { to: "status-operasional", label: "Status Operasional" },
  { to: "ubah-password", label: "Ubah Password" },
];

const tabsSuperAdmin = [
  { to: "kelola-admin", label: "Kelola Admin" },
  { to: "aktivitas-admin", label: "Aktivitas Admin" },
];

export default function PengaturanLayout() {
  const { user } = useAuth();
  const items = user?.role === "super_admin" ? [...tabs, ...tabsSuperAdmin] : tabs;

  return (
    <div>
      <nav className="tabs">
        {items.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}