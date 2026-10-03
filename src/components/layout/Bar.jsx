import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/kumpul-sampah", label: "Kumpul Sampah" },
  { to: "/olah-sampah", label: "Olah Sampah" },
  { to: "/hasil-olahan", label: "Hasil Olahan" },
  { to: "/pengaturan", label: "Pengaturan" },
];

export default function Bar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="bar">
      <div className="bar-logo">
        <strong>
          Sumber<span>Arum</span>
        </strong>
        <small>Sistem Informasi dan Pengelolaan Sampah</small>
      </div>

      <nav className="bar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "bar-link active" : "bar-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button className="bar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}