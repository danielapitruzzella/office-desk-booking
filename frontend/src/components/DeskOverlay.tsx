import type { Desk, Booking } from "../types/api";

interface Props {
  desk: Desk;
  booking: Booking | undefined;
  currentUserEmail: string;
  onClick: () => void;
}

export default function DeskOverlay({ desk, booking, currentUserEmail, onClick }: Props) {
  const isTaken = !!booking;
  const isOwn = booking?.userEmail === currentUserEmail;

  const fill = isOwn ? "#f59e0b" : isTaken ? "#ef4444" : "#22c55e";
  const fillOpacity = 0.85;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect
        x={desk.x}
        y={desk.y}
        width={desk.width}
        height={desk.height}
        rx={4}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={isOwn ? "#d97706" : isTaken ? "#b91c1c" : "#16a34a"}
        strokeWidth={1.5}
      />
      <text
        x={desk.x + desk.width / 2}
        y={desk.y + desk.height / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontFamily="sans-serif"
        fill="#fff"
        fontWeight="600"
        pointerEvents="none"
      >
        {desk.label}
      </text>
      {isTaken && (
        <text
          x={desk.x + desk.width / 2}
          y={desk.y + desk.height / 2 + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontFamily="sans-serif"
          fill="rgba(255,255,255,.85)"
          pointerEvents="none"
        >
          {booking!.userName.split(" ")[0]}
        </text>
      )}
    </g>
  );
}
