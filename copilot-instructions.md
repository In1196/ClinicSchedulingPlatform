# Clinic Scheduling Platform - Copilot Instructions

## Project Approach

- **Read `README.md`, `PLANNING.md`, and `TASKS.md`** before making material architectural or workflow changes.
- **Check `TASKS.md` before starting a new task.** If the task isn't listed, add it with a brief description and today's date.
- **Keep `PLANNING.md` updated** when an architectural decision, assumption, or milestone changes.
- **Keep `TASKS.md` updated** as work is started, completed, blocked, or reprioritized.
- **Ask for clarification** when a requirement would affect clinical workflow, privacy, security, billing, or compliance.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.
-- **Read the PRD files in `docs/prd/` before starting any implementation, architectural decision, workflow change, or task planning.**
- **Treat the PRD as the source of truth for product requirements.** If the PRD conflicts with `PLANNING.md` or `TASKS.md`, identify the conflict and ask for clarification before proceeding.
- **Do not implement behavior that is not supported by the PRD** unless the user explicitly requests it.

## Privacy and Security

- **Treat all patient, provider, appointment, and clinical information as sensitive.**
- **Do not include real protected health information (PHI), credentials, API keys, or secrets** in source code, fixtures, logs, documentation, or commits.
- **Use environment variables for secrets** and provide a `.env.example` file containing placeholder values only.
- **Apply authentication and authorization checks** to every endpoint or view that accesses sensitive data.
- **Validate all external input on the server** and return user-safe error messages.
- **Prefer least-privilege access, audit-sensitive actions, and avoid logging sensitive request data.**

## Engineering Standards

- **Prefer small, focused changes** that match existing project conventions.
- **Keep client and server responsibilities separate; enforce business rules and authorization on the server.**
- **Add or update focused tests** for behavior changes when a test setup exists.
- **Run the narrowest relevant validation command after edits** and report any tests that could not be run.
- **Do not add dependencies** unless they provide clear value and are appropriate for production use.
- **Do not refactor unrelated code** while completing a task.

## Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).

### Testing & Reliability
- **Always create unit tests for new features** (functions, classes, routes, etc).
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
  - Include at least:
    - 1 test for expected use
    - 1 edge case
    - 1 failure case

### Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.

## Documentation and Accessibility
- **Keep setup instructions and required environment variables accurate** in `README.md`. Update them when changes are made to the project structure or dependencies, when new features are added, or setup steps are modified.
- **Use clear, professional language** appropriate for patients, providers, and administrative staff.
- **Build accessible interfaces** with semantic HTML, keyboard support, visible focus states, labels for inputs, and useful error messages.
- **Present dates, times, and time zones explicitly; do not assume a user's locale or time zone.**

### AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.



## Collaboration Preferences

- Treat the project owner as an entry-level developer building professional experience after school.
- Prefer familiar, mainstream tools and established project patterns over advanced abstractions or experimental libraries.
- Explain decisions, code changes, errors, and commands in clear, beginner-friendly language.
- When introducing an unfamiliar tool or library not yet used in this project (e.g., Prisma, Zod, PostgreSQL, BullMQ, Redis, Docker), before writing code that depends on it, provide in this order: (1) a moderate-length explainer of what it is, why the project needs it, and what it replaces or adds; (2) at least one video tutorial link and one text-based tutorial link (official docs, GeeksforGeeks, W3Schools, or equivalent); (3) a minimal isolated working example before the real feature code; (4) the real implementation with light comments only where syntax is non-obvious; (5) a plain-terms walkthrough of the change, pausing for questions before moving on.
- Break larger work into small, testable steps and state how each step can be verified.
- Do not assume prior workplace experience, production deployment knowledge, or familiarity with team conventions.
- Encourage sound engineering practices, but explain the practical reason behind them.
- Prefer JavaScript for application code; avoid introducing TypeScript unless the owner explicitly requests it, since it changes how all code reads.
- Prefer React with Vite for frontend development.
- Prefer Node.js and Express for backend APIs.
- Preferred database is PostgreSQL with Prisma as the ORM (confirmed 2026-09-14), chosen over MongoDB because shared provider-availability and no-double-booking rules require transactional/relational guarantees. See `PLANNING.md` for the full confirmed stack.
- C# is also an acceptable choice when it is better suited to the project requirements.
- Do not introduce a different language, framework, database, or major library without explaining the reason and requesting approval first.
- Remind the owner if there are any security issues that have cropped up due to changes that need to be dealt with.

## Communication Style

- Do not use human-like conversational tone. Avoid conversational openers ("Got it", "Good call", "Makes sense"), first-person opinion framing ("I recommend", "I'd suggest"), collaborative/casual phrasing ("Let's", "we", "our approach"), rhetorical questions, soft transitions, and enthusiasm markers or filler acknowledgments.
- Use direct, neutral, task-oriented statements instead (e.g., "The next step is...", "This task requires...", "The recommended option is X, based on Y").
- Ask direct questions only when a decision genuinely requires user input; otherwise state facts and next actions plainly.
- This does not reduce technical accuracy, completeness, structured formatting (tables/lists/links), tutorial/explainer content for new tools, or use of clarifying questions when truly needed — only the tone changes.