import { Router } from "express";
import { db } from "../db/client";
import { desks } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/floor/:floorId", async (req, res) => {
  const floorId = Number(req.params.floorId);
  const rows = await db.select().from(desks).where(eq(desks.floorId, floorId));
  res.json(rows);
});

export default router;
