# Office Desk Booking — Project Guide

## GSD Workflow

This project uses the Get Shit Done (GSD) workflow.

### Key commands

```
/gsd:discuss-phase <N>   # Clarify approach before planning
/gsd:plan-phase <N>      # Generate execution plan for a phase
/gsd:execute-phase <N>   # Execute all plans in a phase
/gsd:verify-work         # Validate delivered features via UAT
/gsd:progress            # Check current phase status
```

**Current state:** See `.planning/STATE.md`
**Roadmap:** See `.planning/ROADMAP.md`
**Requirements:** See `.planning/REQUIREMENTS.md`

### Workflow rules

- Always check `.planning/STATE.md` before starting any work
- Complete phases in order (Phase 1 → 2 → 3 → 4)
- Never skip verification after execution

## Project: Office Desk Booking

Internal tool for employees to book specific desks in an office. Multiple offices, multiple floors per office, SVG floor plan per floor with clickable desk overlays. No authentication — name + email identification.

**Stack:** Node/Express + TypeScript (port 3001) | React + Vite (port 5173) | SQLite via Drizzle ORM

**Dev start:** `npm run dev` from repo root (starts both servers via concurrently)

**First time setup:**
```bash
npm install
cd backend && npm install && npm run migrate && npm run seed
cd ../frontend && npm install
```
