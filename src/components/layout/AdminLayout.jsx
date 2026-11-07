import { Outlet } from "react-router-dom";
import Bar from "./Bar";
import Header from "./Header";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Bar />

      {/* Right side: header + scrollable content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
