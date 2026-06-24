# Proposal vs Implemented — PitsyPet

**Purpose:** a single source of truth that maps the original capstone **PROPOSAL.md** against what is **actually built today**, what we added **beyond** the proposal, and what is still **missing/pending** — so we can be confident we cover the proposal's baseline (and know exactly where to continue).

**Ground rule (important):** the proposal is a **starting point, not a contract**. This is **real product development, not an academic deliverable**. Where `dev_plan.md` deliberately diverges from the proposal, **the plan wins** — those divergences are intentional design decisions, listed in their own section below, not gaps.

**Deferred by user (not "missing", just later):** RAG knowledge ingestion (Phase 4), Email/Resend, UI/UX polish + accessibility (Phase 8). This doc focuses on what we can advance **now** without those.

**Legend:** ✅ implemented · ➕ added beyond the proposal · 🟡 partial / needs wiring · 🔄 intentionally diverged (plan supersedes) · ⬜ not started / pending · ⛔ dropped on purpose

---

## 1. Functional Requirements

### FR1 — Registration/activation & pet profile management
- ✅ Supabase Auth registration + **email verification (magic link)** — Phase 2.
- ✅ Login, session middleware (`@supabase/ssr` token refresh), protected routes.
- ✅ Pet profile CRUD: name, species (Dog/Cat), **breed autocomplete**, age (years/months), weight, medical_conditions (JSONB).
- ✅ Multi-pet dashboard; switch between pets.
- ✅ Pet field validation (species enum, weight ranges, etc.) via zod.
- 🟡 **Password policy** (proposal: 8+ chars w/ upper/lower/number/special) — **verify our registration enforces the full rule** (Supabase default may be weaker).
- ➕ Pet **soft-delete + Restore + permanent purge** ("Recently deleted"), beyond the proposal's plain delete.

### FR2 — Symptom input & management
- ✅ **Conversational** chat assessment (not form-based); AI greets by pet name.
- ✅ Free-text + **quick-select reply buttons** + clarifying follow-ups.
- ✅ **Live collapsible symptom sidebar** (extracted symptoms stream in).
- ✅ Context maintained across the dialogue (references earlier statements).
- 🔄 Stored as a single **`conversation_log` JSONB** on `assessments` (proposal had a separate "Conversation Messages" table — we collapsed it on purpose).
- ➕ **Active-symptoms tracker** with seeding into follow-ups + reconciliation (resolve/improve/worsen/add) — beyond the proposal.

### FR3 — AI triage, risk classification & history search
- ✅ **Tier 1** extract+reply, **Tier 2** RAG retrieval, **Tier 3** risk classification — engine built and live-tested.
- 🟡 **RAG runs empty** until the KB is ingested (**Phase 4 pending** — needs source docs). Classification currently works on model knowledge.
- ✅ Risk = Low/Medium/High with clinical reasoning + recommended action.
- ✅ Assessment logging: tokens_used, processing_time_ms, model_version, rag_chunks_used, confidence_score.
- ✅ **Rule-based fallback** classifier when the model fails.
- ➕ **Deterministic safety override** (can only escalate) — NOT in the proposal, core to the product.
- 🟡 **History search:** the parameterised, injection-safe `search_assessments` RPC **exists in the DB** but is **not currently wired to a UI search box** (history was folded into the per-pet page). `searchRateLimiter` (30/min) is defined but unused. **Decision needed:** wire a real search UI, or formally mark search as per-pet history.
- 🔄 Divergences from the proposal's Tier design (all intentional — see §5): two models (Haiku+Sonnet) vs single Sonnet; confidence **logged-only** vs 0.75 gate; urgency **re-rank** vs ≥5 filter; **HNSW** vs IVFFlat; embeddings **3-small (1536)** vs 3-large.
- ⬜ **Push notifications** for high-risk — not implemented.
- ⬜ **`assessment_analytics`** aggregate table — not implemented (daily metrics).
- ✅ **`knowledge_processing_audit`** table exists (RLS deny-all by design).

### FR4 — Symptom information & first-aid
- ✅ **First-aid recommendations** table + Low-risk first-aid, age-appropriate; seeded.
- ✅ Detected-symptom list on results.
- 🟡 **"About these symptoms" educational block** (per-symptom explanation: common causes / when to worry) — we show detected symptoms + clinical reasoning, but the dedicated per-symptom educational section is **not a distinct feature yet**.

### FR5 — Results, disclaimer & veterinary referral
- ✅ Colour-coded **risk badge**, primary concern, plain-language clinical reasoning, recommended action.
- ✅ **Emergency veterinary contacts** for High risk (state-specific + national hotline fallback) — now also per **follow-up** block.
- ✅ Prominent **legal disclaimer** box.
- 🔄 **Save Assessment** → assessments now **auto-save on completion** (the `user_saved` flag + Save button were removed on purpose).
- ➕ **PDF "share with vet" export + AI clinical summary** (Part 3) — the proposal listed "generate PDF summary" only as an alternate flow; now **fully implemented** (`@react-pdf/renderer`, vet-facing handover, current/past meds, priority).

---

## 2. Non-Functional Requirements

### Security (proposal NFR-1)
- ✅ **TLS** in transit — provided by Vercel + Supabase (platform-managed HTTPS).
- ✅ **SQL-injection prevention** — all data access via supabase-js (parameterised) + RLS; the `search_assessments` RPC uses `plainto_tsquery` (parameterised, injection-safe).
- ➕ **RLS on every table** (users touch only their own rows; lookup tables read-only; audit table deny-all) — beyond the proposal.
- ➕ **Service-role key isolation** — used ONLY in `scripts/`; `grep SERVICE_ROLE src/` returns nothing (verified).
- ➕ **Rate limiting + cost guard** via Upstash Redis (see §3) — beyond the proposal.
- See §4 for the full security picture + gaps.

### Usability (proposal NFR-2)
- ✅ Conversational flow designed for a quick assessment; ⬜ the **<5-min target is not formally measured**.
- ⬜ **Responsive 320–1920px** — Phase 8 (deferred by user).
- ⬜ **WCAG 2.1 AA + 14px min font** — Phase 8 (deferred by user).

### Reliability (proposal NFR-3)
- ⬜ **99% uptime 8am–8pm AEST** — needs monitoring (Phase 11; UptimeRobot).
- ✅ **AI timeout → show emergency contacts <2s** — the assessment chat now surfaces a **fully static `EmergencyFallback`** (national hotline + "search emergency vet near me", no fetch → renders instantly) on an error or a **>10s stall** (`STALL_MS`). *(done — security pass)*
- ✅ Fallbacks for AI failures (rule-based classification); RAG failure → proceed without context (already coded).

---

## 3. External services & integrations

| Service | Proposal | Status |
|---|---|---|
| **Vercel** (hosting) | Frontend hosting | ✅ used |
| **Supabase** (Postgres + pgvector + Auth) | Core DB/Auth | ✅ used (HNSW index; Auth + email verification) |
| **Claude (Anthropic)** | Single Sonnet 4.5 | ✅ **Haiku 4.5** (extract/chat) + **Sonnet 4.6** (classify, vet summary) 🔄 |
| **OpenAI Embeddings** | text-embedding-3-large | ✅ wired, **3-small (1536)** 🔄; runs but KB empty until Phase 4 |
| **Upstash Redis** | — (not in proposal) | ➕ rate limit + daily cost cap |
| **Sentry** (errors) | Planned | ⬜ Phase 11 |
| **PostHog** (analytics) | Planned | ⬜ Phase 11 |
| **UptimeRobot** (uptime) | Planned | ⬜ Phase 11 |
| **Resend** (email) | Custom SMTP (deferred) | ⬜ deferred (no account/domain yet) |
| **Stripe** (payments) | Future / freemium | ⛔ out of MVP scope (future) |
| **Railway + FastAPI (Python)** | Backend host + framework | ⛔ dropped — replaced by Next.js full-stack on Vercel 🔄 |
| **Arcjet** (security SaaS) | — (not in proposal) | ⬜ optional add (see §4) |

---

## 4. Security & Cybersecurity — detail + gaps + what we can add now

**What the proposal asked for:** TLS in transit; parameterised queries / SQL-injection prevention; rate limiting (30 searches/min); auth via Supabase (bcrypt, JWT, magic-link verification); confidence gating; fallback mechanisms.

**Implemented today:**
- ✅ Supabase Auth (bcrypt + JWT + email verification) and session-refresh middleware.
- ✅ RLS on every table (owner-scoped); service-role key only in `scripts/`.
- ✅ Parameterised access everywhere (supabase-js + `plainto_tsquery` RPC).
- ✅ **Rate limiting** (`src/lib/rate-limit.ts`): chat limiter **20/min** applied to `/api/assessment/chat` and `/api/assistant`.
- ✅ **Cost guard** (`src/lib/cost-guard.ts`): global **daily assessment cap** (200/day) on the AI chat routes.
- ✅ Zod validation on write routes (pets, meds, appointments, vet contacts, symptoms).

**Security pass (done this round):**
1. ✅ **Export route now bounded** — `/api/assessment/[id]/export` is behind the global daily cap (`checkDailyCap`) + a per-user `exportRateLimiter` (10/min). Closed the unprotected-AI-route gap.
2. ✅ **Password policy confirmed** — registration already enforces the proposal's rule via zod (`register-form.tsx`: 8+, upper, lower, number, special). No change needed.
3. ✅ **Emergency-contacts-on-timeout <2s** — static `EmergencyFallback` shown on error or >10s stall (see §2 Reliability).
4. ✅ **Cost-guard / rate-limit coverage** — every Claude/OpenAI route is now behind both: chat ✅, assistant ✅, export ✅.

**Remaining (safe, no external deps):**
- 🟡 **`searchRateLimiter` (30/min)** — defined + reserved; pending the **search UI** being wired to the `search_assessments` RPC (an FR3 feature, not just a security task).
- 🟡 **Security headers** — add CSP / HSTS / X-Frame-Options / X-Content-Type-Options / Referrer-Policy via `next.config` (next safe step).
- 🟡 **Arcjet harden** — user HAS an account/key; bring it in later for bot/abuse protection on auth + AI routes.

**Optional enhancement — Arcjet (not in the proposal):**
- Arcjet is a Next.js-native security layer (bot detection, WAF-style rules, rate limiting, email validation, PII redaction) that runs inline in middleware/route handlers. It would **complement** (or partly replace) the Upstash rate limiting and add bot/abuse protection on the auth + AI routes.
- ⚠️ Like Resend, it needs an **account + API key**. It's a good "harden the AI/auth endpoints" add, but it's **beyond the proposal** — treat as an opt-in once we decide to bring in another external service. Until then, the Upstash limiter + cost guard cover the proposal's requirement.

**This is essentially Phase 9 (Error Handling, Fallbacks & Security) of the roadmap** — and it's the work most independent of the deferred RAG/Resend/UI.

---

## 5. Intentional divergences from the proposal (plan supersedes — NOT gaps)
- Next.js 14 full-stack (TypeScript) on Vercel — **no FastAPI/Python, no Railway**.
- **Two models**: Haiku (extract + chat reply) + Sonnet (classify) — not a single Sonnet.
- **`text-embedding-3-small`** (1536) — not 3-large.
- **HNSW** vector index — not IVFFlat.
- **Confidence is logged-only**, never a gate; uncertainty rounds risk **up** — not the 0.75 gate.
- **Urgency is a re-rank nudge**, never a retrieval filter — no `urgency ≥ 5` WHERE.
- Single **`conversation_log` JSONB** — no separate messages table.
- **One `streamText` call per message** (extract + reply together; RAG + classify in `onFinish`) — not three blocking calls.
- **Auto-save on completion** — removed `user_saved` + Save button.
- ➕ **Deterministic safety override** + **rule-based fallback** — core safety features the proposal never specified.
- ➕ Whole **Pet Clinical History Hub** (Phase 7.5): medications, owner-global vet clinics + doctors, appointments, follow-ups, active-symptom reconciliation, contextual assistant chats, **vet PDF export** — a large, user-directed expansion beyond the proposal.

---

## 6. What's missing vs the proposal (the real backlog)
- ⬜ **RAG KB ingestion** (Phase 4) — pipeline built; needs source docs. *(Deferred by user.)*
- ⬜ **Email/Resend** — appointment email + AI summary email; custom-SMTP auth email. *(Deferred by user.)*
- ⬜ **Responsive + WCAG AA** (Phase 8). *(Deferred by user.)*
- ⬜ **History search UI** wired to the existing `search_assessments` RPC (or formally decide per-pet only).
- ⬜ **"About these symptoms" educational block** (per-symptom causes / when to worry).
- ⬜ **Push notifications** for high-risk.
- ⬜ **`assessment_analytics`** aggregate table + dashboards.
- ⬜ **Monitoring**: Sentry, PostHog, UptimeRobot (Phase 11).
- ⬜ **Automated tests** (Vitest) incl. triage regression set (Phase 10).
- ⬜ **Reliability**: formal uptime + verified <2s emergency fallback.
- ⬜ **UAT with 10 users + README** (Phase 12).
- 🟡 **Security hardening** (Phase 9) — partly done (RLS, rate limit, cost guard); gaps in §4.

---

## 7. Recommended next steps (given RAG/Resend/UI are deferred)
The work most **independent** of the deferred items, in order:
1. ✅ **Security pass (round 1) — done:** export-route rate-limit + cost-guard, password policy confirmed, <2s emergency fallback, full AI-route coverage (§4).
2. **Security pass (round 2):** **security headers** via `next.config` (CSP/HSTS/etc.), RLS/injection re-audit, then **Arcjet** harden (user has an account) on auth + AI routes.
3. **Phase 10 — Testing (Vitest)** — especially the **triage regression set**. Independent of RAG (tests classifier/override/fallback; RAG landing later only adds context).
4. **History search UI** — small, closes an FR3 gap, reuses the injection-safe RPC + the reserved 30/min limiter.

These won't need rework when RAG, Resend, or the UI polish land later — they're orthogonal layers (security, tests, search), not things that depend on KB content, email, or final styling.
