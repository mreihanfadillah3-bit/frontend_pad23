const BASE_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    // balasan bukan JSON
  }

  if (!response.ok) {
    if (response.status === 401) clearToken();
    const error = new Error(result?.message || "Terjadi kesalahan");
    error.status = response.status;
    error.errors = result?.errors || null; // error validasi per field (422)
    throw error;
  }

  return result; // bentuknya {status, message, data}
}