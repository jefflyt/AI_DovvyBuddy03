# DovvyBuddy — MASTER PLAN

**Document Version:** 1.0 **Date:** 17 December 2025 **Based on:** DovvyBuddy-
PSD-V3.md **Prepared for:** Solo Founder, Full-Stack Web Application

---

## 1. Product Summary (from PSD)

### Problem Statement

Recreational divers struggle to research and plan dive trips efficiently. They
need trustworthy, destination-specific information about dive sites, conditions,
marine life, and logistics, matched to their experience level and interests.
Partner dive shops receive low-quality leads that require extensive back-and-
forth to qualify.

### Target Users

- **P-01 – Prospective New Diver (Primary — Highest Priority):** Non-certified; curious about scuba diving; considering PADI Open Water certification
- **P-02 – Open Water Diver Seeking Advanced Certification (Primary):** Open Water certified, ~4–20 logged dives; eager to progress
- **P-03 – Certified Diver Planning a Dive Trip (Secondary):** Open Water or Advanced Open Water certified, ~10–100+ logged dives
- **P-04 – Dive Shop Owner / Manager (Indirect):** Indirect persona needing qualified leads with context

### Value Proposition

DovvyBuddy is a web-based AI assistant that helps **aspiring and recreational divers** at every stage of their diving journey. It provides **high-context guidance** about covered destinations, dive sites, marine life highlights, beginner diving education (incl. PADI Open Water expectations), and logistics. It offers **simple, profile-aware suggestions** based on experience level, certification, dates/window, and interests, and generates **qualified, context-rich leads** for partner dive shops/schools—without booking functionality.

### Core Features (Grouped Logically)

1. **Conversational Discovery:** Web chatbot with session-based memory, profile-
aware recommendations
2. **Destination Intelligence:** RAG-grounded information on covered
destinations, dive sites, marine life, logistics
3. **Safety Guidance:** High-level safety context with disclaimers; no
medical/decompression advice
4. **Qualified Lead Generation:** Inline lead capture with context + automated
delivery to partners
5. **Learn-to-Dive Support:** PADI Open Water guidance + training lead capture

### Non-Functional Requirements

- **Performance:** P95 chat response ≤ 10 seconds (PSD NFR-01)
- **Availability:** 99.0% monthly target for V1 (PSD NFR-02)
- **Data Privacy:** Lead retention 12 months; session logs 30–90 days max (PSD
NFR-03)
- **Security:** HTTPS required; secure secrets storage (PSD NFR-04)
- **Safety Compliance:** Vetted sources only; clear disclaimers (PSD NFR-05)
- **Content Quality:** Curated content reviewed and versioned (PSD NFR-06)

### Explicit Constraints

- Solo founder build (PSD §8)
- Low budget; maximize managed services (PSD §8)
- Small curated dataset: 1–2 destinations, 5–10 sites per destination (PSD §1.4)
- English only for V1 (PSD §1.3, NG-05)
- No booking engine (PSD §1.3, NG-01)
- No user accounts in V1 (PSD §1.4)
- No medical/decompression advice (PSD §1.3, NG-04)

---

## 2. Goals, Success Criteria, and Constraints

### Product Goals

**Business/Impact Goals:**

1. Provide confidence-building support for **non-certified individuals** considering PADI Open Water (or equivalent) certification, and generate training leads (PSD G-01)
2. Help **Open Water certified divers** understand and pursue Advanced Open Water certification, and generate training leads (PSD G-02)
3. Help certified divers (OW and AOW) quickly narrow down **where** and **when** to dive, based on their profile and constraints (PSD G-03)
4. Provide **trustworthy, destination-specific information** about dive sites, conditions, highlights, logistics, and high-level safety (PSD G-04)
5. Generate **qualified, context-rich leads** for partner dive shops/schools (training and trip inquiries) (PSD G-05)
6. Validate demand with a **limited set of destinations** before scaling (PSD G-06)

**Timeframe Expectations:**

- **Phase 0 (Internal MVP):** 1 destination operational within 4–6 weeks
- **Phase 1 (Public V1):** Public launch by end of month 2 (PSD §12)
- Target ≥10 weekly active users and ≥2 qualified leads/week by end of month 2, with **at least 60% being training-related** (PSD §10)

### Success Criteria

**MVP Ready Criteria:**

1. **Functional Chat:** Users can ask questions and receive RAG-grounded
responses for at least 1 destination with 5+ dive sites
2. **Covered-Set Enforcement:** System correctly identifies and declines out-of-
scope requests (destinations, booking, medical advice) per PSD FR-05
3. **Lead Capture & Delivery:** At least 1 test lead successfully captured and
delivered to partner shop via email (PSD FR-11, FR-13)
4. **Safety Guardrails:** Safety-related queries trigger disclaimer mode and
avoid personalized advice (PSD FR-10)

**Technical Health Criteria:**
5. **Reliability:** Error handling for model/API failures with user-friendly
messaging and retry capability (PSD FR-16)
6. **Observability:** Error logs accessible; lead delivery status tracked;
founder receives notification on failures (PSD FR-17)
7. **Testing:** Core RAG retrieval, lead capture flow, and out-of-scope handling
covered by integration tests
8. **Performance:** P95 response time ≤ 10 seconds validated under light load
(PSD NFR-01)

### Constraints & Assumptions

**Constraints (from PSD):**

- Solo founder, full-stack web app (PSD §8)
- Must use managed services where possible to minimize operational overhead (PSD
§8)
- Must clearly disclaim limitations: no booking, no medical advice, covered
destinations only (PSD §1.3, FR-05)
- HTTPS required; secrets securely stored (PSD NFR-04)

**Assumptions (Explicit):**

1. **Tech Stack:** Next.js (TypeScript) for frontend/backend; PostgreSQL for
data; OpenAI API for LLM; simple file-based vector search for RAG (see §3 for
justification)
2. **Traffic/Scale:** < 100 concurrent users for V1; traffic primarily from
organic search and partner referrals
3. **Data Volume:** ~10–20 curated content documents (destinations, sites,
safety, logistics) totaling < 100 pages
4. **Partner Integration:** Email-based lead delivery sufficient for V1; webhook
support deferred unless partner requests it (PSD OQ-02)
5. **Hosting:** Cloud PaaS (Vercel for app, managed Postgres) for simplicity and
low ops overhead
6. **Analytics:** Simple event tracking via Vercel Analytics or similar; no
complex analytics platform for V1 (PSD OQ-04)

---

## 3. Architecture & Technology Stack

### Frontend

**Framework:** **Next.js 14+ (App Router, TypeScript, React)**

**Justification:**

- Solo founder simplicity: single codebase for frontend + backend (API routes)
- Built-in SSR/SSG for landing page SEO
- Strong ecosystem for chat UI components
- TypeScript for maintainability

**Routing & Structure:**

- `/` — Landing page (static or SSR) with clear coverage/limitation messaging
- `/chat` — Main chat interface (client component with streaming support)
- `/api/*` — Server-side API routes for chat orchestration, lead submission, RAG
retrieval

**State Management:**

- Local React state + Context API for session-based chat history
- No Redux/Zustand needed for V1 scope
- Session stored in browser (localStorage/sessionStorage) with 30–60 min expiry

**Styling Approach:**

- **Tailwind CSS** for rapid UI development
- Minimal design system (color palette, typography, spacing tokens)
- Mobile-first responsive design (PSD §7: desktop + mobile web)
- Consider shadcn/ui or similar for chat UI components (bubbles, input, buttons)

---

### Backend

**Framework:** **Next.js API Routes (TypeScript, Node.js runtime)**

**Justification:**

- Collocated with frontend; no separate backend deployment
- Serverless-friendly for cost efficiency
- Sufficient for chat orchestration, RAG, and lead processing

**API Style:** REST (simple JSON endpoints)

**Layering:**

- **API Routes** (`/api/chat`, `/api/leads`): Request validation, auth (future),
response formatting
- **Services Layer:** `ChatService`, `RAGService`, `LeadService`,
`SafetyGuardService`
  - `ChatService`: Orchestrates conversation flow, session context, LLM calls
(GROQ for Phase 0, migration path planned)
  - `RAGService`: Retrieval using Google AI SDK (Gemini embeddings), reranking,
context injection
  - `LeadService`: Validation, storage, delivery (email/webhook)
  - `SafetyGuardService`: Detect safety topics, inject disclaimers
- **Data Access Layer:** Prisma ORM for PostgreSQL; utility wrappers for vector
search
- **Domain Model:** Lightweight entities (Destination, DiveSite, DiveShop, Lead,
Session)

**Background Jobs:**

- **Not required for V1** (lead delivery is inline; defer async processing to
V1.1 if latency becomes an issue)
- Optional: Simple cron job (Vercel Cron or external) for analytics rollup or
session cleanup

---

### Data

**Primary Database:** **PostgreSQL (Managed, e.g., Vercel Postgres, Supabase, or
Neon)**

**Justification:**

- Relational model fits structured data (destinations, sites, shops, leads)
- Excellent tooling and community support
- Managed options reduce ops overhead
- Optional pgvector support if needed (see below)

**ORM/Query Framework:** **Prisma**

**Justification:**

- Type-safe queries with TypeScript
- Auto-generated client from schema
- Built-in migrations
- Great DX for solo founder

**Data Modeling Approach:**

- **Single-tenant** (no org/team isolation needed for V1)
- **Entities:**
  - `Destination`: `id`, `name`, `country`, `is_active`, `created_at`,
`updated_at`
  - `DiveSite`: `id`, `destination_id`, `name`, `difficulty_band`,
`access_type`, `is_active`, `created_at`, `updated_at`
  - `DiveShop`: `id`, `destination_id`, `name`, `contact_email`, `website_url`,
`is_partner`, `is_active`, `created_at`, `updated_at`
  - `Lead`: `id`, `created_at`, `name`, `email`, `destination_id` (nullable for
learn-to-dive), `preferred_shop_id` (nullable), `context_json` (JSONB for
flexible fields), `delivery_status`, `delivered_at`
  - `Session` (optional for V1): `id`, `session_token`, `created_at`,
`last_activity_at`, `context_json` (for multi-turn state)
- Use `context_json` (JSONB) to avoid schema churn for optional lead fields
(cert level, dives, window, interests)

**Vector Search Approach (RAG):**

- **Chosen Approach:** Google AI SDK (Gemini) for embeddings with file-based
storage
  - Store curated content as markdown files in `/content` directory
  - Pre-generate embeddings offline using Google AI SDK (`@google/generative-
ai`) with Gemini embedding models
  - Store embeddings as JSON file with metadata (chunk text, source file, chunk
ID)
  - Use simple cosine similarity in-memory for retrieval
  - **Pros:** High-quality embeddings from Gemini; no additional infrastructure;
free tier generous for V1 scale
  - **Cons:** Limited scalability (acceptable for 10–20 documents)

- **Future Option (Phase 2+):** Migrate to pgvector if content grows beyond 50
documents
  - Add `ContentChunk` table with `embedding` vector column
  - Use pgvector for similarity search
  - **Pros:** Single DB; good for scale
  - **Cons:** Requires managed Postgres with pgvector support

**Migrations Strategy:**

- Prisma Migrate for schema versioning
- Migrations committed to Git
- Apply migrations via CI/CD or manual `npx prisma migrate deploy` in production
- Seed script for initial destinations, sites, shops

---

### Auth & Security

**Authentication Approach (V1):**

- **Guest-only; no user accounts** (PSD §1.4)
- **Session-based identification:** Generate anonymous session token on first
visit; store in browser (cookie or localStorage)
- Optionally persist session metadata in DB for analytics/context retention
(30–60 min expiry)

**Future (V1.1+):**

- Magic-link email authentication (no passwords)
- User profiles to store preferences, conversation history

**Authorization Model (V1):**

- Not applicable (no user accounts, no protected resources)
- Future: simple role-based (user vs admin for partner dashboard)

**Security Measures:**

- HTTPS enforced (handled by Vercel/PaaS)
- Secrets stored in environment variables (`.env.local` for dev, Vercel env vars
for prod)
- Rate limiting on API routes (prevent abuse): e.g., 20 requests/minute per
session token
- Input validation and sanitization (Zod schemas for API payloads)
- CORS configured for web app only

**Data Protection:**

- Lead data retained per PSD NFR-03: 12 months (or partner-defined policy)
- Session logs: 30–90 days max, then anonymized or deleted
- Privacy notice on landing page and before lead submission (PSD FR-14)

---

### Infrastructure & Deployment

**Hosting Model:**

- **Platform:** **Vercel** (Next.js optimized; serverless functions; generous
free tier)
- **Database:** Managed PostgreSQL (Vercel Postgres, Neon, or Supabase)
- **Static Assets:** Served via Vercel CDN
- **Emails:** Transactional email service (e.g., SendGrid free tier, Resend, or
Postmark)

**Justification:**

- Minimal operational overhead for solo founder
- Automatic HTTPS, scaling, and CDN
- Low cost for MVP traffic
- Easy CI/CD integration

**Environments:**

1. **Development:** Local (localhost, local Postgres or Docker)
2. **Staging:** Vercel preview deployment (automatic per PR)
3. **Production:** Vercel production deployment (main branch)

**CI/CD Approach:**

- **Git Workflow:** Feature branches → PR → merge to `main` → auto-deploy to
prod
- **Vercel Integration:**
  - Preview deployments for every PR (automatic)
  - Production deployment on merge to `main`
  - Environment variables configured in Vercel dashboard
- **Quality Gates (Phase 1+):**
  - Lint (ESLint) and type-check (TypeScript) on PR
  - Unit/integration tests (Vitest or Jest) before merge (optional for Phase 0,
required by Phase 1)
  - No manual deployment steps

**Basic Observability:**

- **Logging:** Vercel runtime logs + structured logging (e.g., `pino` or
`winston`) for key events
  - Log levels: ERROR (failures), WARN (degraded), INFO (lead submissions, key
user actions)
- **Error Tracking:** Simple error monitoring (e.g., Sentry free tier or Vercel
integrated error tracking)
  - Capture unhandled errors, model API failures, lead delivery failures
- **Metrics:** Vercel Analytics for basic traffic metrics
  - Custom events: `session_started`, `recommendation_shown`,
`lead_flow_started`, `lead_submitted` (PSD FR-15)
- **Uptime Checks:** Simple external ping (e.g., UptimeRobot free tier) to
`/api/health` endpoint
- **Alerts:** Email to founder on:
  - Lead delivery failure (PSD FR-17)
  - High error rate (> 5 errors in 5 minutes)
  - Uptime check failure

---

### Cross-Cutting Concerns

**Configuration & Environment Variables:**

- `.env.local` for local development (Git-ignored)
- `.env.example` committed to Git (template without secrets)
- **Required Env Vars:**
  - `DATABASE_URL`: Postgres connection string
  - `GROQ_API_KEY`: For LLM calls (Phase 0 testing)
  - `GOOGLE_AI_API_KEY`: For RAG embeddings (Google AI SDK / Gemini)
  - `SENDGRID_API_KEY` (or equivalent): For email delivery
  - `NEXT_PUBLIC_APP_URL`: Base URL for links in emails
  - `SESSION_SECRET`: For session token signing (optional)
- **Phase 1+ Migration:** Add production LLM provider API key (TBD based on
Phase 0 evaluation)
- Production env vars stored in Vercel dashboard
- Validate env vars on startup (Zod schema)

**Error Handling Strategy:**

- **User-Facing Errors (PSD FR-16):**
  - Friendly message: "Oops, something went wrong. Please try again."
  - Retry button in chat UI
  - Avoid exposing stack traces or internal details
- **Internal Error Logging:**
  - Log full error context (stack, request ID, user session)
  - Send to error tracking service (Sentry)
- **Graceful Degradation:**
  - If model API fails: retry once, then fallback to "Service temporarily
unavailable" message
  - If lead delivery fails: log error, notify founder, store lead with
`delivery_status = 'failed'` for manual retry

**Logging Strategy:**

- Structured JSON logs (timestamp, level, message, context)
- **Key Events to Log:**
  - Session creation
  - User messages and bot responses (sanitized; no PII in plain logs)
  - RAG retrieval (query, top results)
  - Lead submission (sanitized)
  - Lead delivery attempts (success/failure)
  - Model API calls (latency, token count)
- **Log Retention:** 30–90 days in Vercel; ship to external store if needed
(defer to Phase 2)

**Caching & Performance Considerations:**

- **LLM Response Streaming:** Use OpenAI streaming API to reduce perceived
latency (show tokens as they arrive)
- **RAG Embeddings:** Pre-compute and cache (regenerate only when content
changes)
- **Static Content:** Landing page and safety/disclaimer text served as static
HTML (Next.js SSG)
- **API Route Optimization:**
  - No caching for chat responses (personalized)
  - Optional: Cache destination/site metadata with short TTL (1–5 min) if DB
load becomes an issue (unlikely for V1)
- **Database Connection Pooling:** Use Prisma connection pooling in serverless
mode

**Compliance & Legal:**

- **Privacy Notice:** Simple page (or modal) linked from footer and shown before
lead submission (PSD FR-14)
  - What data is collected (name, email, conversation context)
  - How it's used (recommendations, lead delivery to partners)
  - Retention period (12 months)
  - Contact for questions/deletion
- **Safety Disclaimers:** Inline disclaimer whenever safety topics detected (PSD
FR-10)
  - "This is general information only, not personalized advice. Consult a
qualified dive professional or emergency services for urgent matters."
- **Terms of Service (Optional for V1; Recommended for Public):** Brief terms
covering:
  - No warranty; informational purposes only
  - No booking; no medical/decompression advice
  - User responsible for verifying information with operators

---

## 4. Project Phases

### Phase 0: Foundations & Internal MVP (Weeks 1–4)

**Objective:** Establish project skeleton, deploy a working chatbot for **1
destination** with RAG, basic lead capture, and safety guardrails. Validate core
architecture with internal testing.

**High-Level Scope:**

- **Features:**
  - Web chat UI (basic, functional)
  - RAG over 1 destination (5–8 sites, 2 shops)
  - Session-based memory (guest-only)
  - Safety mode with disclaimers
  - Lead capture (minimal fields) + email delivery
  - Out-of-scope handling (covered vs non-covered)
- **Layers Touched:**
  - Frontend: Chat UI, landing page
  - Backend: Chat orchestration, RAG service, lead service, safety guard
  - Data: Prisma schema, seed data, embeddings
  - Infra: Vercel deployment, managed Postgres, SendGrid integration

**Dependencies:**

- None (greenfield project)

**Acceptance Criteria:**

1. Chat UI deployed and accessible at staging URL
2. Bot correctly answers questions about Destination #1 using RAG
3. Bot declines out-of-scope requests (other destinations, booking, medical
advice) with clear messaging
4. Safety queries trigger disclaimer mode
5. At least 1 test lead captured and delivered to partner email
6. Error logs accessible; founder receives email on lead delivery failure
7. Basic observability in place (Vercel logs, error tracking)

---

### Phase 1: Public V1 Launch (Weeks 5–8)

**Objective:** Harden reliability, improve UX, add core analytics, and prepare
for public launch. Optionally add Destination #2 if Destination #1 is stable.

**High-Level Scope:**

- **Features:**
  - Refined chat UX (mobile-responsive, better styling)
  - "New chat" / reset functionality
  - Privacy notice and consent flow before lead submission
  - Core analytics events tracked (PSD FR-15)
  - Retry on model API failure
  - **LLM Migration:** Evaluate and migrate from GROQ to production LLM provider
(candidates: OpenAI GPT-4o, Anthropic Claude, or Google Gemini) based on Phase 0
cost/quality analysis
  - Optional: Add Destination #2 (only if Destination #1 validated)
- **Layers Touched:**
  - Frontend: UX polish, analytics integration
  - Backend: Error handling improvements, analytics events
  - Data: Seed Destination #2 (if applicable)
  - Infra: Production environment hardening, uptime checks

**Dependencies:**

- Phase 0 complete and validated

**Acceptance Criteria:**

1. Public URL live with HTTPS
2. Landing page clearly states coverage, limitations, privacy
3. Chat UI mobile-responsive and visually polished
4. Users can reset conversation context via "New chat" button
5. Analytics tracking sessions, recommendations, lead flow (validated in Vercel
Analytics or equivalent)
6. P95 response time ≤ 10 seconds under light load (< 10 concurrent users)
7. At least 1 partner shop receives and confirms quality of test leads
8. Error rate < 5% over 1 week of testing

---

### Phase 2: Trip Outline & Enhancements (Weeks 9–12)

**Objective:** Add value-added features based on early user feedback. Implement
simple trip outline generation and explore flight schedule integration.

**High-Level Scope:**

- **Features:**
  - Simple trip outline (3–5 day high-level itinerary, no booking)
  - Optional: Flight schedule API integration for destination access notes (PSD
FR-18, currently out of scope for V1)
  - Improved RAG: add marine life highlight guides if users request them
  - Learn-to-dive flow enhancements (better PADI Open Water guidance)
- **Layers Touched:**
  - Frontend: Trip outline display, marine life info cards
  - Backend: Trip outline generation logic, optional flight API integration
  - Data: Add marine life content (if applicable)

**Dependencies:**

- Phase 1 complete; at least 2 weeks of public usage data

**Acceptance Criteria:**

1. Bot can generate a simple 3–5 day trip outline (non-bookable, high-level)
2. If flight API integrated: destination pages show "typical access" or live
flight info
3. Marine life highlights available if users ask (validated with at least 5
users)
4. Learn-to-dive flow generates qualified training leads (validated with at
least 1 partner school)

---

### Phase 3: User Profiles & Saved Context (Weeks 13–16)

**Objective:** Introduce optional user accounts (magic-link authentication) to
persist conversation history and preferences across sessions.

**High-Level Scope:**

- **Features:**
  - Magic-link email authentication (no passwords)
  - User profile (name, email, cert level, preferences)
  - Saved conversation history
  - "My Leads" page (view submitted leads)
- **Layers Touched:**
  - Frontend: Login flow, profile page, conversation history UI
  - Backend: Auth service, user CRUD, session → user account migration
  - Data: `User` table, link `Lead` to `User`, migration for existing sessions

**Dependencies:**

- Phase 2 complete; user demand for saved history validated (e.g., "I wish I
could access this later")

**Acceptance Criteria:**

1. Users can sign up/log in via magic link
2. Authenticated users see conversation history across devices
3. "My Leads" page shows submitted leads with status
4. Guest users can upgrade to account (link existing leads to new account)

---

### Phase 4: Partner Dashboard (Weeks 17–20)

**Objective:** Provide basic B2B dashboard for partner shops to view/manage
incoming leads and provide feedback.

**High-Level Scope:**

- **Features:**
  - Partner shop login (magic-link or simple password)
  - Dashboard: view incoming leads, mark as contacted/converted
  - Optional: Webhook delivery for partners who request it
  - Feedback mechanism (lead quality rating)
- **Layers Touched:**
  - Frontend: Partner dashboard UI
  - Backend: Partner auth, lead management API, webhook delivery
  - Data: `PartnerUser` table, lead status updates

**Dependencies:**

- Phase 3 complete; at least 1 partner requests dashboard access

**Acceptance Criteria:**

1. Partner shops can log in and view assigned leads
2. Partners can mark leads as contacted/converted
3. Webhook delivery works for at least 1 partner (if requested)
4. Founder can view aggregate lead quality feedback

---

### Phase 5: Scale & Advanced Features (Month 6+)

**Objective:** Scale to more destinations, add ML-based recommendation ranking,
explore Telegram/WhatsApp integrations, and implement revenue model (if
applicable).

**High-Level Scope:**

- **Features:**
  - Expand to 5–10 destinations
  - ML-based recommendation ranking (personalized site suggestions)
  - Telegram bot integration (PSD deferred feature)
  - Optional: Freemium model (premium features for users or partner
subscriptions)
- **Layers Touched:**
  - All layers; significant data expansion

**Dependencies:**

- Phase 4 complete; validated product-market fit; sustainable lead flow

**Acceptance Criteria:**

- (To be defined based on Phase 1–4 learnings)

---

## 5. Initial PR Breakdown (Phase 0 — Near-Term Work)

### PR-01: Bootstrap Project & Infrastructure

**Branch:** `feat/bootstrap-project` **Scope:** Set up Next.js project, Prisma,
Vercel deployment, basic CI/CD.

**Layers Affected:**

- **Frontend:** Next.js app scaffold, Tailwind CSS setup
- **Backend:** API route structure, environment variable validation
- **Data:** Prisma schema initialization, local Postgres setup
- **Infra:** Vercel project creation, staging environment configuration

**Key Changes:**

- Initialize Next.js 14+ with TypeScript and App Router
- Install dependencies: `prisma`, `@prisma/client`, `zod`, `tailwindcss`, `groq-
sdk`, `@google/generative-ai`
- Create Prisma schema with `Destination`, `DiveSite`, `DiveShop`, `Lead` models
(PSD §6.2)
- Set up `.env.example` and `.env.local` (with placeholders for `DATABASE_URL`,
`GROQ_API_KEY`, `GOOGLE_AI_API_KEY`, `SENDGRID_API_KEY`)
- Create `/api/health` endpoint (returns `{ status: 'ok' }`)
- Configure Vercel project, link to Git repo, set up preview deployments
- Add `README.md` with setup instructions including LLM migration plan

**Testing Focus:**

- **Manual:** Verify Next.js dev server runs locally, health endpoint returns
200
- **CI/CD:** Verify Vercel builds and deploys preview on PR creation

---

### PR-02: Prisma Schema, Migrations & Seed Data

**Branch:** `feat/database-schema` **Scope:** Finalize database schema, create
migrations, add seed script for Destination #1.

**Layers Affected:**

- **Data:** Prisma schema, migrations, seed script

**Key Changes:**

- Refine Prisma schema:
  - Add indexes on `destination_id`, `is_active` fields
  - Add `context_json` as `Json` type for `Lead` model
  - Add `created_at`, `updated_at` timestamps
- Create initial migration: `npx prisma migrate dev --name init`
- Create seed script (`prisma/seed.ts`):
  - 1 destination ("Tioman, Malaysia")
  - 5–8 dive sites (e.g., "Tiger Reef", "Chebeh", "Renggis Island", "Malang
Rocks", "Soyak Island")
  - 2 partner shops with contact emails
- Update `package.json` to include seed command

**Testing Focus:**

- **Unit:** Seed script runs without errors
- **Manual:** Run `npx prisma db seed`, verify data in local Postgres via Prisma
Studio

---

### PR-03: RAG Service — Content Ingestion & Vector Search

**Branch:** `feat/rag-service` **Scope:** Implement RAG retrieval over curated
content for Destination #1.

**Layers Affected:**

- **Backend:** `RAGService`, embedding generation, retrieval logic
- **Data:** Content files in `/content` directory, embeddings storage

**Key Changes:**

- Create `/content` directory with markdown files:
  - `tioman-overview.md`: Destination overview (seasonality, conditions,
highlights)
  - `tioman-sites.md`: Dive site details (5–8 sites with difficulty, access,
highlights)
  - `tioman-logistics.md`: Getting there, accommodations, local tips
  - `safety-general.md`: No-fly after diving, dive planning basics
- Create `scripts/generate-embeddings.ts`:
  - Load markdown files, chunk by section (h2/h3 headers)
  - Generate embeddings via Google AI SDK using Gemini embedding model
(`models/embedding-001` or latest)
  - Store embeddings as JSON file (`/content/embeddings.json`) with metadata
(chunk text, source file, chunk ID)
- Implement `src/services/RAGService.ts`:
  - `retrieveContext(query: string, topK = 5)`: Load embeddings, generate query
embedding using Google AI SDK, compute cosine similarity, return top K chunks
  - Use simple in-memory search (no external vector DB)
  - Initialize Google AI SDK client with `GOOGLE_AI_API_KEY`
- Add utility: `src/utils/vectorUtils.ts` (cosine similarity, normalization)

**Testing Focus:**

- **Unit Tests:**
  - `RAGService.retrieveContext()` returns relevant chunks for sample queries
(e.g., "best sites for macro photography in Tioman")
- **Integration Test:**
  - Generate embeddings for test content, query RAG service, validate top result
matches expected source
- **Manual:** Run embedding generation script, verify `embeddings.json` created

---

### PR-04: Chat Orchestration & OpenAI Integration

**Branch:** `feat/chat-service` **Scope:** Implement chat orchestration with
OpenAI API, session management, and safety guardrails.

**Layers Affected:**

- **Backend:** `ChatService`, `SafetyGuardService`, `/api/chat` endpoint
- **Frontend:** (Placeholder; actual UI in PR-05)

**Key Changes:**

- Implement `src/services/ChatService.ts`:
  - `processMessage(sessionToken, userMessage)`:
    - Load session context from memory/DB (simple in-memory Map for Phase 0)
    - Call `SafetyGuardService.detectSafetyTopics(userMessage)`
    - If safety topic: inject disclaimer prompt
    - Call `RAGService.retrieveContext(userMessage)`
    - Build prompt with RAG context + conversation history + system instructions
(covered destinations only, no booking, no medical advice)
    - Call GROQ API (using `groq-sdk`) with streaming for fastest available
model (e.g., `llama-3.3-70b-versatile` or latest)
    - Update session context with user message + assistant response
  - **Note:** Abstract LLM calls behind interface for easy migration to
production provider in Phase 1
- Implement `src/services/SafetyGuardService.ts`:
  - `detectSafetyTopics(message)`: Simple keyword matching ("no-fly", "medical",
"decompression", "emergency") or LLM classification
  - Return boolean + disclaimer text if detected
- Implement `/api/chat` endpoint:
  - POST `/api/chat`
  - Body: `{ sessionToken, message }`
  - Validate with Zod
  - Call `ChatService.processMessage()`
  - Return streaming response (SSE or JSON stream)
- Add system prompt template:
  - "You are DovvyBuddy, an AI assistant for recreational divers. You help with
destination discovery and dive planning. You only provide information about
covered destinations: Tioman, Malaysia [expand list as destinations are added].
If asked about other destinations, politely say they are not covered yet. You do
not provide booking, medical advice, or decompression calculations. Always base
answers on the provided context."

**Testing Focus:**

- **Unit Tests:**
  - `SafetyGuardService.detectSafetyTopics()` correctly identifies safety
keywords
  - `ChatService` builds prompt with RAG context
- **Integration Test:**
  - POST to `/api/chat` with test session and message
  - Verify response includes RAG context and respects system instructions
- **Manual:** Test with sample queries in API client (Postman/curl)

---

### PR-05: Chat UI (Frontend)

**Branch:** `feat/chat-ui` **Scope:** Build web chat interface with message
bubbles, input, and streaming support.

**Layers Affected:**

- **Frontend:** Chat page, components

**Key Changes:**

- Create `/app/chat/page.tsx`:
  - Client component with React state for messages array
  - Message input (textarea + send button)
  - Message list (scrollable, auto-scroll to bottom)
  - Session token generation on mount (random UUID, stored in localStorage)
- Create components:
  - `components/ChatMessage.tsx`: Message bubble (user vs assistant, timestamp)
  - `components/ChatInput.tsx`: Textarea with send button, handles enter key
- Implement streaming response handling:
  - Use fetch with `ReadableStream` or SSE to receive tokens
  - Append tokens to latest assistant message in real-time
- Basic styling with Tailwind CSS (mobile-responsive)

**Testing Focus:**

- **Manual:**
  - Open `/chat`, send message, verify response streams in
  - Test on mobile viewport (responsive layout)
  - Verify session token persists across page reloads (localStorage)

---

### PR-06: Lead Capture & Delivery

**Branch:** `feat/lead-capture` **Scope:** Implement inline lead capture flow
and email delivery.

**Layers Affected:**

- **Frontend:** Lead capture UI
- **Backend:** `LeadService`, `/api/leads` endpoint, email integration
- **Data:** Lead storage

**Key Changes:**

- Update `ChatService` to detect lead intent:
  - If user message contains phrases like "contact shop", "get quote",
"interested in booking", or bot suggests partner shop, trigger lead capture flow
- Implement `src/services/LeadService.ts`:
  - `createLead(data)`: Validate, insert into `Lead` table
  - `deliverLead(leadId)`: Format email, send via SendGrid, update
`delivery_status`
- Implement `/api/leads` endpoint:
  - POST `/api/leads`
  - Body: `{ sessionToken, name, email, destinationId?, preferredShopId?,
context }`
  - Validate with Zod (email format, required fields)
  - Call `LeadService.createLead()` and `LeadService.deliverLead()`
  - Return success/failure
- Create email template (`src/templates/leadEmail.ts`):
  - Subject: "New DovvyBuddy Lead: [Destination]"
  - Body: Name, email, destination, cert level (if provided), interests, travel
window, conversation highlights
  - Footer: "This lead was generated via DovvyBuddy. Reply directly to the email
above."
- Integrate SendGrid:
  - Install `@sendgrid/mail`
  - Configure API key from env var
  - Send email to partner shop(s) contact email
- Add error handling:
  - If email send fails, log error, update `delivery_status = 'failed'`, send
notification to founder
- Create `components/LeadCaptureModal.tsx`:
  - Modal with form (name, email, optional: cert level, interests)
  - Consent checkbox + privacy notice link
  - Submit button

**Testing Focus:**

- **Unit Tests:**
  - `LeadService.createLead()` validates input and inserts to DB
  - Email template renders correctly
- **Integration Test:**
  - POST to `/api/leads` with test data
  - Verify lead saved to DB and email sent (use SendGrid sandbox/test mode)
- **Manual:** Trigger lead capture in chat UI, submit, verify email received

---

### PR-07: Out-of-Scope Handling & Safety Disclaimers

**Branch:** `feat/guardrails` **Scope:** Implement robust out-of-scope handling
and safety disclaimers in chat UI.

**Layers Affected:**

- **Backend:** `ChatService` prompt engineering
- **Frontend:** Disclaimer UI components

**Key Changes:**

- Update `ChatService` system prompt:
  - Explicitly list covered destinations: "Currently covered: Tioman, Malaysia.
If asked about other locations, respond: 'I currently only have information
about [covered destinations]. Would you like to know more about those?'"
  - Add instructions: "If asked to book flights/hotels/dives, respond: 'I can't
help with bookings, but I can connect you with a trusted partner shop who can
assist.'"
  - Add instructions: "If asked for medical advice, decompression calculations,
or emergency help, respond with: [DISCLAIMER] This is general information only,
not personalized medical advice. For medical concerns, consult a dive physician.
For emergencies, contact local emergency services immediately."
- Create `components/SafetyDisclaimer.tsx`:
  - Banner component displayed when `SafetyGuardService` detects safety topic
  - Text: "⚠️ Safety Reminder: This is general information only. Consult a
qualified dive professional for personalized advice."
- Update `ChatMessage.tsx` to conditionally render disclaimer if message
metadata includes `showDisclaimer: true`

**Testing Focus:**

- **Integration Test:**
  - Send out-of-scope queries (non-covered destination, booking request, medical
question)
  - Verify bot declines appropriately with redirect to covered features
- **Manual:**
  - Test with queries like "Can I dive in the Maldives?", "Book me a flight",
"Can I dive with asthma?"
  - Verify disclaimer appears for safety queries

---

## 6. Risks, Trade-offs, and Open Questions

### Major Risks

**Technical Risks:**

1. **RAG Retrieval Quality (Medium):**
   - **Risk:** With only 10–20 curated documents, retrieval may not always
return the most relevant chunks, leading to off-topic or incomplete answers.
   - **Mitigation:** Carefully structure content with clear headings; use
chunking strategy that preserves context (e.g., chunk by h2 sections). Test with
diverse queries and refine prompts. Plan to add reranking in Phase 2 if needed.

2. **LLM Hallucination Despite Guardrails (Medium):**
   - **Risk:** Despite RAG grounding, the LLM may still generate plausible-
sounding but incorrect information (especially for edge cases).
   - **Mitigation:** Strong system prompt with explicit instructions to say "I
don't know" when uncertain. Use temperature = 0 for more deterministic outputs.
Monitor early user interactions manually (Phase 0) to catch hallucinations. Add
evaluation suite in Phase 1.

3. **Model API Latency/Reliability (Low–Medium):**
   - **Risk:** GROQ (Phase 0) or production LLM provider downtime or high
latency (>10s) degrades UX and violates NFR-01.
   - **Mitigation:** Implement streaming to reduce perceived latency. Add retry
logic with exponential backoff. Monitor P95 latency and set up alerts. GROQ
chosen for Phase 0 testing due to fast inference speeds; migrate to production
provider in Phase 1 based on reliability/cost evaluation. Abstract LLM interface
for easy provider swapping.

**Product Risks:**

1. **Low User Engagement / Lead Volume (Medium):
   - **Risk:** With only 1–2 destinations, the target audience is very narrow.
May not achieve 10 weekly active users or 2 leads/week by month 2.
   - **Mitigation:** Focus on **quality** over quantity: deeply cover
Destination #1 to demonstrate value. Use SEO-optimized landing page targeting
long-tail keywords (e.g., "best dive sites in Tioman for beginners", "Tioman
diving guide"). Leverage partner shops to promote DovvyBuddy to their email
lists. Target 2 destinations (Tioman + 1 more East Malaysia location) for V1 to
broaden appeal.

2. **Partner Shop Adoption / Lead Quality Concerns (Medium):
   - **Risk:** Partner shops may not find leads valuable if context is
insufficient or users are not serious inquiries.
   - **Mitigation:** Capture rich context (cert level, interests, travel window)
and include conversation highlights in lead email. Follow up with partner shops
after first 3–5 leads to gather feedback and iterate. Offer to customize lead
format per partner preferences.

3. **Unclear UX for Out-of-Scope Handling (Low–Medium):
   - **Risk:** Users may feel frustrated if too many queries result in "not
covered" responses, leading to abandonment.
   - **Mitigation:** Proactively surface covered destinations early in
conversation. Use positive framing: "I currently specialize in East Malaysia
diving—here's what I can help with!" Collect feedback on what destinations users
most want added (Phase 1 analytics).

### Key Trade-offs

1. **Simplicity vs Scalability (Data Model):**
   - **Trade-off:** Using JSONB for `context_json` in `Lead` model defers schema
design, enabling fast iteration. However, this makes querying/filtering leads
harder (e.g., "all leads with cert level = Advanced").
   - **Decision:** Accept this trade-off for V1 to move fast. Migrate to
structured fields in Phase 3+ if partner dashboard requires filtering.

2. **In-Memory Vector Search vs Managed Vector DB:**
   - **Trade-off:** In-memory search (Option A) is trivial to operate but won't
scale beyond 100s of documents. Managed vector DB (pgvector or Pinecone) scales
better but adds complexity.
   - **Decision:** Start with in-memory for Phase 0–1. Migrate to pgvector in
Phase 2 if content grows beyond 50 documents or retrieval latency becomes an
issue.

3. **Guest-Only vs User Accounts:**
   - **Trade-off:** Guest-only simplifies V1 (no auth, no user management) but
limits personalization and prevents conversation history persistence.
   - **Decision:** Ship V1 without accounts to reduce scope. Add magic-link auth
in Phase 3 based on user demand (validated by feedback like "I wish I could
access this later").

4. **Email vs Webhook for Lead Delivery:**
   - **Trade-off:** Email is simplest to implement and sufficient for most
partners. Webhook enables real-time CRM integration but requires partner- side
development.
   - **Decision:** Ship V1 with email only (PSD OQ-02). Add webhook support in
Phase 2 if any partner explicitly requests it.

5. **Manual Content Curation vs Automated Scraping:**
   - **Trade-off:** Manually curating content ensures quality and safety-vetted
information but limits scalability. Automated scraping (e.g., from dive blogs,
operator sites) could accelerate coverage but risks quality/accuracy issues.
   - **Decision:** Manually curate all content for V1 to ensure trustworthiness
(PSD NFR-06). Explore semi-automated tools (e.g., LLM-assisted summarization
with human review) in Phase 4+ when scaling to 10+ destinations.

### Open Questions

**OQ-01** Initial Destination Selection

- **Question:** Which destination should be Destination #1? Bali is assumed in
examples, but should we validate demand (search volume, partner availability)
before committing?
- **Decision:** **Tioman, Malaysia** (focus on East Malaysia dive locations)
- **Rationale:** Strategic focus on East Malaysia diving market; allows for
expansion to nearby destinations (Sipadan, Mabul, etc.) in future phases.

**OQ-02** Lead Delivery SLA

- **Question:** PSD OQ-03 notes "no SLA promise in V1 unless you can
monitor/enforce it." Should we promise partners a lead delivery timeframe (e.g.,
"within 5 minutes"), or explicitly state "best effort"?
- **Decision:** **Best effort** with email notification on failure
- **Rationale:** Allows V1 launch without overcommitting; can add formal SLA in
Phase 1 once delivery reliability is validated over 2+ weeks.

**OQ-03** Analytics Tool Selection

- **Question:** PSD OQ-04 mentions "pick a minimal analytics tool." Options: (a)
Vercel Analytics (simplest, integrated), (b) Plausible/Fathom (privacy- focused,
lightweight), (c) Google Analytics (more features, heavier).
- **Decision:** **Vercel Analytics** for Phase 0–1
- **Rationale:** Zero configuration; free tier sufficient for V1; built into
deployment platform. Can migrate to Plausible in Phase 2 if more detailed funnel
analysis is needed.

**OQ-04** Safety Content Sources

- **Question:** What are the "vetted safety sources" for no-fly, decompression,
medical topics? Should we link to PADI, DAN (Divers Alert Network), or specific
safety PDFs?
- **Decision:** **DAN (Divers Alert Network) general safety guidelines + PADI
Open Water Manual excerpts** (with attribution)
- **Rationale:** Both are industry-standard, authoritative sources recognized
globally. Content stored as `/content/safety-general.md` with clear source
attribution and links.

**OQ-05** Session Expiry Policy

- **Question:** PSD FR-02 specifies "expire after inactivity (e.g., 30–60
minutes)." Should we use 30 min (more privacy-preserving) or 60 min (better UX
for slow researchers)?
- **Decision:** **60 minutes** session expiry
- **Rationale:** Better UX for users researching multiple dive sites or
comparing options. Can reduce to 30 min in Phase 1+ if privacy feedback
indicates concern.

**OQ-06** Destination #2 Criteria

- **Question:** Under what conditions should Destination #2 be added in Phase 1?
Specific metrics (e.g., "after 20 leads submitted for Destination #1") or
qualitative (e.g., "once Destination #1 feels stable")?
- **Decision:** **Target 2 destinations for V1**; add Destination #2 in Phase 1
based on:
  - Destination #1 (Tioman) has generated ≥10 leads
  - No major bugs or quality issues in 2 weeks
  - Partner feedback is positive (≥7/10 satisfaction)
- **Rationale:** Two destinations provide broader appeal while remaining
manageable for solo founder; East Malaysia focus allows geographic clustering
(e.g., Destination #2 could be Sipadan, Mabul, or Redang).

---

## Summary & Next Steps

This MASTER PLAN provides a pragmatic, phased approach to building DovvyBuddy as
a solo founder. The architecture prioritizes **simplicity and speed** (single
Next.js codebase, managed services, small curated dataset) while respecting the
PSD's constraints (no booking, no medical advice, covered destinations only).

**Immediate Next Steps:**

1. ✅ **Open Questions Resolved:** Tioman, Malaysia as Destination #1; Vercel
Analytics; DAN + PADI safety sources; 60-min session expiry; best-effort lead
delivery; target 2 destinations for V1.
2. **Start Phase 0, PR-01:** Bootstrap the project skeleton and deploy to Vercel
staging.
3. **Content Curation:** Begin drafting curated content for Tioman (overview,
sites, logistics, safety) in parallel with PR-02 and PR-03.
4. **Partner Onboarding:** Identify and confirm 2 partner dive shops/schools in
Tioman; agree on lead format and delivery preferences.

**Key Success Indicators (Month 2):**

- ≥10 weekly active users
- ≥2 qualified leads/week
- At least 1 partner confirms leads are higher quality than generic web
inquiries
- P95 response time ≤ 10 seconds
- Error rate < 5%

The plan is designed to be **evolvable**: Phases 2–5 are directional and should
be adjusted based on Phase 0–1 learnings. Regularly revisit the PSD and this
MASTER PLAN to ensure alignment as the product develops.

---

### End of MASTER PLAN
