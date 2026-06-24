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

**Current phase:** Phase 7.5 — Pet Clinical History Hub. **Part 1 ✅ committed.** **Part 2 — groups A→B→C ✅ committed (`31c463e`); #8–#12 + Group D + chat fixes ✅ (Session 13).** **Session 14 (global vet clinics + tz dates + assessment prompt fixes) ✅. Session 15 (final test-driven fix batch) ✅ — feature work COMPLETE and HANDED OFF to the testing pass (`docs/TESTING_PROTOCOL.md`).** Email/Resend (Group E), Part 3, and RAG-in-chat remain after testing.
- **A (bugs):** orphan-assessment fixed (no DB row until COMPLETE — chat route persists only on completion via upsert; page mints a UUID, no pre-insert); chat box fixed-height + scroll, symptom sidebar sticky.
- **B (pet record):** vet model = **clinic + doctors** (`vet_contacts`→clinic w/ `service_hours` JSONB + `address`; new `vet_doctors`; new `appointments`); meds **editable + labeled** (Dosage/Quantity/Frequency); vet **editable**, structured **opening-hours picker**, clickable **Hours dialog w/ live Open/Closed**, **collapsible doctors**; **Next appointments** section; pet page relaid Vet → Appointments → Medications.
- **C (assessment context/history):** AI now gets current **meds + last 3 assessments** in extraction + classification (conditions already via formatPet); results page lists **detected symptoms**; history cards show an **abstract** (concern + symptoms + next steps + follow-up count); **follow-ups** = dated sections appended to the same assessment (`follow_ups` JSONB), with a **+ Follow-up** button + timeline on results.
- **Session 13 (#8–#12 + Group D):** quick fixes #8/#9/#10 done; **active-symptoms reconciliation #11/#12** done (AI carries tracked symptoms into every assessment/follow-up, asks how each changed, and resolves/improves/worsens/adds via shared `reconcileActiveSymptoms` with canonical dedup; new `improving` status; resolved symptoms move to a collapsible "Resolved" section on the pet page); **Group D chats** done (per-pet embedded panel + dashboard floating widget; full per-pet context; confirm-before-write proposal cards → existing REST routes; `start_assessment` button).
- **Session 14 (this session, committed):** chat-fix batch + structural change — **vet clinics + doctors are now OWNER-level (global)**, managed on the **dashboard**, not per pet. Migration `20260623000000_global_vet_contacts` (applied; required reconciling a migration-history drift — two MCP-applied migrations `20260622104230/113454` were repaired `reverted`, local `20260622000000/000100` marked `applied`). Dropped `pet_id` from `vet_contacts`/`vet_doctors`; new global routes `src/app/api/vet-contacts/**`; deleted old per-pet vet routes; new `VetContactsManager` + `DashboardAppointments` (all pets, pet picker) on the dashboard; pet page keeps its own appointments + meds (clinic dropdown now reads global clinics); `loadUserClinics()` feeds clinics (with hours + doctors) into EVERY assistant chat + the assessment. Other fixes: dose-vs-quantity prompt/tool clarity; clinic+doctors in ONE proposal card; structured `service_hours` via chat; **Clear chat** button; assistant always available + **propose_create_pet** (works with 0 pets); **timezone-aware dates** (browser IANA tz → server `buildDateReference` table; fixes "next Monday"); appointment **closed-clinic confirm-before-booking** (`clinicOpenAt`); doctor lookup from clinic for "prescribed by"; **proposal cards persist across refresh** (localStorage `…:ext`). **Assessment prompt fixes (mid-test):** never invent symptoms from meds/conditions — **ask, then record only if confirmed**; appointments labelled **(upcoming)/(past)** so a future visit isn't treated as already done.
- **Session 15 (this session, committed):** final fix batch from the user's manual test, then **handed off to the testing pass**. (1) Pet page **past appointments** + **finished medications** are now collapsible sections; ongoing meds get a **"Mark as finished"** button (sets `ended_at=today`). (2) Assessment chat completion reworked: **no auto-redirect** — the AI posts a closing message with a clickable **"View results"** button and the chat **locks** (input + replies gone), so the last AI message is never lost. (3) **Appointment `doctor_name`** field added (migration `20260624000000`): a datalist of the **selected clinic's doctors**, free-text or empty — on BOTH the pet-page and dashboard appointment forms. (4) **Results page emergency-contacts bug fixed**: each block (initial + every follow-up) now renders its OWN risk-appropriate `Recommendations`, so a **High-risk follow-up** shows emergency contacts even when the initial was Low/Medium; emergency contacts are fetched if ANY block is High; Low follow-ups get their own first-aid. (5) Pet-card **risk tag now tracks the LATEST follow-up's** risk, not the initial. (6) Vet clinic/doctor **DELETE changed from soft → hard delete** (no restore UI for this owner-global reference data; clinic delete cascades doctors + nulls appointment links). Testing protocol written to `docs/TESTING_PROTOCOL.md` (renamed from `TESTING_PHASE_7.5.md`).
**Active plan:** `dev_plan.md` (Phase 7.5 section)
**Next action (RESUME HERE):** Phase 7.5 feature work is **complete and handed to the TESTING PASS** — see `docs/TESTING_PROTOCOL.md` (full end-to-end checklist). Await tester feedback and fix anything in the protocol's "Failures to fix" section. Only after the test pass: **Email/Resend** (Group E), **Part 3** (export + AI summary), **RAG into the assistant chat** (KB empty until Phase 4 ingestion).
**Deferred (explicit):** **Email/Resend** — user has **no Resend account or domain yet** (gets one at the end). The manual "request appointment → email doctor" button AND the AI-sent appointment email (with last-assessment summary) are deferred to a dedicated step (needs the chat tools + summary). Build email once, reuse for the deferred custom-SMTP auth too. **Also deferred:** wiring RAG into the assistant chat (no KB content yet).

---

---
## SESSION 15 — 2026-06-24 — Claude / Opus 4.8 (Phase 7.5 — test-driven fix batch + testing hand-off)

### STARTED WITH
- Session 14 committed (`91d104b`). User was running the manual assessment test and filed a batch of concrete fixes.

### COMPLETED THIS SESSION (all: `tsc` + `lint` clean; COMMITTED this session)
- **Pet record UI (test notes #1/#2).** `appointments-section.tsx`: **Past appointments** are now a collapsible "Past appointments (N)" section (collapsed by default; upcoming stay above). `medications-section.tsx`: split into active + a collapsible **"Finished medications (N)"** section (active/finished derived from `ended_at` via `isMedicationActive`); ongoing meds get a **"Mark as finished"** button → `PATCH { ended_at: today, active: false }`.
- **Assessment chat completion (test note #3).** `chat-interface.tsx`: removed the auto `router.push` to results (it clobbered the AI's last message). On completion the AI now posts a closing bubble **inside the transcript** with a Base-UI `Button render={<Link/>}` **"View results →"**; while the stream is still closing it shows "Preparing results…", and once closed (`classification && !isLoading`) the link appears. Input + quick-replies already gate on `!classification`, so the chat **locks** on completion.
- **Appointment doctor field (user request).** Migration `20260624000000_appointment_doctor_name` (applied via `db push`) → `appointments.doctor_name TEXT`. Free-text with a **datalist of the selected clinic's doctors** (placeholder adapts to clinic-chosen / has-doctors / none); accepts a typed name or blank. Wired on BOTH `appointments-section.tsx` (pet page) and `dashboard-appointments.tsx`. Pet page groups doctors by clinic (`doctorsByClinic` → `clinics[].doctors`); dashboard reuses its existing per-clinic `doctors`. `appointment.ts` schema gained `doctor_name: optionalText(200)` (POST/PATCH already spread `parsed.data`). **`database.ts` hand-edited** (added `doctor_name` to appointments Row/Insert/Update) because `gen types` again hit a TLS/network `TransportError` and clobbered the file → restored from git, applied the 3 diffs by hand. Re-run `gen types` when the network cooperates (result will be identical).
- **Results page emergency-contacts bug (the reported High-follow-up miss).** `assessment/[id]/results/page.tsx`: the High case can live in any block since follow-ups are separate immutable snapshots and the top-level `risk_classification` doesn't change. Fix: fetch emergency contacts if `risk === "High" || followUps.some(High)`; extracted a reusable `loadFirstAid()`; precompute per-follow-up first-aid (`followUpData`); each follow-up now renders its own `<Recommendations>` (High → emergency contacts + red flags, Medium → 24h note, Low → first-aid) instead of a plain recommended-action line. Added `red_flags` to the follow-up parser (already stored, just unused).
- **Pet-card risk tag (user request).** `pets/[id]/[name]/page.tsx`: the card's `risk_classification` now uses the **last follow-up's** risk when follow-ups exist (else the initial), so the small card tag tracks the pet's current state.
- **Vet clinic/doctor delete (bug: rows not removed).** Both were **soft deletes** (`deleted_at`) but these owner-global records have **no restore/purge UI**, so rows accumulated hidden. Changed `api/vet-contacts/[vetId]/route.ts` and `.../doctors/[doctorId]/route.ts` DELETE to **hard delete** (`.delete()` + `user_id` guard). Safe per schema: clinic delete CASCADEs doctors + SET NULL on `appointments.vet_contact_id`; doctor names are free-text elsewhere (no FK). User had already removed the old soft-deleted rows manually.
- **Confirmed (no change needed):** vet clinic/doctor deletion already exists on the dashboard (`VetContactsManager` Trash2 + confirm dialogs → the now-hard-delete routes). Clinics stay global; deleting a single pet does NOT remove them (by design).
- **Docs:** renamed `TESTING_PHASE_7.5.md` → `TESTING_PROTOCOL.md` and rewrote it as a complete end-to-end protocol (Groups 0–H) covering every Phase 7.5 function incl. this session's additions. Updated the roadmap (CLAUDE.md) + this STATUS block.

### NOT DONE / DEFERRED (unchanged)
- **Email/Resend** (Group E), **Part 3** (export + AI summary), **RAG in the assistant chat** — all after the testing pass.

### FILES MODIFIED
- New: `supabase/migrations/20260624000000_appointment_doctor_name.sql`; renamed `docs/TESTING_PHASE_7.5.md` → `docs/TESTING_PROTOCOL.md`.
- Changed: `src/components/pets/appointments-section.tsx`, `src/components/pets/medications-section.tsx`, `src/components/assessment/chat-interface.tsx`, `src/components/appointments/dashboard-appointments.tsx`, `src/app/(app)/pets/[id]/[name]/page.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/assessment/[id]/results/page.tsx`, `src/lib/validations/appointment.ts`, `src/app/api/vet-contacts/[vetId]/route.ts`, `src/app/api/vet-contacts/[vetId]/doctors/[doctorId]/route.ts`, `src/types/database.ts`.

### NEXT SESSION MUST START WITH
1. **Run / collect feedback from the TESTING PASS** (`docs/TESTING_PROTOCOL.md`). Fix anything in its "Failures to fix" section.
2. Only after the test pass: Email/Resend (Group E), Part 3 (export + AI summary), RAG into the assistant chat (after KB ingestion).

### DECISIONS / NOTES
- Vet clinics/doctors are owner-global with no restore UI → **hard delete** is correct for them (unlike pets, which keep soft-delete + Recently-deleted + restore/purge).
- Results page now treats each assessment block (initial + each follow-up) as independently risk-classified for the purpose of recommendations — consistent with follow-ups being immutable snapshots that can re-classify the case.
- `gen types` under Norton TLS keeps failing intermittently (`TransportError`) and a `>` redirect clobbers `database.ts`; when it fails, restore from git and hand-apply the column diffs (the migration is already on remote, so the types are the only thing to reconcile).

---
## SESSION 14 — 2026-06-23 — Claude / Opus 4.8 (Phase 7.5 — chat fixes + GLOBAL vet clinics + tz dates + assessment prompt fixes)

### STARTED WITH
- Session 13 committed (`121f453`). User began the Phase 7.5 testing protocol but pivoted to fixing concrete bugs/UX found while testing the assistant chats.

### COMPLETED THIS SESSION (all: `tsc` + `lint` + `npm run build` clean; COMMITTED this session)
- **Chat batch #1 (dashboard/pet assistant):** dose vs quantity clarified in prompt + `propose_add_medication` (dosage+unit = strength mg/ml…, quantity = count of tablets/drops); `propose_add_vet_contact` now takes structured `service_hours` + an optional `doctors[]` so a clinic + its doctors are ONE confirm card (server `POST /vet-contacts` creates both); **Clear chat** button (clears transcript + persisted cards; cleared ids guard so the `data` stream can't resurrect them).
- **Dashboard assistant with no pets:** widget always renders (`DashboardChatWidget hasPets`); greeting adapts; new tool **`propose_create_pet`** (collects name/species/breed/age/weight, converts lb→kg, confirm card → `POST /api/pets`); `confirm()` surfaces server error text (e.g. duplicate name 409).
- **GLOBAL VET CLINICS (structural):** vets/doctors are now owner-level, not per pet.
  - Migration `20260623000000_global_vet_contacts`: dropped `pet_id` from `vet_contacts` + `vet_doctors` (data pre-deleted by user), added `idx_vet_contacts_user`/`idx_vet_doctors_user`. **Had to repair migration-history drift first** (`migration repair --status reverted 20260622104230 20260622113454`, then `--status applied 20260622000000 20260622000100`) — those two had been applied via the Supabase MCP under different timestamps. Types regenerated via MCP (CLI `gen types` failed with a TLS/network TransportError and clobbered the file → restored from git, hand-applied the two diffs).
  - New global routes `src/app/api/vet-contacts/route.ts` (GET+POST w/ optional doctors[]), `[vetId]` (PATCH/DELETE), `[vetId]/doctors` (POST), `[vetId]/doctors/[doctorId]` (PATCH/DELETE). Deleted all `src/app/api/pets/[id]/vet-contacts/**`.
  - New components: `src/components/vet/vet-contacts-manager.tsx` (global clinic+doctor CRUD, hours picker, Hours dialog, collapsible doctors — doctor phone/email now show with icons) and `src/components/appointments/dashboard-appointments.tsx` (ALL pets' appointments, past/upcoming split + outcome, **pet picker** on add; "Add a pet first" hint when 0 pets). Deleted `src/components/pets/vet-contacts-section.tsx`.
  - Dashboard renders **Vet clinics** then **Appointments** STACKED (full width, so editing one doesn't reflow the other). Pet page: vet section removed; keeps Appointments (its pet only) + Medications; clinic dropdown + "prescribed by" suggestions read GLOBAL clinics/doctors.
  - `assistant.ts`: `loadPetDossier` no longer loads clinics; new **`loadUserClinics()`** (clinics + hours + doctors) injected into EVERY assistant chat AND the assessment context. Assistant tools updated: vet/doctor proposals hit the global routes; appointment + doctor proposals resolve the clinic from `userClinics`.
- **Appointment intelligence:** prompt now makes the AI ask reason/notes before proposing; `clinicOpenAt()` does a **deterministic closed-clinic check** against `service_hours` — if the clinic is closed at the chosen day/time the tool refuses and asks the owner to confirm, only booking when called again with `confirmedOutsideHours: true`.
- **Timezone-aware dates:** the assistant chat sends the browser's IANA `timeZone`; the server builds a **`buildDateReference(21, tz)`** table (anchored to the user's local "today" via `Intl`) and the prompt forbids the model from computing weekdays itself (fixes "next Monday" landing on the wrong date / wrong weekday narration). Works for any user worldwide regardless of Vercel's region.
- **Proposal cards persist across refresh:** `assistant-chat.tsx` mirrors `data`-stream actions into `storedActions` + persists `{actions,statuses,anchors}` to `localStorage` (`…:ext`); restored on mount ("working" → "pending"). Prompt also forces re-emitting `propose_start_assessment` whenever asked (no "the button should appear" without a tool call).
- **Doctor lookup:** when "prescribed by" / a doctor is needed and the owner names only a clinic or forgets the name, the AI looks up that clinic's doctors and offers them (one → suggest, several → ask, none → blank).
- **Assessment prompt fixes (the current test focus):**
  - **No inventing symptoms from background.** `EXTRACTION_SYSTEM_PROMPT`: extractedSymptoms = ONLY owner-reported-this-conversation + pre-loaded tracked active symptoms. A medication/condition/past assessment is NOT proof of a current symptom (one med treats many things) — the AI may ASK (naming the med + prescriber + typical use) but only records on confirmation; no improving/worsened/resolved on undiscussed items.
  - **Appointments labelled (upcoming)/(past)** in `formatAppointments(appts, todayStr)`; prompt tells the AI a future appointment hasn't happened (never "how did it go"), a recent past one may warrant a brief question, old ones are ignored.

### IN PROGRESS / NEXT SESSION MUST START WITH
1. **WE ARE MID-TEST OF THE ASSESSMENT + SYMPTOMS.** User will keep testing tomorrow. Verify the two assessment prompt fixes live: (a) AI never auto-adds symptoms from meds/conditions — it asks then records only if confirmed; improving/worsened only on discussed symptoms; (b) future appointments are not treated as past.
2. Then resume the broader Phase 7.5 test pass (global vet clinics+doctors, appointments add/cancel/outcome from dashboard AND pet page, both chats' confirm-writes + memory + card persistence + relative dates + closed-clinic confirm).

### DECISIONS / NOTES
- Vet clinics/doctors are intentionally **owner-global** now (user-directed): one clinic serves all pets, visible to the AI everywhere; appointments stay per-pet but are listed (all) on the dashboard and (own) on each pet page, creatable from both.
- Opening hours are naive wall-clock (no tz) = "local to the user"; the "Open now" badge uses the browser clock, the booking check uses the user-local wall-clock — consistent.
- Known latent item (NOT fixed, flagged to user): stored appointment **time-of-day** is shown via `toLocaleString` in the viewer's browser tz, so it can shift for stored rows; the date/weekday resolution (the reported bug) IS fixed.

---
## SESSION 13 — 2026-06-22 — Claude / Opus 4.8 (Phase 7.5 Part 2 — #8–#12 + Group D chats)

### STARTED WITH
- Session 12 work committed (`31c463e`). Backlog #1–#7 done; NEXT-BATCH #8–#12 pending. User agreed to do quick fixes #8–#10 first, then #11/#12 + Group D.

### COMPLETED THIS SESSION (all: `tsc` + `lint` + `npm run build` clean; UNCOMMITTED)
- **#8 — meds hidden / dosage unit.** New `src/lib/medications.ts` `isMedicationActive(ended_at)` (active = no end date or end ≥ today). Write rule in `medications-section.tsx` fixed (future end date now stays active). Assessment sidebar query (`assessment/[id]/page.tsx`) filters by **date** (`ended_at is null OR >= today`), not the stale `active` flag → shows ALL current meds. `format.ts` derives the AI's `[inactive]` label from `ended_at` too. Dosage "16" was confirmed **not a code bug** (schema/API round-trip the full string; it was test data without a unit).
- **#9 — appointment outcome.** `appointments-section.tsx`: outcome field disabled (with note) unless the form's `scheduled_at` is in the past; owner notes stay always-editable.
- **#10 — follow-up order.** Results page now renders follow-ups **newest-first** and **above** the original block, which is labeled "Initial assessment · <date>" → reads most-recent → initial.
- **#11/#12 — active-symptoms reconciliation (the big one, per user "ultrathink" direction).**
  - Migration `20260622000000_active_symptoms_improving` (applied via Supabase MCP): status CHECK now allows `improving` (better-but-present) alongside active/worsened/resolved.
  - `ExtractedSymptomSchema` gained `status` (`present|improving|worsened|resolved`, default present).
  - **Seeding:** `assessment/[id]/page.tsx` pre-loads the pet's tracked symptoms → passes `initialSymptoms` to `ChatInterface` (shown in the "Symptoms noticed" panel before the AI's first turn) and enriches the greeting ("I'm already tracking these… how are they now?"). Chat route prompt lists the tracked symptoms and instructs the AI to carry ALL of them forward, ask how each changed, and set each one's status.
  - **Shared reconciliation** `src/lib/active-symptoms.ts` `reconcileActiveSymptoms()` — canonicalised matching (lowercase, strip punctuation/​separators, token-subset) so "sleepiness" ≈ "sleepiness/lethargy" (#12 dedup); resolves/improves/worsens existing, inserts new; **resolution is explicit only** (absence ≠ recovery). Chat route `onFinish` now calls it (replacing the insert-only block); reused by the Group D chat + a new `POST /api/pets/[id]/symptoms/reconcile`.
  - `formatSymptoms` passes status to the classifier; results page + `SymptomSidebar` show status tags (green improving / red worsened / struck-through resolved). Safety override untouched.
  - **Resolved section:** `ActiveSymptomsSection` splits active vs resolved; resolved drop into a **collapsible "Resolved (N)"** section (Reactivate available). Added a "Mark improving" button + `improving` badge; symptoms PATCH route clears `resolved_at` for any non-resolved status.
- **Group D — contextual chats (first version).**
  - `src/lib/ai/assistant.ts`: `loadPetDossier()` builds a per-pet text dossier (conditions, active symptoms, current meds, vet clinics+doctors, appointments, recent assessments) + clinic name→id map; `ProposedAction` type.
  - `/api/assistant/route.ts`: scopes **pet** (focused pet full dossier + other pets' names) and **dashboard** (all pets). **Confirm-before-write**: proposal tools (`propose_add_medication/appointment/vet_contact/doctor`, `propose_cancel_appointment`, `propose_update_symptoms`, `propose_start_assessment`) write nothing — they emit a `{type:"action"}` part to the data stream with the REST `endpoint`+`method`+`payload`. Dashboard scope resolves `petName`→pet server-side ("be sure which pet"); doctor proposals resolve clinic by name; cancel resolves the appointment by title/date from the dossier (DELETE).
  - `AssistantChat` (`src/components/assistant/assistant-chat.tsx`): renders messages + **confirm/cancel action cards** (honors POST or DELETE; cancel uses a destructive "Confirm cancel"); Confirm hits the proposal's REST endpoint then `router.refresh()`; `start_assessment` shows a **Start** button that navigates. Mounted as an **embedded panel** at the bottom of the pet page and a **floating bottom-right widget** (`dashboard-chat-widget.tsx`) on the dashboard (only when the user has pets).
- **Dosage unit (user-requested mid-session).** Migration `20260622000100_medication_dosage_unit` (applied via MCP; `database.ts` hand-edited): new `dosage_unit` column. Medication form now has **Dose amount + Unit** (datalist of mg/ml/mcg/g/IU/tablet… but free-text/open). Display + AI context combine "amount unit" (e.g. "1.5 mg") via `formatDosage`/`formatMedications`. The assistant's `propose_add_medication` splits amount vs unit and asks for the unit if missing. Propagated to assessment sidebar, chat-route clinical context, and the assistant dossier.
- **Assistant chat polish (user bug report).** (1) **cancel_appointment** tool added (resolve by title/date → DELETE confirm card). (2) Proposal cards now **anchor to the message that produced them** (no longer stick to the bottom as new messages arrive). (3) **Per-device chat memory** via `localStorage` (key `pitsypet-chat:{scope}:{petId|all}`), hydrated after mount to avoid SSR mismatch. (4) **Input keeps focus after Enter** (stopped disabling it during loading). (5) **Relative dates**: today's date is now in the system prompt + the AI is told to resolve "hoy/mañana/en una semana" to YYYY-MM-DD itself and never pass words to tools (fixes the "confirm fails because started_at='hoy'" bug + the widget "no toma la fecha actual"). (6) Prompt now requires collecting **every field** of a record (e.g. medication quantity) before proposing, skipping only if the owner declines.
- **Session 13 follow-up fixes (live-test feedback, all done + build-clean).**
  - **Chat memory was wiping on refresh.** Root cause: the save effect ran during the mount commit (because the "hydrated" guard was a *ref* set synchronously) and overwrote the saved transcript with just the greeting before hydration applied. Fix: the guard is now React **state** (`ready`) and the load effect runs **once**, so saving only begins on the render *after* hydration — transcript now survives refresh.
  - **Dashboard: confirm button never appeared.** The model *narrated* "he preparado el registro" without ever calling the `propose_*` tool, and invented a redundant "¿confirmas?" step. Fix (prompt): MUST call the tool in the same message as soon as fields are gathered; the tool's Confirm button IS the confirmation, so no separate "are you sure?"; never claim it prepared/saved anything without an actual tool call.
  - **Confirm button flashed then vanished.** The card was anchored to the streaming message's id, which useChat swaps on finalize → anchor pointed at a missing message → card rendered nowhere. Fix: if an anchor's message id is gone, render the card at the bottom (never vanishes) AND re-anchor stale anchors to the latest message (self-heals to sit under the final reply, then stays put).

### NOT DONE / DEFERRED
- **RAG into the assistant chat** — intentionally not wired (KB empty until Phase 4 ingestion); add later so we don't pay per-message embeds for nothing.
- **Email/Resend (Group E)** + **Part 3 (printable history + AI vet summary)** — unchanged, still after Group D.

### FILES MODIFIED
- New: `src/lib/medications.ts`, `src/lib/active-symptoms.ts`, `src/lib/ai/assistant.ts`, `src/app/api/assistant/route.ts`, `src/app/api/pets/[id]/symptoms/reconcile/route.ts`, `src/components/assistant/assistant-chat.tsx`, `src/components/assistant/dashboard-chat-widget.tsx`, migrations `20260622000000_active_symptoms_improving.sql` + `20260622000100_medication_dosage_unit.sql`.
- Changed: `medications-section.tsx`, `appointments-section.tsx`, `active-symptoms-section.tsx`, `symptom-sidebar.tsx`, `chat-interface.tsx`, `results/clinical-reasoning.tsx`, `assessment/[id]/page.tsx`, `assessment/[id]/results/page.tsx`, `api/assessment/chat/route.ts`, `lib/ai/schemas.ts`, `lib/ai/format.ts`, `lib/validations/active-symptom.ts`, `lib/validations/medication.ts`, `types/database.ts`, `api/pets/[id]/symptoms/[symptomId]/route.ts`, `dashboard/page.tsx`, `pets/[id]/[name]/page.tsx`. (Plus follow-up fixes to `assistant-chat.tsx` + `api/assistant/route.ts`.)

### NEXT SESSION MUST START WITH
1. **TESTING PROTOCOL — no new features until this passes.** Walk the whole of Phase 7.5 end-to-end: (a) new assessment + follow-up incl. active-symptom **seeding** in the sidebar, AI asking how each changed, and reconciliation (resolve→Resolved section, improve/worsen tags, dedup of differently-phrased symptoms); (b) meds with **dose amount + unit**; (c) vet clinics + doctors; (d) appointments add / **cancel** / outcome-when-past; (e) BOTH assistant chats (per-pet + dashboard) for **every** confirm-write action (add medication/appointment/vet/doctor, update symptoms, cancel appointment, start assessment), relative-date understanding, **chat memory across refresh**, and **card persistence** (no flash-and-vanish).
2. Only after the test pass: RAG into assistant (after KB ingestion), Email/Resend (Group E), Part 3.

### DECISIONS / NOTES
- Confirm-before-write = AI proposes → owner confirms → existing validated/RLS REST route writes. The AI never writes directly; even tampered client calls hit the same guarded endpoints.
- `active` med flag and active-symptom resolution are both derived from data (dates / explicit reports), not trusted stale flags.
- Type regen still via Supabase MCP under Norton TLS; the `improving` CHECK change doesn't alter the generated TS type (status is `string`), so no regen needed.
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
- Verification — User manually verified RLS in Supabase Table Editor for all public tables. App-readable tables have active policies; `knowledge_processing_audit` has RLS enabled with no policies by design, creating deny-all behavior through PostgREST.
- Verification — `npm run lint` passes.
- Verification — `npm run build` passes.
- Decision — Supabase internal email is accepted temporarily for development so Phase 2 is not blocked.
- Decision — Resend/custom SMTP is deferred until production readiness.

### IN PROGRESS (not finished)
- Phase 1 deferred production hardening: configure/test Resend custom SMTP before production/UAT.
- Phase 1 deferred verification: signup trigger creates a row in `profiles` during Phase 2 auth testing.

### BLOCKED
- None blocking development.

### FILES MODIFIED
- `supabase/config.toml` — Supabase CLI local project configuration.
- `supabase/.gitignore` — Supabase local ignore rules for `.temp` and local env files.
- `supabase/migrations/*.sql` — Phase 1 schema, indexes, functions, seeds, and RLS policies.
- `src/types/database.ts` — Generated Supabase database types.
- `scripts/verify-phase1.mjs` — Remote schema smoke-check helper.
- `docs/DEV_LOG.md` — Updated Phase 1 progress.

### NEXT SESSION MUST START WITH
1. Start Phase 2, Task 2.1: install/create Supabase server, browser, and middleware helpers.
2. Build the auth routes/pages from `dev_plan.md`.
3. Verify signup creates a row in `profiles`.

### DECISIONS / NOTES
- Supabase CLI commands in this environment require `NODE_TLS_REJECT_UNAUTHORIZED=0` because of local TLS/certificate verification failures.
- The `supabase db push` warning about Docker/pg-delta cache did not block remote migration application.
- `supabase/migrations/.gitkeep` was removed because real migration files now exist and the CLI warned about the placeholder filename.
- RLS verified in all tables. The globe icon in Supabase's table list denotes the `public` schema. The `knowledge_processing_audit` dashboard warning is expected because it intentionally has no policies; this keeps internal RAG audit data inaccessible to normal `anon`/`authenticated` clients.
- Resend/custom SMTP remains the production target from the plan, but Supabase internal email is acceptable for development and Phase 2 implementation.
---

---
## SESSION 3 — 2026-06-19 — Claude / Opus 4.8 (Software Engineering review + hardening)

### STARTED WITH
- Last session left off at: Phase 1 complete for development; Phase 2 not started.
- Blockers from last session: none.
- Task this session: exhaustive engineering review of Phase 0 and Phase 1 before proceeding, then fix the problems found.

### REVIEW FINDINGS (Phase 0 + Phase 1)
- **Phase 1 (database): solid and faithful to the plan.** All 12 migrations match the spec; verified applied on remote (types generated with `--linked`; remote smoke check: `breeds=53`, `emergency_contacts=8`, both RPCs respond). The FTS index expression is byte-identical to `search_assessments` (index will be used); HNSW uses `vector_cosine_ops` matching the `<=>` operator; `search_assessments` is `SECURITY INVOKER` + `auth.uid()` + parameterized (injection-safe); RLS enabled on all 8 tables. The `::text` casts added to `search_veterinary_knowledge` were a correct, necessary fix (VARCHAR columns vs. `text` return signature).
- **Phase 0 (CRITICAL ISSUE FOUND): the shadcn UI kit was Tailwind v4 + Base UI, but the build ran Tailwind v3.** `shadcn@latest init` produced the "base-nova" style: every `src/components/ui/*` component imports `@base-ui/react` and uses v4-only class syntax (`gap-(--card-spacing)`, `--spacing(4)`, `max-h-(--available-height)`, `ring-3`, `data-open:`, `outline-hidden`, `@container`). Tailwind v3 silently ignores unknown utilities, so `npm run build` passed while most component styling produced **no CSS at all** — a false green. This would have surfaced as broken-looking forms/dialogs/selects in Phases 2/3/5.
- Other gaps: `form` shadcn component missing (needed Phases 2/3); `react-hook-form`/`@hookform/resolvers` not installed; `updated_at` never auto-updated (no trigger); signup trigger could fail a registration on duplicate; `dev_plan.md` header stale.

### COMPLETED THIS SESSION
- **Migrated the build pipeline to Tailwind v4** to match the already-generated v4/Base UI component kit (the coherent fix vs. rewriting 12 components for v3):
  - Installed `tailwindcss@4.3.1` + `@tailwindcss/postcss@4.3.1`; removed the `shadcn` runtime dependency (CLI only, used via `npx`).
  - Rewrote `postcss.config.mjs` to use `@tailwindcss/postcss`.
  - Rewrote `src/app/globals.css` to clean v4 structure: `@import "tailwindcss"` + `@import "tw-animate-css"`, `@custom-variant dark`, and an `@theme inline` block mapping all color/radius/font tokens to the existing oklch `:root`/`.dark` variables. Removed the `@import "shadcn/tailwind.css"` runtime-coupling hack.
  - Deleted the v3 `tailwind.config.ts` (v4 is CSS-first) and set `components.json` `tailwind.config` to `""`.
  - **Verified the fix:** inspected the compiled CSS in `.next/static/css` and confirmed component utilities now emit real rules (`bg-primary`, `text-muted-foreground`, `bg-popover`, `ring-foreground`, `border-input`, `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`, `outline-hidden`).
- **Added form infrastructure** for Phases 2/3: installed `react-hook-form@7.79.0` + `@hookform/resolvers@5.4.0`; created `src/components/ui/form.tsx` (self-contained, wraps RHF, uses the local `Label`, no extra primitive dependency).
- **Database hardening (2 new migrations, applied to remote):**
  - `20260619001300_updated_at_triggers.sql` — `set_updated_at()` BEFORE UPDATE trigger on `profiles` and `pets` (assessments has no `updated_at` column).
  - `20260619001400_harden_new_user.sql` — `handle_new_user()` now uses `ON CONFLICT (id) DO NOTHING` so a duplicate profile cannot roll back a signup.
  - `npx supabase migration list` confirms all 14 migrations applied local + remote.
- **Docs:** updated `dev_plan.md` header (status + Tailwind v4 stack note) and this DEV_LOG.
- **Verification:** `npm run lint` → 0 errors; `npm run build` → success, 0 TS errors.

### IN PROGRESS (not finished)
- None.

### BLOCKED
- None.

### FILES MODIFIED
- `package.json` / `package-lock.json` — +tailwindcss@4, +@tailwindcss/postcss, +react-hook-form, +@hookform/resolvers; -shadcn.
- `postcss.config.mjs` — switched to `@tailwindcss/postcss`.
- `src/app/globals.css` — rewritten for Tailwind v4 (@theme inline + tokens).
- `components.json` — `tailwind.config` set to `""` (v4).
- `tailwind.config.ts` — deleted (v4 is CSS-first).
- `src/components/ui/form.tsx` — new form component.
- `supabase/migrations/20260619001300_updated_at_triggers.sql` — new.
- `supabase/migrations/20260619001400_harden_new_user.sql` — new.
- `docs/dev_plan.md` — header/status + stack note.
- `docs/DEV_LOG.md` — this entry.

### NEXT SESSION MUST START WITH
1. Begin Phase 2, Task 2.1: create `src/lib/supabase/{client,server,middleware}.ts`.
2. Build the real `src/middleware.ts` (currently a no-op placeholder) per the canonical `@supabase/ssr` pattern.
3. **First end-to-end check in Phase 2:** confirm a real signup creates a `profiles` row via the (now hardened) `handle_new_user` trigger — this is the one Phase 1 "Done When" item that can only be verified with a live signup.

### DECISIONS / NOTES
- **Stack decision:** committed to **Tailwind v4 + shadcn base-nova (Base UI)**. Rationale: the components were already authored for v4/Base UI and `shadcn@latest` keeps generating them that way, so aligning the build to v4 is lower-risk and forward-compatible than rewriting every component to v3/Radix. Do NOT add `tailwindcss-animate` or a v3 `tailwind.config.ts` back; this project is CSS-first v4.
- `lucide-react@1.21.0` and `@base-ui/react@1.6.0` resolved and build is green; left as-is. Worth a sanity check against the public registry if any icon/component import ever fails.
- Supabase CLI still needs `NODE_TLS_REJECT_UNAUTHORIZED=0` in this environment; the Docker/pg-delta catalog warning on `db push` is non-blocking (local edge-runtime image only).
- Still deferred from Phase 1 (unchanged, pre-production): Resend custom SMTP (task 1.5).
---

---
## SESSION 4 — 2026-06-19 — Claude / Opus 4.8 (Phase 2: Authentication)

### STARTED WITH
- Last session left off at: Phase 0+1 reviewed/hardened; Phase 2 not started.
- Blockers from last session: none.

### COMPLETED THIS SESSION (all of Phase 2)
- [Task 2.1] — Supabase client utilities: `src/lib/supabase/client.ts` (browser) and `server.ts` (cookie-scoped, RLS-enforced, no service-role).
- [Task 2.2] — Session-refresh middleware: `src/lib/supabase/middleware.ts` (calls `getUser()` to refresh tokens + route guards) and real `src/middleware.ts` (replaced the no-op placeholder).
- [Task 2.3] — Auth callback: `src/app/(auth)/auth/callback/route.ts` (`exchangeCodeForSession` → /dashboard, or /login?error on failure).
- [Task 2.4] — Register page + `components/auth/register-form.tsx` (RHF + zod; name 2–100, email, password 8+ with upper/lower/number/special, optional AU state via Base UI Select). Handles Supabase's anti-enumeration duplicate case (empty `identities` array → "Email already registered").
- [Task 2.5] — Login page + `components/auth/login-form.tsx` (signInWithPassword → /dashboard; "Invalid email or password").
- [Task 2.6] — Protected layout `src/app/(app)/layout.tsx` (getUser guard) + `components/shared/navbar.tsx` (email + logout).
- [Task 2.7] — Placeholder `src/app/(app)/dashboard/page.tsx` ("Welcome, [name]" reading `profiles`).
- Added `src/lib/constants.ts` (AU_STATES, reused in Phase 6 for emergency contacts).
- Removed redundant `.gitkeep` files from directories that now hold real files.

### VERIFICATION — all Phase 2 "Done When" items PASS
- `npm run lint` → 0 errors; `npm run build` → 0 TS errors.
- Runtime (curl): `/login` 200, `/register` 200, `/dashboard` with no session → 307 to `/login`.
- **Live test by user (Andres):** register → magic-link email → /dashboard "Welcome, Andres felipe Henao"; **`profiles` row auto-created with name + state (confirms the `handle_new_user` trigger — the last deferred Phase 1 item)**; logout → /login; sign in → /dashboard; **re-register same email → "Email already registered"**; visiting `/login` while logged in → auto-redirect to /dashboard.

### PRODUCTION VERIFICATION (Vercel)
- Latest deployment = Phase 2 commit `9142517`, state READY, target production. Build passed.
- `https://pitsypet.vercel.app/login` renders 200 with correct Tailwind v4 styling; `/dashboard` unauthenticated redirects to `/login` (proves Supabase env vars set in Production + middleware runs in prod).
- Added `https://pitsypet.vercel.app/**` to Supabase Auth → URL Configuration → Redirect URLs (was empty; Site URL still localhost). Without this the prod magic link would fall back to localhost.
- **Live prod test by user:** registered a new account on production → magic-link email → landed on the production /dashboard → new user + profiles row visible in Supabase. Phase 2 auth confirmed end to end in production.

### DEFERRED (not blocking Phase 3)
- Production session test (expired-token auto-refresh) — per plan, verified at Phase 11 deployment.
- Resend custom SMTP (Phase 1 task 1.5) — still using Supabase built-in email for dev.
- **Vercel Deployment Protection: DISABLED this session.** The production site is now publicly accessible (verified: `https://pitsypet.vercel.app/login` returns the app's "Welcome back" page to anonymous visitors, not the Vercel auth gate).

### FILES MODIFIED
- New: `src/lib/supabase/{client,server,middleware}.ts`, `src/app/(auth)/auth/callback/route.ts`, `src/components/auth/{register-form,login-form}.tsx`, `src/app/(auth)/{register,login}/page.tsx`, `src/components/shared/navbar.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/lib/constants.ts`.
- Changed: `src/middleware.ts` (real session middleware).

### NEXT SESSION MUST START WITH
1. Phase 3, Task 3.1: pets API routes (`src/app/api/pets/route.ts`, `[id]/route.ts`, `breeds/route.ts`) using the cookie-scoped server client.
2. Then pet-form + breed-autocomplete components, dashboard pet list, create/edit pages.

### DECISIONS / NOTES
- A stale `next dev` from an earlier session was left running on port 3000 and corrupted `.next` (mixed dev/prod chunks → "Cannot find module './948.js'"). Fix: kill the port-3000 process, `rm -rf .next`, rebuild. Don't leave a dev server running across sessions.
- Supabase Select for the State field uses the Base UI API (`value`/`onValueChange`/`SelectValue placeholder`), not Radix.
---

---
## SESSION 5 — 2026-06-20 — Claude / Opus 4.8 (Phase 3: Pet Profile Management + token-budget protocol)

### STARTED WITH
- Last session left off at: Phase 2 complete/verified; Phase 3 not started.
- Blockers from last session: none.

### COMPLETED THIS SESSION
- **Session-startup token budget (workflow change):** rewrote `CLAUDE.md` with a "Session bootstrap" protocol — read only the latest DEV_LOG entry + the *current phase's* section of `dev_plan.md` (Grep + ranged Read), NOT the whole plan (~47K tokens via the real tokenizer; `chars/4` underestimates badly because of SQL/code/tables). Added a 12-phase **Project roadmap** table with live status + cross-phase "keep in mind" notes, and a requirement to reply with a 2–3 line bootstrap summary each session. Arranque ~57K → ~7–9K tokens. No content lost: cross-cutting invariants already live in CLAUDE.md (auto-loaded).
- **Placeholder landing page** (`src/app/page.tsx`): replaced the Next.js boilerplate with a minimal PitsyPet home (name + tagline + Register/Login buttons + footer disclaimer). Marked in-code as a placeholder; Phase 8 task 8.1 polishes it.
- **Phase 3 — all tasks:**
  - [3.1] Pets API (cookie-scoped client, RLS): `api/pets/route.ts` (GET list non-deleted, POST create → **409 on `UNIQUE(user_id, pet_name)` / pg code 23505**), `api/pets/[id]/route.ts` (PATCH update, DELETE = **soft delete** `deleted_at = now()`), `api/pets/breeds/route.ts` (autocomplete via trigram index, authenticated-read).
  - [3.2] `components/pets/pet-form.tsx` — RHF + Zod (`mode: onChange`, submit disabled until valid), Dog/Cat toggle, numeric inputs, medical-conditions tag input (max 10). Serves both create and edit.
  - [3.3] `components/pets/breed-autocomplete.tsx` — 200ms debounce, keyboard nav (↑↓/Enter/Esc), custom-breed option, clears on species change.
  - [3.4] `components/pets/pet-card.tsx` — species icon, age/weight, condition badges, Start Assessment / Edit / Delete (confirm Dialog).
  - [3.5] Dashboard rewritten: pet grid + empty state.
  - [3.6/3.7] `pets/new` and `pets/[id]/edit` pages (edit pre-fetches with ownership via RLS, `notFound()` otherwise).
  - Shared `src/lib/validations/pet.ts` — single source of truth for weight bounds (Dog 0.5–120, Cat 0.3–15), age limits, max conditions; exports both a string-based form schema and a coerced API schema + a `formValuesToApiInput` mapper.
  - Mounted the sonner `<Toaster />` in `(app)/layout.tsx` (was never mounted).

### VERIFICATION — Phase 3 "Done When" PASS (live-tested by user)
- `npm run lint` → 0; `npx tsc --noEmit` → 0; `npm run build` → success (all new routes compiled).
- Live: empty state → add pet → card appears + row in Supabase; second pet (cat) added (2 pets under one user_id); **cat weight 100kg rejected** by species validation; **duplicate name → 409**; delete → disappears from dashboard, row remains in Supabase with `deleted_at` set (soft delete confirmed).

### DEFERRED (not blocking Phase 4)
- **[Phase 3 Done-When] "first pet → /assessment/[petId]" redirect** deferred to Phase 5: that route doesn't exist yet, so create currently redirects to /dashboard. `TODO(Phase 5)` left in `pet-form.tsx`.
- **Soft-delete vs UNIQUE constraint edge case:** a soft-deleted pet name still trips the 409 on re-create (the row persists). Would need a partial unique index excluding `deleted_at IS NOT NULL`. Logged for later; not in Phase 3 scope.
- Resend custom SMTP (Phase 1 task 1.5); expired-token session refresh test (Phase 2 → Phase 11). Unchanged.

### FILES MODIFIED
- New: `src/lib/validations/pet.ts`, `src/app/api/pets/{route.ts,[id]/route.ts,breeds/route.ts}`, `src/components/pets/{pet-form,breed-autocomplete,pet-card}.tsx`, `src/app/(app)/pets/new/page.tsx`, `src/app/(app)/pets/[id]/edit/page.tsx`.
- Changed: `src/app/page.tsx` (placeholder landing), `src/app/(app)/dashboard/page.tsx` (pet list), `src/app/(app)/layout.tsx` (+Toaster), `CLAUDE.md` (bootstrap protocol + roadmap + status), `docs/dev_plan.md` (header status).

### NEXT SESSION MUST START WITH
1. Phase 4, Task 4.1: `src/lib/ai/embed.ts` (shared OpenAI `text-embedding-3-small` helper — used by both ingestion and the Phase 5 runtime).
2. Then `scripts/chunk.ts` (token chunker), collect openly-licensed sources into `scripts/sources/` (gitignored), write + run `scripts/ingest.ts`.
3. Remember: ingestion is the ONLY place `SUPABASE_SERVICE_ROLE_KEY` is used; never import it into `src/`.

### DECISIONS / NOTES
- Soft delete is intentional (assessments FK `pet_id ON DELETE CASCADE` — a hard delete would cascade-wipe history). Dashboard and all queries filter `deleted_at IS NULL`.
- Pet field shape (species/breed/age_years/age_months/weight_kg/medical_conditions) is consumed verbatim by Phase 5 `formatPet` + RAG query — kept stable.
- Numeric form fields are kept as strings in the RHF schema (matches the existing register-form style) and coerced at the API boundary via `petApiSchema`, avoiding RHF/Zod number-generic friction.
---

---
## SESSION 6 — 2026-06-20 — Claude / Opus 4.8 (Phase 4: RAG ingestion pipeline)

### STARTED WITH
- Last session left off at: Phase 3 complete/verified.
- Blockers from last session: none. User does NOT yet have veterinary source documents.

### COMPLETED THIS SESSION (Phase 4 pipeline — code only; ingestion run deferred)
- [Task 4.1] `src/lib/ai/embed.ts` — shared OpenAI `text-embedding-3-small` helper (`embedText`, `embedBatch`, `buildRagQuery`), per the plan verbatim. Imported by ingestion now and the Phase 5 runtime later (one code path, no skew).
- [Task 4.2] `scripts/chunk.ts` — `cleanText` (de-noises PDF extraction) + `chunkText` (~400-token windows, ~50 overlap) via `js-tiktoken` `cl100k_base`.
- [Task 4.4] `scripts/ingest.ts` — reads `scripts/sources/` (PDF/txt/md), extracts text (PDF via `pdf-parse/lib/pdf-parse.js`), chunks, assigns metadata heuristically (species default 'Both'; urgency 3/6/9 by keyword; body_system keyword map; breed_specific flag), embeds in batches of 96, inserts into `veterinary_knowledge` in batches of 100 (embedding stored as pgvector string literal `[...]`), writes one `knowledge_processing_audit` row per file, logs progress. Manual `.env.local` loader into `process.env` (no dotenv dep). Service-role client typed with `Database`.
- Added `pdf-parse` (devDependency) + `scripts/pdf-parse.d.ts` ambient types for the `/lib` subpath (avoids the package's debug-on-import wrapper). Added `npm run ingest`.
- Created `scripts/sources/` (gitignored) with a local-only README telling the user where to drop docs.

### VERIFICATION
- `npx tsc --noEmit` → 0 errors (scripts ARE type-checked: tsconfig `include: **/*.ts`); `npm run lint` → 0; `npm run build` → success.
- NOT yet verified: an actual ingestion run (needs source PDFs + an OpenAI call + writes to remote Supabase). The Phase 4 "Done When" data checks (>500 rows, ≥3 sources, body_system spread, audit rows) remain OPEN until the user supplies documents and we run `npm run ingest`.

### BLOCKED
- [Task 4.3 / 4.5] Collecting openly-licensed veterinary sources and running ingestion — BLOCKED on the user. Drop PDFs/.txt into `scripts/sources/`, then run `npm run ingest`.

### FILES MODIFIED
- New: `src/lib/ai/embed.ts`, `scripts/chunk.ts`, `scripts/ingest.ts`, `scripts/pdf-parse.d.ts`.
- Changed: `package.json`/`package-lock.json` (+pdf-parse, +ingest script), `docs/DEV_LOG.md`, `docs/dev_plan.md` (header), `CLAUDE.md` (roadmap status).
- Local-only (gitignored): `scripts/sources/` + README.

### NEXT SESSION MUST START WITH
1. If docs are ready: drop them in `scripts/sources/`, run ingestion, verify the Phase 4 "Done When" data checks, then mark Phase 4 ✅.
2. Otherwise, Phase 4 can stay open and Phase 5 (AI triage engine) can begin — RAG degrades gracefully on 0 chunks (classification proceeds without context).

### DECISIONS / NOTES
- Metadata labels (species/urgency/body_system) are re-rank signals ONLY, never retrieval gates — heuristics are deliberately conservative (species defaults to 'Both' so a chunk is never hidden by a mislabel).
- `pdf-parse` pulls in old transitive deps with audit warnings; it's a dev-only ingestion tool (never bundled/deployed), so acceptable. PDF text extraction can be messy for multi-column layouts — `cleanText` mitigates, but curated `.txt` gives the cleanest chunks.
- **TLS issue SOLVED this session (properly, no longer disabling verification).** Diagnosed the root cause: **Norton** Web/Mail Shield intercepts HTTPS and re-signs with `Norton Web/Mail Shield Root`, which Node didn't trust (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Fix: set user-level `NODE_OPTIONS=--use-system-ca` (Node v22 → trusts the Windows cert store, where Norton's root already lives). Verified `scripts/verify-phase1.mjs` (real supabase-js → remote) passes with NO `NODE_TLS_REJECT_UNAUTHORIZED=0`. New terminals inherit it automatically. The old insecure flag should no longer be used anywhere. (Supabase CLI is a separate Go binary that uses the Windows store natively; re-check only if a future `db push` complains.)
---

---
## SESSION 7 — 2026-06-20 — Claude / Opus 4.8 (Phase 5: AI Triage Engine — the core)

### STARTED WITH
- Last session left off at: Phase 4 pipeline built (ingestion pending docs).
- Decision: build Phase 5 in parallel (RAG degrades gracefully with 0 chunks).

### COMPLETED THIS SESSION (all of Phase 5)
- **Engine core (committed first as part 1):** `schemas.ts` (5.1), `safety.ts` (5.2, escalate-only override), `rag.ts` (5.3, embed→vector search→quality filter→urgency re-rank→source-diverse top 5, returns [] on failure), `classifier.ts` (5.4, Sonnet generateObject → parse-retry → rule fallback → safety override last), `fallback.ts` (5.5, severity scoring, rounds up, conf 0.65), `format.ts` (5.7), `rate-limit.ts` + `cost-guard.ts` (5.6).
- **Validation (5.14):** `scripts/spike-triage.ts` (`npm run spike`) — 10 scenarios, all 5 emergencies → High; uncertain cases round up. Ran live against Sonnet: PASS.
- **Streaming + routes + UI (part 2):**
  - [5.8] `api/assessment/chat/route.ts` — `createDataStreamResponse` + `streamText` Haiku, one `record_symptoms` tool, `maxSteps:1`; symptoms streamed to client via `writeData`; `onFinish` runs RAG + Sonnet classify + safety override and persists everything in one write (survives client disconnect). Cost-guard (503) + per-user rate-limit (429) + pet re-fetch via RLS.
  - [5.9] `api/assessment/route.ts` (POST create), `[id]/route.ts` (GET), `[id]/save/route.ts` (POST set user_saved).
  - [5.10] `(app)/assessment/[petId]/page.tsx` — creates a fresh assessment row, renders chat.
  - [5.11–5.13] `chat-interface.tsx` (useChat, bubbles, quick-replies, inline result), `symptom-sidebar.tsx`, `progress-indicator.tsx`.

### VERIFICATION
- `tsc` 0, `lint` 0, `build` success. Spike: all emergencies High.
- **LIVE TEST (user):** new pet → Start Assessment → AI greets by name → multi-turn extraction with one follow-up/turn + quick-reply buttons (user liked these) → full GDV scenario (vomiting/weakness/swollen belly + retching) → **High Risk** with detailed clinical reasoning → row saved in Supabase. Core product works end to end.

### NOT YET VERIFIED (optional Done-When robustness checks — deferred, not blocking)
- Disconnect test (close tab mid-analysis → row still classified via onFinish).
- Fallback test (fake ANTHROPIC_API_KEY → completes via rule-based fallback).

### DEFERRED TO LATER PHASES (by design)
- **Phase 6:** inline result panel in chat is a placeholder — replace with `/assessment/[id]/results` page + "Save to History" button (`TODO(Phase 6)` in `chat-interface.tsx`). Symptom sidebar is a persistent panel, not a Sheet (minor, intentional).
- **Phase 7:** no way to browse a past assessment from the dashboard yet (history list + search). User noticed this — it's the next-next phase.

### FILES MODIFIED
- New: `src/app/api/assessment/{route.ts,chat/route.ts,[id]/route.ts,[id]/save/route.ts}`, `src/app/(app)/assessment/[petId]/page.tsx`, `src/components/assessment/{chat-interface,symptom-sidebar,progress-indicator}.tsx`. (Engine libs landed in the part-1 commit.)
- Changed: `CLAUDE.md` (roadmap), `docs/dev_plan.md` (header), `docs/DEV_LOG.md`.

### NEXT SESSION MUST START WITH
1. Phase 6, Task 6.1: `(app)/assessment/[id]/results/page.tsx` + risk-badge / clinical-reasoning / recommendations / disclaimer components; switch the chat to redirect there on completion.
2. Seed `first_aid_recommendations` (migration 6.7), regenerate types.

### DECISIONS / NOTES
- `maxSteps:1` + one tool: Haiku reliably emits BOTH the follow-up question (streamed text) AND the `record_symptoms` tool call per turn — verified live, follow-ups appear as expected.
- RAG ran empty (KB not ingested); classification still produced strong results from model knowledge — confirms the graceful-degradation design. Quality should improve once Phase 4 ingestion runs.
- Result is shown inline for now so Phase 5 is testable without the Phase 6 results page (mirrors the Phase 3 first-pet-redirect deferral).
---

---
## SESSION 8 — 2026-06-20 — Claude / Opus 4.8 (soft-delete fix + lightweight audit)

### STARTED WITH
- Phase 5 complete/live-tested. Low on session tokens — scoped to one concrete fix + an audit recorded for continuity.

### COMPLETED THIS SESSION
- **FIXED the soft-delete vs unique-name bug** (user-reported): deleting a pet then re-creating one with the same name failed with the 409 because the soft-deleted row kept the name. Migration `20260620000000_pets_unique_active_name.sql` drops the table `UNIQUE(user_id, pet_name)` constraint and replaces it with a **partial unique index** `idx_pets_user_name_active ON pets(user_id, pet_name) WHERE deleted_at IS NULL`. **Applied to remote via `supabase db push` (succeeded; ran with no insecure TLS flag — confirms the CLI is also covered by the Norton/system-CA fix).** No API change needed (partial-index violation still raises 23505 → existing 409 path). No type regen needed (no column change). NOT yet live-verified by the user (delete+recreate same name) — verify next session.

### AUDIT (lightweight, from build knowledge — NOT a full re-read; verify these next session)
Strengths confirmed: Phases 0–3 + 5 live-tested; RLS on all tables; service-role key only in `scripts/` (never imported into `src/` — keep enforcing in Phase 9); safety net validated (spike + live GDV → High); TLS fixed securely.

Open risks / things to check (priority order):
1. **Assessment row created on EVERY visit** to `(app)/assessment/[petId]/page.tsx` (it inserts on render). Refreshing/abandoning creates orphan empty `assessments` rows. Fix later: create lazily on first user message, OR reuse the latest incomplete row, OR a cleanup job. (Phase 6/7 candidate.) MEDIUM.
2. **Phase 5 Done-When not yet run:** disconnect test (onFinish persistence) + fallback test (fake ANTHROPIC key → rule-based). Should run before calling Phase 5 fully closed. MEDIUM.
3. **`maxSteps:1` streaming** depends on Haiku emitting follow-up text + `record_symptoms` tool together — verified live but fragile to prompt edits; the spike set is the regression guard. LOW.
4. **RAG runs empty** until Phase 4 ingestion — classification quality will improve once `npm run ingest` runs with real PDFs. (Pending user docs.) INFO.
5. **Weight upper bound is generous** (dogs ≤120kg) — accepted an 85kg Golden in testing; intentional but could tighten if desired. LOW.
6. **Phase 9 formal security checks** (SQL-injection via search, cross-tenant RLS GET, `grep -r SERVICE_ROLE_KEY src/` = empty) not yet run — scheduled for Phase 9; no red flags seen so far. INFO.

### NEXT SESSION MUST START WITH
1. Verify the soft-delete fix live (delete a pet → recreate same name → should succeed).
2. Then Phase 6 (Results page + Save to History) — see Session 7 "next session" notes.
3. Consider addressing audit risk #1 (orphan assessment rows) opportunistically during Phase 6.

### FILES MODIFIED
- New: `supabase/migrations/20260620000000_pets_unique_active_name.sql` (applied to remote).
- Changed: `docs/DEV_LOG.md` (this entry).
---

---
## SESSION 9 — 2026-06-20 — Claude / Opus 4.8 (pre-Phase-6 adjustments from user testing)

### STARTED WITH
- Phase 5 complete + live-tested. User ran manual tests of built features and reported 4 observations; we triaged each (by-design vs bug vs which-phase) before starting Phase 6.

### TRIAGE OF USER OBSERVATIONS
1. **Pet still in DB after delete** — BY DESIGN (soft-delete; Phase 3 Done-When `dev_plan.md:832`). BUT recreate-same-name made a brand-new pet_id, orphaning old assessments (the "history is kept" promise was hollow). User chose **Option B: explicit Restore**.
2. **Quick-reply chips didn't match the question** — real bug: chips were client-side regex guesses (`quickReplies()`), only covered 4 cases. Phase 5 polish.
3. **Assessment launched after ~3 Qs, no confirmation** — enhancement: add a pre-launch "anything else?" gate, EXCEPT for emergencies. Phase 5 enhancement.
4. **Reload mid-chat loses conversation** — clarified design: create-row-on-visit IS in plan (`dev_plan.md:1243`); mid-chat recovery ("recoverable OR cleanly incomplete") is a **Phase 9** Done-When (`dev_plan.md:1431`). Orphan empty rows = unaddressed side effect, deferred to Phase 9. NOT Phase 6.

### COMPLETED THIS SESSION (all live-tested by user)
- **Pet Restore (Option B).** `POST /api/pets/[id]/restore` revives the soft-deleted row (same pet_id → assessment history reconnects). Name-collision with an active pet → friendly 409 ("You already have an active pet with this name…"). Dashboard gained a "Recently deleted" section with Restore cards. User verified: restore works incl. history; collision message shows correctly.
- **AI-emitted quick replies (#2).** Added `suggestedReplies: string[].max(4)` to `RecordSymptomsSchema`; the model now emits 2–4 tappable answers matching its own question, streamed via the `symptoms` data part. Removed the regex `quickReplies()`. User verified chips now match the question.
- **Pre-launch confirmation (#3).** Prompt rule 3 now asks "is there anything else…, or should I assess now?" before completing; rule 4 (emergencies) explicitly OVERRIDES it → critical symptom still completes immediately. Prompt also now instructs calling record_symptoms every turn. (Safety invariant preserved.)

### IN PROGRESS / DEFERRED
- **Phase 9:** orphan empty assessment rows (create-on-visit) + mid-chat reload recovery. Documented, not yet built.
- **Phase 5 Done-When still unrun:** disconnect/onFinish-persistence test + fallback (fake ANTHROPIC key) test. Carry forward.

### FILES MODIFIED
- New: `src/app/api/pets/[id]/restore/route.ts`, `src/components/pets/deleted-pet-card.tsx`.
- Changed: `src/app/(app)/dashboard/page.tsx` (Recently deleted section), `src/lib/ai/schemas.ts` (suggestedReplies), `src/app/api/assessment/chat/route.ts` (prompt + stream suggestedReplies), `src/components/assessment/chat-interface.tsx` (read suggestions from stream, drop regex).
- `npx tsc --noEmit` clean; `next lint` clean.

### NEXT SESSION MUST START WITH
1. Phase 6 — `/assessment/[id]/results` page (Server Component, verify ownership, redirect to chat if `risk_classification` null) + risk badge + clinical reasoning + recommendations (Low first-aid by symptom+age / Medium 24h / High emergency contacts by `profiles.state`) + disclaimer.
2. Redirect chat → results on completion (replace the inline panel TODO in `chat-interface.tsx:166`).
3. Seed `first_aid_recommendations` as a CLI migration (task 6.7), then `db push` + regenerate types.

### DECISIONS / NOTES
- Soft-delete stays; "delete" is now reversible via Restore (Option B), not permanent.
- Confirmation gate is prompt-only and must never apply to emergencies — if a future prompt edit weakens rule 4, the Phase 5 spike set is the regression guard.
---

---
## SESSION 10 — 2026-06-20 — Claude / Opus 4.8 (Phase 6: Results Page & Recommendations + user-directed design changes)

### STARTED WITH
- Phase 5 + pre-Phase-6 adjustments done. Built Phase 6, then iterated on three user requests from live testing.

### COMPLETED THIS SESSION (all live-tested by user)
- **Phase 6 results page.** `src/app/(app)/assessment/[id]/results/page.tsx` (Server Component): RLS-scoped fetch, redirect to chat if `risk_classification` null, 404 if missing. Components in `src/components/assessment/results/`: `risk-badge` (colour+text+icon, never colour alone), `clinical-reasoning` (primaryConcern + clinicalReasoning + "About These Symptoms", all levels), `recommendations` (Low → first-aid by symptom+age band w/ age-specific override of 'Any'; Medium → 24h guidance; High → emergency contacts by `profiles.state` + 'ALL', `tel:` links, Google Maps fallback; red flags shown for M/H), `disclaimer` (amber, all levels).
- **Seed.** `supabase/migrations/20260620000100_seed_first_aid.sql` applied to remote (generic 'Any' rows + puppy/senior variants so a puppy shows different first-aid than a senior). Data-only, no type regen.
- **Redirect-on-complete.** chat-interface now `router.push`es to `/results` once `classification && !isLoading` (onFinish has persisted by then → results read from DB). Removed the inline classification panel + its `TODO(Phase 6)`. Fixes the "reload mid-result loses it" report — the results page is reload-safe.
- **Route slug conflict fix.** Next.js forbids two slug names at one path level (`[petId]` vs `[id]`). Renamed chat route `(app)/assessment/[petId]/` → `[id]/` (value still a pet id; `params.petId`→`params.id`). Now `[id]/page.tsx` (chat) and `[id]/results/page.tsx` (results) coexist. Links unchanged (values are the same).
- **USER DESIGN CHANGE — auto-save.** Assessments already persist in onFinish, so the explicit save was redundant. Removed `SaveButton`, `/api/assessment/[id]/save/route.ts`, and stopped using `user_saved` as a gate. Results page shows "Saved to your history automatically."
- **USER DESIGN CHANGE — delete moved to Phase 7.** Removed the Delete button from the just-completed results view. Kept `delete-button.tsx` + added `DELETE /api/assessment/[id]` (soft delete) for Phase 7 to surface when opening a past assessment card.
- **USER DESIGN CHANGE — permanent pet delete.** "Recently deleted" cards now have **Restore** AND **Delete permanently**. New `DELETE /api/pets/[id]/purge` hard-deletes (restricted to already-soft-deleted rows); pets→assessments FK is ON DELETE CASCADE so assessments go too.

### DEFERRED / CARRY FORWARD
- **Phase 7 must filter to `completed_at NOT NULL`** so abandoned/orphan empty assessment rows never show in history (user_saved is no longer the gate).
- **Phase 9:** physical cleanup of orphan empty assessment rows + mid-chat reload recovery.
- **Phase 5 Done-When still unrun:** disconnect/onFinish-persistence test + fallback (fake ANTHROPIC key) test.

### FILES MODIFIED
- New: `src/app/(app)/assessment/[id]/page.tsx` (renamed from `[petId]`), `src/app/(app)/assessment/[id]/results/page.tsx`, `src/components/assessment/results/{risk-badge,clinical-reasoning,recommendations,disclaimer,delete-button}.tsx`, `src/app/api/pets/[id]/restore/route.ts`, `src/app/api/pets/[id]/purge/route.ts`, `src/components/pets/deleted-pet-card.tsx`, `supabase/migrations/20260620000100_seed_first_aid.sql`.
- Changed: `src/app/(app)/dashboard/page.tsx` (Recently deleted section), `src/app/api/assessment/[id]/route.ts` (+DELETE), `src/components/assessment/chat-interface.tsx` (redirect, AI suggestedReplies), `src/lib/ai/schemas.ts`, `src/app/api/assessment/chat/route.ts` (prompt + stream suggestions).
- Removed: `src/app/(app)/assessment/[petId]/`, `src/app/api/assessment/[id]/save/`, `src/components/assessment/results/save-button.tsx`.
- `npx tsc --noEmit` clean; `next lint` clean.

### NEXT SESSION MUST START WITH
1. Phase 7 — `/api/search` (rate-limited `search_assessments` RPC, returns `{ results }`).
2. `/history` page: server-fetch last 20 COMPLETED assessments (`completed_at NOT NULL`), overlay client search w/ 300ms debounce.
3. `<AssessmentCard>` (pet name, small risk badge, primary concern, date; click → results) + wire the assessment **delete** into the past-assessment view.
4. Add a "History" nav link from the dashboard/navbar.

### DECISIONS / NOTES
- `user_saved` column left in the DB (harmless) but is now dead — history keys off `completed_at`.
- Permanent pet delete is intentionally a two-step flow (soft-delete first, then purge from "Recently deleted") to make irreversible deletion deliberate.
---

---
## SESSION 11 — 2026-06-20 — Claude / Opus 4.8 (Phase 7 + pivot to Phase 7.5 Pet Clinical History Hub; Part 1)

### STARTED WITH
- Phase 6 committed. Built Phase 7 (global history + search), but on testing the user redirected the product: each pet's card should open a **per-pet clinical history hub** (assessments + meds + vet + AI chat + export). Big expansion beyond the plan.

### DESIGN DECISIONS (user-directed, via AskUserQuestion)
- URL `/pets/[id]/[name]` (id authoritative, name cosmetic slug). Meds/vet entered via **forms AND chat**. Export = **printable/downloadable PDF** now, email-send deferred (note left). Build in **parts**, update docs per part.
- **Assessments are immutable** snapshots; the contextual chat reads but never edits them. New assessments accumulate as the clinical timeline. Recorded as Phase 7.5 in `dev_plan.md`; memories saved (`pitsypet-clinical-history-hub`, `pitsypet-ask-before-big-features`).

### COMPLETED THIS SESSION
- **Phase 7 (global history, uncommitted, will commit with 7.5-P1):** `search_assessments` RPC migration `…000200` now gates on `completed_at IS NOT NULL` (not `user_saved`; tsvector kept byte-identical to the GIN index). `/api/search` (rate-limited), `/history` page, `<AssessmentCard>`, `<HistorySearch>` (300ms debounce, empty/loading states), navbar Dashboard/History links. Assessment **delete** shown only when opening a past assessment from history (`?from=history`).
- **Phase 7.5 Part 1:** migration `…000300` adds `medications` + `vet_contacts` (user_id + pet_id CASCADE, RLS owner-scoped, updated_at triggers, soft-delete). Types regenerated **via the Supabase MCP** (`gen types --linked` fails under Norton TLS — `LegacyGenTypesNetworkError`; MCP runs server-side and works — use it for type regen going forward). New: validations (`medication.ts`, `vet-contact.ts`), CRUD API routes (`/api/pets/[id]/medications[/[medId]]`, `/api/pets/[id]/vet-contacts[/[vetId]]`), client sections (`medications-section.tsx`, `vet-contacts-section.tsx`), pet page `/pets/[id]/[name]/page.tsx` (profile + meds + vet + that pet's assessment history via `<AssessmentCard>` + "Start new assessment" + "Edit profile"). `petSlug`/`petHref` helpers in `utils.ts`. Dashboard pet card now → "Open record" (pet page) + "New assessment"; title links to the pet page.
- `tsc` + `lint` + `npm run build` all clean.

### REFINEMENTS FROM USER TESTING (same session, all live-tested OK)
- **Removed the global history** (it was the "old" approach): deleted `/history` page, `history-search.tsx`, `/api/search`, and the navbar History link. History now lives only on each pet page. `search_assessments` RPC kept in DB for reuse.
- **Medications form** now has start date + end date + an "Ongoing / indefinite" checkbox (default on, disables end date). List shows "From … to …" or "… · ongoing".
- **FIXED assessment-chat regression** (user-reported): the AI was replying with ONLY the tool/quick-replies and no visible text. Root cause = Session 9 prompt forcing the tool "every turn", so Haiku led with the tool and dropped text. Prompt rewritten to ALWAYS write the visible reply first, tool as a background channel (maxSteps still 1).
- **Confirm-before-delete** dialogs added to medications AND vet contacts (were deleting on a single click).
- **Navigation fix:** results page footer is now "← Back to [pet]'s record" → the pet page (with a secondary Dashboard link); `DeleteButton` takes a `returnHref` so deleting a past assessment returns to that pet's record, not the dashboard.

### NEXT SESSION MUST START WITH
1. **Part 2** — TWO chats: per-pet chat embedded on the pet page (focused on that pet, can see the user's other pets) + a dashboard chat across ALL pets. New persistent thread table (separate from assessments). Full pet context + RAG; write tools (`add_medication`, `add_vet_contact` with confirm-before-write, `start_assessment`); keep disclaimers; suggest a NEW assessment on new/worsening symptoms (don't re-classify silently). Assessments remain immutable.
2. **Part 3** — printable/downloadable clinical history + AI clinical summary for the vet (email-send deferred).

### DECISIONS / NOTES
- **Type regen workaround:** use Supabase MCP `generate_typescript_types` (project `xaepzvxrqnqenspnanej`); the CLI `gen types --linked` is blocked by Norton TLS interception even though `db push` works (pg connection vs management API).
- Route layering: `/pets/[id]/edit` (static) coexists with `/pets/[id]/[name]` (dynamic) — Next.js allows a static segment beside a dynamic one at the same level.
---

---
## SESSION 12 — 2026-06-21 — Claude / Opus 4.8 (Phase 7.5 Part 2 — Groups A, B, C)

### STARTED WITH
- Part 1 committed. User returned with a large test-feedback list. Agreed (via AskUserQuestion) to tackle it in groups **A→B→C→D**; vet model = **clinic + doctors**; follow-ups = **dated sections in the same assessment**. Build per group, test per group.

### COMPLETED THIS SESSION (all groups: `tsc` + `lint` + `npm run build` clean; live-tested by user; UNCOMMITTED)
- **Group A — bugs.**
  - **A1 orphan assessments:** `assessment/[id]/page.tsx` no longer pre-inserts a row; it mints `crypto.randomUUID()`. The chat route `onFinish` persists **only when `complete`** (upsert with `onConflict: assessment_id`), so abandoning/refreshing mid-chat leaves NO row. (This supersedes the Phase 9 "orphan cleanup" item for the create path.)
  - **A2 chat layout:** conversation box is `max-h-[55vh] overflow-y-auto`; symptom sidebar wrapped `lg:sticky lg:top-6` so it stays visible.
- **Group B — pet record (migration `20260621000000_vet_doctors_appointments`).**
  - `vet_contacts` is now a **CLINIC**: added `service_hours JSONB` + `address`; **dropped `doctor_name`** (migrated existing values into the new table).
  - New **`vet_doctors`** (clinic→many doctors) and **`appointments`** tables (RLS owner-scoped, updated_at triggers, soft-delete, indexes). Types regenerated **via Supabase MCP** (CLI blocked by Norton TLS).
  - Validations: `vet-contact.ts` rewritten (clinic + `serviceHourSchema`), new `vet-doctor.ts`, new `appointment.ts`.
  - API: `…/vet-contacts/[vetId]/doctors[/[doctorId]]` (POST/PATCH/DELETE), `…/appointments[/[apptId]]` (POST/PATCH/DELETE).
  - Components: **medications-section** (edit + labeled Dosage/Quantity/Frequency, 2-col), **vet-contacts-section** (clinic CRUD, collapsible doctors CRUD, day/time opening-hours picker, clickable **Hours dialog with live Open/Closed** computed client-side each minute), **appointments-section** (CRUD, datetime-local, clinic `<select>`). Pet page relaid: **Vet → Appointments → Medications** stacked full width.
- **Group C — assessment context & history.**
  - Migration `20260621000100_assessment_follow_ups` adds `follow_ups JSONB` to `assessments`.
  - `format.ts`: `formatMedications`, `formatPriorAssessments`, `formatClinicalContext`. `classifier.ts`: new `clinicalContext` param appended to the prompt. Chat route fetches active meds + last 3 completed assessments → injects context into BOTH the extraction system prompt and `classifyRisk`.
  - **Follow-ups:** chat route `isFollowUp` branch appends a **dated section** (own chat/symptoms/classification) to `follow_ups` and DOES NOT create a new row; original snapshot stays immutable. `assessment/[id]/page.tsx` reads `?followup=<id>` → sets `isFollowUp` + a follow-up greeting. `chat-interface.tsx` gained `isFollowUp`/`greeting` props.
  - Results page: **detected-symptom badges** (via extended `ClinicalReasoning`), **+ Follow-up** button (history view only) → `/assessment/{petId}?followup={id}`, and a **follow-up timeline** (each section: date + RiskBadge + reasoning + symptoms + next steps). History `AssessmentCard` now shows an **abstract** (concern + symptoms + next steps + "+N follow-ups").

### USER TEST FEEDBACK ON THIS SESSION (→ becomes PENDING BACKLOG below)
- Confirmed working: Groups A & B; follow-up flow; AI clearly knows meds + prior history when asked ("Lola … June 21st … bloat … antibiotics + pain relief now finished").
- **BUG reported:** after a follow-up, doing a *new* assessment produced only ONE row in the DB — it appears to have merged into the existing assessment instead of creating a new one. NEEDS REPRO + FIX (see #1). Follow-up vs new assessment must be unmistakably distinct.

### PENDING BACKLOG (Part 2 — do NOT drop any of these)
1. ~~**[BUG] New assessment merged into existing.**~~ **RESOLVED — not a bug (user confirmed).** Code traced: both "Start new assessment" links go to `/assessment/{petId}` with NO `followup`, so they mint a fresh UUID → new row; only `+ Follow-up` (`?followup=`) appends. User re-tested: new assessments do create new rows. Keep follow-up vs new clearly distinct in any future UI work.
2. ✅ **DONE — Appointments outcome + Past appointments.** Migration `…000200` adds `outcome` (vet's recommendations after the visit); `notes` = owner observations. `AppointmentsSection` splits by a server-passed `nowIso` into **Next** (future) + **Past** (past) groups; each item shows an inline "+ Add what the vet said / + Add visit info" when `outcome` is empty. Appointments (with reason/notes/outcome) now flow into the AI clinical context via `formatAppointments`/`formatClinicalContext` (chat route fetches last 10).
3. ✅ **DONE — Medication "Prescribed by" dropdown.** Input now uses a `<datalist>` of saved doctor names (from `vet_doctors`, passed via `doctorOptions`) + free-text for unsaved doctors.
4. ✅ **DONE — Medication date validation.** `end_date < start_date` rejected client-side (toast) AND in `medicationSchema`/`medicationUpdateSchema` (zod `.refine`).
5. ✅ **DONE — Pet context in the assessment sidebar.** `SymptomSidebar` now shows Known conditions + Current medications (active meds fetched in `assessment/[id]/page.tsx`, passed through `ChatInterface`).
6. ✅ **DONE (UI + auto-populate) — Active symptoms tracker.** Decision: **own table `active_symptoms`** (migration `…000300`: name, severity, status active/resolved/worsened, source manual/assessment/followup/chat, detected_at, resolved_at, notes; RLS owner-scoped). API `…/pets/[id]/symptoms[/[symptomId]]` (POST/PATCH/DELETE; PATCH stamps/clears `resolved_at`). `ActiveSymptomsSection` on the pet page below Conditions: add/edit/delete + one-click **Mark resolved / Mark worsened / Reactivate**, shows "Since <date>". **Auto-populated** on assessment/follow-up completion (new detected symptoms not already active are inserted). Fed into the AI assessment context via `formatActiveSymptoms`. **Remaining for Group D:** the AI chat `update_active_symptoms` write tool (mark resolved/worsened from chat).
7. **[CROSS-CUTTING] The AI must always read ALL pet-related info** — conditions, meds, vet clinics + doctors, appointments + outcome notes, assessments + follow-ups, active symptoms. **Assessment context now includes meds + appointments + prior assessments + active symptoms (✅).** Vet/doctor details + the two chat surfaces reading everything = **Group D**.

### NEXT-BATCH TEST FEEDBACK (after #6 — fix NEXT session, tokens ran low)
8. **[BUG] Assessment sidebar "Current medications" shows only 1 of 3, and dosage drops the unit.** Root cause (a): `assessment/[id]/page.tsx` fetches meds with `.eq("active", true)`, but the meds add logic in `medications-section.tsx` sets `active = indefinite ? true : ended_at === ""` — so ANY med with an end date (even a FUTURE one) is saved `active=false` and hidden. Fix the `active` rule (active if no end date OR end date ≥ today) AND/OR show all current meds in the sidebar. (b) Dosage display shows "16" not "16 mg" — investigate whether the unit is lost on entry vs display ("Cephalexin — 16 · Once Daily"); ensure full dosage text (with unit) round-trips. Sidebar med formatting/order: show all, newest or active first.
9. **[UX] Appointment `outcome` should only be editable once the appointment has passed.** For a FUTURE appointment the "Vet's recommendations / outcome" field should be shown disabled (you can't have an outcome before the visit); enable it only when `scheduled_at` is in the past. (Owner notes stay editable always.)
10. **[UX] Follow-up order on the results page = most-recent first.** Currently the original assessment renders first then follow-ups in chronological order. User wants newest at top: latest follow-up first, earlier follow-ups next, original assessment last — so the timeline reads most-recent → initial. Reverse the `follow_ups` render order (and consider placing follow-ups above the original block).
11. **[BUG/FEATURE] AI must UPDATE active_symptoms, not only add.** Today auto-populate only INSERTS newly detected symptoms; it never resolves/downgrades. When the owner tells the AI a symptom improved/resolved (in an assessment, follow-up, or the Group D chat), the AI should mark that active symptom resolved/worsened so resolved symptoms leave the active list. Manual buttons work, but the AI doesn't reconcile. Needs the Group D `update_active_symptoms` tool + reconciliation logic on assessment/follow-up completion (match detected vs tracked; resolve ones no longer reported).
12. **[BUG] Duplicate active symptoms across assessments** — e.g. "sleepiness" (moderate) AND "sleepiness/lethargy" (mild) both tracked, both "Since 2026-06-21". The dedup is exact-lowercase-name only, so differently-phrased same symptoms double up. Need canonicalization / fuzzy matching, or have the AI reconcile against the existing tracked list (tie into #11). Also appears doubled on the dashboard.

### STILL PLANNED (after the backlog above)
- **Group D — contextual chats:** per-pet chat (on the pet page, focused on that pet, can see others) + dashboard chat (across all pets, must be SURE which pet each action targets). Full context + RAG + write tools (`add_medication`, `add_vet_contact`/`add_doctor` confirm-before-write, `add_appointment`, `update_active_symptoms`, `start_assessment`). Assessments stay immutable.
- **Group E — Email/Resend (deferred, no account/domain yet):** manual "request appointment → email doctor" + AI-sent appointment email with last-assessment summary; also covers the deferred custom-SMTP auth email.
- **Part 3 (original 7.5):** printable/downloadable clinical history + AI clinical summary for the vet.

### FILES MODIFIED
- Migrations: `20260621000000_vet_doctors_appointments.sql`, `20260621000100_assessment_follow_ups.sql`. `src/types/database.ts` regenerated (+`follow_ups` added by hand).
- New: validations `vet-doctor.ts`, `appointment.ts`; API `…/vet-contacts/[vetId]/doctors[/[doctorId]]`, `…/appointments[/[apptId]]`; component `appointments-section.tsx`.
- Changed: `vet-contact.ts`, `medication`? (no), `format.ts`, `classifier.ts`, `api/assessment/chat/route.ts`, `assessment/[id]/page.tsx`, `chat-interface.tsx`, `assessment/[id]/results/page.tsx`, `results/clinical-reasoning.tsx`, `assessment-card.tsx`, `pets/[id]/[name]/page.tsx`, `medications-section.tsx`, `vet-contacts-section.tsx`.

### NEXT SESSION MUST START WITH
1. PENDING #1 is RESOLVED (not a bug). Work the **PENDING BACKLOG #2–#7** (appointment outcome/past notes, prescribed-by dropdown, med date validation, sidebar context, **active-symptoms tracker**, AI-reads-all), then **Group D**.
2. Keep **Email/Resend deferred** until after Group D (user has no Resend/domain yet).

### DECISIONS / NOTES
- Type regen: continue using Supabase MCP `generate_typescript_types` (project `xaepzvxrqnqenspnanej`); CLI `gen types --linked` fails under Norton TLS. For tiny schema deltas, hand-edit `database.ts`.
- Follow-up = dated section in the SAME assessment (immutable original); new assessment = a separate row. This distinction is the crux of PENDING #1.
---
