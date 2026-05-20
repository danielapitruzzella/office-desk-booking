import { useState, useMemo } from "react";
import { api } from "../api/client";
import { useUser } from "../context/UserContext";
import type { Booking, BookingResult } from "../types/api";
import type { Desk } from "../types/api";

interface Props {
  desk: Desk;
  date: string;
  existingBooking: Booking | undefined;
  onClose: (refreshNeeded: boolean) => void;
}

function addWeeks(dateStr: string, n: number) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().split("T")[0];
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

const WEEK_OPTIONS = [2, 3, 4, 6, 8, 10, 12];

export default function BookingModal({ desk, date, existingBooking, onClose }: Props) {
  const { user } = useUser();
  const [recurring, setRecurring] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");

  const isTaken = !!existingBooking;
  const isOwn = existingBooking?.userEmail === user?.email;

  const previewDates = useMemo(() => {
    const count = recurring ? weeks : 1;
    return Array.from({ length: count }, (_, i) => addWeeks(date, i));
  }, [date, recurring, weeks]);

  const handleBook = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.bookings.create({
        desk_id: desk.id,
        date,
        user_name: user.name,
        user_email: user.email,
        weeks: recurring ? weeks : 1,
      });
      setResult(res);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!existingBooking || !user) return;
    setLoading(true);
    try {
      await api.bookings.delete(existingBooking.id, existingBooking.userEmail);
      onClose(true);
    } catch {
      setError("Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  // ── Result screen ───────────────────────────────────────────────────────
  if (result) {
    const allOk = result.failed.length === 0;
    const allFailed = result.created.length === 0;
    return (
      <div style={styles.overlay} onClick={() => onClose(result.created.length > 0)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {allFailed ? "❌" : allOk ? "✅" : "⚠️"}
          </div>
          <h2 style={styles.title}>
            {allFailed
              ? "No bookings created"
              : allOk
              ? `${result.created.length} booking${result.created.length > 1 ? "s" : ""} confirmed`
              : `${result.created.length} of ${result.created.length + result.failed.length} bookings confirmed`}
          </h2>
          {result.created.length > 0 && (
            <div style={styles.resultSection}>
              <p style={styles.resultLabel}>Confirmed</p>
              {result.created.map((b) => (
                <div key={b.id} style={styles.resultRow}>
                  <span style={styles.dot} />
                  {fmtDate(b.date)}
                </div>
              ))}
            </div>
          )}
          {result.failed.length > 0 && (
            <div style={styles.resultSection}>
              <p style={{ ...styles.resultLabel, color: "#dc2626" }}>Skipped</p>
              {result.failed.map((f) => (
                <div key={f.date} style={{ ...styles.resultRow, color: "#dc2626" }}>
                  <span style={{ ...styles.dot, background: "#dc2626" }} />
                  {fmtDate(f.date)} — {f.error}
                </div>
              ))}
            </div>
          )}
          <div style={{ ...styles.actions, marginTop: 20 }}>
            <button style={styles.btnPrimary} onClick={() => onClose(result.created.length > 0)}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking form ────────────────────────────────────────────────────────
  return (
    <div style={styles.overlay} onClick={() => onClose(false)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          {isTaken ? (isOwn ? "Your booking" : "Desk unavailable") : "Book desk"}
        </h2>
        <div style={styles.meta}>
          <span style={styles.deskChip}>{desk.label}</span>
          <span style={styles.dateLabel}>{fmtDate(date)}</span>
        </div>

        {isTaken && !isOwn ? (
          <p style={styles.takenMsg}>Booked by <strong>{existingBooking!.userName}</strong>.</p>
        ) : (
          <>
            {/* User identity row */}
            <div style={styles.userRow}>
              <div style={styles.avatar}>{user?.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
            </div>

            {/* Recurring toggle — only for new bookings */}
            {!isTaken && (
              <div style={styles.recurringSection}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Repeat weekly
                </label>

                {recurring && (
                  <div style={styles.weeksRow}>
                    <span style={styles.weeksLabel}>for</span>
                    <select
                      value={weeks}
                      onChange={(e) => setWeeks(Number(e.target.value))}
                      style={styles.select}
                    >
                      {WEEK_OPTIONS.map((w) => (
                        <option key={w} value={w}>{w} weeks</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date preview */}
                <div style={styles.preview}>
                  <p style={styles.previewLabel}>
                    {recurring ? `Will book ${weeks} dates:` : "Booking:"}
                  </p>
                  <div style={styles.dateList}>
                    {previewDates.map((d, i) => (
                      <span key={d} style={styles.datePill}>
                        {i === 0 && !recurring ? fmtDate(d) : fmtDate(d)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button style={styles.btnSecondary} onClick={() => onClose(false)} disabled={loading}>
            Close
          </button>
          {!isTaken && (
            <button style={styles.btnPrimary} onClick={handleBook} disabled={loading}>
              {loading ? "Booking…" : recurring ? `Book ${weeks} weeks` : "Confirm"}
            </button>
          )}
          {isOwn && (
            <button style={styles.btnDanger} onClick={handleCancel} disabled={loading}>
              {loading ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modal: {
    background: "#fff", borderRadius: 14, padding: "28px 32px",
    width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,.2)",
  },
  title: { fontSize: 17, fontWeight: 700, marginBottom: 12, color: "#111" },
  meta: { display: "flex", gap: 10, alignItems: "center", marginBottom: 16 },
  deskChip: {
    background: "#ede9fe", color: "#5E17EB", fontWeight: 700,
    fontSize: 13, padding: "3px 10px", borderRadius: 20,
  },
  dateLabel: { fontSize: 13, color: "#666" },
  takenMsg: { marginBottom: 20, color: "#444", fontSize: 14 },
  userRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%", background: "#5E17EB",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  userName: { fontSize: 14, fontWeight: 600, color: "#111" },
  userEmail: { fontSize: 12, color: "#888" },
  recurringSection: {
    background: "#fafafa", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "14px 16px", marginBottom: 16,
    display: "flex", flexDirection: "column", gap: 10,
  },
  toggleLabel: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, fontWeight: 600, color: "#333", cursor: "pointer",
  },
  checkbox: { width: 16, height: 16, accentColor: "#5E17EB", cursor: "pointer" },
  weeksRow: { display: "flex", alignItems: "center", gap: 8 },
  weeksLabel: { fontSize: 13, color: "#555" },
  select: {
    padding: "5px 10px", borderRadius: 6, border: "1.5px solid #5E17EB",
    fontSize: 13, fontWeight: 600, color: "#5E17EB", background: "#fff", cursor: "pointer",
  },
  preview: { display: "flex", flexDirection: "column", gap: 6 },
  previewLabel: { fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" },
  dateList: { display: "flex", flexWrap: "wrap", gap: 6 },
  datePill: {
    background: "#ede9fe", color: "#5E17EB", fontSize: 12,
    padding: "3px 9px", borderRadius: 20, fontWeight: 500,
  },
  error: { color: "#dc2626", fontSize: 13, marginBottom: 12 },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  btnSecondary: {
    padding: "8px 16px", borderRadius: 7, border: "1px solid #d1d5db",
    background: "#fff", cursor: "pointer", fontSize: 14,
  },
  btnPrimary: {
    padding: "8px 16px", borderRadius: 7, border: "none",
    background: "#5E17EB", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
  btnDanger: {
    padding: "8px 16px", borderRadius: 7, border: "none",
    background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
  resultSection: { marginTop: 12, display: "flex", flexDirection: "column", gap: 4 },
  resultLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#16a34a", marginBottom: 2 },
  resultRow: { fontSize: 13, color: "#333", display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0 },
};
