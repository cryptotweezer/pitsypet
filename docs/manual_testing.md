# PitsyPet — Manual Testing Guide

A step-by-step manual walkthrough covering **every function of the app**. Work top to bottom: each group assumes the previous one passed. Tick each box; if a step fails, note it under **Failures to fix** at the bottom.

- **Environment:** test on `npm run dev` (http://localhost:3000) first, then repeat the critical path on production (`https://pitsypet.vercel.app`).
- **Two accounts:** create **User A** and **User B** (different emails) — needed for the cross-tenant isolation tests (Group J).
- **Safety reminder:** PitsyPet is an educational triage tool. When testing the "High risk" path, the expected behaviour is that it **escalates** and shows emergency contacts.

Legend: ⌨️ = action · ✅ = expected result

---

## Group 0 — Setup & smoke

- [ ] **0.1** `npm run dev` starts with no errors; open http://localhost:3000.
  ✅ Landing page renders (hero, features, how-it-works, footer disclaimer). No console errors.
- [ ] **0.2** `GET /api/health` in the browser.
  ✅ JSON `{ status: "ok", database: "reachable", latencyMs, timestamp }`, HTTP 200.
- [ ] **0.3** Visit a protected route while logged out (e.g. `/dashboard`).
  ✅ Redirected to `/login` (middleware guards it).

---

## Group A — Authentication

- [ ] **A.1 Register** — ⌨️ Go to `/register`, submit a valid name, email, strong password.
  ✅ Account created; redirected to dashboard (or email-confirm screen per config). A `profiles` row exists for the user.
- [ ] **A.2 Register validation** — ⌨️ Try a weak password / invalid email / mismatched confirm.
  ✅ Inline field errors; no submit.
- [ ] **A.3 Duplicate email** — ⌨️ Register again with the same email.
  ✅ Friendly "already registered" error, no crash.
- [ ] **A.4 Logout** — ⌨️ Use the logout control.
  ✅ Session cleared; protected routes redirect to `/login`.
- [ ] **A.5 Login** — ⌨️ Log in with A.1 credentials.
  ✅ Lands on dashboard.
- [ ] **A.6 Wrong password** — ⌨️ Log in with a bad password.
  ✅ Error message; not logged in.
- [ ] **A.7 Session persists** — ⌨️ Refresh the dashboard; close and reopen the tab.
  ✅ Still logged in (middleware refreshes the token).

---

## Group B — Pet profile management

- [ ] **B.1 Create pet** — ⌨️ From the dashboard, "Add pet". Fill name, species (Dog/Cat), breed, age (years/months), weight.
  ✅ Pet card appears on the dashboard.
- [ ] **B.2 Breed autocomplete** — ⌨️ Start typing a breed.
  ✅ Suggestions appear and are selectable.
- [ ] **B.3 Validation** — ⌨️ Submit with an empty name; enter a wildly wrong weight (e.g. 200 kg for a cat).
  ✅ Field errors block the save (weight must be within the species bounds).
- [ ] **B.4 Duplicate name** — ⌨️ Create a second pet with the **same name** as B.1.
  ✅ "A pet with this name already exists" — rejected.
- [ ] **B.5 Edit pet** — ⌨️ Open the pet, edit weight / add a medical condition, save.
  ✅ Changes persist after refresh.
- [ ] **B.6 Soft delete** — ⌨️ Delete a pet.
  ✅ It leaves the active grid and appears in **"Recently deleted"**.
- [ ] **B.7 Restore** — ⌨️ Restore the deleted pet.
  ✅ Back in the active grid with its data intact.
- [ ] **B.8 Delete permanently (purge)** — ⌨️ Soft-delete again, then "Delete permanently".
  ✅ Gone for good; its assessments are cascaded away. (Use a throwaway pet for this.)

---

## Group C — AI triage assessment (the core)

> Keep **at least one** pet from Group B for these.

- [ ] **C.1 Start assessment** — ⌨️ On a pet, "Start new assessment".
  ✅ Chat opens with an opening question; symptom sidebar visible and sticky; chat box fixed-height + scrolls.
- [ ] **C.2 Streaming reply** — ⌨️ Describe a **mild, single** symptom (e.g. "a little sneezing, otherwise normal, eating fine").
  ✅ The assistant streams a follow-up question (first token < ~2s). Extracted symptoms appear live in the sidebar.
- [ ] **C.3 No invented symptoms** — Confirm the AI only records what you actually said.
  ✅ It does **not** fabricate symptoms from the pet's conditions/medications — it asks first.
- [ ] **C.4 Completion (Low)** — ⌨️ Answer the follow-ups until it completes.
  ✅ The AI posts a closing message with a **"View results"** link and the chat **locks** (no auto-redirect; last message stays). Open results.
- [ ] **C.5 Low results** — On the results page:
  ✅ **Low** risk badge; clinical reasoning; detected-symptom badges; **first-aid / home-care** recommendations (NOT emergency contacts).
- [ ] **C.6 Auto-save** — ⌨️ Go back to the pet page.
  ✅ The assessment is already saved in the pet's history (no manual "Save" button).
- [ ] **C.7 High-risk escalation (safety override)** — ⌨️ Start a new assessment and describe an emergency (e.g. "swollen hard belly, retching but nothing comes up, very restless" — a GDV-style presentation).
  ✅ Classified **High**; results show **emergency contacts** + red flags. (This proves the deterministic safety override escalates.)
- [ ] **C.8 Medium path** — ⌨️ Try a multi-symptom moderate case (e.g. "vomiting and diarrhoea since this morning, a bit lethargic").
  ✅ Typically **Medium**: "see a vet within 24h" type guidance.
- [ ] **C.9 Follow-up** — ⌨️ Open a completed assessment, "+ Follow-up", report a change ("still vomiting, now also not drinking").
  ✅ A **dated follow-up section** is appended (the original snapshot is unchanged); timeline shows newest-first.
- [ ] **C.10 High follow-up on a lower initial** — ⌨️ On a Low/Medium assessment, add a follow-up describing an emergency.
  ✅ That **follow-up block shows emergency contacts** even though the initial was lower; the pet card's risk tag tracks the **latest** follow-up.

---

## Group D — Active symptoms tracker

- [ ] **D.1 Auto-populate** — After an assessment, open the pet page.
  ✅ Newly detected symptoms appear under **Active symptoms** with "Since <date>".
- [ ] **D.2 Manual add/edit** — ⌨️ Add a symptom manually; edit its severity.
  ✅ Persists.
- [ ] **D.3 Status buttons** — ⌨️ Mark one **resolved**, another **worsened**, then **reactivate** one.
  ✅ Resolved ones move to a collapsible **Resolved** section; reactivate brings it back.
- [ ] **D.4 AI reconciliation** — ⌨️ In a follow-up or the chat, say a tracked symptom is gone ("the limping is completely better now").
  ✅ The AI marks that symptom **resolved** (it reconciles, not just adds).
- [ ] **D.5 No duplicates** — Check differently-phrased same symptoms ("sleepiness" vs "lethargy") don't double up.
  ✅ De-duplicated to one tracked entry.

---

## Group E — Medications

- [ ] **E.1 Add med** — ⌨️ On the pet page, add a medication: name, **dosage + unit** (e.g. "16 mg"), quantity, frequency, start date, optional end date, prescribed-by.
  ✅ Appears in the medications list with the **unit shown** ("Cephalexin — 16 mg · Once daily").
- [ ] **E.2 Date validation** — ⌨️ Set an **end date before the start date**.
  ✅ Rejected (toast + inline) — end can't precede start.
- [ ] **E.3 Edit med** — ⌨️ Change the dose.
  ✅ Persists.
- [ ] **E.4 Mark as finished** — ⌨️ On an ongoing med, "Mark as finished".
  ✅ Moves to the collapsible **Finished medications** section (sets end date = today).
- [ ] **E.5 Active in sidebar** — ⌨️ Start an assessment for that pet.
  ✅ All **current** meds show in the assessment sidebar context.
- [ ] **E.6 Delete med** — ⌨️ Delete a medication.
  ✅ Removed from the list.

---

## Group F — Vet clinics, doctors & appointments

> Vet clinics & doctors are **owner-level (global)** — managed on the **dashboard**, shared across all pets.

- [ ] **F.1 Add clinic** — ⌨️ On the dashboard, add a vet clinic: name, phone, email, address.
  ✅ Clinic card appears.
- [ ] **F.2 Service hours** — ⌨️ Add structured opening hours (day + open/close).
  ✅ Saved; clicking **Hours** opens a dialog showing live **Open/Closed** status for "now".
- [ ] **F.3 Doctors** — ⌨️ Add 2 doctors to the clinic; collapse/expand the doctor list.
  ✅ Doctors listed under the clinic; collapsible.
- [ ] **F.4 Edit clinic** — ⌨️ Edit the clinic's phone.
  ✅ Persists.
- [ ] **F.5 Hard delete clinic** — ⌨️ Delete a clinic (use a throwaway one).
  ✅ Permanently removed; its doctors cascade away; any appointment that pointed to it keeps existing with the clinic link nulled.
- [ ] **F.6 Add appointment (pet page)** — ⌨️ On a pet, add a future appointment: title, date/time, clinic (dropdown of global clinics), **doctor_name** (datalist of that clinic's doctors, free-text allowed), reason.
  ✅ Appears under **Next appointments**, labelled **(upcoming)**.
- [ ] **F.7 Outcome lock** — On a **future** appointment, check the "outcome / vet's recommendations" field.
  ✅ **Disabled** until the appointment date passes (owner notes stay editable). Past appointments allow editing the outcome.
- [ ] **F.8 Closed-clinic warning** — ⌨️ Book an appointment at a time the clinic is **closed**.
  ✅ A confirm-before-booking warning appears.
- [ ] **F.9 Dashboard appointments** — ⌨️ Open the dashboard **Appointments** section (all pets).
  ✅ Shows appointments across every pet; pet picker works when adding.
- [ ] **F.10 Edit / delete appointment** — ⌨️ Reschedule one; delete another.
  ✅ Both persist; past appointments are in a collapsible section.

---

## Group G — Contextual AI chat (per-pet + dashboard assistant)

- [ ] **G.1 Per-pet chat opens** — ⌨️ On a pet page, open the embedded chat. Ask "what meds is <pet> on?"
  ✅ Answers from that pet's records (meds, conditions, assessments, appointments).
- [ ] **G.2 Dashboard assistant** — ⌨️ Open the floating dashboard widget. Ask about a **different** pet by name.
  ✅ Answers correctly, scoped to the right pet.
- [ ] **G.3 Confirm-before-write (add med)** — ⌨️ Ask the chat to "add a medication, Metacam 1.5 mg once daily".
  ✅ A **proposal card** appears; nothing is written until you **Confirm**. Confirm → the med shows on the pet page.
- [ ] **G.4 Add appointment via chat** — ⌨️ "Book a check-up next Monday at 10am at <clinic>".
  ✅ Proposal card with the **correctly resolved date** (timezone-aware — "next Monday" = the right calendar date). Confirm writes it.
- [ ] **G.5 Add clinic + doctors via chat** — ⌨️ "Add my vet clinic <name> with Dr X and Dr Y".
  ✅ One proposal card containing the clinic **and** its doctors. Confirm creates them globally.
- [ ] **G.6 Cancel appointment via chat** — ⌨️ "Cancel the appointment on <date>".
  ✅ Proposal → confirm → appointment cancelled/removed.
- [ ] **G.7 Update symptoms via chat** — ⌨️ "The cough is better now."
  ✅ Proposal → confirm → the tracked symptom is reconciled (improving/resolved).
- [ ] **G.8 Start assessment via chat** — ⌨️ "Start a new assessment for <pet>."
  ✅ A button/link launches the assessment flow.
- [ ] **G.9 Create pet via chat (0 pets)** — ⌨️ With a fresh account (no pets), ask the assistant to add a pet.
  ✅ A `propose_create_pet` card flow works even with zero pets.
- [ ] **G.10 Proposal cards persist** — ⌨️ With a pending proposal card, **refresh** the page.
  ✅ The card is still there (localStorage), and chat history persists per device.
- [ ] **G.11 Clear chat** — ⌨️ Use "Clear chat".
  ✅ Thread resets.

---

## Group H — Vet PDF export

- [ ] **H.1 Export button** — ⌨️ On a completed assessment's results page, click **"Export for vet (PDF)"**.
  ✅ A PDF downloads (heavy lib loads dynamically — no page-bundle bloat / no error).
- [ ] **H.2 PDF content** — Open the PDF.
  ✅ Contains: patient details; **current + past medications with start/end dates**; the initial assessment **and all follow-ups**; and an **AI clinical handover summary**.
- [ ] **H.3 Deterministic priority** — For a case whose highest risk was **High**.
  ✅ The summary's triage priority reads **Urgent** (any High → Urgent, Medium → Soon, else Routine) — never softened.

---

## Group I — History & search

- [ ] **I.1 Per-pet history** — ⌨️ On a pet, view its assessment history.
  ✅ Lists **completed** assessments with an abstract (concern + symptoms + next steps + follow-up count).
- [ ] **I.2 Search** — ⌨️ On `/history`, search a term you know appears (e.g. "vomiting").
  ✅ Matching assessments returned (debounced). Empty query → empty results.
- [ ] **I.3 Open from history** — ⌨️ Open a past assessment.
  ✅ Full results render, including any follow-ups (newest-first).

---

## Group J — Security & isolation (cross-tenant)

- [ ] **J.1 Cross-tenant pets** — ⌨️ As **User B**, note B's dashboard. Confirm none of **User A's** pets are visible.
  ✅ Each user only sees their own data (RLS).
- [ ] **J.2 Direct ID access** — ⌨️ As User B, try to open one of User A's assessment/pet URLs directly (use an id from A's session).
  ✅ No data — 404 / not-found / empty (RLS denies).
- [ ] **J.3 SQL-injection (search)** — ⌨️ Search `'; DROP TABLE assessments; --`.
  ✅ Treated as a harmless query string → empty/normal results; nothing breaks (parameterised RPC).
- [ ] **J.4 Injection (pet name)** — ⌨️ Create a pet named `Max'; DROP TABLE pets; --`.
  ✅ Stored as plain text; tables intact.
- [ ] **J.5 Rate limit (search)** — ⌨️ Fire many searches quickly (>30 in a minute).
  ✅ Eventually returns **429** "Too many searches".
- [ ] **J.6 Security headers** — In DevTools → Network, inspect a page response.
  ✅ Headers present: `Content-Security-Policy` (with a nonce), `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

---

## Group K — Fallbacks & resilience (Phase 9 verification)

> These prove the safety nets work. The code is in place — here you trigger each.

- [ ] **K.1 Safety override beats everything** — (covered by C.7) An emergency description → **High**, regardless of model output.
  ✅ Always High for critical phrasing.
- [ ] **K.2 Rule-based fallback** — ⌨️ Temporarily break the classifier model (e.g. set an invalid `ANTHROPIC_API_KEY` in `.env.local`, restart dev) and run an assessment.
  ✅ It still **completes and saves** using the rule-based fallback; the saved row has `fallback_used = true`; emergency wording still escalates appropriately. **(Restore the key after.)**
- [ ] **K.3 Emergency contacts on stall/error** — ⌨️ With the broken key (or throttled network), start an assessment and let a turn stall/error.
  ✅ The **static emergency block** (Animal Emergency Australia 1300 226 226 + "search emergency vet near me") appears quickly (< ~2s), no white screen.
- [ ] **K.4 RAG-less classification** — (current default, KB empty) Assessments still classify.
  ✅ No 500s when RAG returns 0 chunks; results render.
- [ ] **K.5 Cost guard** — ⌨️ If feasible, lower the daily cap (or simulate hitting `MAX_ASSESSMENTS_PER_DAY`) and start another assessment.
  ✅ Fails **closed** with a friendly message, not a crash.
- [ ] **K.6 Network drop mid-chat** — ⌨️ Disconnect mid-assessment.
  ✅ Error shown fast; no orphan DB row is created (rows persist only on completion); reconnecting lets you continue or cleanly restart.

---

## Group L — Monitoring & analytics (prod)

- [ ] **L.1 Health monitor** — Confirm UptimeRobot shows the `/api/health` monitor **"Up"**.
- [ ] **L.2 Sentry** — ⌨️ Trigger a deliberate error (or check a known one).
  ✅ It appears in the Sentry dashboard.
- [ ] **L.3 PostHog events** — ⌨️ Run an assessment in prod.
  ✅ `assessment_started`, `assessment_completed`, and `risk_level_shown` events recorded in PostHog.

---

## Group M — Responsive & accessibility (spot-check)

- [ ] **M.1 Mobile** — ⌨️ Resize to **320px** and **375px** (DevTools device mode). Walk the core flow.
  ✅ No horizontal scroll; chat fully usable; touch targets reasonable.
- [ ] **M.2 Desktop** — ⌨️ Check **1440px / 1920px**.
  ✅ No broken/over-stretched layouts.
- [ ] **M.3 Keyboard** — ⌨️ Tab through register/login and the pet form.
  ✅ Logical tab order; visible focus; forms submittable by keyboard.

---

## Performance targets (DevTools, Fast 3G)

- [ ] Dashboard loads < 3s
- [ ] First streamed assessment token < 2s
- [ ] Full assessment < 10s
- [ ] History search < 1s

---

## Production smoke (final)

- [ ] Repeat the **critical path** on `https://pitsypet.vercel.app`: register → create pet → assessment (Low) → assessment (High → emergency contacts) → follow-up → export PDF → search — with **no errors**.
- [ ] HTTPS served; auth redirect URLs work in prod.

---

## Failures to fix

| ID | What happened | Severity | Notes |
|----|----------------|----------|-------|
|    |                |          |       |
