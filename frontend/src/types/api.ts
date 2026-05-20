export interface Office {
  id: number;
  name: string;
  address: string;
}

export interface Floor {
  id: number;
  officeId: number;
  name: string;
  viewBox: string;
  svgBackground?: string;
}

export interface Desk {
  id: number;
  floorId: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Booking {
  id: number;
  deskId: number;
  date: string;
  userName: string;
  userEmail: string;
  seriesId: number | null;
  createdAt: string;
}

export interface BookingResult {
  created: Booking[];
  failed: { date: string; error: string }[];
}

export interface MeetingRoom {
  id: number;
  floorId: number;
  name: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomBooking {
  id: number;
  roomId: number;
  date: string;
  startHour: number;
  endHour: number;
  userName: string;
  userEmail: string;
  title: string | null;
  createdAt: string;
}

export interface MyRoomBooking {
  id: number;
  date: string;
  startHour: number;
  endHour: number;
  title: string | null;
  createdAt: string;
  roomId: number;
  roomName: string;
  floorId: number;
  floorName: string;
  officeId: number;
  officeName: string;
}

export interface MyBooking {
  id: number;
  date: string;
  createdAt: string;
  seriesId: number | null;
  deskId: number;
  deskLabel: string;
  floorId: number;
  floorName: string;
  officeId: number;
  officeName: string;
}
