# PitsyPet: Business Proposal

**NIT3274 Small IT Business — Assessment 2, Part A**

Project title: PitsyPet — an AI-powered veterinary symptom-triage platform
Group number: 4
Group members: Andres Henao (s8103043) — Project Lead & Manager · Adnan Sami (s8121184)

*The financial figures below are founder projections built on real operating costs and clearly stated assumptions. They are illustrative and to be validated.*

---

## 1. Executive Summary

**Company information.** Every year, thousands of Australian pet owners face the same worrying question late at night: is this an emergency, or can it wait until morning? PitsyPet was built to answer that in minutes. It is an Australian software (SaaS) business running an AI-powered veterinary symptom-triage platform for dog and cat owners, set up as a Proprietary Limited company (Pty Ltd) — a structure that gives its two founder-shareholders limited liability and room to take on investment as the business grows. PitsyPet is an educational triage tool, not a diagnosis: it helps owners decide whether a symptom can be watched at home, needs a vet visit, or is an emergency.

**Market opportunity.** Around 73% of Australian households own a pet (Animal Medicines Australia, 2025), and they spend an estimated AUD $1,600–$3,000 a year on pet care. Emergency consultations often cost AUD $180–$350 or more (PetCloud, 2025), after-hours access is limited (especially in rural areas), and owners frequently struggle to judge how urgent a symptom is. No current product gives them an immediate, round-the-clock, personalised assessment without paying first. That is the gap PitsyPet fills.

**Financial data.** The platform runs on a lean, mostly free-tier cost base. On conservative freemium assumptions, projected first-year revenue is about AUD $12,600 against roughly AUD $5,800 in operating costs, leaving a net profit after tax of about AUD $5,100. This points to an early path to profitability and a model that scales without heavy overhead.

## 2. Environment and Industry Analysis

**Target customers.** PitsyPet is for Australian dog and cat owners who want fast, reliable guidance the moment their pet shows symptoms. The strongest demand comes from younger and less-experienced owners, budget-conscious owners, and people in rural or after-hours situations where a vet is hard to reach.

**Competitors.** PetMD's Symptom Checker gives only generic information — no AI triage, no risk rating. Telemedicine services such as FirstVet and Joii charge around AUD $50–$80, require payment upfront, involve waiting, and offer no triage before the consultation. General pet apps like VetStreet handle reminders and articles but do not assess symptoms. A plain Google search returns results that are not tailored to the pet, vary widely in quality, and sometimes spread misinformation. None of them bring immediacy, personalisation, safety and a free starting point together.

**Market forces.** Several trends push demand upward: pet ownership keeps rising, veterinary costs keep climbing (leading some owners to delay or skip visits, per KenResearch, 2024), after-hours and rural access stays limited, and people are increasingly comfortable using digital health tools. The main obstacle is trust in an AI health tool — which PitsyPet answers directly through a safety-first design, clear clinical reasoning and plain disclaimers.

**Product outlook and potential.** PitsyPet is launching in Australia, where English-language AI performs well and RSPCA and AVA guidelines give solid clinical grounding, on an architecture that can extend to other markets later. The freemium model leaves room to grow into premium subscriptions, with a natural path to add more species and partner with veterinary clinics.

## 3. Products or Services

**Does the solution satisfy the target market?** Yes. PitsyPet gives a worried owner an immediate, personalised, round-the-clock assessment at no upfront cost — exactly the "should I go to the vet?" question the market cannot answer today.

**Look, feel, features and benefits.** At its centre is a conversational AI assessment: the owner describes symptoms in ordinary language, the system extracts them as the conversation goes, and it returns a colour-coded risk level (Low, Medium or High) with plain-English reasoning and level-appropriate advice — home first-aid for Low, and 24/7 emergency contacts for the owner's state for High. Around that core, owners get multi-pet profiles, a per-pet clinical history hub (medications, vet clinics and doctors, appointments, follow-ups and active-symptom tracking), an assistant that drafts records for the owner to confirm, searchable history, and a vet-ready PDF export with an AI handover summary. Every assessment draws on curated Australian veterinary guidelines (RSPCA and AVA) through retrieval-augmented generation (RAG), so its advice is grounded in verified clinical sources rather than generic AI output. The interface is mobile-first and built to finish a first assessment in under five minutes.

**What makes it unique (USP).** PitsyPet is the only tool that combines immediate, round-the-clock, personalised, free-to-start and safety-first triage in one place. Its real edge is clinical safety: a deterministic safety override that always escalates a genuine emergency, a rule-based backup if the AI is unavailable, and triage logic calibrated with a practising vet.

## 4. Compliance

The founders have chosen a Proprietary Limited (Pty Ltd) structure; the next formal step is to register the company with ASIC (which issues its ACN, still to be registered) and obtain an Australian Business Number (ABN, still to be registered). The company then lodges an annual company tax return at the 25% base-rate-entity rate (turnover under $50M). GST registration becomes compulsory once annual turnover reaches AUD $75,000; since first-year revenue sits below that, the company registers voluntarily until it nears the threshold. Because the platform holds personal information, it follows the Privacy Act 1988 and the Australian Privacy Principles, with a published privacy policy and terms of use. Given the health-adjacent nature of the service, it carries combined professional-indemnity and public-liability insurance (about AUD $1,200 a year). A clear legal disclaimer sits on every result ("PitsyPet is an educational tool only and does not replace professional veterinary diagnosis…"). Technically, the safeguards are already in place: encrypted transport (TLS), parameterised queries and row-level security that block SQL injection and cross-tenant access, plus rate limiting and bot protection.

## 5. Marketing, Research and Evaluation

**Target market.** As described in Section 2: Australian dog and cat owners needing fast guidance, with a core of younger, budget-conscious, and rural/after-hours owners.

**Branding.** The "PitsyPet" brand aims for a calm, trustworthy, plain-spoken identity that suits an anxious owner in a stressful moment. *[In development — final deliverable pending: logo, colour palette and brand guide.]*

**Unique selling proposition.** Immediate, round-the-clock, personalised, free-to-start, safety-first triage.

**Look, feel and features.** A clean, mobile-first, accessible interface (WCAG 2.1 AA), colour-coded risk badges, and a five-minute conversational flow.

**Advertising and promotion.** The Year-1 promotional budget is about AUD $1,000 — above the usual 1–3% of sales early on to fund acquisition, settling back toward 1–3% as revenue grows. The plan leans on low-cost, high-intent channels: organic SEO and content (the platform is built to be found in search), an active social-media presence, and word-of-mouth through pet-owner communities and local vets. The site and app also carry marketing-supporting features: social-media links, emergency-vet location maps, and clear graphics.

## 6. Manufacturing & Operations Plan, Management Team, Timeline, Exit Strategy

**Management team.** Two founders run the business. Andres Henao (s8103043) is Project Lead and Manager, owning project management, delivery, technical architecture, full-stack development and the AI triage engine. Adnan Sami (s8121184) covers testing and QA, documentation, and marketing and research. Together the team brings full-stack development, AI integration, quality assurance and product operations.

**M&O framework.** PitsyPet runs as a single Next.js full-stack application on Vercel, with Supabase (PostgreSQL, pgvector, Auth and row-level security) as the data layer, Claude models handling symptom extraction and risk classification, and OpenAI embeddings with pgvector powering RAG knowledge retrieval. Development uses version control (GitHub) and continuous deployment. Three challenges shape the build: never under-triaging a real emergency, keeping the veterinary knowledge trustworthy, and controlling AI running costs — met, respectively, by the safety override, the vet-calibrated RAG knowledge base, and Redis rate limiting with a daily cost cap.

**System integration testing and data collection.** Quality rests on 136 automated tests (including a triage-safety regression set), production monitoring (Sentry for errors, PostHog for analytics, UptimeRobot on a health check), and a structured veterinarian-calibration process for the triage logic. User-acceptance testing with real owners captures satisfaction feedback.

**Proposed timeline.** The MVP came together over about 25 weeks, moving through set phases: environment, database, authentication, pet profiles, the AI triage engine, results and recommendations, the clinical-history hub, security, testing and monitoring. User-acceptance testing and refinement close out the plan.

**Exit strategy.** The plan is to grow the freemium base and recurring premium revenue, then pursue a strategic acquisition by a pet-health, pet-insurance or veterinary-technology company. Failing that, the fallback is steady independent growth on premium subscriptions and clinic partnerships.

## 7. Financial Plan

**Assumptions (Year 1).** Premium subscription sits at AUD $9.99 a month, just under the AUD $10–$30 range pet-telehealth apps charge. Free basic triage builds a base of roughly 6,000 registered users, and a 3.5% freemium conversion (industry norm 2–5%) yields about 210 premium subscribers by month 12, or roughly 105 paying on average across the ramp. The founders contribute their time as sweat equity (no salary in Year 1) plus AUD $3,000 of seed capital. Cost figures use real market rates: AI APIs ~$1,800/yr; hosting, database and monitoring on free tiers (~$120 buffer); domain and tools ~$100; ASIC registration and annual review ~$940; Stripe fees (1.7% + $0.30) ~$650; marketing ~$1,000; combined insurance ~$1,200.

**Income Statement (projected, AUD)**

| Item | Year 1 |
|---|---|
| Revenue, premium subscriptions | 12,600 |
| AI APIs (Claude + OpenAI) | (1,800) |
| Hosting / database / monitoring | (120) |
| Domain & tools | (100) |
| ASIC registration & annual review | (940) |
| Payment processing (Stripe) | (650) |
| Marketing & promotion | (1,000) |
| Insurance (PI + public liability) | (1,200) |
| **Net profit before tax** | **6,790** |
| Company tax (25% base-rate entity) | (1,698) |
| **Net profit after tax** | **5,092** |

**Cash Flow Projection (projected, AUD)**

| | Q1 | Q2 | Q3 | Q4 | Year 1 |
|---|---|---|---|---|---|
| Opening cash | 3,000 | 1,500 | 3,000 | 5,900 | 3,000 |
| Subscription inflows | 1,000 | 2,600 | 4,000 | 5,000 | 12,600 |
| Operating outflows | (2,500) | (1,100) | (1,100) | (1,110) | (5,810) |
| Net cash flow | (1,500) | 1,500 | 2,900 | 3,890 | 6,790 |
| **Closing cash** | 1,500 | 3,000 | 5,900 | **9,790** | 9,790 |

*Company tax (AUD 1,698) accrues and is settled after year-end.

**Balance Sheet (projected, end of Year 1, AUD)**

| Assets | | Liabilities & Equity | |
|---|---|---|---|
| Cash at bank | 9,790 | Tax payable | 1,698 |
| | | Share capital (founders) | 3,000 |
| | | Retained earnings | 5,092 |
| **Total assets** | **9,790** | **Total liabilities & equity** | **9,790** |

The freemium plan gives PitsyPet a recurring-revenue base with steady monthly income, and the $9.99 price uses psychological ("odd") pricing. The business breaks even at around 50 premium subscribers — well short of the 210 targeted for Year 1 — so it becomes viable early. Taken together, the numbers describe a low-overhead SaaS where modest recurring revenue clears a lean cost base, turns a profit inside the first year, and retains cash to reinvest. After Year 1, revenue grows with the free-user base while infrastructure costs stay almost flat, so margins improve. Stripe processing starts only with the premium tier, costing money only once revenue comes in.
