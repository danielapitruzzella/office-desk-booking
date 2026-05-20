import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSwitch = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser({ name: "", email: "" });
    window.location.reload();
  };

  const navLink = (label: string, to: string) => {
    const active = pathname === to || (to === "/" && pathname === "/");
    return (
      <button
        style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }}
        onClick={() => navigate(to)}
      >
        {label}
      </button>
    );
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.left}>
          <div style={styles.brand} onClick={() => navigate("/")} role="button">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#5E17EB"/>
              <path d="M8 20c0-2.2 1.8-4 4-4h8c2.2 0 4-1.8 4-4s-1.8-4-4-4H12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="20" cy="24" r="3" fill="#fff"/>
            </svg>
            <span style={styles.brandName}>Soldo</span>
            <span style={styles.divider}>|</span>
            <span style={styles.appName}>Desk Booking</span>
          </div>
          {user?.name && (
            <nav style={styles.nav}>
              {navLink("Offices", "/")}
              {navLink("My Bookings", "/my-bookings")}
            </nav>
          )}
        </div>

        {user?.name && (
          <div style={styles.user}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <button style={styles.switchBtn} onClick={handleSwitch}>Switch user</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: "#fff", borderBottom: "1px solid #ede9fe",
    position: "sticky", top: 0, zIndex: 50,
  },
  inner: {
    maxWidth: 1280, margin: "0 auto", padding: "0 24px",
    height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  left: { display: "flex", alignItems: "center", gap: 32 },
  brand: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  brandName: { fontSize: 16, fontWeight: 700, color: "#5E17EB" },
  divider: { color: "#d1d5db", fontSize: 16 },
  appName: { fontSize: 14, fontWeight: 500, color: "#555" },
  nav: { display: "flex", gap: 4 },
  navLink: {
    background: "none", border: "none", padding: "6px 12px", borderRadius: 6,
    fontSize: 14, fontWeight: 500, color: "#555", cursor: "pointer",
  },
  navLinkActive: { color: "#5E17EB", background: "#f5f0ff" },
  user: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "#5E17EB", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700,
  },
  userInfo: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  userName: { fontSize: 13, fontWeight: 600, color: "#111" },
  switchBtn: {
    background: "none", border: "none", color: "#5E17EB",
    fontSize: 11, cursor: "pointer", padding: 0, fontWeight: 500,
  },
};
