# DovvyBuddy (AI Diving Bot) — Product Specification Document (PSD) — V3

## 1. Overview

### 1.1 Product Summary

DovvyBuddy is a web-based AI assistant that helps **aspiring and recreational divers** at every stage of their diving journey. It provides:

- **Learn-to-dive guidance** for non-certified users considering PADI Open Water certification (course structure, expectations, fears).
- **Certification advancement support** for Open Water divers exploring Advanced Open Water and beyond.
- **High-context guidance** about covered destinations, dive sites, marine life highlights, beginner diving education (incl. PADI Open Water expectations), and logistics.
- **Simple, profile-aware suggestions** based on experience level, certification, dates/window, and interests.
- **High-level safety context** (e.g., difficulty vs diver profile, general no-fly concepts), always with clear disclaimers.
- **Qualified lead capture** for partner dive shops/schools (training and trip inquiries), but **no booking flow**.

The initial public version is a **web chatbot only**, with intentionally small, high-quality coverage.

### 1.2 Goals

- G-01: Provide confidence-building support for **non-certified individuals** considering PADI Open Water (or equivalent) certification, and generate training leads.
- G-02: Help **Open Water certified divers** understand and pursue Advanced Open Water certification, and generate training leads.
- G-03: Help certified divers (OW and AOW) quickly narrow down **where** and **when** to dive, based on their profile and constraints.
- G-04: Provide **trustworthy, destination-specific information** about dive sites, conditions, highlights, logistics, and high-level safety.
- G-05: Generate **qualified, context-rich leads** for partner dive shops/schools (training and trip inquiries).
- G-06: Validate demand with a **limited set of destinations** before scaling.

### 1.3 Non-Goals

- NG-01: **No direct booking** of flights, accommodation, or dives in V1.
- NG-02: **No dive log storage** for users in V1.
- NG-03: **No photo-based marine life recognition** in V1.
- NG-04: **No decompression calculations, medical advice, or technical dive planning** beyond generic, non-personalized guidance and links to authoritative sources.
- NG-05: **No multi-language support** in V1 (English only).
- NG-06: **No B2B dashboards** for dive shops in V1.
- NG-07: **No “global” answers** presented as authoritative (if a destination/site is not covered, the bot must say so).

### 1.4 Scope — Public V1 (Lean)

The V1 scope is sized for **one developer**, low budget, and fast iteration.

**In Scope (V1):**

- Web-based chatbot UI (desktop + mobile web).
- RAG over curated content for:
  - **PADI Open Water certification guide** (course structure, FAQs, common fears).
  - **PADI Advanced Open Water certification guide** (benefits, adventure dives, prerequisites).
  - **1–2 destinations** (start with 1; add the 2nd only after the first is stable).
  - **5–10 dive sites per destination** (with certification-level suitability noted).
  - **2–3 partner shops/schools per destination** (offering both training and guided dives).
  - 1–2 safety reference docs (general + destination-specific if available).
  - 1 logistics/getting-there guide per destination.
  - Optional: 1–2 marine life highlight guides (only if users ask for it frequently).
- Guest-only, **session-based memory** (no user accounts).
- **Inline lead capture** (minimal fields) for both training and trip inquiries, with automated delivery to partner(s).
- Basic analytics (sessions, key funnels, leads by type: training vs trip).
- **Out-of-scope handling** (covered vs not covered destinations; “no booking”; “no medical advice”).
- Basic error handling + operational visibility (see FR-18).

**Explicitly Out of Scope (V1):**

- Flight schedule API integration (defer to V1.1 / Phase 2).
- ML-based recommendation ranking.
- Telegram or other messaging integrations.
- User authentication and profiles.
- Payments/subscriptions.
- Multi-language support.
- Dive logs and media storage.
- B2B dashboards for partner shops.
- Any personalized decompression/safety computations.

---

## 2. Personas (Priority Order)

### P-01 – Prospective New Diver (Primary — Highest Priority)

- **Profile:** Non-certified; curious about scuba diving; may have snorkeled or done a Discover Scuba experience.
- **Goals:** Understand what PADI Open Water certification involves; reduce fear and uncertainty; find a reputable school/instructor.
- **Success:** Clarity on course structure, time commitment, and costs + training lead submitted to a partner school.

### P-02 – Open Water Diver Seeking Advanced Certification (Primary)

- **Profile:** Open Water certified, ~4–20 logged dives; eager to progress to the next level.
- **Goals:** Understand Advanced Open Water course benefits, structure, and prerequisites; find a reputable school for AOW training.
- **Success:** Confident decision to pursue AOW + training lead submitted.

### P-03 – Certified Diver Planning a Dive Trip (Secondary)

- **Profile:** Open Water or Advanced Open Water certified, ~10–100+ logged dives.
- **Goals:** Research destinations, dive sites, conditions, and logistics; get profile-aware recommendations; connect with reputable operators.
- **Success:** Confident destination/site shortlist + warm handoff to a partner dive shop.

### P-04 – Dive Shop Owner / Manager (Indirect)

- **Goal:** Receive fewer, better-qualified leads with context (training and trip inquiries).
- **Success:** Lead includes enough info to quote/advise without repeated back-and-forth.

---

## 3. Key Use Cases (Lean — Priority Order)

### UC-01 — Learn to Dive: Open Water Certification (Primary)

- Non-certified users ask about PADI Open Water course structure, expectations, common fears, time/cost commitments.
- Bot provides grounded, confidence-building answers from curated OW certification content.
- Offer training lead capture (minimal fields) to connect with partner dive schools.

### UC-02 — Advance Your Certification: Open Water → Advanced Open Water (Primary)

- Open Water certified divers ask about AOW course benefits, adventure dive options, prerequisites.
- Bot explains AOW structure and helps user decide if they're ready.
- Offer training lead capture to connect with partner dive schools offering AOW.

### UC-03 — Research a Covered Destination / Dive Sites (Secondary)

- RAG-grounded destination overview, conditions, highlights.
- Suggest 2–5 relevant sites (from the covered set) with certification-level suitability noted.

### UC-04 — Discover Suitable Destination (Covered Set Only)

- Bot asks a few follow-ups and returns **1–3 suggestions from the configured destinations**.
- If user asks about a destination outside coverage, bot explicitly says it is not covered and offers covered options.

### UC-05 — Simple Trip Outline (Optional in V1; Required in V1.1)

- If implemented in V1: produce **a simple 3–5 day outline** (no pricing, no promises, no bookings).
- Otherwise: provide a "what a typical 3–5 day trip looks like" generic outline per destination.

### UC-06 — Capture and Send a Qualified Lead

- Offer 1–3 partner shops/schools.
- Collect minimal lead details (training or trip inquiry), then send via email/webhook.

### UC-07 — Safety / No-Fly / Medical Queries

- Safety-guarded response mode with disclaimers.
- No personalized advice or emergency instructions beyond "contact local emergency services / dive pros".

---

## 4. Functional Requirements (FRs)

### 4.1 Conversation & Session Management

**FR-01 — Web Chat Interface (V1 / Must Have)**  
The system SHALL provide a web-based chat interface for free-text questions and AI-generated responses.

**FR-02 — Session-Based Memory for Guests (V1 / Must Have)**  
The system SHALL maintain conversation state within a user session and expire after inactivity (e.g., 30–60 minutes).

**FR-03 — User-Controlled Reset (V1 / Must Have)**  
The system SHALL allow users to reset/clear the current chat context (e.g., “New chat” button).

### 4.2 Destination Discovery & Recommendations

**FR-04 — Covered-Set Recommendations (V1 / Must Have)**  
The system SHALL recommend destinations/sites **only** from the configured set and provide a short rationale.

**FR-05 — Out-of-Scope Handling (V1 / Must Have)**  
If a user requests:

- an unsupported destination/site, or
- booking/pricing, or
- medical/emergency advice,
the system SHALL clearly state the limitation and redirect to what it can do (covered destinations + referral), without inventing details.

**FR-06 — Dive Site Details (V1 / Must Have)**  
The system SHALL provide concise site descriptions grounded in curated content (difficulty, access type, highlights).

**FR-07 — Simple Trip Outline (V1 / Optional; V1.1 / Should Have)**  
If enabled, the system SHOULD generate a simple high-level multi-day outline (no bookings, no exact timing, no medical/deco advice).

### 4.3 Knowledge Retrieval (RAG) & Content

**FR-08 — RAG over Curated Content (V1 / Must Have)**  
The system SHALL retrieve and ground responses on curated documents for destination, dive sites, logistics, and safety.

**FR-09 — Hallucination Guardrails (V1 / Must Have)**  
When information is missing or uncertain, the system SHALL:

- say it is unknown / not in the current dataset,
- avoid precise numbers,
- suggest what to verify with an operator or official source.

### 4.4 Safety Guidance

**FR-10 — Safety Response Mode (V1 / Must Have)**  
When messages are about safety (flying after diving, medical conditions, decompression, emergencies), the system SHALL:

- use vetted safety content only,
- provide general information only (not personalized advice),
- include a clear disclaimer,
- direct urgent cases to local emergency services / qualified professionals.

The system MUST NOT calculate decompression schedules or recommend personal profiles.

### 4.5 Lead Capture & Routing

**FR-11 — Minimal Inline Lead Capture (V1 / Must Have)**  
The system SHALL capture leads in-chat using a short flow.

- Required: **name, email, destination (or learning location intent)**.
- Strongly recommended (asked only if user continues): travel window, cert level, approximate dives, interests.
- Optional: budget band.

**FR-12 — Lead Storage (V1 / Must Have)**  
Store each lead with timestamp, destination, selected shop(s), and captured context.

**FR-13 — Lead Delivery (V1 / Must Have)**  
Deliver leads to partner shops via:

- email (MVP default), and/or
- webhook (optional, if a partner requests it).

**FR-14 — Consent & Data Use Notice (V1 / Must Have)**  
Before submitting a lead, the system SHALL show:

- what info will be sent,
- which shop(s) will receive it,
- a brief consent statement.

### 4.6 Analytics & Ops

**FR-15 — Core Analytics (V1 / Must Have)**  
Track:

- sessions,
- destination recommendation shown,
- lead flow started,
- lead submitted.

**FR-16 — Basic Reliability (V1 / Must Have)**  
If the model/API fails, the system SHALL:

- show a user-friendly error,
- allow retry,
- log the failure.

**FR-17 — Operator Visibility (V1 / Must Have)**  
The system SHALL provide minimal operational visibility:

- error logs,
- lead delivery status (sent/failed),
- a simple notification path to the founder (e.g., email on lead-send failure).

### 4.7 Integrations

**FR-18 — Flight Schedule API (Out of Scope V1)**  
Defer to V1.1/Phase 2. V1 can optionally provide static “typical access” notes in the logistics guide.

---

## 5. Non-Functional Requirements (NFRs)

**NFR-01 — Performance**  
P95 chat response time SHOULD be ≤ 10 seconds.

**NFR-02 — Availability (V1 target)**  
Target 99.0% monthly (best effort for MVP).

**NFR-03 — Data Privacy & Retention**  

- Leads retained for 12 months (or partner-defined policy).
- Raw session logs retained for **30–90 days** max, then anonymized or deleted.
- Provide a minimal privacy notice on the landing page and before lead submission.

**NFR-04 — Security**  

- HTTPS required.
- Secrets stored securely.

**NFR-05 — Safety & Compliance**  

- Clear “not medical advice / not a substitute for training” messaging.
- Safety responses only from vetted sources; no personalized decompression advice.

**NFR-06 — Content Quality**  

- Curated content reviewed before release.
- Version content changes (even simple Git history is sufficient).

---

## 6. Architecture & Data Model (Simplified)

### 6.1 Recommended V1 Architecture (Single Codebase)

Goal: minimize moving parts for a solo founder.

- **Single web app** (recommended: Next.js with server routes *or* a single Python web app) that handles:
  - chat UI,
  - chat orchestration,
  - retrieval,
  - lead capture + delivery,
  - analytics events.
- **Single database** (Postgres recommended) used for:
  - leads,
  - partner shops,
  - destinations/sites (minimal structured fields),
  - optional session metadata.

**Retrieval Options (pick one for V1):**

- Option A (simplest to operate): small RAG corpus stored as files + an embedded index (local vector search) inside the app.
- Option B (still simple): Postgres + pgvector / managed vector (only if you’re already using a managed Postgres).

Avoid running a separate vector DB service for V1 unless you already have it for free and it’s trivial to operate.

### 6.2 Data Model (Lean V1)

**Destination**: `id`, `name`, `country`, `is_active`  
**DiveSite**: `id`, `destination_id`, `name`, `difficulty_band`, `access_type`, `is_active`  
**DiveShop**: `id`, `destination_id`, `name`, `contact_email`, `website_url`, `is_partner`, `is_active`  
**Lead**: `id`, `created_at`, `name`, `email`, `destination_id` (nullable for “learn to dive”), `preferred_shop_id` (nullable), `context_json`, `delivery_status`  
**Session (optional)**: `id`, `session_token`, `created_at`, `last_activity_at`

`context_json` stores optional details (cert level, dives, window, interests) without forcing schema complexity.

---

## 7. UX / UI Notes (MVP)

- Landing page must clearly state:
  - what’s covered (destinations),
  - what’s not (no booking, no medical advice),
  - privacy/lead handling.
- Chat layout: single column chat + a visible “New chat” control.
- Safety: inline disclaimer whenever safety topics arise + a persistent “Safety & Disclaimer” link.
- Lead capture:
  - keep it short (name + email + destination intent first),
  - ask optional qualifiers only after the user commits.

---

## 8. Constraints & Assumptions

- Solo founder build.
- Low budget; maximize managed services and templates.
- Small curated dataset; explicit non-coverage for everything else.
- Information + referral only; no booking engine; no authority on safety.

---

## 9. Open Questions (Trimmed)

**OQ-01 — Initial Destination List**  
Pick **Destination #1** to ship first; Destination #2 only after stability.

**OQ-02 — Lead Delivery Default**  
Email first; webhook only if a partner requests it.

**OQ-03 — Lead Response Expectation**  
No SLA promise in V1 unless you can monitor/enforce it.

**OQ-04 — Analytics Tool**  
Pick a minimal analytics tool that’s quick to integrate.

---

## 10. Success Metrics (More Realistic for V1)

- ≥ 10 weekly active users by end of month 2.
- ≥ 2 qualified leads/week by end of month 2 (training leads are the primary goal).
- **At least 60% of leads are training-related** (OW or AOW certification inquiries) — reflects our primary focus on certification pathways.
- Qualitative: users report the answers feel grounded and limitations are clear.
- At least 1 partner school confirms the lead quality is higher than generic inquiries.

---

## 11. Acceptance Criteria (Adjusted)

- **OW certification questions** answered with grounded, confidence-building content (primary priority).
- **AOW certification questions** answered with helpful guidance on course benefits and prerequisites (primary priority).
- Training lead capture works end-to-end (OW and AOW inquiries).
- Covered-set destination/site recommendations only (for certified divers planning trips).
- Out-of-scope responses clearly decline and redirect.
- Lead submission (training and trip) works end-to-end, and failures are visible to the founder.
- Safety mode always includes disclaimer and avoids personalized advice.
- Users can reset context.

---

## 12. Release Plan & Roadmap (Adjusted)

### Phase 0 — Internal MVP (1 destination)

- 1 destination, 5–8 sites, 2 shops.
- RAG + safety guardrails + basic lead capture.
- Manual review of logs.

### Phase 1 — Public V1 (Lean)

- Harden reliability, lead delivery, analytics.
- Add Destination #2 only if Destination #1 is stable and used.

### Phase 2 — Enhancements

- Trip outline improvements (if not in V1).
- Flight schedule API (optional).
- User profiles (magic-link).

Later phases remain similar, but should be driven by observed user demand rather than planned scope.
