import { useState } from "react";
import { Outlet } from "react-router-dom";
import Bar from "./Bar";
import Header from "./Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4FAF6]">
      {/* Sidebar (drawer on mobile, fixed on desktop) */}
      <Bar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right side: header + scrollable content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
