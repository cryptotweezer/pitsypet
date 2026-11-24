# CLAUDE.md

Guidance for AI agents working in this repository.

## What this is

PitsyPet is an AI veterinary symptom-triage web app for Australian dog/cat owners. Users register, create pet profiles and run a conversational assessment: the AI extracts symptoms from chat, retrieves veterinary knowledge (RAG over pgvector), classifies risk **Low / Medium / High**, and shows reasoning plus recommendations (first-aid for Low, vet referral and emergency contacts for High). It is an educational triage tool, **not** a diagnosis. A missed emergency is far worse than an unnecessary vet visit, so the system escalates when uncertain.

Production: `https://pitsypet.andreshenao.com.au` (Vercel).

## Where things are documented

- `agents_docs/agents_log.md` (local, git-ignored): the session diary. Start here (see the block at the end of this file).
- `agents_docs/ref/project-detail.md`: long-form phase status, deferred items, feature notes (export, plan tiers, legal/deletion, landing, pet photos), full calibration context, PROPOSAL divergences, data/UI/env detail. Read when a task touches those areas.
- `docs/dev_plan.md`: the build spec, phases 0 to 12 with **Done When** checklists. Read ONE phase section at a time (grep `## Phase N`), never whole (~47K tokens).
- `docs/DEV_LOG.md`: committed history of Sessions 1 to 50, the "KNOWN ISSUES / OPEN DEFECTS" list and the calibration "PENDING IMPLEMENTATION PLAN". Grep it, do not read it whole.
- `docs/vet_calibration_notes.md`: the veterinarian's criteria; its "FINAL CORRECTIONS FROM THE VETERINARIAN" section governs. Read before touching any triage rubric.
- `docs/PROPOSAL.md`: outdated academic proposal. Historical only; where it conflicts with the plan, the plan wins.

## Status

Phases 0-3, 5-7, 7.5 done. Phase 4 runs on a TEMPORARY, non-licensed 121-chunk test corpus. **Current: Phase 8** (Lighthouse/WCAG pass and loading/error/empty states remain; responsive layout audited in Session 50). Phases 9-11 partial, 12 not started. Detail in `agents_docs/ref/project-detail.md`.

- **Triage calibration: APPROVED BUT POSTPONED. Do not start without the user's explicit go-ahead.** Only task 0 (the `safety.ts` substring bug) is implemented.
- **The vet's criteria escalate MORE than the code, not less.** Never treat calibration as "make it less cautious". Patient modifiers shorten the observation window and never raise the level.
- The user owns visual checks: do not run visual automation unless asked.

## Tech stack

Next.js **15** App Router (React 19, async `cookies()`/`params`/`searchParams`) · TypeScript · **Vercel AI SDK v4** · Supabase (Postgres + pgvector/HNSW + Auth + RLS + Storage) · OpenAI `text-embedding-3-small` · Upstash Redis (rate limit + cost guard) · Tailwind v4 + shadcn base-nova (Base UI) · Stripe · Sentry · PostHog · Vercel.

**Pin discipline:** AI SDK is v4 (`ai@^4`, `@ai-sdk/*@^1`). **Never `npm install ai@latest`**: v5 renames `streamText`/`createDataStreamResponse`/`useChat`.

Models: `claude-haiku-4-5-20251001` (extraction + chat reply), `claude-sonnet-4-6` (risk classification).

## Commands

```bash
npm run dev            # http://localhost:3000
npm run build          # also runs tsc; must be 0 TS / 0 ESLint errors
npm run lint
npx tsc --noEmit
npx vitest run         # 180 tests / 16 files

# Migrations: supabase/migrations/ is the source of truth. NEVER edit schema in the dashboard.
npx supabase migration new <name>
npx supabase db push
npx supabase migration list
npx supabase gen types typescript --linked > src/types/database.ts   # after ANY schema change, commit it

npx tsx scripts/ingest.ts          # RAG ingestion
node scripts/verify-phase1.mjs     # remote schema smoke-check
```

## Architecture: the triage engine (the core)

One streaming request per user message:
- **Tier 1:** `streamText` on Haiku with tool `record_symptoms`, `maxSteps: 1`: streams the follow-up question and emits structured symptoms in the same response.
- When `isComplete: true`, in the same request's **`onFinish`** (runs even if the client disconnects):
  - **Tier 2 RAG** (`src/lib/ai/rag.ts`): embed, `search_veterinary_knowledge`, drop similarity < 0.3, re-rank `similarity + 0.05*(urgency/10)`, max 2 chunks/source, top 5. Zero chunks or an error = classify without RAG.
  - **Tier 3 classify** (`src/lib/ai/classifier.ts`): `generateObject` on Sonnet, parse-failure retry, rule-based fallback (`fallback.ts`), then the deterministic safety override (`safety.ts`).
- Everything persists in one server-side write and is pushed over the data stream. History is a single `conversation_log` JSONB on `assessments`.

## Non-negotiable invariants

- **Safety override only escalates.** `hasCriticalSymptom` forces `High`; it never lowers a result.
- **`confidence_score` is logged only.** It gates nothing. Uncertainty rounds risk UP.
- **Urgency is a re-rank signal, never a retrieval gate.** `search_veterinary_knowledge` has no urgency `WHERE`.
- Encode the vet's criteria as rules in `classifier.ts`, never as hardcoded symptom lists. Hard lists belong only in `safety.ts` (absolute emergencies) and `fallback.ts` (offline mode). No fine-tuning.
- **RLS on every table.** All app data access goes through the cookie-scoped server client (`src/lib/supabase/server.ts`).
- **Service-role key:** only in `scripts/` and `src/lib/supabase/admin.ts`, imported solely by `src/lib/billing/subscription.ts` (Stripe webhooks). `grep -r SERVICE_ROLE_KEY src/` must match ONLY `admin.ts`.
- **Never trust client-supplied pet/owner data** in the chat route: re-fetch the pet by id through the cookie-scoped client.
- **Assessments are immutable snapshots**: chats and follow-ups read and append, never edit. The AI must always be able to read all pet information (conditions, meds, clinics/doctors, appointments, assessments/follow-ups, active symptoms).
- Pet fields (species, breed, age, weight, medical_conditions) are consumed verbatim by `formatPet` and the RAG query: keep their shape stable.
- `src/lib/plan-limits.ts` is the single source of truth for Basic/Premium limits (`403 { code: "plan_limit" }`); changing limits means updating landing/billing copy too.
- The `assessments` FTS GIN index expression is byte-identical to the one in `search_assessments`: change both or neither.
- Vet PDF export is deterministic (no AI call per download). If AI prose is ever wanted, generate it once at completion and store it.

## Gotchas

- **Supabase identity guard:** the only remote project is `pitsypet`, ref **`xaepzvxrqnqenspnanej`** (org `qdendiktmyttgngqljay`, `ap-southeast-2`). Confirm the ref before every remote write. Never touch `protegiendo_huellas` (`irwdfcacgpznmvjofszq`). CLI bridge: `--profile supabase/.temp/pitsypet-profile.json`.
- **TLS / Norton:** Norton intercepts HTTPS. The fix is the user env var `NODE_OPTIONS=--use-system-ca` (a fresh terminal picks it up; also needed for Gmail SMTP in `npm run dev`). **Never `NODE_TLS_REJECT_UNAUTHORIZED=0`.** The Docker/pg-delta warning on `db push` is harmless.
- **Middleware matcher** (`src/middleware.ts`): any new public static file type must be excluded there, or logged-out visitors are redirected to `/login` (happened with the demo `.mp4`).
- **Prod CSP** needs `'wasm-unsafe-eval'` for the PDF renderer; dev CSP has `'unsafe-eval'`, so CSP bugs show only in prod.
- **Tailwind v4, CSS-first:** no `tailwind.config.ts`, no `tailwindcss-animate`, no `@import "shadcn/tailwind.css"`. Add components with `npx shadcn@latest add <name>`. A green build does not prove styles render.
- **No FK cascade reaches Storage:** deleting pets/accounts must remove `pet-photos` objects explicitly.
- **Demo video** source lives outside the repo (`C:\AI_Workspace\pitsypet_video`); render with `--concurrency=1` (parallel rendering flickers), never `--gl=swangle`.
- Commit/push only when asked.

## Structure

- `src/app/(auth)/*` login/register/callback; `src/app/(dashboard)/dashboard/*` overview/pets/clinics/appointments/history/help/billing/account; `src/app/(app)/*` protected pet/assessment/results pages. Public: `/`, `/privacy`, `/terms`.
- Pet pages use `pets.slug`; API routes key on UUIDs. Chat route is `/assessment/[id]`.
- Landing: `src/app/page.tsx` + `src/components/landing/*`. AI: `src/lib/ai/*`. Billing: `src/lib/billing/*`.

## Environment variables (`.env.local`, never committed; template `.env.example`)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` (+ optional `CONTACT_TO_EMAIL`). Vercel needs all of them for Production AND Preview.

<!-- agents_log:start -->
## Session log (agents_log)

- At session start: run `node "$HOME/.claude/skills/agents_log/scripts/backup.mjs" sync` (brings the log from the other PC if newer),
  then read the header of `agents_docs/agents_log.md` down to its `ENTRIES`
  marker, plus the first entry. Nothing more; grep for older history only when needed.
- Use that entry's `Files` and `Next` to open the relevant code directly instead of exploring
  the repo. Always read code before changing it.
- Keep this file lean (~150 lines): move rarely needed detail to `agents_docs/ref/`.
- When the user says "logea todo" / "cerremos sesión": follow the protocol in that header.
- If you are a worker on a delegated task, ignore `agents_docs/`: only the orchestrator logs.
- `agents_docs/ref/project-detail.md`: detail moved out of this file. Read when a task touches it.
<!-- agents_log:end -->
