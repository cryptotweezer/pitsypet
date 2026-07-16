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

| 7 | Assessment History & Search (`search_assessments` RPC) | ✅ Done. **Search UI wired in Session 22:** `/history` page + `GET /api/search` (debounced, `searchRateLimiter` 30/min) over the `completed_at`-filtered RPC. |

| 7.5 | **Pet Clinical History Hub** (user-directed expansion: pet page + meds/vet + contextual chat + export) | ✅ **Feature COMPLETE (all parts committed).** Parts 1 + 2 (A–D), Session 14 (global vet clinics + tz dates + assessment prompt fixes), Session 15 (collapsible past appts/finished meds + "mark finished"; assessment-complete = in-chat "View results" link + chat locks; appointment `doctor_name` by-clinic datalist; results page shows emergency contacts for High follow-ups; pet-card tag tracks latest follow-up; vet clinic/doctor hard-delete), Session 16 (**Part 3 — vet PDF export + AI summary**: `@react-pdf/renderer`, `POST /api/assessment/[id]/export`). **Manual feature-walkthrough verification is folded into the Phase 10/12 manual passes** (the standalone manual-test guide was removed). **Still deferred:** Email/Resend (Group E) + RAG-in-chat. (Export-summary caching became obsolete in Session 33 — the export is deterministic now, no AI call.) |

| 8 | UI/UX Polish & Accessibility (responsive 320–1920px, WCAG 2.1 AA) | 🟡 **Partial (Sessions 32–33):** whole authenticated app now on the landing brand — Session 32: shadcn tokens scoped via `:root:has(.app-shell)`, dashboard route group `(dashboard)` w/ full-height sidebar + **Overview**, **pet slugs** (`/pets/max`, migration `20260715000000`); Session 33: pet record / assessment / results / pet forms re-skinned, **static** (app) navbar, assessment URL = pet slug (`/assessment/max`, UUID fallback), aligned symptom sidebar (+ meds + upcoming appts), overview per-pet stat breakdown, `cleanAiText()` hygiene on all AI prose (no markdown/em dashes; prompts forbid at source). Remaining: formal responsive+WCAG pass. |

| 9 | Error Handling, Fallbacks & Security (RLS/injection/cost-guard audit) | 🟡 **Partial (pulled forward):** security rounds 1–2 done — see Status note. Remaining Phase-9 work (broader error/fallback audit) still pending. |

| 10 | Testing (Vitest; triage regression set from 5.14) | 🟡 **Mostly done:** Vitest + **136** tests pass — **71** unit (safety override, fallback, schemas, model-down regression, active-symptoms dedup, RAG ranking, meds, formatters) + **65 route-handler integration** (10.6: pets, search, medications, appointments, vet-contacts+doctors, symptoms+reconcile — all CRUD routes, via mocked Supabase client + rate limiter; shared mock in `src/app/api/__tests__/_helpers.ts`). **Left:** 10.8 perf (manual DevTools) + manual walkthrough. |

| 11 | Monitoring & Production Deployment (Sentry, PostHog, UptimeRobot health check) | 🟢 **Done bar manual smoke:** Sentry (11.1), PostHog + 3 named events (11.2), `/api/health` + **UptimeRobot 5-min monitor "Up"** (11.3), **Supabase Auth URLs set** — Site URL `https://pitsypet.vercel.app`, redirect allowlist = prod `/**` + localhost `/**` (11.4); AI keys in Vercel confirmed (prod AI works). **Left:** 11.6 prod smoke test (manual). Custom-domain swap = very-end task (then update UptimeRobot URL + Supabase Site/redirect URLs). |

| 12 | User Acceptance Testing + README | ⬜ Not started |

**Things to keep in mind across phases (so early work doesn't paint us into a corner):**
- **Everything funnels into the Phase 5 triage engine.** Pet fields built in Phase 3 (species, breed, age, weight, medical_conditions) are consumed verbatim by `formatPet` and the RAG query in Phase 5 — keep their shape stable.
- **Phase 4 (RAG ingest) and Phase 3 are independent** and can be done in parallel; Phase 5 needs *both* done.
- **The safety override, rule-based fallback, and "confidence is logged-only" rules are non-negotiable** and appear as explicit Done-When tests in Phases 5/9/10. Don't soften them.
- **Schema changes** → always regenerate `src/types/database.ts` (`npx supabase gen types ... --linked`) and commit it.
- **Deferred items currently outstanding:** **Transactional email via Resend (user has NO Resend account or domain yet — set up at the very end).** *(Separate & already DONE: the landing "Get in touch" contact form email — Session 29, Nodemailer + Gmail SMTP; that path does NOT cover the items below.)* The deferred work covers BOTH the deferred custom-SMTP auth email (Phase 1 task 1.5) AND the new Phase 7.5 "request appointment → email the doctor" feature (manual button + AI-sent email with the last-assessment summary) — do this as one dedicated step AFTER Group D, since the valuable version needs D's chat tools + C's summary. Also still outstanding: expired-token session refresh test (Phase 2, verified at Phase 11); mid-chat reload *recovery* (the orphan *create* path is now fixed in 7.5 Group A — rows exist only after completion); **RAG wiring into the Group D assistant chat (deferred until Phase 4 KB ingestion — no content to retrieve yet).** Don't lose these — all tracked in the DEV_LOG.
- **Vet PDF export is DETERMINISTIC — no AI call (Session 33; replaces the old "cache the summary" TODO):** `POST /api/assessment/[id]/export` assembles the handover purely from the STORED assessment via `buildVetSummary` (`src/lib/export/summary.ts`) — the triage AI already wrote the clinical prose at completion. Instant, free, immune to Vercel function timeouts (the old per-download Sonnet call had no `maxDuration` and died at the prod default — first half of the "works locally, fails on Vercel" bug; the second half was the **prod CSP blocking the renderer's WASM** — `@react-pdf/renderer`/yoga-layout compiles WebAssembly in the browser, so prod `script-src` carries `'wasm-unsafe-eval'` (WASM-only; does NOT enable JS `eval()`) — dev never hit it because dev CSP has `'unsafe-eval'` for HMR). Route guards = auth + RLS + `exportRateLimiter` (arcjet/daily-cap removed — no AI spend). If richer AI prose is ever wanted, generate it ONCE at assessment completion and store it; never per-download.
- **Phase 6 design changes vs the plan (user-directed):** assessments **auto-save on completion** — the `user_saved` flag + "Save to History" button + `/api/assessment/[id]/save` were removed. Assessment **delete** (soft) moved to Phase 7 (shown when opening a past assessment, not on the just-completed results view). Pets gained **Restore** + **Delete permanently** (hard, CASCADEs assessments) in a "Recently deleted" dashboard section. The chat route slug is **`/assessment/[id]`** (was `[petId]`) so it can share the path level with `[id]/results` (Next.js requires one slug name per level). Phase 7 history must list **completed** assessments (`completed_at NOT NULL`), not `user_saved`.
- **Public landing page (`/`) — merged to `main` in Session 29** (built on branch `feat/landing-page`): the marketing site (`src/app/page.tsx` + `src/components/landing/*`), separate from the authenticated app. Every section is a fullscreen (`min-h-dvh`) **scroll-snap** panel (`html:has(.landing-root){scroll-snap-type:y proximity}`, each section `snap-start`; `<main>` uses `overflow-x-clip` NOT `-hidden` so it doesn't become a nested scroller and steal snap); section content is vertically centred with `my-auto` so on short laptops it anchors below the floating pill navbar instead of hiding the heading. **Scroll-reveal** entrance via `scroll-reveal.tsx` (IntersectionObserver adds `.is-visible`; the animation runs on the independent `translate`/`opacity` properties as a CSS `@keyframes` — NOT `transform`/`transition` — so it never clobbers Tailwind `hover:scale` on cards; progressive-enhancement, no-flash, respects reduced-motion). The navbar is a floating centered pill. The **emergency-clinic section is a real interactive map** — **Leaflet + OpenStreetMap** (`leaflet@^1.9`, a **landing-only** dep) loaded client-side via an `ssr:false` wrapper (`emergency-map.tsx` → `emergency-map-inner.tsx`) so the page stays a Server Component; clinic data is a **curated static copy** of the `emergency_contacts` seed (`emergency-clinics.ts`), not a live read (RLS is auth-only; landing is public). No CSP change was needed (OSM tiles ride `img-src https:`). The **"Get in touch" form works** (Session 29): `POST /api/contact` (public — allow-listed in `src/lib/supabase/middleware.ts` alongside `/api/health`, else the auth guard 307-redirects it to `/login` and `fetch` silently follows to a false success) sends the enquiry to the owner via **Nodemailer + Gmail SMTP (App Password)**; zod-validated, honeypot field + IP-keyed `contactRateLimiter`. Design is driven **conversationally in small increments** (see memory `pitsypet-conversational-design`). See DEV_LOG Sessions 28–29 for the full list + outstanding polish.
- **Plan tiers — Basic vs Premium (product spec; NOT enforced in code yet — wire in when billing/quota is built):** the landing pricing section reflects these limits. **PitsyBasic (free):** 2 AI triage sessions / month · 2 vet PDF exports / month · **1 pet profile** · Low/Medium/High risk assessment · 24/7 access, any device. **PitsyPremium:** everything **unlimited** — unlimited AI triage sessions, unlimited vet PDF exports, **unlimited pets**, **unlimited records & clinical history**, priority support. **Enforcement points when built:** assessment-create route (monthly triage count), export route (monthly export count — `POST /api/assessment/[id]/export` already has `exportRateLimiter` + a daily cap to build on), pet-create route (1-pet cap for Basic). Stripe checkout is still stubbed — the "Go Premium"/"Start free" buttons point at `/register` (see the TODO comment in `src/app/page.tsx`).

### Triage calibration & tuning — making "vet vs home-care" sharper (a veterinarian's job)

Observed: with the **RAG empty** (KB not yet ingested — Phase 4), the classifier over-escalates — mild, single, non-red-flag presentations (e.g. a bit of lethargy, slightly increased thirst) often still get "see a vet within 24h". Some of this is **intentional** (the product is deliberately biased to escalate when uncertain — the safety override + "round risk UP" are non-negotiable), but the blanket conservatism can be tightened **without hardcoding any symptoms**. Three levers, in order of impact:
1. **RAG content (Phase 4) — the big one.** Ingest real veterinary triage guidance that actually states home-care-vs-escalate **thresholds**. The classifier then retrieves concrete criteria instead of defaulting to caution. Quality of the source docs is everything (garbage in → garbage out).
2. **Classifier prompt + Low/Medium/High definitions** (`src/lib/ai/classifier.ts`). Refine the *criteria/instructions* — give explicit permission to choose **Low / home-care** for genuinely mild, isolated, non-red-flag cases — at the rubric level, never as symptom lists. Complementary to RAG; can be tuned independently.
3. **NOT fine-tuning.** We do **not** train a custom model. "Tuning" here = RAG grounding + prompt/rubric work only.
The safety invariants stay regardless. **This calibration (curating the KB docs + the triage thresholds) is meant to be driven by a veterinarian** — they own the clinical criteria; we wire it into RAG + the prompt.

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

Next.js **15** App Router (migrated from 14 in Session 20 — async `cookies()`/`params`/`searchParams`; React 19) · TypeScript · **Vercel AI SDK v4** · Supabase (PostgreSQL + pgvector/HNSW + Auth + RLS) · OpenAI `text-embedding-3-small` · Upstash Redis (rate limit + cost guard) · Tailwind v4 + shadcn base-nova (Base UI) · Sentry · PostHog · Vercel.

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
- **Session 14 (this session):** chat-fix batch + a structural change — **vet clinics + doctors are now OWNER-level (global), managed on the DASHBOARD, not per pet** (migration `20260623000000` dropped `pet_id` from `vet_contacts`/`vet_doctors`; new global routes `/api/vet-contacts/**`; old per-pet vet routes deleted; dashboard got **Vet clinics** + **Appointments**(all pets) sections; pet page keeps its own appointments + meds; AI sees global clinics in every chat + assessment). Also: dose vs quantity clarified; clinic+doctors in one proposal card; structured `service_hours` via chat; **clear-chat** button; assistant available + **create-pet** flow even with no pets; **timezone-aware date resolution** (browser IANA tz → server date table, fixes "next Monday"); appointment **closed-clinic** confirm-before-booking; doctor lookup from clinic for "prescribed by"; **proposal cards persist across refresh** (localStorage `…:ext`). Assessment prompt fixes: **don't invent symptoms from meds/conditions — ask, then record only if confirmed**; appointments labelled **(upcoming)/(past)** so a future visit isn't treated as done.
- **Session 15 (this session):** test-driven fix batch, then feature work **handed off to the testing pass**. Pet page **past appointments** + **finished medications** are collapsible; ongoing meds get **"Mark as finished"**. Assessment completion = the AI posts an in-chat **"View results"** link and the chat **locks** (no auto-redirect, last message preserved). New appointment **`doctor_name`** field (migration `20260624000000`) with a datalist of the **selected clinic's doctors** (free-text/empty), on both pet-page + dashboard forms. **Results page emergency-contacts fix:** each block (initial + every follow-up) renders its OWN risk-appropriate recommendations, so a **High follow-up shows emergency contacts** even when the initial was lower. Pet-card **risk tag tracks the latest follow-up**. Vet clinic/doctor **DELETE is now a hard delete** (owner-global reference data, no restore UI).
- **Session 16 (this session):** **Part 3 — vet-facing PDF export + AI summary.** New `POST /api/assessment/[id]/export` assembles the record (patient, current + past meds with dates, the assessment + all follow-ups) and a Sonnet **clinical handover summary** (priority is deterministic from the stored risk, never softened); `@react-pdf/renderer` document downloaded client-side via a dynamically-imported "Export for vet (PDF)" button (heavy lib stays out of the page bundle). Independent of RAG/Resend. **Known deferred:** the summary is regenerated on every download (caching note above).
- **Session 17 (security round 1):** bounded the export route (daily cap + `exportRateLimiter`), static emergency-contacts fallback on assessment error/stall (<2s), password policy confirmed compliant; new `docs/proposal_vs_implemented.md`.
- **Session 18 (security round 2):** **security headers** — nonce-based CSP in middleware (`src/lib/security/csp.ts`) + static headers (HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy) in `next.config.mjs`; `'strict-dynamic'` required forcing the 3 static pages dynamic (`/`, `/register`, new `not-found`) so **every route is now `ƒ`**. **Arcjet** (`src/lib/arcjet.ts`: shield + bot detection, fails-open, DRY_RUN in dev) on the 3 AI routes (auth is client-side→Supabase, so not covered here by design). **RLS/injection re-audit PASS** (13/13 tables RLS, no `SERVICE_ROLE` in `src/`, 100% body writes zod-validated). **Open decision flagged:** Next.js 14.2.35 has 14 advisories fixed only in **15.5.16+** (a Next 15 major upgrade) — incl. a moderate CSP-nonce XSS; staying on 14.2.35 with documented residuals pending the user's call.
- **Immediate next (RESUME HERE):** automated testing is essentially at the plan's bar — **85 Vitest tests** (71 unit + 14 route-handler integration: `POST/GET /api/pets`, `GET /api/search`); optionally extend integration coverage to the remaining CRUD route handlers (medications/appointments/vet-contacts/symptoms — same mock pattern in `src/app/api/__tests__/`). **What's genuinely left (excluding RAG/UI/Resend):** Phase 9 remaining = mostly *verification* tasks (9.1 fallback behaviour, 9.4 cross-tenant RLS, 9.6 cost-guard fail-closed — code already exists: `src/lib/cost-guard.ts`); Phase 10.8 perf + manual walkthrough (manual); Phase 11.6 prod smoke (manual); **Phase 12.5 README** (a real code/doc deliverable). Deferred: **Email/Resend** (Group E — no account yet), **RAG into the assistant chat** (KB empty until Phase 4), **Phase 8 UI/UX polish**. See **Triage calibration & tuning** above for the over-escalation work (vet-driven, with Phase 4 RAG).
- **Invariant:** assessments are immutable snapshots — chats and follow-ups read them and append; they never edit a prior snapshot. The AI must always be able to read ALL pet info (conditions, meds, clinics+doctors, appointments+notes, assessments+follow-ups, active symptoms). See the **Project roadmap** table + DEV_LOG `## STATUS` for authoritative status — keep both current.
- Routes are grouped: `src/app/(auth)/*` (login/register/callback), `src/app/(dashboard)/dashboard/*` (sidebar shell: overview/pets/clinics/appointments/history/help — no top navbar, full-height rail, own auth re-check) and `src/app/(app)/*` (protected pages with the pill navbar: `pets/[slug]`, `pets/[slug]/edit`, `pets/new`, assessment, results; `/history` redirects to `/dashboard/history`). **Pet pages are addressed by `pets.slug`** (unique per user among active pets; assigned in the pets POST/PATCH via `src/lib/pet-slug.ts`; renames regenerate it; `new` is reserved) — API routes still key on the UUID. `src/middleware.ts` is the real `@supabase/ssr` session-refresh middleware (calls `supabase.auth.getUser()` to refresh tokens + guards routes); the Supabase clients live in `src/lib/supabase/{client,server,middleware}.ts`.
- After any schema change, regenerate `src/types/database.ts` and keep it committed.
- Commit/push only when asked. Update `docs/DEV_LOG.md` **and** the roadmap status at the end of each working session.

## Environment variables (`.env.local`, never committed)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (scripts only), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` (embeddings only), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`, and — for the landing contact form (Gmail SMTP) — `GMAIL_USER` + `GMAIL_APP_PASSWORD` (+ optional `CONTACT_TO_EMAIL`, defaults to `GMAIL_USER`). Template in `.env.example`. Vercel needs all of these set for Production AND Preview, or branch-deploy AI calls 500. **Local-dev SMTP caveat:** Norton MITMs the Gmail TLS, so `npm run dev` must run in a terminal that has the persisted user env var `NODE_OPTIONS=--use-system-ca` (a *fresh* terminal picks it up automatically) — otherwise sends fail with `self-signed certificate in certificate chain`. Do NOT "fix" it by disabling TLS verification. Production (Vercel — no Norton) needs nothing special.
