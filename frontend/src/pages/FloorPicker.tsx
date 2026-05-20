import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Office, Floor } from "../types/api";

export default function FloorPicker() {
  const { id } = useParams<{ id: string }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const officeId = Number(id);
    Promise.all([api.offices.get(officeId), api.offices.floors(officeId)])
      .then(([o, f]) => { setOffice(o); setFloors(f); })
      .catch(() => setError("Failed to load floors"));
  }, [id]);

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate("/")}>← All offices</button>
      {office && <h1 style={styles.title}>{office.name}</h1>}
      {office && <p style={styles.sub}>{office.address}</p>}
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.list}>
        {floors.map((f) => (
          <button
            key={f.id}
            style={styles.item}
            onClick={() => navigate(`/offices/${id}/floors/${f.id}`)}
          >
            <span style={styles.itemName}>{f.name}</span>
            <span style={styles.arrow}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 640, margin: "0 auto", padding: "40px 24px" },
  back: { background: "none", border: "none", color: "#5E17EB", cursor: "pointer", fontSize: 14, marginBottom: 20, padding: 0 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: "#555", marginBottom: 32 },
  error: { color: "crimson" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 10, cursor: "pointer", textAlign: "left",
    boxShadow: "0 1px 3px rgba(0,0,0,.06)",
  },
  itemName: { fontSize: 16, fontWeight: 500 },
  arrow: { color: "#aaa" },
};
