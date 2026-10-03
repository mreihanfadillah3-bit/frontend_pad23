import { apiRequest } from "./apiClient";

export async function getDashboard() {
  const result = await apiRequest("/dashboard");
  return result.data;
}