import { LuCircleUserRound, LuChevronDown } from "react-icons/lu";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-3.5 bg-[#FFFFFF] border-b border-[#DDE2DF] shrink-0">
      {/* Greeting */}
      <p className="font-jakarta text-base font-medium text-[#3F4B44]">
        Selamat Datang,{" "}
        <span className="text-[#1F6B3F] font-semibold">{user?.nama ?? "Admin"}</span>
      </p>

      {/* User profile dropdown trigger */}
      <div className="flex items-center gap-2.5 text-[#3F4B44] cursor-pointer hover:opacity-90 select-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E3F1E8] text-[#1F6B3F]">
          <LuCircleUserRound size={20} strokeWidth={2} />
        </div>
        <span className="text-sm font-semibold text-[#14201A]">
          {user?.nama ?? "Admin"}
        </span>
        <LuChevronDown size={16} strokeWidth={2.2} className="text-[#5B6B61]" />
      </div>
    </header>
  );
}
