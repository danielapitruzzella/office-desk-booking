import { sqliteTable, integer, text, real, unique } from "drizzle-orm/sqlite-core";
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
