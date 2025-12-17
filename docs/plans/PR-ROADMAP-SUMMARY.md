# DovvyBuddy - PR-Based Roadmap Summary

**Date:** 17 December 2025
**Based on:** MASTER_PLAN.md v1.0
**Epic:** DovvyBuddy MVP (Phase 0 + Phase 1)

---

## Overview

This directory contains 12 detailed PR (Pull Request) specifications broken down from the MASTER_PLAN. Each PR is designed to be independently implementable, testable, and deployable.

---

## Phase 0: Foundations & Internal MVP (Weeks 1-4)

**Goal:** Deploy working chatbot for Tioman with RAG, lead capture, and safety guardrails

### PR-01: Bootstrap Project & Infrastructure

**Effort:** 4-6 hours **Status:** Not Started **Focus:** Next.js setup, Vercel deployment, environment configuration

### PR-02: Prisma Schema, Migrations & Seed Data

**Effort:** 6-8 hours **Status:** Not Started **Focus:** Database schema, Tioman data seeding (1 destination, 8 sites, 2 shops)

### PR-03: RAG Service — Content Ingestion & Vector Search

**Effort:** 10-12 hours (6-8h content + 4h code) **Status:** Not Started
**Focus:** Curated markdown content, Google AI SDK embeddings, cosine similarity retrieval

### PR-04: Chat Orchestration & GROQ Integration

**Effort:** 8-10 hours **Status:** Not Started **Focus:** ChatService, SafetyGuardService, `/api/chat` endpoint, GROQ LLM integration

### PR-05: Chat UI (Frontend)

**Effort:** 6-8 hours **Status:** Not Started **Focus:** `/chat` page, streaming response handling, mobile-responsive UI

### PR-06: Lead Capture & Delivery

**Effort:** 8-10 hours **Status:** Not Started **Focus:** LeadCaptureModal, `/api/leads` endpoint, SendGrid email integration

### PR-07: Out-of-Scope Handling & Safety Disclaimers

**Effort:** 4-6 hours **Status:** Not Started **Focus:** Enhanced guardrails, SafetyDisclaimer component, comprehensive testing

---

## Phase 1: Public V1 Launch (Weeks 5-8)

**Goal:** Harden reliability, UX polish, analytics, LLM migration, production launch

### PR-08: Landing Page & Privacy Notice

**Effort:** 4-6 hours **Status:** Not Started **Focus:** SEO-optimized landing page, privacy notice, footer links

### PR-09: UX Polish & Analytics Integration

**Effort:** 6-8 hours **Status:** Not Started **Focus:** Loading states, error handling, "New chat" button, Vercel Analytics

### PR-10: Error Handling & Reliability Improvements

**Effort:** 8-10 hours **Status:** Not Started **Focus:** Retry logic, Sentry integration, graceful degradation, founder notifications

### PR-11: LLM Migration & Performance Testing

**Effort:** 10-12 hours **Status:** Not Started **Focus:** Evaluate production LLM providers, migrate from GROQ, P95 latency validation

### PR-12: Production Readiness & Launch Checklist

**Effort:** 6-8 hours **Status:** Not Started **Focus:** SEO meta tags, uptime monitoring, production environment hardening, launch checklist

---

## Milestones

### Milestone 1: Backend Foundation (PRs 1-3)

- Infrastructure, data, RAG operational (no UI)
- **Exit Criteria:** RAG retrieval working, database seeded, Vercel staging deployed

### Milestone 2: Chat Backend Complete (PR 4)

- Chat orchestration with GROQ operational (API-only)
- **Exit Criteria:** `/api/chat` working via Postman, safety guardrails validated

### Milestone 3: MVP Chat UI (PRs 5-7)

- End-to-end chat experience for internal testing
- **Exit Criteria:** 1 test lead delivered, manual testing by founder + 2-3 testers, no critical bugs

### Milestone 4: Public V1 Ready (PRs 8-12)

- Production-ready with landing page, analytics, error handling, LLM migration
- **Exit Criteria:** Launch checklist 100% complete, partner confirms lead quality, error rate <5%, uptime monitoring active

---

## Total Estimated Effort

**Phase 0:** 46-60 hours (7 PRs) **Phase 1:** 34-44 hours (5 PRs) **Total:** 80-104 hours (~2-3 weeks full-time or 4-6 weeks part-time)

---

## Dependencies & Critical Path

**Critical Path:**

1. PR-01 (foundation)
2. PR-02 (data) → depends on PR-01
3. PR-03 (RAG) → depends on PR-01, PR-02
4. PR-04 (chat backend) → depends on PR-03
5. PR-05 (chat UI) → depends on PR-04
6. PR-06 (leads) → depends on PR-02, PR-04, PR-05
7. PR-07 (guardrails) → depends on PR-04, PR-05
8. PRs 8-12 → depend on PRs 1-7 complete

**Parallel Opportunities:**

- PR-03 content curation can start early (week 1-2)
- PR-08 landing page can be drafted while PR-06/07 in progress
- Partner onboarding can happen in parallel with PRs 1-5

---

## Key External Dependencies

### APIs & Services

- GROQ API key (Phase 0 LLM)
- Google AI SDK / Gemini API key (RAG embeddings)
- SendGrid account + verified sender email (lead delivery)
- Vercel account + Git repository
- PostgreSQL database (managed: Vercel Postgres, Neon, or Supabase)

### Content & Partners

- Curated markdown content for Tioman (PR-03): ~2500-3500 words across 4 files
- 2 partner dive shops in Tioman confirmed (PR-06): contact emails, consent to receive leads

### Decisions

- Production LLM provider selection (PR-11): OpenAI GPT-4o, Anthropic Claude, or Google Gemini
- Destination #2 selection (Phase 1): criteria in MASTER_PLAN OQ-06

---

## Next Steps

1. **Review all 12 PR specs** to understand scope and dependencies
2. **Set up external accounts:**
   - GROQ API (<https://console.groq.com>)
   - Google AI Studio (<https://aistudio.google.com>)
   - SendGrid (<https://sendgrid.com>)
   - Vercel (<https://vercel.com>)
3. **Start PR-01:** Bootstrap project skeleton
4. **Begin content curation** in parallel (PR-03 dependency)
5. **Identify partner shops** in Tioman (PR-06 dependency)

---

## PR File Naming Convention

- `PR-01-Bootstrap-Project-Infrastructure.md`
- `PR-02-Prisma-Schema-Seed-Data.md`
- `PR-03-RAG-Service-Content-Embeddings.md`
- `PR-04-Chat-Orchestration-GROQ.md`
- `PR-05-Chat-UI-Frontend.md`
- `PR-06-Lead-Capture-Delivery.md`
- `PR-07-Guardrails-Safety-Disclaimers.md`
- `PR-08-Landing-Page-Privacy-Notice.md`
- `PR-09-UX-Polish-Analytics.md`
- `PR-10-Error-Handling-Reliability.md`
- `PR-11-LLM-Migration-Performance.md`
- `PR-12-Production-Readiness-Launch.md`

---

## Status Tracking

Each PR file includes:

- **Status:** Not Started / In Progress / In Review / Merged
- **Estimated Effort:** Hours
- **Acceptance Criteria:** Checklist
- **Implementation Checklist:** Step-by-step tasks
- **Testing:** Unit, integration, manual test plans
- **Risks & Mitigations:** Known risks and mitigation strategies

Update status as you progress through implementation.

---

## Questions or Issues?

Refer to:

- **MASTER_PLAN.md:** Overall project strategy, architecture, trade-offs
- **Individual PR specs:** Detailed implementation guidance
- **Open Questions (MASTER_PLAN §6):** Strategic decisions and rationale

For technical questions, check PR dependencies and testing sections. For product questions, refer to DovvyBuddy-PSD-V3.md.
