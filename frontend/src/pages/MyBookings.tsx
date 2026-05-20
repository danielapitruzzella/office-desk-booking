import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useUser } from "../context/UserContext";
import type { MyBooking, MyRoomBooking } from "../types/api";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function fmtShort(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

// Group bookings: series (same seriesId) → one group, singles → individual groups
interface BookingGroup {
  seriesId: number | null;
  bookings: MyBooking[];
  isSeries: boolean;
}

function groupBookings(bookings: MyBooking[]): BookingGroup[] {
  const seriesMap = new Map<number, MyBooking[]>();
  const singles: MyBooking[] = [];

  for (const b of bookings) {
    if (b.seriesId) {
      const arr = seriesMap.get(b.seriesId) ?? [];
      arr.push(b);
      seriesMap.set(b.seriesId, arr);
    } else {
      singles.push(b);
    }
  }

  const groups: BookingGroup[] = [];
  for (const [seriesId, items] of seriesMap) {
    groups.push({ seriesId, bookings: items, isSeries: true });
  }
  for (const b of singles) {
    groups.push({ seriesId: null, bookings: [b], isSeries: false });
  }

  // Sort groups by the earliest booking date within each group
  groups.sort((a, b) => a.bookings[0].date.localeCompare(b.bookings[0].date));
  return groups;
}

export default function MyBookings() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [roomBookings, setRoomBookings] = useState<MyRoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = todayIso();

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.bookings.mine(user.email), api.roomBookings.mine(user.email)])
      .then(([db, rb]) => { setBookings(db); setRoomBookings(rb); setLoading(false); })
      .catch(() => { setError("Failed to load bookings"); setLoading(false); });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCancelRoom = async (rb: MyRoomBooking) => {
    if (!user) return;
    try {
      await api.roomBookings.delete(rb.id, user.email);
      setRoomBookings((prev) => prev.filter((x) => x.id !== rb.id));
    } catch {
      setError("Failed to cancel room booking.");
    }
  };

  const handleCancelOne = async (b: MyBooking) => {
    if (!user) return;
    try {
      await api.bookings.delete(b.id, user.email);
      setBookings((prev) => prev.filter((x) => x.id !== b.id));
    } catch {
      setError("Failed to cancel booking.");
    }
  };

  const handleCancelSeries = async (seriesId: number) => {
    if (!user) return;
    try {
      await api.bookings.deleteSeries(seriesId, user.email);
      load();
    } catch {
      setError("Failed to cancel series.");
    }
  };

  const upcoming = groupBookings(bookings.filter((b) => b.date >= today));
  const past = groupBookings(bookings.filter((b) => b.date < today));

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Bookings</h1>
      {/* Tab-like heading separator */}
      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.muted}>Loading…</p>
      ) : bookings.length === 0 && roomBookings.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.muted}>You have no bookings yet.</p>
          <button style={styles.ctaBtn} onClick={() => navigate("/")}>Book a desk</button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Upcoming</h2>
              <div style={styles.list}>
                {upcoming.map((g) =>
                  g.isSeries ? (
                    <SeriesCard
                      key={g.seriesId}
                      group={g}
                      today={today}
                      onCancelOne={handleCancelOne}
                      onCancelSeries={() => handleCancelSeries(g.seriesId!)}
                      onNavigate={(b) => navigate(`/offices/${b.officeId}/floors/${b.floorId}`)}
                    />
                  ) : (
                    <SingleCard
                      key={g.bookings[0].id}
                      booking={g.bookings[0]}
                      isPast={false}
                      onCancel={() => handleCancelOne(g.bookings[0])}
                      onNavigate={() => navigate(`/offices/${g.bookings[0].officeId}/floors/${g.bookings[0].floorId}`)}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section style={styles.section}>
              <h2 style={{ ...styles.sectionTitle, color: "#aaa" }}>Past</h2>
              <div style={styles.list}>
                {past.map((g) =>
                  g.isSeries ? (
                    <SeriesCard
                      key={g.seriesId}
                      group={g}
                      today={today}
                      onCancelOne={() => {}}
                      onCancelSeries={() => {}}
                      onNavigate={(b) => navigate(`/offices/${b.officeId}/floors/${b.floorId}`)}
                    />
                  ) : (
                    <SingleCard
                      key={g.bookings[0].id}
                      booking={g.bookings[0]}
                      isPast
                      onCancel={() => {}}
                      onNavigate={() => navigate(`/offices/${g.bookings[0].officeId}/floors/${g.bookings[0].floorId}`)}
                    />
                  )
                )}
              </div>
            </section>
          )}

          {/* ── Room bookings ── */}
          {roomBookings.length > 0 && (
            <section style={{ ...styles.section, marginTop: upcoming.length > 0 || past.length > 0 ? 40 : 0 }}>
              <h2 style={{ ...styles.sectionTitle, color: "#0369a1" }}>Meeting Room Bookings</h2>
              <div style={styles.list}>
                {roomBookings.map((rb) => {
                  const isPast = rb.date < today;
                  return (
                    <div key={rb.id} style={{ ...styles.card, opacity: isPast ? 0.6 : 1 }}>
                      <div style={styles.cardLeft}>
                        <div style={styles.dateLabel}>{fmtDate(rb.date)}</div>
                        <div style={styles.locationLine}>
                          <span style={styles.officeName}>{rb.officeName}</span>
                          <span style={styles.sep}>·</span>
                          <span>{rb.floorName}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ ...styles.deskChip, background: "#e0f2fe", color: "#0369a1" }}>
                            {rb.roomName}
                          </span>
                          <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>
                            {String(rb.startHour).padStart(2,"0")}:00 – {String(rb.endHour).padStart(2,"0")}:00
                          </span>
                          {rb.title && <span style={{ fontSize: 12, color: "#888" }}>"{rb.title}"</span>}
                        </div>
                      </div>
                      {!isPast && (
                        <div style={styles.cardActions}>
                          <button
                            style={styles.viewBtn}
                            onClick={() => navigate(`/offices/${rb.officeId}/floors/${rb.floorId}`)}
                          >
                            View floor
                          </button>
                          <button style={styles.cancelBtn} onClick={() => handleCancelRoom(rb)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ── Single booking card ───────────────────────────────────────────────────

function SingleCard({ booking: b, isPast, onCancel, onNavigate }: {
  booking: MyBooking; isPast: boolean; onCancel: () => void; onNavigate: () => void;
}) {
  return (
    <div style={{ ...styles.card, opacity: isPast ? 0.6 : 1 }}>
      <div style={styles.cardLeft}>
        <div style={styles.dateLabel}>{fmtDate(b.date)}</div>
        <div style={styles.locationLine}>
          <span style={styles.officeName}>{b.officeName}</span>
          <span style={styles.sep}>·</span>
          <span>{b.floorName}</span>
        </div>
        <span style={styles.deskChip}>{b.deskLabel}</span>
      </div>
      {!isPast && (
        <div style={styles.cardActions}>
          <button style={styles.viewBtn} onClick={onNavigate}>View floor</button>
          <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── Series card (collapsible) ─────────────────────────────────────────────

function SeriesCard({ group, today, onCancelOne, onCancelSeries, onNavigate }: {
  group: BookingGroup;
  today: string;
  onCancelOne: (b: MyBooking) => void;
  onCancelSeries: () => void;
  onNavigate: (b: MyBooking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { bookings: items } = group;
  const first = items[0];
  const last = items[items.length - 1];
  const future = items.filter((b) => b.date >= today);
  const isPast = future.length === 0;

  return (
    <div style={{ ...styles.card, opacity: isPast ? 0.6 : 1, flexDirection: "column", alignItems: "stretch", gap: 0 }}>
      {/* Series header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={styles.cardLeft}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={styles.seriesBadge}>🔁 {items.length} weeks</span>
            <span style={styles.dateRange}>{fmtShort(first.date)} → {fmtShort(last.date)}</span>
          </div>
          <div style={styles.locationLine}>
            <span style={styles.officeName}>{first.officeName}</span>
            <span style={styles.sep}>·</span>
            <span>{first.floorName}</span>
          </div>
          <span style={styles.deskChip}>{first.deskLabel}</span>
        </div>
        <div style={styles.cardActions}>
          {!isPast && (
            <button style={styles.cancelBtn} onClick={onCancelSeries}>
              Cancel all
            </button>
          )}
          <button style={styles.viewBtn} onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Hide" : "Show all"}
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div style={styles.seriesList}>
          {items.map((b) => {
            const isBPast = b.date < today;
            return (
              <div key={b.id} style={{ ...styles.seriesRow, opacity: isBPast ? 0.55 : 1 }}>
                <span style={styles.seriesDate}>{fmtDate(b.date)}</span>
                {!isBPast && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={styles.viewBtnSm} onClick={() => onNavigate(b)}>View</button>
                    <button style={styles.cancelBtnSm} onClick={() => onCancelOne(b)}>Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 64px" },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 32, color: "#111" },
  error: { color: "#dc2626", marginBottom: 16, fontSize: 14 },
  muted: { color: "#888" },
  emptyState: { display: "flex", flexDirection: "column", gap: 16, marginTop: 8 },
  ctaBtn: {
    padding: "10px 20px", borderRadius: 8, border: "none",
    background: "#5E17EB", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  section: { marginBottom: 40 },
  sectionTitle: {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.07em", color: "#5E17EB", marginBottom: 12,
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", background: "#fff",
    border: "1px solid #e2e8f0", borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
  },
  cardLeft: { display: "flex", flexDirection: "column", gap: 5 },
  dateLabel: { fontSize: 15, fontWeight: 600, color: "#111" },
  dateRange: { fontSize: 14, fontWeight: 600, color: "#111" },
  locationLine: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#666" },
  officeName: { fontWeight: 500 },
  sep: { color: "#ccc" },
  deskChip: {
    display: "inline-block", background: "#ede9fe", color: "#5E17EB",
    fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20, alignSelf: "flex-start",
  },
  seriesBadge: {
    background: "#f0fdf4", color: "#15803d", fontSize: 12,
    fontWeight: 700, padding: "2px 9px", borderRadius: 20,
  },
  cardActions: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 16 },
  viewBtn: {
    padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db",
    background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#444",
  },
  cancelBtn: {
    padding: "6px 14px", borderRadius: 6, border: "none",
    background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
  seriesList: {
    marginTop: 12, borderTop: "1px solid #f0f0f0", paddingTop: 10,
    display: "flex", flexDirection: "column", gap: 6,
  },
  seriesRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "6px 4px",
  },
  seriesDate: { fontSize: 13, color: "#444" },
  viewBtnSm: {
    padding: "4px 10px", borderRadius: 5, border: "1px solid #d1d5db",
    background: "#fff", cursor: "pointer", fontSize: 12, color: "#444",
  },
  cancelBtnSm: {
    padding: "4px 10px", borderRadius: 5, border: "none",
    background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 600,
  },
};
