import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LuHouse,
  LuTruck,
  LuRecycle,
  LuPackage,
  LuSquareUser,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import PopUpKonfirmasiKeluar from "../common/PopUpKonfirmasiKeluar";

const menu = [
  { to: "/dashboard",     label: "Dashboard",     Icon: LuHouse },
  { to: "/kumpul-sampah", label: "Kumpul Sampah",  Icon: LuTruck },
  { to: "/olah-sampah",   label: "Olah Sampah",    Icon: LuRecycle },
  { to: "/hasil-olahan",  label: "Hasil Olahan",   Icon: LuPackage },
  { to: "/olah-admin",    label: "Olah Admin",     Icon: LuSquareUser },
  { to: "/pengaturan",    label: "Pengaturan",     Icon: LuSettings },
];

export default function Bar() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleConfirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <aside className="flex flex-col w-48 shrink-0 h-full bg-[#FFFFFF] border-r border-[#DDE2DF]">
        {/* Logo */}
        <div className="px-5 py-6">
          <span className="font-jakarta text-[22px] font-extrabold tracking-tight text-[#14201A]">
            Sumber<span className="text-[#1F6B3F]">Arum</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {menu.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E3F1E8] text-[#1F6B3F] font-semibold"
                    : "text-[#3F4B44] hover:bg-[#F6F8F7]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={19}
                    strokeWidth={2}
                    className={isActive ? "text-[#1F6B3F]" : "text-[#5B6B61]"}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Keluar */}
        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#3F4B44] hover:bg-[#F6F8F7] transition-colors"
          >
            <LuLogOut size={19} strokeWidth={2} className="text-[#5B6B61]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <PopUpKonfirmasiKeluar
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleConfirmLogout}
          loading={loggingOut}
        />
      )}
    </>
  );
}
