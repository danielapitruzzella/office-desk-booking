import { Router } from "express";
import { db } from "../db/client";
import { floors, desks } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [floor] = await db.select().from(floors).where(eq(floors.id, id));
  if (!floor) return res.status(404).json({ error: "Not found" });
  return res.json(floor);
});

router.get("/:id/desks", async (req, res) => {
  const floorId = Number(req.params.id);
  const rows = await db.select().from(desks).where(eq(desks.floorId, floorId));
  res.json(rows);
});

export default router;
