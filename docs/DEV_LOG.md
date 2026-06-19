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

**Current phase:** Phase 0 — local setup complete; Vercel deployment pending
**Active plan:** `dev_plan.md`
**Next action:** Commit/push Phase 0 local setup, then deploy to Vercel and configure env vars.

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
- [Task 0.5] — Installed core runtime dependencies, including Vercel AI SDK v4 packages. Verified `ai@4.3.19`.
- [Task 0.6] — Installed Supabase CLI. Verified `supabase@2.107.0`.
- [Task 0.7] — Initialized shadcn/ui and added required base components.
- [Task 0.8] — Created `.env.example` with the required Phase 0 keys.
- [Task 0.9] — Created planned folder structure, `src/middleware.ts`, and `.gitkeep` files for empty directories.
- [Task 0.10] — Added root `DEV_LOG.md` pointer to the canonical `docs/DEV_LOG.md`.
- Verification — `npm run lint` passes.
- Verification — `npm run build` passes.
- Verification — `npm run dev` starts and listens on `http://localhost:3000`.

### IN PROGRESS (not finished)
- [Task 0.4] — Local repo is connected to GitHub, but commit/push still needs to be done after user review.
- [Task 0.11] — Vercel deployment not done from this environment.
- [Task 0.12] — Vercel environment variables not configured.

### BLOCKED
- [Task 0.11] — BLOCKED: Requires Vercel account/project access in the browser or Vercel CLI authentication.
- [Task 0.12] — BLOCKED: Requires real secret values and Vercel project access.

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
- `DEV_LOG.md` — Root pointer to canonical session log.
- `docs/DEV_LOG.md` — Appended this session entry.

### NEXT SESSION MUST START WITH
1. Review `git status --short` and confirm the initial project files are ready to commit.
2. Commit and push Phase 0 local setup to `origin/main`.
3. Deploy to Vercel and configure env vars for Production, Preview, and Development.

### DECISIONS / NOTES
- shadcn CLI latest generated Tailwind v4-style utilities; project remains on Tailwind v3 from `create-next-app@14`, so theme tokens were added manually and `outline-ring/50` was replaced with explicit CSS.
- `docs/DEV_LOG.md` remains the canonical continuity log because prior project docs already point there.
- Dev server process is currently listening on port 3000.
---
