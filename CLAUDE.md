# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PitsyPet is an AI-powered veterinary symptom-triage web app for Australian dog/cat owners. A user registers, creates pet profiles, then runs a conversational assessment: the AI extracts symptoms from chat, retrieves veterinary knowledge (RAG over pgvector), classifies risk **Low / Medium / High**, and shows clinical reasoning plus risk-appropriate recommendations (first-aid for Low, vet referral + emergency contacts for High). It is an educational triage tool, **not** a diagnosis — a missed emergency is treated as far worse than an unnecessary vet visit, so the whole system is biased to escalate when uncertain.

## Session bootstrap — DO THIS FIRST, EVERY SESSION

**This file (`CLAUDE.md`) loads automatically into every session — you are reading it now. It is your map. Do not read the whole `dev_plan.md` at startup; that costs ~47K tokens and most of it is for phases you are not building this session.** Instead, bootstrap like this:

1. **Read the latest `docs/DEV_LOG.md` entry + the `## STATUS` block at the top.** That tells you what's done, what's deferred, and the exact next action. (You may skip older entries — read only the most recent session, plus STATUS.)
2. **Find the current phase** in the **Project roadmap** table below (and confirm against the DEV_LOG STATUS line).
3. **Read ONLY the current phase's section of `docs/dev_plan.md`.** Use Grep to find the `## Phase N` heading line, then Read just that range (typically ~3–5K tokens) — including its **✅ Done When** checklist. Do not read other phases unless a task explicitly depends on them.
4. The **cross-cutting invariants** (safety, RLS, AI SDK pins, the stack) are already in this file — you do not need the plan for those.

**Then, before doing any work, reply to the user with a 2–3 line bootstrap summary** so they have confidence we're aligned:
> **Phase N — <name>.** This session: <one line on what we build>. Watch: <one thing to keep in mind / a deferred item / a Done-When gate>.

Keep it to a couple of lines — it's a sanity check, not a report. Then proceed (or ask the user for the go-ahead if the next step is ambiguous).

**Closing a session:** append a new `DEV_LOG.md` entry (template at the top of that file) **and** update the **Project roadmap** status below + the `## STATUS` block in DEV_LOG if the current phase changed. Keep these two in sync — they are the entire continuity mechanism.

## Project roadmap — the long arc (so we never drift)

The full build is 12 phases, each gated by its own **✅ Done When** checklist in `dev_plan.md`. Work them **in order**; never start a phase until the previous one's checklist passes. This table is the at-a-glance map — read the phase's section in `dev_plan.md` for the actual tasks.

| Phase | Name | Status |
|---|---|---|
| 0 | Environment & Repository Setup | ✅ Done (verified) |
| 1 | Database Schema & Supabase Config (tables, RLS, RPCs, indexes) | ✅ Done (reviewed + hardened) |
| 2 | Authentication (register, login, session middleware, protected routes) | ✅ Done (live-tested in prod) |
| 3 | Pet Profile Management (CRUD pets, breed autocomplete, dashboard) | ✅ Done (live-tested) |
| 4 | **RAG Knowledge Base Ingestion** (TypeScript `scripts/ingest.ts`) | 🟡 **CURRENT — pipeline built; ingestion run pending source docs** |
| 5 | AI Triage Engine — the core (stream extract → RAG → classify → safety override) | ✅ Done (live-tested: GDV emergency → High, persisted) |
| 6 | **Results Page & Recommendations** (risk badge, first-aid, emergency contacts) | ✅ Done (live-tested; auto-save replaced the Save button — see note) |
| 7 | Assessment History & Search (`search_assessments` RPC) | ✅ Done (global history + search built) |
| 7.5 | **Pet Clinical History Hub** (user-directed expansion: pet page + meds/vet + contextual chat + export) | ⏳ **CURRENT — Part 1 ✅ committed; Part 2 groups A,B,C ✅ committed (`31c463e`); #8–#12 + Group D + chat fixes ✅ done (Session 13). NEXT: a TESTING PROTOCOL of all of Phase 7.5 before anything new. Then Email/Resend (Group E), Part 3 (export + AI summary), RAG-in-chat — all wait for the test pass.** |
| 8 | UI/UX Polish & Accessibility (responsive 320–1920px, WCAG 2.1 AA) | ⬜ Not started |
| 9 | Error Handling, Fallbacks & Security (RLS/injection/cost-guard audit) | ⬜ Not started |
| 10 | Testing (Vitest; triage regression set from 5.14) | ⬜ Not started |
| 11 | Monitoring & Production Deployment (Sentry, PostHog, UptimeRobot health check) | ⬜ Not started |
| 12 | User Acceptance Testing + README | ⬜ Not started |

**Things to keep in mind across phases (so early work doesn't paint us into a corner):**
- **Everything funnels into the Phase 5 triage engine.** Pet fields built in Phase 3 (species, breed, age, weight, medical_conditions) are consumed verbatim by `formatPet` and the RAG query in Phase 5 — keep their shape stable.
- **Phase 4 (RAG ingest) and Phase 3 are independent** and can be done in parallel; Phase 5 needs *both* done.
- **The safety override, rule-based fallback, and "confidence is logged-only" rules are non-negotiable** and appear as explicit Done-When tests in Phases 5/9/10. Don't soften them.
- **Schema changes** → always regenerate `src/types/database.ts` (`npx supabase gen types ... --linked`) and commit it.
- **Deferred items currently outstanding:** **Email/Resend (user has NO account or domain yet — set up at the very end).** This covers BOTH the deferred custom-SMTP auth email (Phase 1 task 1.5) AND the new Phase 7.5 "request appointment → email the doctor" feature (manual button + AI-sent email with the last-assessment summary) — do this as one dedicated step AFTER Group D, since the valuable version needs D's chat tools + C's summary. Also still outstanding: expired-token session refresh test (Phase 2, verified at Phase 11); mid-chat reload *recovery* (the orphan *create* path is now fixed in 7.5 Group A — rows exist only after completion); **RAG wiring into the Group D assistant chat (deferred until Phase 4 KB ingestion — no content to retrieve yet).** Don't lose these — all tracked in the DEV_LOG.
- **Phase 6 design changes vs the plan (user-directed):** assessments **auto-save on completion** — the `user_saved` flag + "Save to History" button + `/api/assessment/[id]/save` were removed. Assessment **delete** (soft) moved to Phase 7 (shown when opening a past assessment, not on the just-completed results view). Pets gained **Restore** + **Delete permanently** (hard, CASCADEs assessments) in a "Recently deleted" dashboard section. The chat route slug is **`/assessment/[id]`** (was `[petId]`) so it can share the path level with `[id]/results` (Next.js requires one slug name per level). Phase 7 history must list **completed** assessments (`completed_at NOT NULL`), not `user_saved`.

## The three docs — order of authority

1. **`docs/dev_plan.md`** — the SOURCE OF TRUTH for what we build and how. Phased (0→12), each phase has a "✅ Done When" checklist. Per the bootstrap protocol above, read it **one phase section at a time**, not whole.
2. **`docs/DEV_LOG.md`** — the continuity mechanism. **Read the latest entry before doing anything**, and **append a new session entry when you finish** (template is at the top of the file). It records what's done, what's deferred, and what the next session must start with.
3. **`docs/PROPOSAL.md`** — the original academic capstone proposal. **Historical context only — do not read at startup.** It is a starting guide, not the build spec. Where it conflicts with `dev_plan.md`, the plan wins, always. This is *real software development now, not an academic deliverable* — there is no report to hand in.

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

**Environment caveat (TLS):** the dev machine runs **Norton**, whose Web/Mail Shield does HTTPS interception — it re-signs TLS with `Norton Web/Mail Shield Root`, which Node doesn't trust by default (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). **Fix (secure, already applied):** the user-level env var `NODE_OPTIONS=--use-system-ca` makes Node v22 trust the Windows cert store (where Norton's root already lives) — no verification is disabled. New terminals pick it up automatically; supabase-js scripts and `npm run ingest` then work with no flag. **Do NOT use `NODE_TLS_REJECT_UNAUTHORIZED=0`** (it disables all TLS verification → MITM risk). The Docker/pg-delta catalog warning on `db push` is non-blocking (it only affects the local edge-runtime image, which we don't use).

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

- **Done:** Phase 0–3; Phase 5 (AI triage engine); Phase 6 (results + recommendations, auto-save); Phase 7 (history+search, later folded into per-pet). **Phase 4 pipeline built but ingestion run pending user PDFs** (RAG runs empty meanwhile; classification works on model knowledge). **Current:** Phase 7.5 — **Pet Clinical History Hub** (user-directed; see Phase 7.5 in `dev_plan.md`). Built in **parts/groups**, docs updated per group. **Part 1 ✅ committed. Part 2 groups A,B,C ✅ committed (`31c463e`). Session 13 = #8–#12 + Group D + chat fixes ✅ done (committed this session):**
  - **A:** orphan-assessment fix — a row is written only when the assessment COMPLETES; chat box fixed-height; sidebar sticky.
  - **B:** vet model = **clinic + doctors** (`vet_contacts` clinic + `service_hours`/`address`, new `vet_doctors`, new `appointments`); meds editable; Hours dialog w/ live Open/Closed; collapsible doctors; pet page Vet → Appointments → Medications.
  - **C:** AI clinical context (meds + last 3 assessments); results detected-symptom badges; history abstracts; **follow-ups** = dated sections in `follow_ups` JSONB + `+ Follow-up` + timeline.
  - **#8–#10:** med `active` derived from `ended_at` (not stale flag) + all current meds in sidebar; appointment `outcome` editable only once past; follow-ups newest-first above the labeled "Initial assessment".
  - **#11/#12 (active-symptoms tracker):** new `improving` status; AI **seeds** tracked symptoms into every assessment/follow-up, asks how each changed, and **reconciles** (resolve/improve/worsen/add) via shared `reconcileActiveSymptoms` with canonical dedup; resolved symptoms drop to a collapsible **Resolved** section.
  - **Group D chats:** per-pet embedded panel + dashboard floating widget; full per-pet dossier context; **confirm-before-write** proposal cards → existing validated/RLS REST routes (add medication/appointment/vet/doctor, **cancel appointment**, update symptoms, start assessment); medication **dosage + unit** (new `dosage_unit` column); per-device **chat memory** (localStorage); relative-date resolution; cards anchored in the transcript.
- **Immediate next: a TESTING PROTOCOL of all of Phase 7.5 before any new feature** (assessments/follow-ups, active-symptoms seed+reconcile, meds w/ unit, vet+doctors, appointments add/cancel/outcome, BOTH chats' confirm-writes + memory + relative dates). Only after the test pass: **Email/Resend** (Group E — user has no account/domain yet), **Part 3** (export + AI summary), and **RAG into the assistant chat** (KB empty until Phase 4 ingestion).
- **Invariant:** assessments are immutable snapshots — chats and follow-ups read them and append; they never edit a prior snapshot. The AI must always be able to read ALL pet info (conditions, meds, clinics+doctors, appointments+notes, assessments+follow-ups, active symptoms). See the **Project roadmap** table + DEV_LOG `## STATUS` for authoritative status — keep both current.
- Routes are grouped: `src/app/(auth)/*` (login/register/callback) and `src/app/(app)/*` (protected: dashboard, pets, assessment, history). `src/middleware.ts` is the real `@supabase/ssr` session-refresh middleware (calls `supabase.auth.getUser()` to refresh tokens + guards routes); the Supabase clients live in `src/lib/supabase/{client,server,middleware}.ts`.
- After any schema change, regenerate `src/types/database.ts` and keep it committed.
- Commit/push only when asked. Update `docs/DEV_LOG.md` **and** the roadmap status at the end of each working session.

## Environment variables (`.env.local`, never committed)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (scripts only), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (embeddings only), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`. Template in `.env.example`. Vercel needs all of these set for Production AND Preview, or branch-deploy AI calls 500.
