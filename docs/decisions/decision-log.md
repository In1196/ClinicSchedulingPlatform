# Decision Log

Records why each project decision was made, what else was considered, and when to revisit it. `PLANNING.md` holds the short decision table; this file holds the reasoning.

How to use it:
- Add an entry when a decision is made or changed. Do not rewrite old entries; mark them "Superseded" and add a new one.
- Entries marked "Not recorded" had no written alternatives at the time. Fill them in when the reasoning is discussed.
- Where an entry has a "Source" line, the reasoning was taken from the named planning session. Other entries include analysis added on 2026-10-07 that the owner has not yet confirmed.
- To challenge a decision, check its "Revisit when" line first.

Entry format: Decision, Status, Date, Options considered, Reason, Trade-offs, Revisit when.

---

## D1. Database: PostgreSQL

- **Status:** Confirmed. **Date:** 2026-09-14.
- **Options considered:** MongoDB (earlier default in the planning notes), PostgreSQL.
- **Reason:** The core rule is that a provider is never double-booked across the scheduled and urgent care schedules. This needs transactions and relational constraints that the database itself enforces.
- **Trade-offs:** A fixed schema and migrations require more up-front design than a document database.
- **Revisit when:** The domain model shows data that does not fit relational tables, or overlap prevention cannot be enforced in the database.

## D2. ORM and migrations: Prisma

- **Status:** Confirmed. **Date:** 2026-09-14.
- **Options considered:** Prisma or EF Core (EF Core only if the backend were .NET). Prisma was chosen because the backend is Node.
- **Reason:** Its schema file is plain and declarative, like a table definition, and it generates a JavaScript client, so the database and code stay in agreement without hand-written SQL everywhere. Migrations also document how the data model evolved. This works without TypeScript.
- **Trade-offs:** Adds a new tool to learn. Some database features (such as exclusion constraints for overlap prevention) may need raw SQL inside migrations.
- **Source:** Planning session 2026-09-14, turns 0 and 2.
- **Revisit when:** Overlap prevention requires database features Prisma cannot express cleanly.

## D3. Validation: Zod at the route boundary

- **Status:** Confirmed. **Date:** 2026-09-14.
- **Options considered:** Zod (Node) or FluentValidation (.NET). Zod was chosen because the backend is Node. A NestJS-style structure was considered and deferred; Zod plus a thin route pattern (route, validate, service, response) gives similar consistency without NestJS decorators or modules.
- **Reason:** All scheduling rules and input checks are enforced on the server, never trusted from the client. Zod schemas read like documentation of what data looks like, and it was judged a good first new tool because it stops bad data before it reaches scheduling rules.
- **Trade-offs:** Each endpoint needs a schema, which is extra code per route.
- **Source:** Planning session 2026-09-14, turns 0 and 2.
- **Revisit when:** A different validation approach is needed for a specific integration.

## D4. Local development and test database: PostgreSQL in Docker

- **Status:** Superseded by D14. **Date:** 2026-09-14.
- **Options considered:** Testcontainers (a throwaway database started per test run) or a simpler local Docker PostgreSQL; mocked database. A local Docker PostgreSQL was chosen as the simpler option.
- **Reason:** One database setup for development and tests. "No double booking" is a database-transaction guarantee, and a mock would let overlap bugs pass untested, so scheduling tests run against a real database.
- **Trade-offs:** Requires Docker to be installed and running. Tests are slower than mocked tests.
- **Revisit when:** Superseded on 2026-10-13 after Docker was identified as potentially impractical on the current machine; see D14.

## D5. Plain JavaScript, no TypeScript

- **Status:** Confirmed (deferred). **Date:** 2026-09-14.
- **Options considered:** TypeScript, JavaScript. NestJS, managed authentication, and Testcontainers-style tooling were separately judged additive and kept or deferred.
- **Reason:** TypeScript changes how every file reads, unlike the other options, which only add tools in specific places. Since AI writes the code and the owner reviews it, readable plain JavaScript was preferred. Stated by the owner in the planning session, 2026-09-14, turn 2.
- **Trade-offs:** No compile-time type checking. Type mistakes appear at runtime or in tests, and Zod covers only the API boundary.
- **Revisit when:** The codebase grows large enough that type errors become frequent, or the owner requests it.

## D6. React + Vite frontend, Node + Express backend

- **Status:** Confirmed. **Date:** 2026-09-03 (preferred), scaffolded 2026-09-18.
- **Options considered:** NestJS was explicitly deferred. C# was noted as acceptable but not chosen.
- **Reason:** Mainstream tools with the most learning material, matching the owner's stated preferences.
- **Trade-offs:** Express has little built-in structure, so project conventions must supply it.
- **Revisit when:** Backend structure becomes hard to maintain.

## D7. Deferred tools: BullMQ + Redis, managed authentication, observability stack

- **Status:** Confirmed (deferred). **Date:** 2026-09-14.
- **Reason:** Each adds new concepts and operating cost. BullMQ + Redis was recommended because the PRD needs reminders (24–48 hours out), the morning email fallback, Outlook sync, and provider-absence fill-in searches to survive failures and retries, which a durable job queue handles better than a simple timer or cron script. It stays isolated in a `jobs/` folder and is introduced only when those features are built. Hand-rolled sessions with role-based middleware are used for authentication until then.
- **Trade-offs:** Hand-rolled authentication carries more security responsibility than a managed provider.
- **Revisit when:** Authentication work begins. Re-evaluate managed providers against the privacy requirements at that point.

## D8. Linting: ESLint, no formatter yet

- **Status:** Confirmed. **Date:** 2026-09-18.
- **Options considered:** Oxlint (added automatically by the Vite template, removed), ESLint, no linter.
- **Reason:** ESLint is the mainstream choice, has React Hooks rules, and catches common mistakes early in plain JavaScript. Oxlint was not requested, so it was removed to keep dependencies as approved.
- **Trade-offs:** Extra devDependencies and two config files (client and server).
- **Revisit when:** A formatter (such as Prettier) is wanted, which is a separate decision.

## D9. Repository layout: npm workspaces

- **Status:** Confirmed. **Date:** 2026-09-18.
- **Options considered:** Separate installs per folder, npm workspaces.
- **Reason:** One `npm install` at the root installs both `client/` and `server/`, and shared scripts live in the root `package.json`.
- **Trade-offs:** Dependencies are hoisted to the root `node_modules`, which can hide a missing dependency declaration. Each workspace must declare what it imports.
- **Revisit when:** The client and server need different Node versions or separate deployment pipelines.

## D10. Test runner: Vitest or Jest (open)

- **Status:** Open. **Date:** 2026-09-14.
- **Options considered:** Vitest, Jest. Supertest and React Testing Library are confirmed regardless.
- **Reason:** Not yet decided. Vitest works naturally with Vite, which the client already uses.
- **Revisit when:** The test setup task starts. State the choice and reason, then wait for approval.

## D11. Git workflow: one session at a time, push to `main`

- **Status:** Confirmed. **Date:** 2026-10-07.
- **Options considered:** Pull requests for every change, direct pushes to `main`.
- **Reason:** Solo project, so direct pushes are faster. Agent sessions create separate worktrees, which caused divergent copies, so each session starts with a fetch and rebase and ends with a push.
- **Trade-offs:** No review step before changes reach `main`.
- **Update 2026-10-14:** No additional worktrees or branches. Agent sessions run in the main project folder on `main`, one session at a time. A leftover worktree was removed from Git (its commit was already on `main`).
- **Revisit when:** More contributors join, `main` needs protection, or two agent sessions need to run at the same time.

## D12. Deployment target: Microsoft Azure

- **Status:** Confirmed as the target; specific Azure services not yet chosen. **Date:** 2026-10-07.
- **Options considered:** Azure, other clouds, self-hosting. Only Azure was stated by the owner as the aim; the others were not evaluated.
- **Reason:** Stated by the owner on 2026-10-07. Outlook sync (Microsoft Graph and Entra ID) is already a PRD requirement, which fits an Azure deployment.
- **Consequences for current work (analysis, not yet confirmed by the owner):**
  - Application code stays portable: configuration is read from environment variables, never hard-coded.
  - Production database is expected to be Azure Database for PostgreSQL Flexible Server. The `btree_gist` extension must be allow-listed there before the overlap-prevention migration (D2) can run. SSL is required.
  - Local development and tests use real PostgreSQL; the supported local runtime options are recorded in D14.
  - Production migrations run with `prisma migrate deploy` in a pipeline, not `migrate dev`.
  - The API will need a container image or build pipeline before deployment.
  - Production secrets belong in Azure Key Vault or App Service settings, not `.env` files.
- **Trade-offs:** Managed services are billed continuously. Patient data hosted in a cloud may require a Business Associate Agreement and a HIPAA-eligible configuration; whether HIPAA applies is an open compliance question in `PLANNING.md`.
- **Revisit when:** Before the first deployment, or when the compliance questions are answered. Re-evaluate Entra ID against hand-rolled authentication (D7) when authentication work begins.

## D13. Prototype assumptions and first scheduling slice

- **Status:** Confirmed by the owner for the prototype. **Date:** 2026-10-12.
- **Assumptions:** Use fictional provider names and synthetic patient data only. Use `America/New_York` and configurable weekday availability; manually enter variable or part-time availability. Apply hard provider eligibility rules before recommending the eligible provider with the lightest scheduled workload. Count one booked appointment as one covered visit: reserve on booking, release on cancellation, consume on completion, and count a no-show as used by default with staff correction allowed. Block booking when the coverage is expired or has no visits remaining.
- **First slice:** A day schedule supporting scheduled/urgent care bookings and cancellations, eligibility checks, shared overlap prevention, coverage checks, and clear booking-block reasons.
- **Deferred:** Configure break periods instead of inferring their placement. Build waitlists, provider-absence replacements, real notifications, Outlook synchronization, and practice manager reports after the first slice; simulate integrations in the prototype.
- **Reason:** The prototype is not expected to go live, so explicit synthetic-data assumptions allow implementation without implying production privacy or compliance readiness. A small complete booking workflow validates the central scheduling rules before broader features.
- **Revisit when:** The project scope changes toward real users, real patient data, production deployment, or implementation of the deferred workflows.

## D14. Local PostgreSQL runtime: native here, Docker Compose optional

- **Status:** Confirmed. **Date:** 2026-10-13.
- **Options considered:** Require Docker for every developer machine, install PostgreSQL natively on every machine, or support both local runtime options.
- **Reason:** Docker may be impractical on the current machine, but PostgreSQL is still needed for development and tests that verify transactional scheduling rules. Running PostgreSQL natively here avoids making Docker a blocker; Docker Compose remains available for another machine that supports it.
- **Consequences:** Use PostgreSQL 17.11 in both setups, with the database engine, Prisma schema, migrations, and required extensions consistent. Use separate application and shadow databases so the local application role does not need permission to create databases. Read connection settings from environment variables such as `DATABASE_URL` and `SHADOW_DATABASE_URL`; do not commit credentials or local database data. Tests that exercise database guarantees must run against real PostgreSQL in either setup.
- **Trade-offs:** Native installation requires managing the PostgreSQL service and version on this machine. Supporting both options requires documenting the setup for each and avoiding machine-specific database assumptions.
- **Revisit when:** Docker becomes practical and a single container-based workflow is preferred, or a different development/test database setup is needed.

## D15. First-slice permissions and relational model

- **Status:** Confirmed from the PRD and accepted prototype scope. **Date:** 2026-10-13.
- **Permissions:** Practice Managers and front desk staff have full scheduling access and can manage patient/coverage and availability records; only practice managers own scheduling rules. Providers can view only their own schedule and submit schedule-change requests, but cannot edit appointments, see other schedules, access patient records, or view reports.
- **Data model:** User, Provider, Patient, Coverage, AvailabilityWindow, Appointment, and AuditEvent. Use synthetic display names only. Store appointment instants as timezone-aware values and availability as weekly or date-specific local-time windows.
- **Integrity:** Each appointment belongs to the same patient as its coverage. Booking reserves one visit; completion/no-show consumes it; cancellation releases it. Extended visits occupy 40 minutes plus a 10-minute buffer; standard visits occupy 20 minutes. PostgreSQL checks visit counters and uses a GiST exclusion constraint to block overlaps for non-cancelled appointments across both settings.
- **Reason:** This is the smallest database model that supports the accepted first scheduling slice and keeps core booking safeguards in PostgreSQL rather than relying only on frontend checks.
- **Trade-offs:** The initial migration includes PostgreSQL-specific SQL for `btree_gist` and the overlap constraint. Coverage counter updates still require server-side transactions. Authentication, schedule-change approval, waitlists, and reports remain later tasks.
- **Revisit when:** The first scheduling slice is expanded or the PRD's role, coverage, or appointment rules change.

## D16. Re-theme as an original portfolio project

- **Status:** Confirmed. **Date:** 2026-10-22.
- **Decision:** The project is a fictional family-medicine clinic with an urgent care (fictional name Riverbend Family Medicine), with 16 providers (physicians, nurse practitioners, physician assistants) on one shared availability pool. Scheduled appointments and urgent care visits replace the two original schedule types; the single-location structure is unchanged. Terminology: provider, patient, appointment, coverage. Extended visits are 40 minutes plus a 10-minute buffer; standard visits are 20 minutes.
- **Reason:** The project is for a public portfolio and must not resemble confidential or third-party material. The original PRD, brand assets, and source-company references were removed and replaced by `docs/prd/clinic-scheduling-platform-prd.md`.
- **Consequences:** The initial migration was regenerated (the earlier one was deleted); existing local databases must be recreated. Earlier decision entries were reworded for the new terminology. Git history still contains the original material until it is cleaned (owner deferred).
- **Revisit when:** Before the repository is made public.
