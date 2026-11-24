import { apiRequest } from "./apiClient";

/**
 * Normalizes operational status from various backend response formats into "buka" | "tutup".
 * Handles:
 * - "buka" / "tutup"
 * - { status: "success", data: { status: "buka" } }
 * - { status: "success", data: { status_operasional: "buka" } }
 * - { status_operasional: "buka" }
 * - { status: "buka" }
 */
export function parseStatusOperasional(res) {
  if (!res) return null;

  if (typeof res === "string") {
    const s = res.toLowerCase().trim();
    if (s === "buka" || s === "tutup") return s;
    if (s === "open") return "buka";
    if (s === "closed" || s === "close") return "tutup";
  }

  const data = res.data ?? res;
  if (typeof data === "string") {
    const s = data.toLowerCase().trim();
    if (s === "buka" || s === "tutup") return s;
    if (s === "open") return "buka";
    if (s === "closed" || s === "close") return "tutup";
  }

  const getCandidate = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    if (obj.status_operasional && typeof obj.status_operasional === "string") {
      return obj.status_operasional;
    }
    if (obj.status && typeof obj.status === "string" && obj.status !== "success" && obj.status !== "error") {
      return obj.status;
    }
    return null;
  };

  const candidate = getCandidate(data) || getCandidate(res);
  if (candidate) {
    const s = candidate.toLowerCase().trim();
    if (s === "buka" || s === "tutup") return s;
    if (s === "open") return "buka";
    if (s === "closed" || s === "close") return "tutup";
  }

  return null;
}

export async function getStatusOperasional() {
  const result = await apiRequest("/status-operasional");
  return result;
}

export async function getPublicStatusOperasional() {
  const result = await apiRequest("/public/status-operasional");
  return result;
}

export async function updateStatusOperasional(status) {
  const result = await apiRequest("/status-operasional", {
    method: "PATCH",
    body: { status, status_operasional: status },
  });
  return result;
}

