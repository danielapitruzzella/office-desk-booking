import { useRef, useState, useCallback, useEffect } from "react";
import type { Floor, Desk, Booking } from "../types/api";
import { useUser } from "../context/UserContext";
import DeskOverlay from "./DeskOverlay";

interface Props {
  floor: Floor;
  desks: Desk[];
  bookings: Booking[];
  onDeskClick: (desk: Desk) => void;
}

interface ZoomState {
  scale: number;
  tx: number;
  ty: number;
}

export default function FloorMap({ floor, desks, bookings, onDeskClick }: Props) {
  const { user } = useUser();
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const bookingsByDeskId = new Map(bookings.map((b) => [b.deskId, b]));

  // Non-passive wheel listener so we can call preventDefault() and block browser page zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => {
        const next = Math.min(4, Math.max(0.5, z.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
        return { ...z, scale: next };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: zoom.tx, ty: zoom.ty };
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setZoom((z) => ({ ...z, tx: dragRef.current!.tx + dx, ty: dragRef.current!.ty + dy }));
  }, []);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const resetZoom = () => setZoom({ scale: 1, tx: 0, ty: 0 });

  return (
    <div style={styles.wrapper}>
      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => setZoom((z) => ({ ...z, scale: Math.min(4, z.scale * 1.2) }))}>+</button>
        <button style={styles.btn} onClick={() => setZoom((z) => ({ ...z, scale: Math.max(0.5, z.scale * 0.8) }))}>−</button>
        <button style={styles.btn} onClick={resetZoom}>Reset</button>
      </div>
      <div
        ref={viewportRef}
        style={{ ...styles.viewport, cursor: dragRef.current ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={floor.viewBox}
          style={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${zoom.tx},${zoom.ty}) scale(${zoom.scale})`}>
            {floor.svgBackground && (
              <g dangerouslySetInnerHTML={{ __html: floor.svgBackground }} />
            )}
            {desks.map((desk) => (
              <DeskOverlay
                key={desk.id}
                desk={desk}
                booking={bookingsByDeskId.get(desk.id)}
                currentUserEmail={user?.email ?? ""}
                onClick={() => onDeskClick(desk)}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" },
  controls: { position: "absolute", top: 8, right: 8, display: "flex", gap: 4, zIndex: 10 },
  btn: { padding: "4px 10px", borderRadius: 6, border: "1px solid #d1d5db", background: "rgba(255,255,255,.9)", cursor: "pointer", fontSize: 14 },
  viewport: { width: "100%", userSelect: "none", touchAction: "none" },
  svg: { display: "block", width: "100%", height: "auto" },
};
