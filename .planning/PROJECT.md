# Office Desk Booking

## What This Is

A web app for employees to book specific desks in an office. Supports multiple offices, each with one or more floors. Each floor has a visual SVG floor plan where desks are clickable overlay elements. No authentication — users identify themselves with name and email, which are persisted in localStorage for convenience.

## Core Value

An employee can open the app, see which desks are available on a visual floor plan for a given day, and book one in seconds.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can select an office from a list
- [ ] User can select a floor within an office
- [ ] User can navigate to a specific date (prev/next + date input, past dates disabled)
- [ ] User can see a visual SVG floor plan with coloured desk overlays (green=available, red=taken, amber=own booking)
- [ ] User can click an available desk to open a booking modal
- [ ] User can book a desk by entering name + email (pre-filled from localStorage)
- [ ] User can cancel their own booking (validated by matching email)
- [ ] Double-booking is prevented: DB-level UNIQUE(desk_id, date) returns 409 to second user
- [ ] Floor plan supports zoom and pan via a useZoom hook
- [ ] Seed data provides 2 offices × 2 floors × 8–12 desks each for development

### Out of Scope

- Authentication / user accounts — deliberate; name+email is sufficient for internal tooling
- GDPR retention policy / privacy notice — noted as production concern, out of scope for v1
- Real SVG imports from design tools — seed data uses synthetic placeholder SVGs

## Context

- Monorepo with npm workspaces: `backend/` (Express, port 3001) + `frontend/` (React/Vite, port 5173)
- Vite proxies `/api/*` → `http://localhost:3001` — no CORS issues, no hardcoded URLs
- SVG approach: `svg_background` stores inner `<g>` content only; `view_box` stores coordinate space (e.g. `"0 0 1200 800"`); desk x/y/w/h use the same SVG user-unit space — no coordinate translation needed
- Race condition guard: `UNIQUE(desk_id, date)` at DB level is the final arbiter; 409 surfaced to user
- GDPR note: name+email are personal data — production should add retention policy and privacy notice

## Constraints

- **Tech Stack**: Node/Express + TypeScript backend, React + Vite frontend, SQLite via Drizzle ORM — decided upfront, not negotiable
- **No Auth**: Name + email identification only — simplicity requirement for internal tool
- **SVG Floor Plans**: Desks are SVG overlay elements in the same coordinate space as the background — no coordinate translation
- **Database**: SQLite with `better-sqlite3` — single-file DB, gitignored (`backend/data/booking.db`)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No authentication | Internal tool; name+email sufficient; avoids auth complexity | — Pending |
| SQLite via Drizzle ORM | Simple single-file DB for an internal tool; easy to migrate later | — Pending |
| SVG overlays in same coordinate space | Eliminates coordinate translation; `<svg viewBox>` handles responsive scaling | — Pending |
| UNIQUE(desk_id, date) DB constraint | Race condition guard at the DB layer; 409 surfaced to UI | — Pending |
| Monorepo with npm workspaces | Single `npm run dev` starts both servers via `concurrently` | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 after initialization*
