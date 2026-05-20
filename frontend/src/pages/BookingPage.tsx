import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Floor, Desk, Booking, MeetingRoom, RoomBooking } from "../types/api";
import FloorMap from "../components/FloorMap";
import BookingModal from "../components/BookingModal";
import RoomBookingModal from "../components/RoomBookingModal";
import DayPicker from "../components/DayPicker";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingPage() {
  const { id, floorId } = useParams<{ id: string; floorId: string }>();
  const navigate = useNavigate();

  const [floor, setFloor] = useState<Floor | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [date, setDate] = useState(todayIso);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [selectedRoomBookings, setSelectedRoomBookings] = useState<RoomBooking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fid = Number(floorId);
    Promise.all([api.floors.get(fid), api.floors.desks(fid), api.floors.meetingRooms(fid)])
      .then(([f, d, mr]) => { setFloor(f); setDesks(d); setMeetingRooms(mr); })
      .catch(() => setError("Failed to load floor"));
  }, [floorId]);

  const fetchBookings = useCallback(() => {
    if (!floorId) return;
    const fid = Number(floorId);
    Promise.all([
      api.bookings.list(fid, date),
      api.roomBookings.forFloor(fid, date),
    ]).then(([db, rb]) => { setBookings(db); setRoomBookings(rb); })
      .catch(() => setError("Failed to load bookings"));
  }, [floorId, date]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleRoomClick = (room: MeetingRoom) => {
    const rb = roomBookings.filter((b) => b.roomId === room.id);
    setSelectedRoomBookings(rb);
    setSelectedRoom(room);
  };

  const handleRoomModalClose = (refreshNeeded: boolean) => {
    setSelectedRoom(null);
    if (refreshNeeded) fetchBookings();
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
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, background: "#22c55e" }} /> Desk available
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, background: "#ef4444" }} /> Desk taken
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, background: "#f59e0b" }} /> Your desk
        </span>
        {meetingRooms.length > 0 && (
          <span style={styles.legendItem}>
            <span style={{ ...styles.dot, background: "#22c55e", borderRadius: 3 }} /> Meeting room (click to book by hour)
          </span>
        )}
      </div>

      {floor && (
        <FloorMap
          floor={floor}
          desks={desks}
          bookings={bookings}
          onDeskClick={(desk) => setSelectedDesk(desk)}
          meetingRooms={meetingRooms}
          roomBookings={roomBookings}
          onRoomClick={handleRoomClick}
        />
      )}

      {selectedDesk && (
        <BookingModal
          desk={selectedDesk}
          date={date}
          existingBooking={bookings.find((b) => b.deskId === selectedDesk.id)}
          onClose={handleModalClose}
        />
      )}

      {selectedRoom && (
        <RoomBookingModal
          room={selectedRoom}
          date={date}
          bookings={selectedRoomBookings}
          onClose={handleRoomModalClose}
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
  legend: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#555", marginBottom: 12 },
  legendItem: { display: "flex", alignItems: "center", gap: 5 },
  dot: { display: "inline-block", width: 12, height: 12, borderRadius: "50%" },
};
