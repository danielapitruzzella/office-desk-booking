import type { Office, Floor, Desk, Booking, BookingResult, MyBooking, MeetingRoom, RoomBooking, MyRoomBooking } from "../types/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  offices: {
    list: () => get<Office[]>("/api/offices"),
    get: (id: number) => get<Office>(`/api/offices/${id}`),
    floors: (id: number) => get<Floor[]>(`/api/offices/${id}/floors`),
  },
  floors: {
    get: (id: number) => get<Floor>(`/api/floors/${id}`),
    desks: (id: number) => get<Desk[]>(`/api/floors/${id}/desks`),
    meetingRooms: (id: number) => get<MeetingRoom[]>(`/api/meeting-rooms?floor_id=${id}`),
  },
  roomBookings: {
    forRoom: (roomId: number, date: string) =>
      get<RoomBooking[]>(`/api/room-bookings?room_id=${roomId}&date=${date}`),
    forFloor: (floorId: number, date: string) =>
      get<RoomBooking[]>(`/api/room-bookings?floor_id=${floorId}&date=${date}`),
    mine: (userEmail: string) =>
      get<MyRoomBooking[]>(`/api/room-bookings/mine?user_email=${encodeURIComponent(userEmail)}`),
    create: async (body: {
      room_id: number; date: string; start_hour: number; end_hour: number;
      user_name: string; user_email: string; title?: string;
    }): Promise<RoomBooking> => {
      const res = await fetch("/api/room-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw Object.assign(new Error(data.error ?? "Failed"), { status: res.status, data });
      return data;
    },
    delete: async (id: number, userEmail: string): Promise<void> => {
      const res = await fetch(`/api/room-bookings/${id}?user_email=${encodeURIComponent(userEmail)}`, { method: "DELETE" });
      if (res.status !== 204 && !res.ok) throw new Error(`DELETE room-booking ${id} → ${res.status}`);
    },
  },
  bookings: {
    list: (floorId: number, date: string) =>
      get<Booking[]>(`/api/bookings?floor_id=${floorId}&date=${date}`),
    mine: (userEmail: string) =>
      get<MyBooking[]>(`/api/bookings/mine?user_email=${encodeURIComponent(userEmail)}`),
    create: async (body: {
      desk_id: number;
      date: string;
      user_name: string;
      user_email: string;
      weeks?: number;
    }): Promise<BookingResult> => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(`POST /api/bookings → ${res.status}`);
      return data as BookingResult;
    },
    delete: async (id: number, userEmail: string): Promise<void> => {
      const res = await fetch(`/api/bookings/${id}?user_email=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
      });
      if (res.status !== 204 && !res.ok) throw new Error(`DELETE /api/bookings/${id} → ${res.status}`);
    },
    deleteSeries: async (seriesId: number, userEmail: string): Promise<{ cancelled: number }> => {
      const res = await fetch(
        `/api/bookings/series/${seriesId}?user_email=${encodeURIComponent(userEmail)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`DELETE series ${seriesId} → ${res.status}`);
      return res.json();
    },
  },
};
