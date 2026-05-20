import { db } from "./db/client";
import { offices, floors, desks, bookings } from "./db/schema";

// ─── SVG helpers ───────────────────────────────────────────────────────────

function chair(x: number, y: number) {
  // small rounded rect representing a seat
  return `<rect x="${x}" y="${y}" width="14" height="28" rx="3" fill="#b0b0b0" opacity="0.7"/>`;
}

// Chairs on the right side of a left-zone desk
function leftDeskChairs(dx: number, dy: number, dw: number, dh: number) {
  const cx = dx + dw + 10;
  const cy1 = dy + 4;
  const cy2 = dy + dh - 4 - 28;
  return chair(cx, cy1) + chair(cx, cy2);
}

// Chairs on the left side of a right-zone desk
function rightDeskChairs(dx: number, dy: number, dh: number) {
  const cx = dx - 24;
  const cy1 = dy + 4;
  const cy2 = dy + dh - 4 - 28;
  return chair(cx, cy1) + chair(cx, cy2);
}

// ─── Rome floor plan ──────────────────────────────────────────────────────

// Desk positions (x, y, w=160, h=58) — used in SVG background chairs AND seed desks
const DW = 160;
const DH = 58;

const romeDesks = [
  // Zone A – top-left
  { label: "A1", x: 60,  y: 115 },
  { label: "A2", x: 60,  y: 197 },
  { label: "A3", x: 60,  y: 279 },
  // Zone B – bottom-left
  { label: "B1", x: 60,  y: 420 },
  { label: "B2", x: 60,  y: 502 },
  { label: "B3", x: 60,  y: 584 },
  // Zone C – top-right
  { label: "C1", x: 980, y: 115 },
  { label: "C2", x: 980, y: 197 },
  { label: "C3", x: 980, y: 279 },
  // Zone D – bottom-right
  { label: "D1", x: 980, y: 420 },
  { label: "D2", x: 980, y: 502 },
  { label: "D3", x: 980, y: 584 },
];

function buildRomeSvg() {
  const deskChairs = [
    ...romeDesks.slice(0, 6).map(d => leftDeskChairs(d.x, d.y, DW, DH)),
    ...romeDesks.slice(6).map(d => rightDeskChairs(d.x, d.y, DH)),
  ].join("\n  ");

  return `
<g>
  <!-- Floor boundary -->
  <rect x="20" y="20" width="1160" height="860" rx="6" fill="#fafafa" stroke="#888" stroke-width="3"/>

  <!-- Zone A background – top-left -->
  <rect x="42" y="98" width="196" height="260" rx="6" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="140" y="90" text-anchor="middle" font-size="11" fill="#7c3aed" font-family="sans-serif" font-weight="700" letter-spacing="1">ZONE A</text>

  <!-- Zone B background – bottom-left -->
  <rect x="42" y="403" width="196" height="260" rx="6" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="140" y="395" text-anchor="middle" font-size="11" fill="#7c3aed" font-family="sans-serif" font-weight="700" letter-spacing="1">ZONE B</text>

  <!-- Zone C background – top-right -->
  <rect x="962" y="98" width="196" height="260" rx="6" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="1060" y="90" text-anchor="middle" font-size="11" fill="#7c3aed" font-family="sans-serif" font-weight="700" letter-spacing="1">ZONE C</text>

  <!-- Zone D background – bottom-right -->
  <rect x="962" y="403" width="196" height="260" rx="6" fill="#ede9fe" stroke="#c4b5fd" stroke-width="1.5"/>
  <text x="1060" y="395" text-anchor="middle" font-size="11" fill="#7c3aed" font-family="sans-serif" font-weight="700" letter-spacing="1">ZONE D</text>

  <!-- Chair indicators (painted behind desk overlays) -->
  ${deskChairs}

  <!-- Kitchen – centre -->
  <rect x="440" y="45" width="320" height="310" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="2"/>
  <text x="600" y="78" text-anchor="middle" font-size="13" fill="#15803d" font-family="sans-serif" font-weight="700" letter-spacing="1">KITCHEN</text>
  <rect x="462" y="90" width="276" height="200" rx="4" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <!-- Appliances -->
  <text x="530" y="205" text-anchor="middle" font-size="30" font-family="sans-serif">🔥</text>
  <text x="600" y="205" text-anchor="middle" font-size="30" font-family="sans-serif">❄️</text>
  <text x="670" y="205" text-anchor="middle" font-size="30" font-family="sans-serif">🚰</text>
  <text x="530" y="270" text-anchor="middle" font-size="10" fill="#15803d" font-family="sans-serif">Microwave</text>
  <text x="600" y="270" text-anchor="middle" font-size="10" fill="#15803d" font-family="sans-serif">Fridge</text>
  <text x="670" y="270" text-anchor="middle" font-size="10" fill="#15803d" font-family="sans-serif">Sink</text>

  <!-- Wall separating work area from meeting rooms -->
  <rect x="20" y="678" width="1160" height="9" fill="#888"/>

  <!-- Meeting room dividers -->
  <rect x="413" y="687" width="7" height="193" fill="#888"/>
  <rect x="780" y="687" width="7" height="193" fill="#888"/>

  <!-- Meeting room fills -->
  <rect x="27"  y="687" width="386" height="193" fill="#eef2ff"/>
  <rect x="420" y="687" width="360" height="193" fill="#eef2ff"/>
  <rect x="787" y="687" width="393" height="193" fill="#eef2ff"/>

  <!-- Meeting room labels -->
  <text x="220"  y="722" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700">Meeting Room 1</text>
  <text x="600"  y="722" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700">Meeting Room 2</text>
  <text x="983"  y="722" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif" font-weight="700">Meeting Room 3</text>

  <!-- Conference tables -->
  <ellipse cx="220"  cy="810" rx="85" ry="38" fill="#c7d2fe" stroke="#818cf8" stroke-width="2"/>
  <ellipse cx="600"  cy="810" rx="85" ry="38" fill="#c7d2fe" stroke="#818cf8" stroke-width="2"/>
  <ellipse cx="983"  cy="810" rx="85" ry="38" fill="#c7d2fe" stroke="#818cf8" stroke-width="2"/>

  <!-- Chairs around MR1 table -->
  <circle cx="220" cy="762" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="220" cy="858" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="145" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="295" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="170" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="170" cy="846" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="270" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="270" cy="846" r="11" fill="#818cf8" opacity="0.55"/>

  <!-- Chairs around MR2 table -->
  <circle cx="600" cy="762" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="600" cy="858" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="525" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="675" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="550" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="550" cy="846" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="650" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="650" cy="846" r="11" fill="#818cf8" opacity="0.55"/>

  <!-- Chairs around MR3 table -->
  <circle cx="983" cy="762" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="983" cy="858" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="908" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="1058" cy="810" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="933" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="933" cy="846" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="1033" cy="774" r="11" fill="#818cf8" opacity="0.55"/>
  <circle cx="1033" cy="846" r="11" fill="#818cf8" opacity="0.55"/>
</g>`.trim();
}

// ─── Milan placeholder SVG ────────────────────────────────────────────────

function buildMilanFloorSvg(floorLabel: string) {
  return `
<g>
  <rect x="20" y="20" width="1160" height="760" rx="6" fill="#fafafa" stroke="#888" stroke-width="3"/>
  <rect x="20" y="20" width="1160" height="60" fill="#e5e7eb" stroke="#888" stroke-width="2"/>
  <text x="600" y="58" text-anchor="middle" font-size="22" fill="#555" font-family="sans-serif" font-weight="600">${floorLabel}</text>
  <rect x="40" y="640" width="180" height="130" rx="4" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <text x="130" y="710" text-anchor="middle" font-size="13" fill="#15803d" font-family="sans-serif">Kitchen</text>
  <rect x="900" y="640" width="260" height="130" rx="4" fill="#eef2ff" stroke="#818cf8" stroke-width="1.5"/>
  <text x="1030" y="710" text-anchor="middle" font-size="13" fill="#3730a3" font-family="sans-serif">Meeting Room</text>
</g>`.trim();
}

// ─── Seed ─────────────────────────────────────────────────────────────────

async function seed() {
  console.log("Wiping existing data...");
  await db.delete(bookings);
  await db.delete(desks);
  await db.delete(floors);
  await db.delete(offices);

  console.log("Inserting offices...");
  const [rome, milan] = await db
    .insert(offices)
    .values([
      { name: "Rome",  address: "Via del Corso 14, 00186 Roma RM" },
      { name: "Milan", address: "Via Brera 5, 20121 Milano MI" },
    ])
    .returning();

  console.log("Inserting floors...");
  const [romeFloor] = await db
    .insert(floors)
    .values([
      {
        officeId: rome.id,
        name: "Floor 1",
        svgBackground: buildRomeSvg(),
        viewBox: "0 0 1200 900",
      },
    ])
    .returning();

  const [milanF1, milanF2] = await db
    .insert(floors)
    .values([
      {
        officeId: milan.id,
        name: "Floor 1",
        svgBackground: buildMilanFloorSvg("Milan – Floor 1"),
        viewBox: "0 0 1200 800",
      },
      {
        officeId: milan.id,
        name: "Floor 2",
        svgBackground: buildMilanFloorSvg("Milan – Floor 2"),
        viewBox: "0 0 1200 800",
      },
    ])
    .returning();

  console.log("Inserting desks...");

  // Rome – 12 desks from romeDesks array
  await db.insert(desks).values(
    romeDesks.map((d) => ({
      floorId: romeFloor.id,
      label: d.label,
      x: d.x,
      y: d.y,
      width: DW,
      height: DH,
    }))
  );

  // Milan Floor 1 – 8 desks in two rows
  const milanDeskW = 100;
  const milanDeskH = 55;
  await db.insert(desks).values([
    { floorId: milanF1.id, label: "M1-01", x: 80,  y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-02", x: 210, y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-03", x: 340, y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-04", x: 470, y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-05", x: 80,  y: 260, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-06", x: 210, y: 260, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-07", x: 340, y: 260, width: milanDeskW, height: milanDeskH },
    { floorId: milanF1.id, label: "M1-08", x: 470, y: 260, width: milanDeskW, height: milanDeskH },
  ]);

  // Milan Floor 2 – 6 desks
  await db.insert(desks).values([
    { floorId: milanF2.id, label: "M2-01", x: 80,  y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF2.id, label: "M2-02", x: 210, y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF2.id, label: "M2-03", x: 340, y: 120, width: milanDeskW, height: milanDeskH },
    { floorId: milanF2.id, label: "M2-04", x: 80,  y: 260, width: milanDeskW, height: milanDeskH },
    { floorId: milanF2.id, label: "M2-05", x: 210, y: 260, width: milanDeskW, height: milanDeskH },
    { floorId: milanF2.id, label: "M2-06", x: 340, y: 260, width: milanDeskW, height: milanDeskH },
  ]);

  console.log("Seed complete.");
  console.log(`  Rome:  1 floor, 12 desks (zones A–D)`);
  console.log(`  Milan: 2 floors, 8 + 6 desks`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
