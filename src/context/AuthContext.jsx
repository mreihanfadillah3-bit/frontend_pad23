import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import { getToken, clearToken } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Saat halaman dibuka ulang, cek token yang tersimpan
  useEffect(() => {
    if (!getToken()) return;
    authService
      .getMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await authService.login(username, password);
    setUser(data.admin);
    return data.admin;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // tetap keluar di sisi frontend walau API gagal
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}