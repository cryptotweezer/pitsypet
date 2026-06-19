# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PitsyPet is an AI-powered veterinary symptom-triage web app for Australian dog/cat owners. A user registers, creates pet profiles, then runs a conversational assessment: the AI extracts symptoms from chat, retrieves veterinary knowledge (RAG over pgvector), classifies risk **Low / Medium / High**, and shows clinical reasoning plus risk-appropriate recommendations (first-aid for Low, vet referral + emergency contacts for High). It is an educational triage tool, **not** a diagnosis — a missed emergency is treated as far worse than an unnecessary vet visit, so the whole system is biased to escalate when uncertain.

## The three docs — read these first, in this order of authority

1. **`docs/dev_plan.md`** — the SOURCE OF TRUTH for what we build and how. Phased (0→12), each phase has a "✅ Done When" checklist. Work phases in order; do not start a phase until the previous one's checklist passes.
2. **`docs/DEV_LOG.md`** — the continuity mechanism. **Read the latest entry before doing anything**, and **append a new session entry when you finish** (template is at the top of the file). It records what's done, what's deferred, and what the next session must start with.
3. **`docs/PROPOSAL.md`** — the original academic capstone proposal. **Historical context only.** It is a starting guide, not the build spec. Where it conflicts with `dev_plan.md`, the plan wins, always. This is *real software development now, not an academic deliverable* — there is no report to hand in.

### PROPOSAL.md is outdated — do NOT implement these parts of it

The plan deliberately diverged from the proposal. If you see these in the proposal, ignore them:

| Proposal (ignore) | Actual decision (build this) |
|---|---|
| FastAPI + Python backend on Railway | **Next.js 14 full-stack (TypeScript)**, API routes, Vercel only — no separate backend |
| `text-embedding-3-large` | **`text-embedding-3-small`** (1536 dims) |
| IVFFlat vector index (100 lists) | **HNSW** index (`vector_cosine_ops`) |
| `confidence_score` ≥ 0.75 gate before classifying | **confidence is LOGGED ONLY, never a gate.** Completion is decided by facts gathered (symptom + onset/severity); uncertainty rounds risk **UP**, never down |
| Filter RAG chunks by `urgency_level ≥ 5` | **No urgency gate.** Urgency is a re-rank nudge only (`+0.05 * urgency/10`); it never hides a chunk |
| Single Claude Sonnet 4.5 for everything | **Two models:** `claude-haiku-4-5-20251001` (extraction + chat reply) and `claude-sonnet-4-6` (risk classification) |
| Separate "Conversation Messages" table | Single **`conversation_log` JSONB** column on `assessments`; no messages table |
| Three blocking AI calls | **One `streamText` call per message** (extract + reply together); RAG + classification run in the same request's `onFinish` |
| Supabase built-in email | **Resend custom SMTP** (deferred to pre-production; built-in email used for dev) |
| shadcn/ui on Tailwind v3 / Radix | **Tailwind v4 + shadcn "base-nova" (Base UI)** — see UI section below |

The proposal also has no concept of the **deterministic safety override** or the **rule-based fallback** — both are core to the plan (see AI architecture below).

## Tech stack

Next.js 14 App Router · TypeScript · **Vercel AI SDK v4** · Supabase (PostgreSQL + pgvector/HNSW + Auth + RLS) · OpenAI `text-embedding-3-small` · Upstash Redis (rate limit + cost guard) · Tailwind v4 + shadcn base-nova (Base UI) · Sentry · PostHog · Vercel.

**Pin discipline:** the Vercel AI SDK is v4 (`ai@^4`, `@ai-sdk/*@^1`). **Never run `npm install ai@latest`** — v5 renames the streaming APIs (`streamText`/`createDataStreamResponse`/`useChat`) the plan depends on.

## Commands

```bash
npm run dev          # local dev at http://localhost:3000
npm run build        # production build — also runs tsc; must be 0 TS / 0 ESLint errors
npm run lint         # next lint
npx tsc --noEmit     # type-check only

# Supabase migrations — files in supabase/migrations/ are the source of truth.
# NEVER edit schema in the Supabase dashboard SQL editor (creates drift).
npx supabase migration new <name>                               # create a migration file
npx supabase db push                                            # apply pending migrations to remote
npx supabase migration list                                     # verify local == remote
npx supabase gen types typescript --linked > src/types/database.ts   # regenerate after ANY schema change

# RAG ingestion (Phase 4) — shares the runtime embedding code in src/lib/ai/embed.ts
npx tsx scripts/ingest.ts

# Remote schema smoke-check (no secrets printed)
node scripts/verify-phase1.mjs
```

**Environment caveat:** the Supabase CLI and any supabase-js script that hits the remote currently need `NODE_TLS_REJECT_UNAUTHORIZED=0` prefixed (local TLS cert issue) — e.g. `NODE_TLS_REJECT_UNAUTHORIZED=0 npx supabase db push`. This is a local-dev workaround only; never bake it into committed code or CI. The Docker/pg-delta catalog warning on `db push` is non-blocking (it only affects the local edge-runtime image, which we don't use).

Tests (Vitest) are introduced in Phase 10 — not set up yet.

## Architecture: the AI triage engine (Phase 5, the core)

One streaming request per user message, not three blocking calls:

- **Tier 1 — extract + reply (single pass):** `streamText` on **Haiku** with one tool `record_symptoms` and `maxSteps: 1`. Claude streams the conversational follow-up question to the user *and* emits structured symptoms via the tool in the same response; the tool's `execute` writes symptoms to the data stream so the sidebar updates live.
- When `isComplete: true`, the rest runs in the same request's **`onFinish`** (fires even if the client disconnects, so results always persist server-side):
  - **Tier 2 — RAG** (`src/lib/ai/rag.ts`): `buildRagQuery` → `embedText` → `search_veterinary_knowledge` RPC → drop similarity < 0.3 → re-rank `similarity + 0.05*(urgency/10)` → max 2 chunks/source → top 5. If 0 chunks or the call throws, classification proceeds without RAG context.
  - **Tier 3 — classify** (`src/lib/ai/classifier.ts`): `generateObject` on **Sonnet** → parse-failure retry → rule-based fallback (`fallback.ts`) on repeated failure → then a **deterministic safety override** (`safety.ts`).
- Everything (assistant message, `conversation_log`, `extracted_symptoms`, full classification) is persisted in one server-side write and pushed to the client over the data stream.

**Non-negotiable safety invariants** (the whole point of the product):
- **Safety override can only escalate.** `hasCriticalSymptom(text)` (regex rubric of emergencies in clinical + plain + Aussie phrasing) forces `High`. It never lowers a result.
- **`confidence_score` is logged only.** It gates nothing. Uncertainty rounds risk **up**.
- **Urgency is a re-rank signal, never a retrieval gate.** A chunk is never hidden by its urgency level.
- These map directly to SQL/TS: `search_veterinary_knowledge` has no urgency `WHERE`, and `classifyRisk` applies the override after the model/fallback.

## Architecture: data & access control

- **Database (Phase 1, done).** Tables: `profiles`, `pets`, `assessments`, `veterinary_knowledge`, `breeds`, `first_aid_recommendations`, `emergency_contacts`, `knowledge_processing_audit`. Two RPCs: `search_veterinary_knowledge` (vector search, no urgency gate) and `search_assessments` (full-text + trigram, `SECURITY INVOKER`, parameterized via `plainto_tsquery` → injection-safe). The `assessments` FTS GIN index expression is **byte-identical** to the one inside `search_assessments` — if you change one, change both or the index stops being used.
- **RLS on every table.** Users only touch their own `profiles`/`pets`/`assessments`; lookup tables are read-only to authenticated users; `knowledge_processing_audit` has RLS on with no policy (deny-all via PostgREST, by design).
- **One Supabase client rule.** All application data access goes through the **cookie-scoped server client** (`src/lib/supabase/server.ts`, anon key + session cookies → RLS enforced). The **service-role key bypasses RLS and is used ONLY in `scripts/`** (ingestion). No route handler, Server Component, or client code may import it. Phase 9 enforces this: `grep -r SERVICE_ROLE_KEY src/` must return nothing.
- **Never trust client-supplied pet/owner data** in the chat route — re-fetch the pet by id through the cookie-scoped client so RLS verifies ownership.
- **Triggers:** `handle_new_user` (SECURITY DEFINER, `ON CONFLICT (id) DO NOTHING`) auto-creates a `profiles` row from auth metadata on signup; `set_updated_at` keeps `updated_at` current on `profiles`/`pets`. Verify the signup→profile trigger end-to-end during Phase 2 (it's the one Phase 1 item only provable with a live signup).

## UI: Tailwind v4 + shadcn base-nova (Base UI)

This project is **CSS-first Tailwind v4**, not v3. The `src/components/ui/*` kit was generated by `shadcn@latest` in the "base-nova" style: it imports `@base-ui/react` (Base UI, not Radix) and uses v4-only class syntax (`gap-(--card-spacing)`, `--spacing(4)`, `ring-3`, `data-open:`, `outline-hidden`, `@container`).

- Tokens live in `src/app/globals.css` via `@theme inline` mapping to oklch CSS variables; there is **no `tailwind.config.ts`** (deleted on purpose) and `components.json` has `tailwind.config: ""`.
- **Do not** re-introduce a v3 `tailwind.config.ts`, `tailwindcss-animate`, or `@import "shadcn/tailwind.css"`. Animations come from `tw-animate-css`.
- Add components with `npx shadcn@latest add <name>` (keeps the base-nova/v4 style). Forms use `react-hook-form` + the local `src/components/ui/form.tsx`.
- Caveat: Tailwind v3 silently ignores unknown utilities, so a green `npm run build` does NOT prove styles render — if you ever downgrade or misconfigure, components will look broken while the build passes.

## Status & workflow

- **Done:** Phase 0 (setup) and Phase 1 (DB schema + RLS + RPCs), reviewed and hardened. **Next:** Phase 2 (Authentication).
- Routes are grouped: `src/app/(auth)/*` (login/register/callback) and `src/app/(app)/*` (protected: dashboard, pets, assessment, history). `src/middleware.ts` is currently a no-op placeholder — Phase 2 replaces it with the canonical `@supabase/ssr` session-refresh middleware (must call `supabase.auth.getUser()` to refresh tokens).
- After any schema change, regenerate `src/types/database.ts` and keep it committed.
- Commit/push only when asked. Update `docs/DEV_LOG.md` at the end of each working session.

## Environment variables (`.env.local`, never committed)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (scripts only), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (embeddings only), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`. Template in `.env.example`. Vercel needs all of these set for Production AND Preview, or branch-deploy AI calls 500.
