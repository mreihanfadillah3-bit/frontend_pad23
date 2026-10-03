import { apiRequest, setToken, clearToken } from "./apiClient";

export async function login(username, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: { username, password },
  });
  setToken(result.data.token);
  return result.data; // {token, role, admin}
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export async function getMe() {
  const result = await apiRequest("/auth/me");
  return result.data; // {id_admin, nama, username, role}
}

export async function changePassword(password_lama, password_baru, konfirmasi_password_baru) {
  return apiRequest("/auth/me/password", {
    method: "PATCH",
    body: { password_lama, password_baru, konfirmasi_password_baru },
  });
}