interface Props {
  date: string;
  onChange: (date: string) => void;
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export default function DayPicker({ date, onChange }: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={styles.wrapper}>
      <button
        style={styles.btn}
        disabled={date <= today}
        onClick={() => onChange(addDays(date, -1))}
      >
        ‹ Prev
      </button>
      <input
        type="date"
        value={date}
        min={today}
        onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
        style={styles.input}
      />
      <button style={styles.btn} onClick={() => onChange(addDays(date, 1))}>
        Next ›
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  btn: {
    padding: "6px 14px", borderRadius: 6, border: "1px solid #d1d5db",
    background: "#fff", cursor: "pointer", fontSize: 14,
  },
  input: { padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 },
};
