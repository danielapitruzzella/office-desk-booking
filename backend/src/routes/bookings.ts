import { Router } from "express";
import { db } from "../db/client";
import { bookings, desks, floors, offices } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

function addWeeks(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n * 7);
  return d.toISOString().split("T")[0];
}

// GET /api/bookings/mine
router.get("/mine", async (req, res) => {
  const { user_email } = req.query;
  if (!user_email) return res.status(400).json({ error: "user_email is required" });

  const rows = await db
    .select({
      id: bookings.id,
      date: bookings.date,
      createdAt: bookings.createdAt,
      seriesId: bookings.seriesId,
      deskId: bookings.deskId,
      deskLabel: desks.label,
      floorId: floors.id,
      floorName: floors.name,
      officeId: offices.id,
      officeName: offices.name,
    })
    .from(bookings)
    .innerJoin(desks, eq(bookings.deskId, desks.id))
    .innerJoin(floors, eq(desks.floorId, floors.id))
    .innerJoin(offices, eq(floors.officeId, offices.id))
    .where(eq(bookings.userEmail, String(user_email)))
    .orderBy(bookings.date);

  return res.json(rows);
});

// GET /api/bookings?floor_id=X&date=YYYY-MM-DD
router.get("/", async (req, res) => {
  const { floor_id, date } = req.query;
  if (!floor_id || !date) return res.status(400).json({ error: "floor_id and date are required" });

  const floorDesks = await db.select({ id: desks.id }).from(desks).where(eq(desks.floorId, Number(floor_id)));
  if (floorDesks.length === 0) return res.json([]);

  const deskIds = floorDesks.map((d) => d.id);
  const rows = await db
    .select()
    .from(bookings)
    .where(and(inArray(bookings.deskId, deskIds), eq(bookings.date, String(date))));

  return res.json(rows);
});

// POST /api/bookings
// body: { desk_id, date, user_name, user_email, weeks? }
// Returns: { created: Booking[], failed: { date, error }[] }
router.post("/", async (req, res) => {
  const { desk_id, date, user_name, user_email, weeks = 1 } = req.body;
  if (!desk_id || !date || !user_name || !user_email) {
    return res.status(400).json({ error: "desk_id, date, user_name and user_email are required" });
  }

  const numWeeks = Math.min(26, Math.max(1, Number(weeks)));
  const seriesId = numWeeks > 1 ? Date.now() : null;

  const created: (typeof bookings.$inferSelect)[] = [];
  const failed: { date: string; error: string }[] = [];

  for (let i = 0; i < numWeeks; i++) {
    const bookingDate = addWeeks(date, i);

    const [userConflict] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.userEmail, user_email), eq(bookings.date, bookingDate)))
      .limit(1);

    if (userConflict) {
      failed.push({ date: bookingDate, error: "You already have a booking on this date" });
      continue;
    }

    try {
      const [booking] = await db
        .insert(bookings)
        .values({ deskId: Number(desk_id), date: bookingDate, userName: user_name, userEmail: user_email, seriesId })
        .returning();
      created.push(booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE")) {
        failed.push({ date: bookingDate, error: "Desk already taken on this date" });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  const status = created.length > 0 ? 201 : 409;
  return res.status(status).json({ created, failed });
});

// DELETE /api/bookings/series/:seriesId
router.delete("/series/:seriesId", async (req, res) => {
  const seriesId = Number(req.params.seriesId);
  const { user_email } = req.query;
  if (!user_email) return res.status(400).json({ error: "user_email is required" });

  const today = new Date().toISOString().split("T")[0];

  // Only delete future bookings in the series owned by this user
  const toDelete = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.seriesId, seriesId), eq(bookings.userEmail, String(user_email))));

  const future = toDelete.filter((b) => b.date >= today);
  if (future.length === 0) return res.status(404).json({ error: "No future bookings found in this series" });

  for (const b of future) {
    await db.delete(bookings).where(eq(bookings.id, b.id));
  }

  return res.json({ cancelled: future.length });
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { user_email } = req.query;
  if (!user_email) return res.status(400).json({ error: "user_email is required" });

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!booking) return res.status(404).json({ error: "Not found" });
  if (booking.userEmail !== String(user_email)) return res.status(403).json({ error: "Email does not match booking" });

  await db.delete(bookings).where(eq(bookings.id, id));
  return res.status(204).send();
});

export default router;
