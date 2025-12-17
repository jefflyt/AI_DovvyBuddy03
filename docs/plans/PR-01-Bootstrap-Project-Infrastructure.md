# PR-01: Bootstrap Project & Infrastructure

**Branch:** `feat/bootstrap-project`  
**Epic:** DovvyBuddy MVP - Phase 0  
**Status:** Not Started  
**Estimated Effort:** 4-6 hours

---

## Feature Summary

### Objective

Establish the foundational Next.js project infrastructure for DovvyBuddy, configure deployment pipeline, and validate that all core tooling (TypeScript, Prisma, LLM SDKs, environment management) works end-to-end.

### User Impact

- **Developer**: Can clone, configure, and run the project locally in < 15 minutes.
- **Deployment**: Automatic preview deployments on every PR via Vercel.
- **Validation**: Health endpoint confirms the app is running and core dependencies are loadable.

### Assumptions

- **Stack**: Next.js 14+ with App Router, TypeScript, Tailwind CSS, Prisma, Vercel hosting.
- **LLM Providers**: GROQ for Phase 0 testing, Google AI SDK for RAG embeddings.
- **Email**: SendGrid for lead delivery.
- **Database**: PostgreSQL (managed, e.g., Neon, Supabase, or Vercel Postgres).

---

## Success Criteria & Constraints

### Success Criteria

1. **Local Development Works**: `npm run dev` starts the app at `http://localhost:3000` without errors.
2. **Health Endpoint Live**: `GET /api/health` returns `{ "status": "ok" }` both locally and on Vercel preview.
3. **Environment Validation**: App fails fast with clear error messages if required environment variables are missing.
4. **Deployment Pipeline Active**: Vercel auto-deploys preview environments for each PR.
5. **Documentation Complete**: README.md provides setup instructions that any developer can follow.

### In Scope

- Next.js project initialization with TypeScript, App Router, Tailwind CSS.
- Install all core dependencies (Prisma, GROQ SDK, Google AI SDK, Zod, SendGrid).
- Environment variable validation on app startup.
- Basic health check endpoint.
- Vercel project configuration and first successful deployment.
- Minimal README with setup instructions.

### Out of Scope

- Database schema design and migrations (deferred to PR-02).
- Any functional API logic beyond health check (deferred to PR-03, PR-04).
- Frontend chat UI (deferred to PR-05).
- Content files or RAG setup (deferred to PR-03).

### Constraints & Considerations

- **Solo Founder**: Setup must be simple and use managed services to minimize operational overhead.
- **LLM Migration**: GROQ is temporary; production LLM will be selected in PR-11 (document this in README).
- **Node.js Version**: Lock to Node.js 18+ to avoid runtime mismatches between local and Vercel.
- **Secrets Management**: All secrets must be documented in `.env.example` and configured in Vercel dashboard before first deployment.

---

## Full-Stack Impact

### Backend

- **New Endpoint**: `GET /api/health` → Returns `{ "status": "ok" }`.
- **Environment Validation**: New module `src/lib/env.ts` validates required env vars on app startup using Zod schemas.
- **Prisma Initialization**: Prisma client initialized with empty schema (no models yet).

### Frontend

- **Pages**: Placeholder landing page at `/` (simple static page).
- **Components**: None (deferred to PR-05).
- **Styling**: Tailwind CSS configured and ready for use.

### Data

- **Schema**: Initialize Prisma schema file (`prisma/schema.prisma`) with no models.
- **Database Connection**: Validate `DATABASE_URL` connects successfully (no migrations yet).

### Infra / Config

- **Environment Variables**: 
  - `DATABASE_URL`, `GROQ_API_KEY`, `GOOGLE_AI_API_KEY`, `SENDGRID_API_KEY`, `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET`.
  - Create `.env.example` with placeholders and comments.
- **Vercel Setup**:
  - Link Git repository to Vercel project.
  - Configure environment variables in Vercel dashboard.
  - Enable automatic preview deployments.
- **Node.js Version**:
  - Add `engines` field to `package.json` specifying Node 18+.
  - Create `.nvmrc` for local development consistency.
- **Documentation**: Create `README.md` with setup instructions, tech stack summary, and LLM migration plan.

---

## Implementation Steps

### Step 1: Initialize Next.js Project

**Goal**  
Create a Next.js 14+ project with TypeScript, App Router, and Tailwind CSS configured out of the box.

Backend Changes

- Run: `npx create-next-app@latest dovvybuddy --typescript --tailwind --app`.
- Accept defaults for ESLint, src directory, and import alias.

Frontend Changes

- Tailwind CSS configured automatically.
- Default landing page at `app/page.tsx` (will be placeholder).

Data Changes

- None.

Infra / Config

- Node.js 18+ required.
- Create `.nvmrc` with `18` or `20`.
- Add `engines` field to `package.json`: `"engines": { "node": ">=18.0.0" }`.

Testing

- Manual: Run `npm run dev`, verify app starts at `http://localhost:3000`.
- Manual: Verify Tailwind styles apply to default page.

Notes / Risks

- Ensure you use `--app` flag for App Router (not Pages Router).

---

### Step 2: Install Core Dependencies

**Goal**  
Install all required packages for database, LLM SDKs, email, and validation.

**Backend Changes**

- Run: `npm install prisma @prisma/client groq-sdk @google/generative-ai zod @sendgrid/mail`.
- Run: `npx prisma init` to create `prisma/schema.prisma` and `.env` template.

**Frontend Changes**

- None.

**Data Changes**

- Prisma schema initialized with empty models (database provider set to `postgresql`).

**Infra / Config**

- `.env` file created automatically by Prisma with `DATABASE_URL` placeholder.
- Do not commit `.env` (add to `.gitignore`).

**Testing**

- Manual: Verify `node_modules` contains all installed packages.
- Manual: Verify `prisma/schema.prisma` exists with PostgreSQL provider.

**Notes / Risks**

- Keep Prisma schema empty (no models); schema design happens in PR-02.

---

### Step 3: Environment Variable Validation

**Goal**  
Create a centralized environment validation module that fails fast with clear errors if required variables are missing.

**Backend Changes**

- Create `src/lib/env.ts`:
  - Define Zod schema for all required environment variables.
  - Export validated `env` object.
  - Call validation on module load (top-level).
- Required variables:
  - `DATABASE_URL`, `GROQ_API_KEY`, `GOOGLE_AI_API_KEY`, `SENDGRID_API_KEY`, `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET`.

**Frontend Changes**

- None.

**Data Changes**
- None.

**Infra / Config**
- Create `.env.example`:
  ```env
  DATABASE_URL="postgresql://user:password@localhost:5432/dovvybuddy"
  GROQ_API_KEY="your-groq-api-key"
  GOOGLE_AI_API_KEY="your-google-ai-api-key"
  SENDGRID_API_KEY="your-sendgrid-api-key"
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
  SESSION_SECRET="your-session-secret"
  ```
- Document each variable's purpose in comments.

**Testing**
- Manual: Remove a required env var, run `npm run dev`, verify app fails with clear error message showing which variable is missing.
- Manual: Restore env vars, verify app starts successfully.

**Notes / Risks**
- Use Zod `.min(1)` for all required strings to catch empty values.

---

### Step 4: Health Check Endpoint

**Goal**  
Create a simple API endpoint that confirms the app is running and can respond to HTTP requests.

**Backend Changes**
- Create `app/api/health/route.ts`:
  - `GET` handler returns JSON: `{ "status": "ok" }`.
  - Return 200 status code.

**Frontend Changes**
- None.

**Data Changes**
- None.

**Infra / Config**
- None.

**Testing**
- Manual: Run `npm run dev`, navigate to `http://localhost:3000/api/health`, verify returns `{ "status": "ok" }`.
- Manual: Use `curl http://localhost:3000/api/health`, verify 200 response.

**Notes / Risks**
- This endpoint will be used for uptime monitoring in production (PR-12).

---

### Step 5: Create README Documentation

**Goal**  
Provide clear setup instructions so any developer can clone and run the project.

**Backend Changes**
- None.

**Frontend Changes**
- None.

**Data Changes**
- None.

**Infra / Config**
- Create `README.md` with:
  - **Project Overview**: Brief description of DovvyBuddy.
  - **Tech Stack**: Next.js 14+, TypeScript, Prisma, Tailwind, GROQ (temp), Google AI SDK, SendGrid.
  - **Setup Instructions**:
    1. Clone repo.
    2. Install dependencies: `npm install`.
    3. Copy `.env.example` to `.env` and fill in values.
    4. Run dev server: `npm run dev`.
  - **LLM Migration Plan**: Note that GROQ is for Phase 0 testing; production LLM will be selected in PR-11.
  - **Environment Variables**: Table listing each variable and its purpose.

**Testing**
- Manual: Follow README instructions from scratch to verify they work.

**Notes / Risks**
- Keep README concise; detailed architecture docs can come later.

---

### Step 6: Vercel Deployment Configuration

**Goal**  
Link the project to Vercel, configure environment variables, and verify the first deployment succeeds.

**Backend Changes**
- None.

**Frontend Changes**
- None.

**Data Changes**
- None.

**Infra / Config**
- **Vercel Setup**:
  - Create Vercel project via dashboard or CLI.
  - Link to Git repository (GitHub/GitLab/Bitbucket).
  - Configure environment variables in Vercel dashboard (copy from `.env.example`).
  - Enable automatic preview deployments for all PRs.
- **Verification**:
  - Push code to Git, create a PR.
  - Verify Vercel builds and deploys a preview environment.
  - Navigate to preview URL `/api/health`, verify returns `{ "status": "ok" }`.

**Testing**
- Manual: Create PR, verify Vercel comment appears with preview URL.
- Manual: Open preview URL, verify landing page loads.
- Manual: Open preview URL `/api/health`, verify 200 response.

**Notes / Risks**
- **Risk**: Missing env vars on Vercel causes deployment failure.
  - **Mitigation**: Double-check all required variables are set in Vercel dashboard before first deployment.
- **Risk**: Database connection fails if `DATABASE_URL` points to local DB.
  - **Mitigation**: Use a managed Postgres service (Neon, Supabase, or Vercel Postgres) accessible from Vercel.

---

## PR Plan

### Branch Name
`feat/bootstrap-project`

### PR Title
Bootstrap Next.js project with Vercel deployment and core dependencies

### PR Description
- **Backend**: Add health check endpoint (`GET /api/health`) and environment variable validation (`src/lib/env.ts`).
- **Frontend**: Initialize Next.js 14+ with TypeScript, App Router, and Tailwind CSS; placeholder landing page.
- **Data**: Initialize Prisma client and schema file (empty models).
- **Infra**: Configure Vercel project, set up automatic preview deployments, document all required environment variables in `.env.example`.
- **Documentation**: Add README with setup instructions and LLM migration plan.

### Risk & Rollback
**Main Risks**:
- Environment variable misconfiguration on Vercel (deployment fails).
- Node.js version mismatch between local and Vercel (runtime errors).

**Rollback Strategy**:
- Revert commit if deployment fails.
- Re-check environment variables in Vercel dashboard.
- Verify `.nvmrc` and `package.json` engines field match Vercel's Node version.

### Verification Checklist
- [ ] `npm run dev` starts locally without errors.
- [ ] `http://localhost:3000` displays landing page.
- [ ] `http://localhost:3000/api/health` returns `{ "status": "ok" }`.
- [ ] App fails gracefully if required env var is missing (clear error message).
- [ ] Vercel preview deployment builds successfully.
- [ ] Preview URL `/api/health` returns 200.
- [ ] README setup instructions are accurate (tested from scratch).

---

## Follow-Ups (Post-PR)

- **Database Schema Design** (PR-02): Define Destination, DiveSite, DiveShop, Lead, Session models.
- **Content Curation** (PR-03): Create markdown files for Tioman (overview, sites, logistics, safety, PADI certification guide).
- **Chat API** (PR-04): Implement chat orchestration and GROQ integration.
- **Frontend UI** (PR-05): Build chat interface with streaming responses.
- **LLM Migration** (PR-11): Evaluate and migrate from GROQ to production LLM provider.
