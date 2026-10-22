## Foundation

- [x] Record prototype assumptions in place of stakeholder confirmation. (2026-10-12: Owner approved synthetic data, Eastern time, configurable weekday availability, coverage visit lifecycle/no-show handling, provider recommendation rules, and the first scheduling slice; see PLANNING.md and decision D13.)
- [x] Choose the database after validating overlap-prevention and coverage transactions. (2026-09-14: PostgreSQL + Prisma confirmed; see PLANNING.md Confirmed Stack.)
- [x] Define first-slice role permissions for practice managers, front desk staff, and providers. (2026-10-13: Recorded PRD-aligned permissions in PLANNING.md and D15.)
- [x] Define the first-slice domain model and audit-event model. (2026-10-13: Recorded entities and integrity rules in PLANNING.md and D15.)
- [x] Scaffold the repo: `client/` (React + Vite) and `server/` (Node + Express), plain JavaScript. (2026-09-18: Root npm workspace, client dev/build scripts, server health check endpoint at `/api/health` — validated with `npm install`, `npm run build:client`, and a manual server start/health check.)
- [x] Set up PostgreSQL and Prisma; use a native PostgreSQL installation on this machine, support Docker Compose as an alternative, and write the first migration. (2026-10-15: Installed PostgreSQL 17.11, applied the Prisma 6.12.0 migration, generated the client, verified the `btree_gist` extension and overlap constraint, and confirmed a cross-schedule overlap is rejected.)
- [ ] Before moving forward with implementation, review the Prisma files, understand the database setup, and practice interacting with PostgreSQL in pgAdmin.
- [ ] Add Zod validation at the API route boundary as a standard pattern for all endpoints.
- [ ] Set up Vitest/Jest + Supertest for the server, and React Testing Library for the client, running scheduling-related tests against a real PostgreSQL database (native or Docker).
- [x] Create `.env.example` with placeholder values only; confirm `.gitignore` excludes `node_modules`, `.env`, and local Docker data. (2026-10-13: Added root placeholder settings; existing ignore rules already cover these paths.)

## Scheduling

- [ ] Seed a fictional 16-provider roster and configurable availability rules; explicitly enter variable/part-time availability.
- [ ] Implement shared provider availability across scheduled and urgent care schedules.
- [ ] Implement overlap prevention for create, move, and replacement operations.
- [ ] Build the first scheduling slice: day schedule, scheduled/urgent care booking and cancellation, eligibility and coverage guards, and clear booking-block reasons.
- [ ] Implement extended visits, standard visits, charting buffers, automatic breaks, and clinic blackout windows.
- [ ] Implement provider type, credential, pediatric, availability, and workload matching filters.
- [ ] Implement coverage guards and utilization tracking.

## Operations

- [ ] Implement cancellations, no-shows, waitlist management, and provider-absence replacement workflows.
- [ ] Implement provider read-only schedule views and schedule-change requests.
- [ ] Implement SMS confirmations and reminders.
- [ ] Implement Outlook synchronization with email fallback.
- [ ] Implement the five practice manager reports.

## Validation

- [ ] Add tests for cross-schedule double-booking and constraint enforcement.
- [ ] Add tests for permissions, coverage limits, cancellations, waitlists, and replacements.
- [ ] Validate accessibility, auditability, security, and integration failure handling.

## Discovered During Work

- [ ] 2026-10-07: Delete the temporary `docs/copilot-notes/` folder (personal Copilot advice notes) before the project is finalized.
- [ ] 2026-10-13: Update the existing development-only `source-map-js` dependency from 1.2.1 to a fixed release (>=1.2.2) for GHSA-68fv-2mgg-jv7q; confirmed present in the baseline lockfile.
- [x] 2026-10-22: Re-themed the project as an original portfolio project (fictional family-medicine clinic with urgent care, 16 providers); removed source-company references, brand assets, original PRD, and the old migration; wrote a new PRD and a fresh initial migration (D16).
- [ ] 2026-10-22: Scrub docs/copilot-notes/ of old-domain terms (deferred by the owner) or delete the folder.
- [ ] 2026-10-22: Decide how to remove the original content from git history before the repository is made public (owner is deferring this).
- [ ] 2026-10-22: Rename the local folder and GitHub repository to match the new name, and recreate the local databases (clinic_scheduling, clinic_scheduling_shadow) and update the local .env.
