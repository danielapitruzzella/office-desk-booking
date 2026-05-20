import { Router } from "express";
import { db } from "../db/client";
import { offices, floors } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(offices);
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [office] = await db.select().from(offices).where(eq(offices.id, id));
  if (!office) return res.status(404).json({ error: "Not found" });
  return res.json(office);
});

router.get("/:id/floors", async (req, res) => {
  const officeId = Number(req.params.id);
  const rows = await db
    .select({
      id: floors.id,
      officeId: floors.officeId,
      name: floors.name,
      viewBox: floors.viewBox,
    })
    .from(floors)
    .where(eq(floors.officeId, officeId));
  res.json(rows);
});

export default router;
