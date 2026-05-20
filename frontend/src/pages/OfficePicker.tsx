import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Office } from "../types/api";

export default function OfficePicker() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.offices.list().then(setOffices).catch(() => setError("Failed to load offices"));
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Office Desk Booking</h1>
      <p style={styles.sub}>Select an office to get started</p>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.grid}>
        {offices.map((o) => (
          <button key={o.id} style={styles.card} onClick={() => navigate(`/offices/${o.id}`)}>
            <span style={styles.cardName}>{o.name}</span>
            <span style={styles.cardAddress}>{o.address}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 800, margin: "0 auto", padding: "40px 24px" },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8 },
  sub: { color: "#555", marginBottom: 32 },
  error: { color: "crimson", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  card: {
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    padding: "20px 24px", background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 12, cursor: "pointer", textAlign: "left",
    boxShadow: "0 1px 3px rgba(0,0,0,.06)", transition: "box-shadow .15s",
  },
  cardName: { fontSize: 18, fontWeight: 600, marginBottom: 6 },
  cardAddress: { fontSize: 13, color: "#666" },
};
