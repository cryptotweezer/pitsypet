# PitsyPet — Web App Must-Haves for Assessment (Dev Checklist)

**For:** Development · **Source:** `assessment_2.md` → Part B (Implementation & Demonstration) · **Rule:** every item below is graded, so none can be missing at demo time.

---

## ✅ Mandatory — MUST be visible/working on the web app

- [ ] **Temporary ABN/ACN number** displayed on the site (e.g. footer / "About" / Contact page).
- [ ] **Contact Us page** — reachable from the nav (form or email + basic details).
- [ ] **Online payment method — use Stripe** (Stripe Checkout) for the **premium subscription ($9.99/mo)** — must complete a **single payment** in the demo.
- [ ] **Bill / receipt generation** after a successful payment — use Stripe's built-in email receipt and/or an on-screen confirmation page with the payment details.
- [ ] **List of available services** shown clearly (the triage assessment, clinical-history hub, vet PDF export, premium features, etc.).
- [ ] **Marketing & promotion of the product** on the site (landing/hero, feature highlights, pricing, calls-to-action).
- [ ] **Disclaimer text** displayed verbatim: **"This website/app is for a class assignment and not for commercial purposes"** (separate from the medical/educational disclaimer — this specific line is required).

## ⭐ Bonus marks — include if possible (extra points in the rubric)

- [ ] **Link(s) to social media** (header or footer icons).
- [ ] **Location map(s)** — e.g. an embedded map of nearby / 24-7 emergency vet clinics.
- [ ] **Attractive graphics** — polished, consistent visuals (ties into the pending **branding** work: logo, colour palette, imagery).

## 🎯 Look & feel (graded criteria — keep in mind while building)

- [ ] **Functional** — well-designed, clear layout.
- [ ] **Aesthetically pleasing** — appealing without being overwhelming.
- [ ] **Intuitive** — easy to read and understand.
- [ ] **Simple** — memorable and meaningful.
- [ ] **Responsive** — works cleanly on mobile and desktop (demo will likely be on a phone-sized view).

## 🔗 Design must align to (so the demo tells one story)

- [ ] The **problem statement** (owners can't judge how urgent a symptom is).
- [ ] The **customer profile** (Australian dog/cat owners; younger, budget-conscious, rural/after-hours).
- [ ] The **core value proposition** (immediate, 24/7, personalised, free-to-start, safety-first triage).
- [ ] Information **flows** with no dead ends or major bugs.

## 📝 Notes

- **Payments — Stripe in Test Mode:** implement the real Stripe Checkout integration but run it with **test API keys** (`pk_test_…` / `sk_test_…`) for the demo. Pay with Stripe's test card **`4242 4242 4242 4242`** (any future expiry, any CVC, any postcode) → the payment completes exactly like a real one, no real money moves, and Stripe issues a receipt. Going live later = swap test keys for live keys + activate the account; the code stays the same. No PayPal needed.
- **ABN/ACN is temporary/placeholder** for the class project — it only needs to be *displayed*, not a real registered number.
- **Two disclaimers, both present:** (1) the required class-assignment line above, and (2) the existing medical/educational disclaimer ("educational tool only, not a diagnosis").
- **Optional 10 bonus marks:** a **mobile app** earns +10. We are delivering a web app — flag if we want to pursue a mobile version.
- **Demonstration:** 10-min demo + 5-min Q&A; must cover all key requirements, highlight key features, and show **both team members contributing**.
