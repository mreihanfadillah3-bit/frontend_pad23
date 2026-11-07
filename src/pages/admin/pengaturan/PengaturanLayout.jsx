import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";

const menu = [
  { to: "data-sampah-olahan", label: "Jenis Sampah/Olahan" },
  { to: "pic-pengolahan", label: "PIC Pengolah" },
  { to: "status-operasional", label: "Status Operasional" },
  { to: "data-warga", label: "Data Warga/Penyetor" },
  { to: "ubah-password", label: "Password" },
];

const menuSuperAdmin = [
  { to: "kelola-admin", label: "Kelola Admin" },
  { to: "aktivitas-admin", label: "Aktivitas Admin" },
];

export default function PengaturanLayout() {
  const { user } = useAuth();
  const items = user?.role === "super_admin" ? [...menu, ...menuSuperAdmin] : menu;

  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#14201A] font-jakarta">
            Pengaturan
          </h1>
          <p className="mt-1 text-sm text-[#14201A]">
            Kelola data sampah, pengolah, layanan, dan keamanan akun SumberArum
          </p>
        </div>

        {/* Layout: Sidebar Menu + Content */}
        <div className="flex gap-6 items-start">
          {/* Sidebar Menu */}
          <nav className="w-64 bg-white rounded-2xl border border-[#DDE2DF] p-3 shadow-sm flex flex-col gap-1 shrink-0">
            {items.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  [
                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#E3F1E8] text-[#1F6B3F] font-semibold"
                      : "text-[#3F4B44] hover:bg-[#F6F8F7]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{m.label}</span>
                    {isActive && (
                      <MdChevronRight size={18} className="text-[#1F6B3F] shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
