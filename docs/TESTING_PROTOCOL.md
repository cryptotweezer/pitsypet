# PitsyPet — Testing Protocol (Phase 7.5)

**Goal:** verify everything built through Phase 7.5 end-to-end before moving on to the deferred work (Email/Resend, Part 3 export + AI summary, RAG-in-chat). This is the hand-off checklist for the testing pass.

**Scope:** the Pet Clinical History Hub — pet record (vet clinics + doctors, medications, appointments), assessments + follow-ups, active-symptoms reconciliation, both assistant chats, and the results/recommendations surface.

**How to run it:** walk each item in the browser and mark the **Result** line: ✅ PASS / ❌ FAIL + notes. Anything that fails goes into the **Failures to fix** section at the bottom.

**Environment:**
- `npm run dev` → http://localhost:3000 (or the deployed preview URL).
- Logged in with at least one pet. For full coverage, have: 2+ pets, 1+ vet clinic with 2+ doctors, some medications (ongoing + ended), some appointments (past + future), and at least one completed assessment.
- A profile with a `state` set (so High-risk emergency contacts show local clinics, not just the national hotline).

**Legend:** ⬜ not run · ✅ pass · ❌ fail

---

## Group 0 — Build & boot sanity
- [ ] **0.1** `npm run build` is clean (0 TS errors / 0 ESLint errors / full route table). — **Result:**
- [ ] **0.2** `npm run dev` boots; login works; dashboard renders with pets, vet clinics, and appointments. — **Result:**
- [ ] **0.3** Migrations are in sync (`npx supabase migration list` shows Local == Remote, newest is `20260624000000_appointment_doctor_name`). — **Result:**

## Group A — Assessment chat lifecycle (orphans, completion, lock)
- [ ] **A.1** Start a new assessment, send 1–2 messages, then close the tab WITHOUT completing → no assessment row appears in the pet's history (no orphan; the row is written only on completion). — **Result:**
- [ ] **A.2** Complete a full assessment → exactly one row appears with results. — **Result:**
- [ ] **A.3** Chat box is fixed-height and scrolls internally; the symptom sidebar stays sticky while chatting. — **Result:**
- [ ] **A.4** **(New)** On completion, the AI posts a closing message **inside the chat** with a clickable **"View results"** button — there is NO automatic redirect, and the AI's last message is NOT lost. — **Result:**
- [ ] **A.5** **(New)** After completion, the chat is **locked**: the input box and quick-reply buttons are gone; only the "View results" link remains. — **Result:**
- [ ] **A.6** **(New)** Clicking "View results" opens the results page for that assessment. — **Result:**

## Group B — Pet record: medications
- [ ] **B.1** Add a medication (Name, **Dose amount + Unit**, Quantity, Frequency, Prescribed by, dates). Shows in the meds list and in the assessment sidebar. — **Result:**
- [ ] **B.2** Dose displays as "amount unit" (e.g. `1.5 mg`); Quantity is separate (e.g. `1 tablet`). — **Result:**
- [ ] **B.3** Edit a medication; changes persist after refresh. — **Result:**
- [ ] **B.4** **(New)** An ongoing med shows a **"Mark as finished"** button → clicking it sets the end date to today and moves it to the **"Finished medications (N)"** section. — **Result:**
- [ ] **B.5** **(New)** The "Finished medications" section is **collapsible** (collapsed by default) and only finished meds live there; active/current meds stay above. — **Result:**
- [ ] **B.6** A med given a future end date stays in the **active** list (active is derived from `ended_at`, not a stale flag). — **Result:**
- [ ] **B.7** "Prescribed by" suggests saved doctor names (datalist) but accepts any typed name. — **Result:**

## Group C — Pet record: appointments (+ doctor field)
- [ ] **C.1** Add a future appointment (title, date/time, clinic, reason, notes). Shows under **Next appointments**. — **Result:**
- [ ] **C.2** **(New)** After choosing a clinic, the **Doctor** field suggests that clinic's doctors (datalist) — and changing the clinic changes the suggestions. — **Result:**
- [ ] **C.3** **(New)** The Doctor field accepts a **typed name not in the list**, and accepts being left **empty**. The saved doctor shows on the appointment ("Doctor: …"). — **Result:**
- [ ] **C.4** For a PAST appointment, the **outcome** field is editable (only the outcome; once recorded it reads back). A FUTURE appointment has no editable outcome field. — **Result:**
- [ ] **C.5** **(New)** **Past appointments** on the pet page are in a **collapsible** "Past appointments (N)" section (collapsed by default); upcoming stay visible above. — **Result:**
- [ ] **C.6** Delete an appointment → confirm dialog → row removed. — **Result:**

## Group D — Vet clinics + doctors (owner-level / global, on the dashboard)
- [ ] **D.1** On the dashboard, add a vet clinic (name, phone, email, address, **opening hours via the day/time picker**, notes). Saves + shows. — **Result:**
- [ ] **D.2** Click the clinic's **Hours** → dialog shows the weekly hours with a live **Open now / Closed** for the current time. — **Result:**
- [ ] **D.3** Add 2+ doctors to a clinic; the doctors list is **collapsible**; phone/email show with icons. — **Result:**
- [ ] **D.4** Edit a clinic and edit a doctor; changes persist after refresh. — **Result:**
- [ ] **D.5** The clinic + its doctors are visible to **all pets** (clinic dropdown on a pet's appointment form, doctor suggestions) — confirming they're global, not per-pet. — **Result:**
- [ ] **D.6** **(New)** Delete a doctor from the dashboard → confirm dialog → the row is **actually gone from the database** (hard delete), not just hidden. — **Result:**
- [ ] **D.7** **(New)** Delete a clinic → confirm dialog → the clinic AND its doctors are **gone from the database**; any appointment that linked to it survives with no clinic. — **Result:**
- [ ] **D.8** The **dashboard Appointments** section lists ALL pets' appointments, has a pet picker on the add form, and the same Doctor-by-clinic field (C.2/C.3). — **Result:**

## Group E — Assessment context, results & follow-ups
- [ ] **E.1** In a new assessment, the AI demonstrably knows the pet's conditions + current meds + recent assessments (uses them in conversation). — **Result:**
- [ ] **E.2** **(Critical)** The AI does **not invent symptoms** from meds/conditions — it ASKS (e.g. "I see she's on Metacam — any discomfort?") and only records a symptom if you confirm it. — **Result:**
- [ ] **E.3** Appointments are read as **(upcoming)/(past)** — the AI never asks "how did it go?" about a future appointment. — **Result:**
- [ ] **E.4** Results page lists the **detected symptoms** and the clinical reasoning. — **Result:**
- [ ] **E.5** **Low risk** result → first-aid recommendations for the extracted symptoms (age-appropriate). — **Result:**
- [ ] **E.6** **High risk** result → **emergency veterinary contacts** show (state-specific first, national hotline fallback) + red flags + urgent action. — **Result:**
- [ ] **E.7** Add a **Follow-up** to a completed assessment (+ Follow-up). It appends a dated section; the timeline shows newest-first, above "Initial assessment". — **Result:**
- [ ] **E.8** **(New, the reported bug)** Do a follow-up that classifies **High** on an assessment whose initial risk was Low/Medium → the follow-up block on the results page now shows its **own emergency contacts** (each block renders risk-appropriate recommendations). — **Result:**
- [ ] **E.9** **(New)** A **Low** follow-up shows its own first-aid; a **Medium** follow-up shows the 24h-vet note. — **Result:**
- [ ] **E.10** **(New)** On the pet page, the assessment card's **risk tag reflects the LATEST follow-up's risk**, not the initial (Low initial + High follow-up → card shows High; a later Medium follow-up → card shows Medium). — **Result:**

## Group F — Active-symptoms reconciliation
- [ ] **F.1** After the 1st assessment, tracked symptoms appear on the pet page (active-symptoms tracker). — **Result:**
- [ ] **F.2** In a follow-up, the AI **seeds** the tracked symptoms (shown in the sidebar before its first turn) and asks how each changed. — **Result:**
- [ ] **F.3** Resolve a symptom (explicitly) → it moves to a collapsible **"Resolved (N)"** section; Reactivate is available. — **Result:**
- [ ] **F.4** Improve / worsen a symptom → status + badge update (incl. the **improving** status). — **Result:**
- [ ] **F.5** Feed a near-duplicate phrasing ("sleepiness" vs "sleepiness/lethargy") → canonical dedup keeps one entry. — **Result:**
- [ ] **F.6** A symptom only mentioned in passing (not confirmed present) is NOT auto-marked improving/worsened/resolved. — **Result:**

## Group G — Assistant chats (per-pet panel + dashboard widget)
- [ ] **G.1** The per-pet embedded chat opens and answers questions using the full pet dossier (meds / vet / appts / assessments / active symptoms). — **Result:**
- [ ] **G.2** The dashboard floating widget opens and chats; it works even with **0 pets** (offers to create a pet). — **Result:**
- [ ] **G.3** Confirm-write — **add medication** (with dose amount + unit): proposal card → Confirm → row created. — **Result:**
- [ ] **G.4** Confirm-write — **add appointment**. — **Result:**
- [ ] **G.5** Confirm-write — **add vet clinic (+ doctors in one card)** with structured service hours. — **Result:**
- [ ] **G.6** Confirm-write — **add doctor** to an existing clinic. — **Result:**
- [ ] **G.7** Confirm-write — **cancel appointment** (destructive confirm). — **Result:**
- [ ] **G.8** Confirm-write — **update/track symptoms**. — **Result:**
- [ ] **G.9** Confirm-write — **create pet** (from the dashboard widget; lb→kg conversion). — **Result:**
- [ ] **G.10** **start_assessment** → a Start button appears and navigates to the assessment. — **Result:**
- [ ] **G.11** **Relative + timezone-aware dates** ("next Monday", "in 2 weeks") resolve to the correct absolute date in the proposal (user's local timezone). — **Result:**
- [ ] **G.12** **Closed-clinic check**: booking at a time the chosen clinic is closed → the AI refuses and asks to confirm; only books on explicit confirmation. — **Result:**
- [ ] **G.13** **Chat memory** persists across refresh (per-device localStorage); **Clear chat** wipes transcript + cards. — **Result:**
- [ ] **G.14** **Proposal cards** stay anchored in the transcript after confirm/cancel and **survive a refresh** (no flash-and-vanish). — **Result:**
- [ ] **G.15** The assistant sees the **global vet clinics** (with hours + doctors) in every chat. — **Result:**

## Group H — Access control / data integrity (spot checks)
- [ ] **H.1** A user only ever sees/edits their own pets, meds, appts, clinics, assessments (RLS via the cookie-scoped routes). — **Result:**
- [ ] **H.2** Permanently deleting a pet removes its assessments/meds/appointments (CASCADE) but leaves the **global** vet clinics/doctors (by design). — **Result:**
- [ ] **H.3** Soft-deleted pets appear in "Recently deleted" with Restore + Delete-permanently. — **Result:**

---

## Failures to fix (filled in as we go)
(none yet)

---

## Out of scope for this pass (deferred — do NOT test yet)
- **Email/Resend** (request-appointment email + AI summary email) — user has no Resend account/domain yet.
- **Part 3** — printable/exportable history + AI vet summary.
- **RAG in the assistant chat** — the knowledge base is empty until Phase 4 ingestion, so retrieval is intentionally not wired in.
