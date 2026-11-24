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
  LuX,
} from "react-icons/lu";
import PopUpKonfirmasiKeluar from "../common/PopUpKonfirmasiKeluar";

const menu = [
  { to: "/dashboard",     label: "Dashboard",     Icon: LuHouse },
  { to: "/kumpul-sampah", label: "Kumpul Sampah",  Icon: LuTruck },
  { to: "/olah-sampah",   label: "Olah Sampah",    Icon: LuRecycle },
  { to: "/hasil-olahan",  label: "Hasil Olahan",   Icon: LuPackage },
  { to: "/olah-admin",    label: "Olah Admin",     Icon: LuSquareUser, superAdminOnly: true },
  { to: "/pengaturan",    label: "Pengaturan",     Icon: LuSettings },
];

export default function Bar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const visibleMenu = menu.filter((item) => {
    if (item.superAdminOnly) {
      return user?.role === "super_admin";
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 md:w-48 shrink-0 h-full bg-[#FFFFFF] border-r border-[#DDE2DF] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"
        }`}
      >
        {/* Header with Logo + Mobile Close Button */}
        <div className="flex items-center justify-between px-5 py-6">
          <span className="font-jakarta text-[22px] font-extrabold tracking-tight text-[#14201A]">
            Sumber<span className="text-[#1F6B3F]">Arum</span>
          </span>
          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#5B6B61] hover:text-[#14201A] hover:bg-[#F4FAF6] md:hidden transition-colors"
            aria-label="Tutup menu"
          >
            <LuX size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {visibleMenu.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                if (onClose) onClose();
              }}
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

        {/* Logout */}
        <div className="px-3 pb-6 pt-2 border-t border-[#F0F2F1] md:border-none">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#3F4B44] hover:bg-[#F6F8F7] transition-colors cursor-pointer"
          >
            <LuLogOut size={19} strokeWidth={2} className="text-[#5B6B61]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Pop Up Konfirmasi Keluar */}
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
