## Clinic Scheduling Platform

A portfolio project: a scheduling platform for a fictional family-medicine clinic ("Riverbend Family Medicine") that also runs an urgent care. It books regular scheduled appointments and walk-in urgent care visits from one shared pool of 16 providers, prevents double-booking, and matches each patient to an eligible provider. All people, organizations, and data in this project are fictional.

## Project Structure

- `client/` — React + Vite frontend (plain JavaScript).
- `server/` — Node.js + Express backend (plain JavaScript).

## Setup

Requirements: Node.js (v22.12 or later) and npm. This version supports the current Vite and Vitest versions; Prisma database scripts also require Node.js 20.6 or later.

Install dependencies for both `client` and `server` from the repository root:

```
npm install
```

## Running the app

Start the frontend development server:

```
npm run dev:client
```

Start the backend server:

```
npm run dev:server
```

The backend listens on port `3001` by default and exposes a health check at `GET /api/health`. Set the `PORT` environment variable to use a different port.

## Building the client

```
npm run build:client
```

Product requirements are in `docs/prd/clinic-scheduling-platform-prd.md`. The first-slice role permissions and data model are summarized in `PLANNING.md`. This project supports a native PostgreSQL installation on this machine and Docker Compose as an alternative on other machines; both use PostgreSQL 17.11 with the same Prisma schema and migrations. Copy `.env.example` to `.env` and replace the placeholder password before starting a database. Never use real patient data.

### Database setup

Install PostgreSQL 17.11 on this computer, or use Docker Compose on a computer with Docker Desktop. Copy the example environment file and replace its placeholder admin and application passwords with different local passwords:

```powershell
winget install --id PostgreSQL.PostgreSQL.17 --exact
Copy-Item .env.example .env
```

The native PostgreSQL installer asks you to set a password for the local `postgres` administrator. Keep it private; it is separate from the `clinic_app` password used by the project. The admin password in `.env` is used only by the Docker Compose option.

For a native installation, use the PostgreSQL SQL Shell (psql) as the `postgres` administrator to create the application role and its main and shadow databases. Use the application password from `.env` in place of the SQL placeholder:

```sql
CREATE ROLE clinic_app WITH LOGIN PASSWORD 'replace-with-your-local-password';
CREATE DATABASE clinic_scheduling OWNER clinic_app;
CREATE DATABASE clinic_scheduling_shadow OWNER clinic_app;
```

For Docker Compose instead, replace the placeholder values in `.env`, then start PostgreSQL. On the first start, Compose creates the limited application role and both databases using the initialization script:

```powershell
docker compose up -d postgres
```

Both options use PostgreSQL 17.11. Once the database is running and `DATABASE_URL` points to it, create the schema and generated Prisma client:

```powershell
npm run db:migrate --workspace server
npm run db:generate --workspace server
```

The separate shadow database is used by Prisma during development migrations; the application role does not need permission to create databases. The migration installs PostgreSQL's `btree_gist` extension for database-enforced cross-schedule overlap prevention. Keep the connection local, do not commit `.env`, and use synthetic records only.

The optional appointment `reason` field is intended for scheduling context and must be treated as sensitive. The example provider route does not persist data or implement authentication. User credentials and provider name fields in the database, and coverage-counter request handling, remain deferred.

Run the server and client tests from the repository root:

```powershell
npm test
```

To run one workspace's tests, use `npm run test:server` or `npm run test:client`. Server schema and API tests run without a database. Tests for scheduling transactions and overlap constraints must use a real PostgreSQL database; those will be added alongside the scheduling implementation.

## Linting

ESLint checks JavaScript/JSX source for common mistakes (unused variables, invalid conditions, React Hook rule violations) without running the code. Run it across both the client and server:

```
npm run lint
```
