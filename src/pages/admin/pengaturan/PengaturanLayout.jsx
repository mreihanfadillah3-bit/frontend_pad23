import { NavLink, Outlet } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";

const menu = [
  { to: "data-sampah-olahan", label: "Jenis Sampah/Olahan" },
  { to: "pic-pengolahan", label: "PIC Pengolah" },
  { to: "status-operasional", label: "Status Operasional" },
  { to: "data-warga", label: "Data Warga/Penyetor" },
  { to: "ubah-password", label: "Password" },
];

export default function PengaturanLayout() {
  return (
    <div
      className="min-h-full"
      style={{
        background: "linear-gradient(180deg, #F4FAF6 0%, #5F9C78 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14201A] font-jakarta">
            Pengaturan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#14201A]">
            Kelola data sampah, pengolah, layanan, dan keamanan akun SumberArum
          </p>
        </div>

        {/* Layout: Responsive Tabs / Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
          {/* Menu: Horizontal scrollable tabs on mobile/tablet/zoom-in, vertical sidebar on desktop */}
          <nav className="w-full lg:w-64 bg-white rounded-2xl border border-[#DDE2DF] p-2 lg:p-3 shadow-sm flex flex-row lg:flex-col gap-1.5 overflow-x-auto shrink-0">
            {menu.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  [
                    "shrink-0 flex items-center justify-between px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-medium transition-colors whitespace-nowrap",
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
                      <MdChevronRight size={18} className="text-[#1F6B3F] shrink-0 hidden lg:inline-block" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
