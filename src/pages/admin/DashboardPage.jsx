import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p>Halo, {user?.nama} ({user?.role})</p>
      <button onClick={logout}>Keluar</button>
    </div>
  );
}