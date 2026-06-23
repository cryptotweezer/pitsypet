# Phase 7.5 — Testing Protocol

**Goal:** verify everything built in Phase 7.5 end-to-end before any new feature (Email/Resend, Part 3 export, RAG-in-chat all wait for this to pass).

**How we run it:** Claude sends ONE test point at a time. User executes in the browser and writes the result inline (✅ PASS / ❌ FAIL + notes) in the **Result** line. At the end, Claude fixes everything that failed.

**Env:** `npm run dev` → http://localhost:3000 — logged in, with at least one pet.

Legend: ⬜ not run · ✅ pass · ❌ fail

---

## Group 0 — Build & boot sanity
- [x] **0.1** `npm run build` is clean (0 TS / 0 ESLint). — **Result:** ✅ PASS (build compiled, full route table, 0 errors)
- [ ] **0.2** `npm run dev` boots, login works, dashboard renders with pets. — **Result:**

## Group A — Bug fixes (orphan, layout)
- [ ] **A.1** Start a new assessment, send 1–2 messages, then close the tab WITHOUT completing. No assessment row should appear in history/pet page (no orphan). — **Result:**
- [ ] **A.2** Complete a full assessment → exactly one row appears, with results. — **Result:**
- [ ] **A.3** Chat box is fixed-height and scrolls internally; symptom sidebar stays sticky while chatting. — **Result:**

## Group B — Pet record (vet clinics + doctors, meds, appointments)
- [ ] **B.1** Add a vet clinic (name, address, opening hours via picker). Saves + shows. — **Result:**
- [ ] **B.2** Click clinic Hours → dialog shows live Open/Closed correctly for current time. — **Result:**
- [ ] **B.3** Add a doctor to the clinic; doctors list is collapsible. — **Result:**
- [ ] **B.4** Edit the clinic, edit the doctor; changes persist. — **Result:**
- [ ] **B.5** Add a medication (Name, Dosage + unit, Quantity, Frequency). Shows in meds + sidebar. — **Result:**
- [ ] **B.6** End a medication (set ended_at) → it leaves the "current/active" list (active is derived from ended_at, not a stale flag). — **Result:**
- [ ] **B.7** Add an appointment (future date). Shows under Next appointments. — **Result:**
- [ ] **B.8** For a PAST appointment, set an outcome → editable only once (locks after). Future appt has no outcome field. — **Result:**

## Group C — Assessment context / history / follow-ups
- [ ] **C.1** In a new assessment, AI demonstrably knows the pet's conditions + current meds + last assessments (mentions/uses them). — **Result:**
- [ ] **C.2** Results page lists the detected symptoms. — **Result:**
- [ ] **C.3** History cards show an abstract (concern + symptoms + next steps + follow-up count). — **Result:**
- [ ] **C.4** Add a Follow-up to a completed assessment (+ Follow-up). It appends a dated section; timeline shows newest-first above "Initial assessment". — **Result:**

## Group #11/#12 — Active-symptoms reconciliation
- [ ] **D.1** After 1st assessment, tracked symptoms appear on the pet page (active-symptoms tracker). — **Result:**
- [ ] **D.2** In a follow-up, AI seeds the tracked symptoms and asks how each changed. — **Result:**
- [ ] **D.3** Mark one as resolved → it moves to a collapsible "Resolved" section. — **Result:**
- [ ] **D.4** Improve/worsen a symptom → status updates (incl. new "improving"). — **Result:**
- [ ] **D.5** Add a near-duplicate symptom phrasing → canonical dedup keeps one entry. — **Result:**

## Group D-chats — Both assistant chats (per-pet + dashboard)
- [ ] **E.1** Per-pet embedded chat opens; has full pet dossier context (answers questions about meds/vet/appts/assessments). — **Result:**
- [ ] **E.2** Dashboard floating widget opens and chats. — **Result:**
- [ ] **E.3** Confirm-write: "add a medication ..." → proposal card → confirm → row created via REST route. — **Result:**
- [ ] **E.4** Confirm-write: add appointment. — **Result:**
- [ ] **E.5** Confirm-write: add vet / add doctor. — **Result:**
- [ ] **E.6** Confirm-write: cancel appointment. — **Result:**
- [ ] **E.7** Confirm-write: update/track symptoms. — **Result:**
- [ ] **E.8** Confirm-write: start_assessment button works. — **Result:**
- [ ] **E.9** Relative dates ("next Tuesday", "in 2 weeks") resolve to correct absolute dates in the proposal. — **Result:**
- [ ] **E.10** Chat memory persists across refresh (localStorage, per-device). — **Result:**
- [ ] **E.11** Proposal cards stay anchored in the transcript after confirm/cancel. — **Result:**

---

## Failures to fix (filled in as we go)
(none yet)
