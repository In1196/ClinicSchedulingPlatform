# Clinic Scheduling Platform - Planning

## Purpose

This document is the working plan for the Clinic Scheduling Platform. It captures the requirements extracted from the PRD, project decisions, milestones, and open questions.

## Source of Truth

- Primary PRD: [`docs/prd/clinic-scheduling-platform-prd.md`](docs/prd/clinic-scheduling-platform-prd.md)
- This document is a searchable summary of the PRD, not a replacement for it.
- When this document conflicts with the PRD, pause and resolve the difference before implementation.

## PRD Summary

The product is a clinic scheduling system for a fictional family-medicine clinic with an urgent care. It manages separate scheduled-appointment and urgent care schedules while enforcing a shared provider-availability pool.

### Product Goals

- Provide a reliable schedule for scheduled and urgent care clinic services.
- Prevent double-booking across either schedule.
- Help practice managers and front desk staff match patients with appropriately qualified, available providers.
- Surface coverage, cancellation, waitlist, productivity, and utilization information for operational decisions.

### Users and Roles

- **Practice Manager:** Full access to schedules, provider assignments, coverage records, reports, and operational workflows.
- **Front Desk:** Full scheduling and patient-communication access.
- **Provider:** Read-only schedule access; may submit schedule-change requests.

### Core Workflows

- Create and manage scheduled and urgent care appointments using one shared provider-availability pool.
- Recommend or filter providers by provider type, credentials, pediatric eligibility, availability, and workload.
- Schedule 40-minute extended visits and 20-minute standard visits with charting buffers.
- Apply automatic breaks, clinic blackout windows, and coverage limits.
- Process cancellations and no-shows, maintain a waitlist, and coordinate provider-absence replacements.
- Send SMS confirmations and reminders, with Outlook synchronization and email fallback.
- Review practice manager reports for daily schedules, productivity, coverage utilization, cancellation/no-show trends, and waitlist status.

### Functional Requirements

- Maintain the 16-provider roster, including provider type, credentials, pediatric eligibility, and availability rules.
- Store and enforce patient coverage information before appointments are confirmed.
- Prevent overlapping appointments for a provider across scheduled and urgent care schedules.
- Support extended visits, standard visits, charting time, breaks, blackout periods, cancellations, no-shows, waitlist entries, and replacement assignments.
- Allow providers to view their schedules without changing appointments directly.
- Record schedule-change requests for authorized users to review.
- Provide the five practice manager reports listed under Core Workflows.

### Non-Functional Requirements

- Enforce role-based access for practice manager, front desk, and provider workflows.
- Preserve schedule integrity when appointments are created, moved, cancelled, or reassigned.
- Make scheduling constraints visible enough for staff to understand why a provider is unavailable or ineligible.
- Keep operational actions auditable, especially coverage checks, schedule changes, cancellations, and replacements.

### Constraints and Integrations

- Integrate confirmations and reminders through SMS.
- Synchronize with Outlook calendars and fall back to email when required.
- Clinical documentation, billing and claims, and replacement of existing clinical systems are out of scope.

## Technology Direction

- Preferred languages: JavaScript and C#.
- Preferred frontend tools: React and Vite.
- Preferred backend tools: Node.js and Express.
- Preferred database: MongoDB when a document database suits the requirements.
- Confirm the final stack after the data relationships and transactional scheduling constraints have been reviewed. The shared availability pool and overlap prevention may favor a relational database over MongoDB.

### Confirmed Stack (2026-09-14)

- **Frontend:** React + Vite, plain JavaScript (no TypeScript for now, to keep code readable and consistent for the project owner).
- **Backend:** Node.js + Express, plain JavaScript.
- **Database:** PostgreSQL — chosen over MongoDB because the shared provider-availability pool and no-double-booking rule need real transactional/relational guarantees.
- **ORM:** Prisma — declarative schema file and migrations, keeps the DB and code in agreement without requiring TypeScript.
- **Validation:** Zod — server-side validation of all request input (appointments, coverage records, schedule-change requests, etc.). Validation happens at the route boundary before business logic runs.
- **Local dev database:** PostgreSQL 17.11 installed natively on the current machine; Docker Compose pins the same version as an alternative for other machines. Both use the same schema and migrations, with separate application and Prisma shadow databases and connection settings supplied through environment variables.
- **Testing:** Vitest (or Jest) for unit/service tests, Supertest for API endpoint tests, React Testing Library for frontend behavior tests. Tests that touch scheduling/overlap logic run against a real PostgreSQL database, whether it is installed natively or running in Docker.
- **Background jobs (introduced later, when needed):** BullMQ + Redis — for reminders (24–48h before appointment), Outlook sync, and provider-absence replacement search. Deferred until those features are actively being built, kept isolated in a `jobs/` folder.
- **Explicitly deferred/skipped for now:** TypeScript, NestJS, managed auth providers (e.g., Auth0), and a full observability stack — these add real value but bring more new concepts/tooling than is useful at this stage. Hand-rolled sessions + RBAC middleware are used instead.

## Visual Direction

Original design for this portfolio project: plain, accessible styling with a neutral palette defined in the client CSS. No third-party branding is used.

## Architecture Decisions

Record confirmed decisions here using this format. The reasoning, alternatives, and revisit conditions for each decision are kept in [`docs/decisions/decision-log.md`](docs/decisions/decision-log.md); update both when a decision changes.

| Decision | Rationale | Status | Date |
| --- | --- | --- | --- |
| Product scope | Scheduled and urgent care scheduling share provider availability; clinical documentation and billing remain out of scope | Confirmed from PRD | 2026-09-03 |
| Technology stack | React/Vite and Node/Express are preferred; database choice depends on transactional scheduling constraints | Proposed | 2026-09-03 |
| Database | PostgreSQL, chosen over MongoDB, for transactional overlap prevention across the shared availability pool | Confirmed | 2026-09-14 |
| ORM | Prisma, used with plain JavaScript (no TypeScript) | Confirmed | 2026-09-14 |
| Validation | Zod, applied at the API route boundary | Confirmed | 2026-09-14 |
| Local dev/test database | Real PostgreSQL 17.11 for development and tests; native installation on the current machine, Docker Compose supported on other machines. See D14 | Confirmed | 2026-10-13 |
| Background jobs | BullMQ + Redis, introduced later for reminders, Outlook sync, and provider-absence replacement search | Confirmed (deferred implementation) | 2026-09-14 |
| TypeScript / NestJS / managed auth / observability | Explicitly skipped for now to keep code approachable and avoid unnecessary tooling overhead | Confirmed (deferred) | 2026-09-14 |
| Deployment target | Microsoft Azure (specific services not yet chosen); keep configuration in environment variables and migrations in version control. See D12 in the decision log | Confirmed (target only) | 2026-10-07 |
| Prototype assumptions and first scheduling slice | Use synthetic identities, Eastern time, documented booking/coverage rules, and implement a small end-to-end scheduling workflow before later features. See D13 in the decision log | Confirmed | 2026-10-12 |
| First-slice role permissions and data model | Apply the PRD's two-tier permissions and model users, providers, patients, coverage records, availability, appointments, and audit events. See D15 | Confirmed | 2026-10-13 |

## Milestones

1. Extract and confirm PRD requirements.
2. Choose and document the technology stack and database.
3. Define the application architecture and data model for providers, patients, coverage records, availability, appointments, waitlists, notifications, and audit events.
4. Set up the frontend, backend, testing, and environment configuration.
5. Implement shared availability and overlap prevention.
6. Implement scheduling constraints, provider matching, coverage records, cancellations, waitlists, and replacement workflows.
7. Implement role-based access, notifications, Outlook synchronization, email fallback, and reports.
8. Validate workflows, accessibility, security, auditability, and documentation.

## Open Questions and Assumptions

- What exact SMS, Outlook, and email providers are available? Defer this decision until integrations are in scope; simulate notifications and calendar sync in the prototype.
- What privacy, security, audit, and compliance requirements apply before any real patient data or production deployment? Prototype data must remain synthetic.
- What holiday and appointment lead-time rules apply? Defer until those rules are needed; start with configurable weekday availability.
- Which Azure services will host the API, client, and database, and does the deployment need a Business Associate Agreement or HIPAA-eligible configuration? (See D12.)

### Confirmed Prototype Assumptions (2026-10-12)

- Use fictional provider names and synthetic patient data only; do not use real patient information.
- Use `America/New_York` for date/time handling and configurable weekday availability. variable or part-time availability is entered explicitly rather than inferred.
- Enforce hard provider eligibility rules first (provider type, extended visit credentials, pediatric eligibility, and availability), then recommend the eligible provider with the lightest scheduled workload. Staff may choose another eligible provider only.
- Count one appointment as one covered visit. Reserve a visit on booking, release it on cancellation, and mark it used when completed. No-shows count as used by default; staff can correct the record. Block bookings when no visits remain or the coverage has expired.
- The first end-to-end slice is a day schedule with scheduled/urgent care booking and cancellation, provider eligibility checks, shared cross-schedule overlap prevention, a coverage guard, and clear explanations when a booking is blocked.
- Keep break times configurable rather than guessing their placement. Defer waitlists, provider-absence replacement workflows, real notifications, Outlook synchronization, and practice manager reports until after the first scheduling slice. External integrations will be simulated in the prototype.

### First-Slice Roles and Data Model (2026-10-13)

- **Practice Manager and front desk:** May create, move, and cancel appointments; manage patient/coverage and provider availability records; and view all schedules. The practice manager also owns scheduling rules. Both roles may select only providers who pass hard eligibility checks.
- **Provider:** May view only their own schedule and submit schedule-change requests. They cannot edit appointments directly, view other providers' schedules, access patient records, or view practice manager reports. Schedule-change requests are stored for later approval workflow; that workflow is outside the first booking slice.
- **First-slice records:** User (role and optional provider link), provider (provider type, credential, extended visit qualification, pediatric eligibility, active state), patient (synthetic display name and pediatric flag), coverage (valid dates and visit totals), availability window (weekly or date-specific), appointment (patient, coverage, provider, scheduled/urgent care setting, extended visit/standard visit type, interval, status, and creation actor), and audit event (actor, action, and affected record identifier without clinical details).
- **Integrity rules:** Appointments store timezone-aware instants; render and enter local schedule times in `America/New_York`. Extended visits occupy 40 minutes plus a 10-minute charting buffer; standard visits occupy 20 minutes. Cancelled appointments no longer reserve provider time or a coverage visit. A booking reserves one visit, completion or no-show consumes it, and cancellation releases it. Booking is rejected for expired/exhausted coverage records, ineligible providers, or overlapping active appointments in either setting.
- **Coverage counters and appointment changes** must be updated in one database transaction. PostgreSQL constraints should enforce nonnegative/capped visit counts and prevent overlapping provider time ranges, including extended visit buffers, across scheduled and urgent care.

## Change Log

| Date | Change |
| --- | --- |
| 2026-09-03 | Created the initial planning structure and recorded the PRD source. |
| 2026-09-14 | Confirmed technology stack: React/Vite + JavaScript, Node/Express + JavaScript, PostgreSQL + Prisma, Zod validation, Docker-based local/test database, and BullMQ + Redis deferred until reminder/sync features are built. TypeScript, NestJS, managed auth, and observability tooling deferred. |
| 2026-10-07 | Recorded Microsoft Azure as the deployment target (D12). Specific services and compliance scope remain open. |
| 2026-10-12 | Recorded owner-approved synthetic-data, scheduling, coverage, and initial-slice assumptions (D13); deferred integrations and later operational features. |
| 2026-10-13 | Superseded the Docker-only local database setup with native PostgreSQL on this machine and Docker Compose as an alternative (D14). |
| 2026-10-13 | Defined first-slice role permissions, records, and core integrity rules (D15). |
| 2026-10-22 | Re-themed as an original fictional clinic scheduler (scheduled + urgent care, 16 providers); replaced the PRD, removed brand references, and regenerated the initial migration (D16). |
