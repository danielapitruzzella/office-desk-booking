import { sqliteTable, integer, text, real, unique, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const offices = sqliteTable("offices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
});

export const floors = sqliteTable("floors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  officeId: integer("office_id").notNull().references(() => offices.id),
  name: text("name").notNull(),
  svgBackground: text("svg_background").notNull().default(""),
  viewBox: text("view_box").notNull().default("0 0 1200 800"),
});

export const desks = sqliteTable("desks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  floorId: integer("floor_id").notNull().references(() => floors.id),
  label: text("label").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
});

export const meetingRooms = sqliteTable("meeting_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  floorId: integer("floor_id").notNull().references(() => floors.id),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(8),
  x: real("x").notNull(),
  y: real("y").notNull(),
  width: real("width").notNull(),
  height: real("height").notNull(),
});

export const roomBookings = sqliteTable(
  "room_bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    roomId: integer("room_id").notNull().references(() => meetingRooms.id),
    date: text("date").notNull(),
    startHour: integer("start_hour").notNull(),
    endHour: integer("end_hour").notNull(),
    userName: text("user_name").notNull(),
    userEmail: text("user_email").notNull(),
    title: text("title"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => ({
    roomDateIdx: index("room_date_idx").on(t.roomId, t.date),
  })
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    deskId: integer("desk_id").notNull().references(() => desks.id),
    date: text("date").notNull(),
    userName: text("user_name").notNull(),
    userEmail: text("user_email").notNull(),
    seriesId: integer("series_id"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => ({
    uniqueDeskDate: unique().on(t.deskId, t.date),
  })
);
