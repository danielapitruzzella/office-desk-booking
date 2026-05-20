import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Floor, Desk, Booking } from "../types/api";
import FloorMap from "../components/FloorMap";
import BookingModal from "../components/BookingModal";
import DayPicker from "../components/DayPicker";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingPage() {
  const { id, floorId } = useParams<{ id: string; floorId: string }>();
  const navigate = useNavigate();

  const [floor, setFloor] = useState<Floor | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState(todayIso);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fid = Number(floorId);
    Promise.all([api.floors.get(fid), api.floors.desks(fid)])
      .then(([f, d]) => { setFloor(f); setDesks(d); })
      .catch(() => setError("Failed to load floor"));
  }, [floorId]);

  const fetchBookings = useCallback(() => {
    if (!floorId) return;
    api.bookings.list(Number(floorId), date)
      .then(setBookings)
      .catch(() => setError("Failed to load bookings"));
  }, [floorId, date]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);
  };

  const handleModalClose = (refreshNeeded: boolean) => {
    setSelectedDesk(null);
    if (refreshNeeded) fetchBookings();
  };

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate(`/offices/${id}`)}>← Back to floors</button>
      {floor && <h1 style={styles.title}>{floor.name}</h1>}
      {error && <p style={styles.error}>{error}</p>}

      <DayPicker date={date} onChange={setDate} />

      <div style={styles.legend}>
        <span style={{ ...styles.dot, background: "#22c55e" }} /> Available
        <span style={{ ...styles.dot, background: "#ef4444", marginLeft: 16 }} /> Taken
        <span style={{ ...styles.dot, background: "#f59e0b", marginLeft: 16 }} /> Your booking
      </div>

      {floor && (
        <FloorMap
          floor={floor}
          desks={desks}
          bookings={bookings}
          onDeskClick={handleDeskClick}
        />
      )}

      {selectedDesk && floor && (
        <BookingModal
          desk={selectedDesk}
          date={date}
          existingBooking={bookings.find((b) => b.deskId === selectedDesk.id)}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1280, margin: "0 auto", padding: "24px 24px 48px" },
  back: { background: "none", border: "none", color: "#5E17EB", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 16 },
  error: { color: "crimson", marginBottom: 12 },
  legend: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", marginBottom: 12 },
  dot: { display: "inline-block", width: 12, height: 12, borderRadius: "50%" },
};
