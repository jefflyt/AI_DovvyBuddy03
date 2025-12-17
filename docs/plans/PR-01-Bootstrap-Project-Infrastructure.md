# PR-01: Bootstrap Project & Infrastructure

**Branch:** `feat/bootstrap-project` **Epic:** DovvyBuddy MVP - Phase 0
**Status:** Not Started **Estimated Effort:** 4-6 hours

---

## Goal

Establish Next.js project skeleton, configure Vercel deployment, and validate core tooling setup.

---

## Scope

**Included:**

- Initialize Next.js 14+ with TypeScript, App Router, Tailwind CSS
- Install dependencies: prisma, groq-sdk, @google/generative-ai, zod
- Configure environment variables and validation
- Deploy basic health endpoint to Vercel staging

**Excluded:**

- Database schema finalization (PR-02)
- Actual API logic (PRs 3-4)
- Frontend chat UI (PR-05)

---

## Backend Changes

### New Endpoints

- `GET /api/health`: Returns `{ status: 'ok' }` for uptime monitoring

### Configuration

- Environment variable validation on startup (Zod schema for required vars)
- Validate presence of: DATABASE_URL, GROQ_API_KEY, GOOGLE_AI_API_KEY, SENDGRID_API_KEY, NEXT_PUBLIC_APP_URL

---

## Frontend Changes

### Pages

- Scaffold Next.js app with Tailwind CSS
- Create placeholder landing page at `/`

### Components

- None yet (PR-05)

---

## Data Changes

### Schema

- Initialize Prisma client and schema file (empty models)
- No migrations yet (PR-02)

---

## Infra / Config

### Environment Variables

Create `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dovvybuddy"
GROQ_API_KEY="your-groq-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
SENDGRID_API_KEY="your-sendgrid-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="your-session-secret"
```

### Vercel Setup

- Configure Vercel project
- Link to Git repository
- Set up preview deployments (automatic per PR)
- Configure environment variables in Vercel dashboard

### Documentation

Create `README.md` with:

- Project overview
- Setup instructions (clone, install, env vars, run dev)
- LLM migration plan (GROQ → production provider in Phase 1)
- Tech stack summary

---

## Testing

### Manual Testing

- [ ] Verify `npm run dev` starts locally at <http://localhost:3000>
- [ ] Navigate to `/api/health`, verify returns `{ "status": "ok" }`
- [ ] Verify environment validation fails gracefully if required vars missing

### CI/CD Testing

- [ ] Create PR, verify Vercel builds successfully
- [ ] Verify preview deployment URL accessible
- [ ] Verify `/api/health` returns 200 on preview deployment

---

## Dependencies

**Prerequisite PRs:** None (greenfield project)

**External Dependencies:**

- Vercel account created
- Git repository initialized
- Node.js 18+ installed locally

---

## Risks & Mitigations

### Risk: Environment Variable Misconfiguration on Vercel

**Impact:** App crashes on deployment due to missing env vars **Mitigation:**

- Document all required env vars in README
- Validate on startup with clear error messages
- Test on Vercel preview before merging

### Risk: Node.js Version Mismatch

**Impact:** Build failures or runtime errors **Mitigation:**

- Specify Node.js version in `package.json` engines field
- Use `.nvmrc` file for local development
- Verify Vercel uses same Node.js version

---

## Acceptance Criteria

- [ ] Next.js 14+ project initialized with TypeScript and App Router
- [ ] All dependencies installed: prisma, groq-sdk, @google/generative-ai, zod, tailwindcss
- [ ] `.env.example` created with all required variables documented
- [ ] `/api/health` endpoint returns `{ "status": "ok" }`
- [ ] Environment variable validation runs on startup
- [ ] Vercel project configured and linked to Git repo
- [ ] Preview deployment successful
- [ ] README.md contains setup instructions and LLM migration plan

---

## Implementation Checklist

- [ ] Run `npx create-next-app@latest dovvybuddy --typescript --tailwind --app`
- [ ] Install dependencies: `npm install prisma @prisma/client groq-sdk @google/generative-ai zod`
- [ ] Create `src/lib/env.ts` for environment variable validation (Zod schemas)
- [ ] Create `/api/health/route.ts` with health check endpoint
- [ ] Create `.env.example` with all required variables
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Create README.md with setup instructions
- [ ] Configure Vercel project via dashboard or CLI
- [ ] Set environment variables in Vercel
- [ ] Push to Git, create PR
- [ ] Verify preview deployment works
- [ ] Test `/api/health` endpoint on preview URL

---

## Notes

- Keep Prisma schema minimal (empty models) in this PR; schema design happens in PR-02
- Focus on tooling and infrastructure validation
- GROQ SDK is for Phase 0 testing only; production LLM provider will be selected in PR-11
- Google AI SDK is for RAG embeddings (Gemini), not for LLM chat
