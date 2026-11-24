import { LuCircleUserRound, LuMenu } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#FFFFFF] border-b border-[#DDE2DF] shrink-0">
      {/* Left: Hamburger button on mobile + Greeting */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#3F4B44] hover:bg-[#F4FAF6] md:hidden transition-colors cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <LuMenu size={22} />
        </button>

        {/* Greeting */}
        <p className="font-jakarta text-sm sm:text-base font-semibold text-[#14201A] truncate">
          Selamat Datang
        </p>
      </div>

      {/* User profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-[#3F4B44] select-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E3F1E8] text-[#1F6B3F] shrink-0">
          <LuCircleUserRound size={20} strokeWidth={2} />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-[#14201A] max-w-[140px] sm:max-w-none truncate">
          {user?.nama ?? "Admin"}
        </span>
      </div>
    </header>
  );
}
