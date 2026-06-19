# DEV_LOG.md — PitsyPet Session Diary

**Project:** PitsyPet — AI-Powered Veterinary Triage System
**Rule:** Every AI session MUST read this file first and append an entry at the end. This is the continuity mechanism for the entire project.

---

## ENTRY TEMPLATE (copy this for each new session)

```
---
## SESSION [N] — [DATE] — [AI Agent / Model]

### STARTED WITH
- Last session left off at: [phase/task]
- Blockers from last session: [describe or "none"]

### COMPLETED THIS SESSION
- [Task X.Y] — [what was done]

### IN PROGRESS (not finished)
- [Task X.Y] — [what remains]

### BLOCKED
- [Task X.Y] — BLOCKED: [reason + suggested fix]

### FILES MODIFIED
- [file path] — [what changed]

### NEXT SESSION MUST START WITH
1. [Exact first action — be specific]
2. [Second step if needed]

### DECISIONS / NOTES
- [Any architectural decisions, discoveries, or things to remember]
---
```

---

## STATUS

**Current phase:** Phase 1 — IN PROGRESS
**Active plan:** `dev_plan.md`
**Next action:** Configure/test custom SMTP, then verify Phase 1 remaining checks.

---

---
## SESSION 1 — 2026-06-19 — Codex / GPT-5

### STARTED WITH
- Last session left off at: Phase 0, Task 0.1.
- Blockers from last session: none. User confirmed GitHub repo already exists at `https://github.com/cryptotweezer/pitsypet.git`.

### COMPLETED THIS SESSION
- [Task 0.1] — Confirmed Git remote points to `https://github.com/cryptotweezer/pitsypet.git`.
- [Task 0.2] — Created the Next.js 14 App Router project with TypeScript, Tailwind, ESLint, `src/`, and `@/*` alias.
- [Task 0.3] — Updated `.gitignore` to block env files, RAG sources, Python leftovers, and local dev-server logs.
- [Task 0.4] — Committed and pushed Phase 0 setup to `origin/main`.
- [Task 0.5] — Installed core runtime dependencies, including Vercel AI SDK v4 packages. Verified `ai@4.3.19`.
- [Task 0.6] — Installed Supabase CLI. Verified `supabase@2.107.0`.
- [Task 0.7] — Initialized shadcn/ui and added required base components.
- [Task 0.8] — Created `.env.example`; user confirmed all variables from the plan are saved locally in `.env.local`.
- [Task 0.9] — Created planned folder structure, `src/middleware.ts`, and `.gitkeep` files for empty directories.
- [Task 0.10] — Removed duplicate root `DEV_LOG.md`; `docs/DEV_LOG.md` is the only canonical session log.
- [Task 0.11] — User confirmed Vercel deployment is complete.
- [Task 0.12] — User confirmed all Vercel environment variables were added for the deployment.
- Verification — Confirmed `.env.local` is ignored by git and not tracked.
- Verification — `npm run lint` passes.
- Verification — `npm run build` passes with `.env.local` present.
- Verification — `npm run dev` starts and listens on `http://localhost:3000`.
- Verification — `npm ls ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/react` confirms `ai@4.3.19`.
- Verification — `npx supabase --version` confirms `2.107.0`.

### IN PROGRESS (not finished)
- None for Phase 0.

### BLOCKED
- None for Phase 0.

### FILES MODIFIED
- `.gitignore` — Added secret/RAG/log ignore rules.
- `.env.example` — Added required environment variable template.
- `package.json` / `package-lock.json` — Added Next.js project dependencies and Phase 0 packages.
- `components.json` — shadcn/ui configuration.
- `tailwind.config.ts` — Added shadcn theme tokens for Tailwind v3 compatibility.
- `src/app/globals.css` — shadcn theme CSS adjusted for Tailwind v3 build compatibility.
- `src/app/layout.tsx` — Updated metadata and removed unnecessary Google font dependency.
- `src/middleware.ts` — Added no-op middleware placeholder.
- `src/components/ui/*` — Added shadcn/ui base components.
- `src/**/.gitkeep`, `scripts/.gitkeep`, `supabase/migrations/.gitkeep` — Added planned folder structure placeholders.
- `DEV_LOG.md` — Removed duplicate root log pointer.
- `docs/DEV_LOG.md` — Updated status to Phase 0 complete and consolidated Phase 0 into one session entry.

### NEXT SESSION MUST START WITH
1. Start Phase 1, Task 1.1: create/configure the Supabase project if not already done.
2. Copy/confirm Supabase URL, anon key, and service role key in `.env.local`.
3. Run Supabase CLI initialization/linking and begin migrations from `dev_plan.md`.

### DECISIONS / NOTES
- Phase 0 is complete based on local verification plus user-confirmed Vercel deployment and Vercel env var configuration.
- `.env.local` remains local only and is correctly ignored.
- shadcn CLI latest generated Tailwind v4-style utilities; project remains on Tailwind v3 from `create-next-app@14`, so theme tokens were added manually and `outline-ring/50` was replaced with explicit CSS.
---

---
## SESSION 2 — 2026-06-19 — Codex / GPT-5

### STARTED WITH
- Last session left off at: Phase 0 complete.
- Blockers from last session: none.

### COMPLETED THIS SESSION
- [Task 1.1] — User confirmed Supabase project exists in Oceania/Sydney (`ap-southeast-2`).
- [Task 1.2] — User confirmed `.env.local` includes Supabase URL, anon key, and service role key.
- [Task 1.3] — Ran `npx supabase init` and linked the CLI to project ref `xaepzvxrqnqenspnanej`.
- [Task 1.4] — Created and applied all Phase 1 migrations to the remote Supabase project:
  `enable_extensions`, `profiles`, `breeds`, `pets`, `assessments`, `veterinary_knowledge`,
  `first_aid_and_emergency`, `knowledge_audit`, `indexes`, `vector_search_function`,
  `assessment_search_function`, and `rls_policies`.
- Generated `src/types/database.ts` from the linked remote schema.
- Added `scripts/verify-phase1.mjs` for service-role schema smoke checks without printing secrets.
- Verification — `npx supabase migration list` shows all 12 migrations applied locally and remotely.
- Verification — Remote smoke check returned `breeds = 53`, `emergency_contacts = 8`, and both RPC functions responded successfully.
- Verification — User manually verified RLS in Supabase Table Editor for all public tables: `profiles`, `pets`, `assessments`, `veterinary_knowledge`, `breeds`, `first_aid_recommendations`, `emergency_contacts`, and `knowledge_processing_audit`.
- Verification — `npm run lint` passes.
- Verification — `npm run build` passes.

### IN PROGRESS (not finished)
- [Task 1.4] — Custom SMTP still needs to be configured/tested in Supabase.
- Phase 1 deferred verification: signup trigger creates a row in `profiles` after Phase 2 auth exists.

### BLOCKED
- Custom SMTP — BLOCKED until Resend/custom SMTP credentials are available/configured in Supabase.
- Test signup profile trigger — BLOCKED until Phase 2 auth UI/flow exists.

### FILES MODIFIED
- `supabase/config.toml` — Supabase CLI local project configuration.
- `supabase/.gitignore` — Supabase local ignore rules for `.temp` and local env files.
- `supabase/migrations/*.sql` — Phase 1 schema, indexes, functions, seeds, and RLS policies.
- `src/types/database.ts` — Generated Supabase database types.
- `scripts/verify-phase1.mjs` — Remote schema smoke-check helper.
- `docs/DEV_LOG.md` — Updated Phase 1 progress.

### NEXT SESSION MUST START WITH
1. Decide/configure custom SMTP provider settings in Supabase Auth.
2. Send a Supabase Auth SMTP test email and confirm delivery.
3. Commit and push Phase 1 database setup once the current changes are reviewed.

### DECISIONS / NOTES
- Supabase CLI commands in this environment require `NODE_TLS_REJECT_UNAUTHORIZED=0` because of local TLS/certificate verification failures.
- The `supabase db push` warning about Docker/pg-delta cache did not block remote migration application.
- `supabase/migrations/.gitkeep` was removed because real migration files now exist and the CLI warned about the placeholder filename.
- RLS verified in all tables. The globe icon in Supabase's table list denotes the `public` schema and does not contradict active RLS policies.
---
