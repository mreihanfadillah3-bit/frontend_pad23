import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <h1>
        Selamat Datang, <span>{user?.nama}</span>
      </h1>
      <div className="header-actions">
        <button className="header-bell" aria-label="Notifikasi">🔔</button>
        <div className="header-avatar" />
      </div>
    </header>
  );
}