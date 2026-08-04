# vet_calibration_notes.md: clinical calibration with a veterinarian (live session)

**What this file is:** the raw record of the calibration interview run from the protocol in
`docs/vet_protocol.md`. It holds the veterinarian's answers exactly as she gave them, before they
are turned into code criteria. The interview was conducted in Spanish and the answers are recorded
here in English translation, kept as literal as possible: nothing is summarised, softened or
reordered, and every threshold, time window and clinical term is carried across unchanged. This is
irreplaceable material. It is documented here first, and only then does the developer convert it
into rules over `classifier.ts`, `safety.ts`, `fallback.ts`, the extraction prompt and the
recommendation tables.

---

## Session details

- **Date:** 2026-08-02
- **Veterinarian:** anonymised on purpose. Professional profile: 3 years of experience, dogs and
  cats, general practice, emergency and surgery. Her identity is not recorded in this repository
  (which is public) so as not to expose the personal data of a professional who collaborated
  privately. If she ever authorises being credited, it will be added here.
- **Practises in:** Colombia (with clinical experience; not currently in active practice)
- **Time available:** 1 hour
- **Format:** questions and answers one at a time, over chat. No code changes during the interview:
  everything is collected first, and the developer applies the adjustments afterwards.
- **Out of scope for this session (worked on later with the developer):** source documents for the
  RAG corpus, real emergency contacts, evaluation scripts.

**Clinical context note:** the veterinarian practises in Colombia, so the triage criteria
(physiology, thresholds, red flags) are applicable, but the epidemiology specific to Australia
(paralysis tick, 1080, snail bait, cane toad, local snakes) and Australian emergency resources are
**not** validated by this session and remain outstanding.

---

## Interview record

### M0: professional profile

**Q1. Species, years and scope of practice.**
> Dogs and cats, 3 years, general practice, emergency and surgery.

---

### M0 / M2: the three levels, definitions, windows and examples

**Q2. What defines LOW risk, and how much observation margin is given?**
> Low risk is that the symptoms are very mild and that the animal is still eating, not depressed
> or lethargic, drinking water, not vomiting, no diarrhoea, not bleeding, has not had an accident;
> that overall the owner sees it as well, only with some mild symptoms.
> If the consultation is at night: observe overnight and, if it is still unwell in the morning,
> take it to the vet. If it is during the day: keep checking **every 2 hours** how it behaves and,
> if anything changes drastically, take it to the vet.

**Q3. What defines MEDIUM risk, and within what timeframe?**
> They should take it in over the next few hours, the same day or night, within a window of
> **6 to 12 hours**.

**Q4. Examples of MEDIUM risk (neither home care nor go right now).**
> - Loose stools, but still bright, eating, drinking water, not vomiting.
> - The owner realised it ate something (human food or a small object) but the animal is still
>   fine: eating, drinking water, normal stools, bright, not vomiting.
> - The animal is a little down but eats well and has no other symptom.
> - The dog took a small knock that did not affect any vital part, is not bleeding, but is a
>   little down and otherwise eats well and performs all its normal functions.

**Q5. What defines HIGH risk?**
> The animal has had an accident, is bleeding, is lethargic, down, not eating, vomiting, watery
> diarrhoea of various kinds, ate something toxic, ate a very large object, suffered heatstroke,
> suffered an episode of human violence or an attack by another animal.

**Q6. A single vomit, animal otherwise perfect.**
> Medium.

**Q7. Concrete examples of LOW risk (observe at home).**
> - It is scratching or licking and has no alarming skin lesion: they should check it and try to
>   **book a vet visit in the next few days**.
> - It has a skin lump that is not inflamed, not ulcerated, not painful, moves when touched and
>   has not grown in months: they should **book a check-up soon** to have the lump looked at.
> - It had one episode of loose stools one day, had no more, and is well: they should
>   **mention it at the next visit** to make sure everything is in order.
> - It had a small accident that did not affect vital parts or compromise a limb or vital organ,
>   the owner managed it with cleaning at home and the animal recovered and looks well: they
>   should **book an appointment soon** and have it checked just in case.

---

### M1: absolute emergencies and subtle signs

**Q8. Cat-specific emergencies that people do not recognise.**
> Yes, cats that cannot urinate, especially males.

**Q9. Subtle signs that owners play down but are already a red flag.**
> The cat goes into the litter tray again and again and the owner thinks it is nothing, but it
> can be an obstruction.

**Q10. Immediate-emergency checklist (yes / no).**
> **Yes, immediate emergency:** (a) a cat breathing with its mouth open or panting, (b) pale,
> white or bluish gums, (c) an animal that suddenly cannot move its hind legs, (e) tremors.
> **Not an immediate emergency:** (d) hiding and not wanting to be touched.

---

### M7: ingestions and toxins

**Q11. Which are always an immediate emergency even if the animal looks well?**
> All of them: (a) chocolate, (b) xylitol, (c) grapes or raisins, (d) onion or garlic, (e) human
> medicines, (f) rat poison, (g) a large object.
> In Colombia the frequent ones are: **poisonings, large objects and chocolate**.

---

### M3 / M6: thresholds, grey zone and escalation

**Q12. Hours without eating that are concerning.**
> Puppies, small dogs or dogs with a health condition: more than **12 hours** is concerning.
> Healthy dogs: more than **24 hours**. Cats: more than **12 to 24 hours**.

**Q13. Vomiting and diarrhoea threshold.**
> Just 1 vomit is considered "observe it". More than that is "take it in now".
> Diarrhoea is the same: one episode is "observe it", 2 or more is "take it in now".

**Q14. Clarification: healthy adult dog, 2 vomits in the day, but eating, drinking and bright.**
> That falls in the 6 to 12 hours (medium risk).

**Q15. What moves it to a go-now emergency?**
> More vomiting episodes, being down, anorexia, blood, diarrhoea at the same time.

---

### M4: patient modifiers

**Q16. Which patients lower your threshold?**
> **All** of the ones proposed: puppies and kittens, over 10 years old, flat-faced breeds,
> large deep-chested breeds, diabetic / cardiac / renal patients, a pregnant or recently
> whelped female.

**Q17. How does your approach change in those patients?**
> **The observation window is shortened** (the risk level does not go up).

---

### M6: common presentations, level by presentation

**Q18. Level for each case (low / medium / high).**
> - Occasional cough, otherwise well: **low** (consult soon).
> - Limping on one leg but weight-bearing and eating normally: **medium**.
> - Red, watering eye, opens it fully: **high**.
> - Shaking its head and scratching its ear: **medium**.
> - Sneezing with a runny nose, eating well: **high** (qualified in Q19).
> - Bloody urine but is passing urine: **high**.

**Q19. Clarification on sneezing with nasal discharge.**
> It changes if the discharge is **yellow or greenish**.
> (Interpretation: clear discharge with a normal animal is not high; purulent discharge does
> escalate. **Pending confirmation** of the exact level for the clear-discharge case.)

---

### M5: taking the clinical history

**Q20. Minimum questioning for "my dog is vomiting", in order.**
> 1. How many times has it vomited?
> 2. How long ago?
> 3. What does the vomit look like?
> 4. Is it eating?
> 5. Does it have diarrhoea?
> 6. Is it drinking water?
> 7. Is it down?
> 8. What food does it eat?
> 9. Could it have eaten something unusual?

**Q21. When do you stop asking and say straight out "take it in now"?**
> If they say it has vomited **more than once in a short time (a couple of hours)** and that it
> **looks down**, I do not ask anything else: take it in now.

---

### M3: follow-up at 24 and 48 hours

**Q22. What indicates real improvement and what indicates worsening.**
> **Improved:** symptoms reduced or gone, eating normally, drinking normally, brighter.
> **Worsened:** more symptoms, higher frequency of the symptoms, down, not eating, not breathing
> well, panting, bleeding.

---

### M8: home management and first aid

**Q23. Common owner mistakes the app must explicitly advise against.**
> Giving human medicines; putting things on skin or wounds; giving home or natural remedies with
> no scientific evidence; inducing vomiting in certain cases.

**Q24. What should the owner watch for during observation at home.**
> That the symptoms do not increase or worsen, that the animal takes food and water without
> difficulty, and its mood.

**Q25. What to do while getting to the vet in an emergency.**
> Give no food and no water; transport it in a suitable carrier and keep it warm; do not let it
> be exposed to adverse environmental conditions; control bleeding with gauze or a clean cloth;
> keep it as calm as possible during transport.

---

### M10: limits and communication

**Q26. What the app must NEVER do.**
> Diagnose; medicate (conventional or natural); suggest waiting when there is doubt; tell people
> "it is nothing" when it may well be something.

**Q27. What the veterinarian wants to see in the summary the owner brings her.**
> 1. **Complete patient details:** name, age, species, **sex**, breed, **current weight**, special
>    characteristics, previous and current diagnoses, owner (phone, address), time of arrival at
>    the emergency clinic.
> 2. **Reason for consultation.**
> 3. **Clinical history:** condition, symptoms, **vaccinations**, previous treatments, behaviour,
>    **diet**, **recent changes**.
> 4. Clinical assessment and diagnostic tests.
> 5. Final diagnosis.
> 6. Treatments and home recommendations.
> 7. Next check-ups.
>
> (Points 4 to 7 are filled in by the veterinarian, not by the app. Points 1 to 3 are the ones the
> app must deliver. **Data the app does not currently hold: sex, vaccinations, diet, recent
> changes, owner phone and address.**)

**Q28. Tone with a frightened owner.**
> A reassuring, clear tone, without technical terms, that they can understand.

---

### M0 / M6: closing confirmations

**Q29a. Sneezing with clear nasal discharge, animal completely normal.**
> **Medium.**

**Q29b. Does low risk always include booking a consultation?**
> "Observe it **and** book an appointment with a vet soon, because even if it is not a situation
> of immediate risk or a life-threatening emergency, the animal is still showing some symptom
> that is not normal to have, so they should take it in for the peace of mind of the owner and of
> the clinician who sees that patient."

**Q29c. Cat versus dog differences the system must always keep in mind.**
> **Cats:** extreme lethargy or hiding away a lot; jumped from a height and apparently is fine,
> but may not be.
> **Dogs:** gastric dilatation and volvulus.
> **Both:** accidents or trauma; violent fights with other animals; violence from humans;
> problems during birth and very long labour (**more than 2 hours**); newborn kittens or puppies
> that stop nursing or cry a lot; poisonings or intoxications; diarrhoea and vomiting;
> heatstroke; foreign body ingestion; seizures; respiratory difficulty.

---

### Closing: the veterinarian's warnings (product requirements, non-negotiable)

**Q30. What worries you about a tool like this?**
> - I do not want the tool to **replace veterinary diagnosis**, or people to stop consulting the
>   vet, who is the only one who can diagnose and medicate.
> - I do not want veterinarians to **feel threatened** by a tool like this, but rather for it to
>   be **a help in their daily practice**.
> - I do not want **legal problems** from owners misinterpreting what the tool tells them and
>   then, if something happens to the animal, blaming the tool or trying to start legal
>   proceedings.

**Translation into product requirements:**
1. Every result must reinforce that the app **guides**, it does not diagnose, and that the
   veterinarian is the only one who diagnoses and medicates. The disclaimer already exists; it
   must be visible at all three levels, not only at high.
2. **Low risk can never read as "does not need a vet"** (see Q29b): it always includes booking a
   consultation. This is exactly what stops the tool replacing the consultation.
3. Pro-veterinarian positioning: the referral summary (Q27) and the clinical history are designed
   so the owner arrives better prepared for the consultation, not so they avoid it.
4. Legal risk: keep the asymmetry (when in doubt, escalate), promise no outcomes, do not medicate
   or diagnose, and retain the record of what the app said in each case.

---

## FINAL CORRECTIONS FROM THE VETERINARIAN (these govern over everything above)

> These corrections were made at the close of the session, after she read the full summary.
> **Wherever they contradict an earlier answer, this section wins.** The developer must implement
> these values, not those in Q2, Q3 or Q14.

### C1: the three levels, redefined

- **LOW:** observe over a window of **24 to 48 hours**, provided the animal:
  - keeps a **normal, alert demeanour**,
  - **breathes well**,
  - performs its **normal functions**,
  - and **shows no pain**.
  (This applies both by day and at night.) If any of those conditions fails, it is no longer low.
- **MEDIUM:** **check every hour**. If it **worsens**, take it to the vet **now**, without waiting
  out the 6 to 12 hours. If it **does not worsen or improves**, keep checking through the
  **next 6 to 12 hours** to decide.
  (That is: medium is **not** a mandatory appointment at 6 to 12 hours, it is an active
  observation window with a decision point at the end, or immediately if it worsens.)
- **HIGH:** right now, do not wait.

### C2: vomiting and diarrhoea threshold, redefined

- **1 vomit** or **1 episode of diarrhoea** → **MEDIUM**.
- **More than that** (2 or more episodes) → **HIGH**.

> This **replaces** answer Q14 (where 2 vomits with a good general state stayed at medium). The
> veterinarian's final criterion is more escalating: from the second episode onward, high.

### C3: what still stands from the earlier answers

- The **general state** gate (eating, drinking, bright, normal functions, no pain, breathing well)
  remains the axis of everything.
- **Q29b explicitly confirmed after C1** (it is no longer pending): at low risk the owner
  **is** advised to book an appointment with the vet "for peace of mind". Correction C1 only
  changed the observation window, it did not remove the consultation. Therefore the app's low-risk
  text can never read as "does not need a vet".
- The cut-off rule from Q21 (more than one vomit within a couple of hours **plus** being down: do
  not ask anything else, take it in now) is consistent with C2 and stands.
- The patient modifiers (Q16, Q17) still **shorten the observation window**, without raising the
  level.

---

### Derived calibration notes (developer interpretation, to be validated)

- **General state is the main gate, not the isolated symptom.** Eating, drinking, bright, normal
  functions: that is what lowers the level. The same symptom in an animal that is down or not
  eating raises the level.
- **Low risk does NOT mean "does not need a vet".** In all four examples in Q7 the veterinarian
  always adds a non-urgent consultation ("in the next few days", "soon", "at the next visit"). The
  app's current low-risk text does not say this and has to be adjusted.
- **Resolved symptom versus ongoing symptom.** An isolated episode that has already passed with
  the animal well is low; the same symptom still ongoing is medium. Duration and resolution move
  the level.
- **The medium-risk window is 6 to 12 hours, not 24.** The app's current text ("within 24 hours")
  contradicts the veterinarian's criterion.
- **Low-risk observation window:** check every 2 hours during the day; at night, observe and
  reassess in the morning.
- **Witnessed ingestion of something NOT toxic, with an asymptomatic animal, is medium, not high.**
  The system currently forces high on any mention of having eaten something. Still to be pinned
  down in the toxins block.
- **A small knock with no vital compromise and no bleeding is medium.** The system currently
  forces high on any mention of a knock or a fall.
