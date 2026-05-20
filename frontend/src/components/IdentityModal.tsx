import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function IdentityModal() {
  const { user, setUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email"); return; }
    setUser({ name: name.trim(), email: email.trim() });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#5E17EB"/>
            <path d="M8 20c0-2.2 1.8-4 4-4h8c2.2 0 4-1.8 4-4s-1.8-4-4-4H12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="20" cy="24" r="3" fill="#fff"/>
          </svg>
          <span style={styles.logoText}>Soldo</span>
        </div>
        <h1 style={styles.title}>Desk Booking</h1>
        <p style={styles.sub}>Enter your details to start booking desks across Soldo offices.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full name
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              autoFocus
            />
          </label>
          <label style={styles.label}>
            Work email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@soldo.com"
            />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit">Get started</button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "#f5f3ff",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
  },
  modal: {
    background: "#fff", borderRadius: 16, padding: "40px 44px",
    width: "100%", maxWidth: 420,
    boxShadow: "0 8px 40px rgba(94,23,235,.12)",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoText: { fontSize: 20, fontWeight: 700, color: "#5E17EB" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#111" },
  sub: { color: "#666", fontSize: 14, marginBottom: 28, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "#444" },
  input: {
    padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid #e2e8f0", fontSize: 14,
    outline: "none", transition: "border-color .15s",
  },
  error: { color: "#dc2626", fontSize: 13, margin: 0 },
  btn: {
    marginTop: 4, padding: "12px", borderRadius: 8, border: "none",
    background: "#5E17EB", color: "#fff", fontSize: 15, fontWeight: 600,
    cursor: "pointer",
  },
};
