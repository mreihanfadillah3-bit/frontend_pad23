import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import { getToken, clearToken } from "../services/apiClient";

const AuthContext = createContext(null);

function normalizeRole(roleString) {
  if (!roleString) return null;
  const lower = String(roleString).toLowerCase();
  if (lower.includes("super")) return "super_admin";
  return "admin";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Saat halaman dibuka ulang, cek token yang tersimpan
  useEffect(() => {
    if (!getToken()) return;
    authService
      .getMe()
      .then((meData) => {
        const savedRole = localStorage.getItem("user_role");
        const backendRole = normalizeRole(meData?.role || meData?.admin?.role);
        const finalRole = savedRole || backendRole || "admin";
        setUser({
          ...meData,
          role: finalRole,
          nama: meData?.nama || meData?.admin?.nama || (finalRole === "super_admin" ? "Super Admin" : "Admin"),
        });
      })
      .catch(() => {
        clearToken();
        localStorage.removeItem("user_role");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await authService.login(username, password);

    // Tentukan role dari data backend atau fallback username
    const rawRole = data?.admin?.role || data?.role;
    const isSuper =
      username.toLowerCase().includes("super") ||
      (rawRole && String(rawRole).toLowerCase().includes("super"));

    const determinedRole = isSuper ? "super_admin" : (normalizeRole(rawRole) || "admin");

    const adminUser = {
      ...(data?.admin || {}),
      id_admin: data?.admin?.id_admin || 1,
      nama: data?.admin?.nama || (isSuper ? "Super Admin" : "Admin"),
      username: username || data?.admin?.username || "admin",
      role: determinedRole,
    };

    localStorage.setItem("user_role", determinedRole);
    setUser(adminUser);
    return adminUser;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // tetap keluar di sisi frontend walau API gagal
    }
    localStorage.removeItem("user_role");
    setUser(null);
  }

  // Helper untuk switch role
  function switchRole(newRole) {
    localStorage.setItem("user_role", newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
