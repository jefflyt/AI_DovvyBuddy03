# PR-12: Production Readiness & Launch Checklist

**Branch:** `feat/production-launch` **Epic:** DovvyBuddy MVP - Phase 1
**Status:** Not Started **Estimated Effort:** 6-8 hours

---

## Goal

Final production environment hardening, uptime checks, SEO meta tags, launch
checklist completion.

---

## Scope

**Included:**

- Advanced SEO meta tags (OpenGraph, Twitter cards, structured data)
- Uptime monitoring setup
- Production environment configuration review
- Comprehensive launch checklist
- Documentation updates

**Excluded:**

- Marketing/content marketing (separate workstream)
- Paid advertising setup (separate)
- Social media accounts (separate)

---

## Backend Changes

No new endpoints

### Rate Limiting Review

**Verify all API routes have rate limiting:**

- `/api/chat`: 20 requests/min per session
- `/api/leads`: 3 leads/hour per session
- `/api/health`: No limit (uptime checks)

---

## Frontend Changes

### Advanced SEO Meta Tags

**Update Landing Page (`/app/page.tsx`):**

```tsx
export const metadata = {
  title: 'DovvyBuddy - AI Diving Assistant for Tioman, Malaysia',
  description: 'Plan your dive trip to Tioman with AI-powered recommendations. Get site suggestions, safety guidance, and connect with trusted dive shops.',
  keywords: 'Tioman diving, dive sites Tioman, Malaysia diving, beginner dive sites, AI diving assistant, dive trip planning',
  
  // OpenGraph (Facebook, LinkedIn)
  openGraph: {
    title: 'DovvyBuddy - AI Diving Assistant for Tioman, Malaysia',
    description: 'Plan your dive trip to Tioman with AI-powered recommendations',
    url: 'https://dovvybuddy.com',
    siteName: 'DovvyBuddy',
    images: [{
      url: 'https://dovvybuddy.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'DovvyBuddy AI Diving Assistant'
    }],
    locale: 'en_US',
    type: 'website'
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'DovvyBuddy - AI Diving Assistant',
    description: 'Plan your Tioman dive trip with AI',
    images: ['https://dovvybuddy.com/og-image.jpg']
  },
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}
```

**Create OG Image:**

- 1200×630px
- DovvyBuddy logo + tagline
- Diving imagery
- Tool: Canva, Figma, or use simple text on gradient background

### Structured Data (JSON-LD)

**Add to Landing Page:**

```tsx
export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'DovvyBuddy',
    description: 'AI diving assistant for Tioman, Malaysia',
    url: 'https://dovvybuddy.com',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8', // Update when reviews available
      reviewCount: '10' // Update when reviews available
    }
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ... rest of landing page */}
    </>
  )
}
```

### Favicon & App Icons

**Add to `/public`:**

- `favicon.ico` (32×32, 16×16)
- `apple-touch-icon.png` (180×180)
- `icon-192.png` (192×192, for Android)
- `icon-512.png` (512×512, for Android)

**Update Root Layout:**

```tsx
export const metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}
```

---

## Data Changes

No changes

---

## Infra / Config

### Uptime Monitoring

**Setup UptimeRobot (or similar):**

1. Create account at <https://uptimerobot.com> (free tier: 50 monitors, 5-min
interval)
2. Add HTTP monitor:
   - URL: `https://dovvybuddy.com/api/health`
   - Interval: 5 minutes
   - Alert contacts: Founder's email
   - Alert threshold: 2 failures
3. Test: Verify alerts work (temporarily disable health endpoint)

**Alternative Tools:**

- Better Uptime (free tier, status page included)
- Pingdom (paid, $10/month)
- Vercel Monitoring (built-in, but limited)

### Production Environment Review

**Verify Environment Variables:**

- [ ] `DATABASE_URL` (production Postgres)
- [ ] `LLM_PROVIDER` ('openai', 'anthropic', or 'gemini')
- [ ] `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY` (chosen
provider)
- [ ] `GOOGLE_AI_API_KEY` (for RAG embeddings)
- [ ] `SENDGRID_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (`https://dovvybuddy.com`)
- [ ] `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `FOUNDER_EMAIL`
- [ ] `SESSION_SECRET`

**Security Review:**

- [ ] HTTPS enforced (Vercel default)
- [ ] Secrets not exposed in client bundle (use `NEXT_PUBLIC_` prefix only for
public vars)
- [ ] CORS configured (default: same-origin only)
- [ ] Rate limiting enabled on all API routes
- [ ] Input validation with Zod on all API routes
- [ ] No console.log in production code (use logger)

### Custom Domain (Optional)

**If using custom domain:**

1. Purchase domain (e.g., dovvybuddy.com)
2. Add to Vercel project (Project Settings → Domains)
3. Configure DNS (A/CNAME records)
4. Verify SSL certificate provisioned
5. Update `NEXT_PUBLIC_APP_URL` env var

**If using Vercel subdomain:**

- Use `https://dovvybuddy.vercel.app` (or similar)
- Update all references to domain

---

## Testing

### Pre-Launch Smoke Test

**End-to-End Flow:**

- [ ] Load landing page <https://dovvybuddy.com>
- [ ] Click CTA → navigate to /chat
- [ ] Send message: "What are the best beginner sites in Tioman?"
- [ ] Verify response streams in with site names
- [ ] Say "I'd like to contact a shop"
- [ ] Verify lead capture modal opens
- [ ] Fill out form, submit
- [ ] Verify success message
- [ ] Check partner shop email inbox
- [ ] Verify lead email received with correct data

**Mobile Testing:**

- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Android Chrome
- [ ] Verify responsive layout (no horizontal scroll)
- [ ] Verify touch targets (buttons, inputs) are tappable

**SEO Testing:**

- [ ] View page source, verify meta tags
- [ ] Use Google Rich Results Test: <https://search.google.com/test/rich-results>
- [ ] Verify structured data valid
- [ ] Use Facebook Sharing Debugger:
  <https://developers.facebook.com/tools/debug/>
- [ ] Verify OG image displays correctly

**Performance Testing:**

- [ ] Run Lighthouse audit (target: >90 for all categories)
- [ ] Verify P95 latency <10s (use monitoring or manual timing)
- [ ] Verify no console errors (browser DevTools)

**Security Testing:**

- [ ] Verify HTTPS enforced (try http:// URL)
- [ ] Verify rate limiting (send 21 requests in 1 min to /api/chat)
- [ ] Verify input validation (send malformed JSON to /api/leads)
- [ ] Check for exposed secrets (search bundle for API keys)

### Monitoring Validation

**After Launch (24 hours):**

- [ ] Check Vercel Analytics for traffic
- [ ] Check Sentry for errors
- [ ] Check uptime monitor (99%+ uptime)
- [ ] Check SendGrid delivery reports (all leads delivered or failed with
notification)
- [ ] Review founder email (any failure notifications?)

---

## Dependencies

**Prerequisite PRs:**

- All PRs 1-11 merged and tested

**External Dependencies:**

- Custom domain purchased and configured (optional)
- OG image created
- Favicon and app icons created
- Uptime monitoring service account

---

## Risks & Mitigations

### Risk: Production Deployment Breaks Due to Env Var Misconfiguration

**Impact:** App crashes on launch **Mitigation:**

- Validate env vars on startup (already implemented in PR-01)
- Test on staging mirror before production
- Use Vercel preview deployment for final pre-launch test

### Risk: SEO Doesn't Drive Traffic Immediately

**Impact:** Low user volume for first 2-4 weeks **Mitigation:**

- Set expectations (organic SEO takes time)
- Use partner referrals for initial traffic
- Share on diving forums/communities (Reddit, ScubaBoard)
- Submit to Google Search Console for faster indexing

### Risk: Critical Bug Discovered After Launch

**Impact:** Poor first impression, reputation damage **Mitigation:**

- Comprehensive smoke test before launch
- Monitor Sentry for errors post-launch
- Respond to bugs within 24 hours (fix + deploy)
- Have rollback plan (revert to previous deployment)

---

## Acceptance Criteria

- [ ] Advanced SEO meta tags added (OpenGraph, Twitter, structured data)
- [ ] OG image created and deployed
- [ ] Favicon and app icons added
- [ ] Uptime monitoring configured (UptimeRobot or equivalent)
- [ ] Production environment variables verified
- [ ] Rate limiting verified on all API routes
- [ ] Security review complete
- [ ] Custom domain configured (if applicable)
- [ ] Pre-launch smoke test complete (end-to-end flow works)
- [ ] Mobile testing complete (iOS + Android)
- [ ] SEO testing complete (Rich Results, Sharing Debugger)
- [ ] Lighthouse audit score >90 for all categories
- [ ] Launch checklist 100% complete

---

## Implementation Checklist

### SEO & Assets (3-4 hours)

- [ ] Create OG image (1200×630px)
- [ ] Create favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png
- [ ] Update landing page metadata (OpenGraph, Twitter)
- [ ] Add structured data (JSON-LD) to landing page
- [ ] Add icons to root layout
- [ ] Test with Google Rich Results Test
- [ ] Test with Facebook Sharing Debugger

### Infrastructure (2-3 hours)

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure custom domain (if applicable)
- [ ] Verify all production env vars in Vercel
- [ ] Review security settings
- [ ] Verify rate limiting on all API routes
- [ ] Configure Vercel deployment settings (auto-deploy on main)

### Testing & Launch (2-3 hours)

- [ ] Run pre-launch smoke test (end-to-end flow)
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit, fix critical issues
- [ ] Deploy to production
- [ ] Verify production deployment successful
- [ ] Run smoke test on production URL
- [ ] Monitor for 1 hour post-launch (Sentry, Analytics, uptime)

### Post-Launch (1 hour)

- [ ] Submit sitemap to Google Search Console
- [ ] Share launch on diving communities (optional)
- [ ] Notify partner shops (app is live)
- [ ] Update README with production URL
- [ ] Document any launch issues in retrospective

---

## Launch Checklist

### Pre-Launch (Complete Before Deployment)

**Code & Testing:**

- [ ] All PRs 1-11 merged to `main`
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] End-to-end smoke test passing
- [ ] Mobile testing complete (iOS + Android)
- [ ] No console errors or warnings

**Content & Data:**

- [ ] Curated content for Tioman reviewed and approved
- [ ] Database seeded with Tioman data (1 destination, 8 sites, 2 shops)
- [ ] Embeddings generated (`embeddings.json`)
- [ ] Partner shops confirmed and onboarded (2 shops in Tioman)

**Environment & Configuration:**

- [ ] All production env vars configured in Vercel
- [ ] Secrets verified (API keys valid and working)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned and valid
- [ ] HTTPS enforced

**Security:**

- [ ] Rate limiting enabled on all API routes
- [ ] Input validation with Zod on all API routes
- [ ] Secrets not exposed in client bundle
- [ ] CORS configured correctly
- [ ] No sensitive data in logs or Sentry

**Monitoring & Observability:**

- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking active (client + server)
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Founder email alerts set up (lead failures, uptime, errors)
- [ ] Structured logging active (pino)

**SEO & Marketing:**

- [ ] Landing page with clear value prop
- [ ] Privacy notice published
- [ ] SEO meta tags (title, description, OpenGraph, Twitter)
- [ ] Structured data (JSON-LD)
- [ ] OG image, favicon, app icons
- [ ] Robots.txt allows indexing
- [ ] Sitemap generated (optional for V1)

**Documentation:**

- [ ] README.md updated with setup instructions
- [ ] MASTER_PLAN.md finalized
- [ ] All PR specs complete
- [ ] Partner onboarding guide created (email template for lead format)

### Launch Day

- [ ] Deploy to production (merge to `main`, verify Vercel deployment)
- [ ] Run smoke test on production URL
- [ ] Verify uptime monitor pinging successfully
- [ ] Verify analytics tracking events
- [ ] Submit to Google Search Console (optional)
- [ ] Notify partner shops (app is live, test leads)
- [ ] Share on diving communities (Reddit, ScubaBoard) (optional)
- [ ] Monitor for first 4 hours (Sentry, Analytics, uptime)

### Post-Launch (First Week)

- [ ] Monitor daily: errors, uptime, lead delivery
- [ ] Review first 10 leads with partner shops (quality check)
- [ ] Address any critical bugs within 24 hours
- [ ] Collect user feedback (manual review of conversations)
- [ ] Track success metrics: weekly active users, leads/week (target 60% training-related)
- [ ] Document lessons learned in retrospective

---

## Notes

### Lighthouse Audit Targets

**Performance:** >90

- Optimize images (WebP, lazy loading)
- Minimize JavaScript bundle size
- Use Next.js Image component

**Accessibility:** >90

- Semantic HTML (h1, h2, nav, main, footer)
- Alt text for images
- Color contrast WCAG AA
- Keyboard navigation

**Best Practices:** >90

- HTTPS enforced
- No console errors
- Secure dependencies (npm audit)

**SEO:** >90

- Meta tags
- Structured data
- Mobile-friendly
- Fast load times

### Google Search Console Setup

1. Go to <https://search.google.com/search-console>
2. Add property (dovvybuddy.com)
3. Verify ownership (Vercel DNS or HTML file)
4. Submit sitemap (optional: `/sitemap.xml`)
5. Monitor indexing status

### OG Image Design Tips

**Content:**

- DovvyBuddy logo (prominent)
- Tagline: "AI Diving Assistant for Tioman, Malaysia"
- Diving imagery (coral, fish, diver)
- Clean, readable font

**Tools:**

- Canva: <https://www.canva.com/create/open-graph/>
- Figma: Design custom
- Placeholder: <https://og-image.vercel.app> (generate programmatically)

### Favicon Generation

Use tool: <https://realfavicongenerator.net>

- Upload logo (512×512 source)
- Generate all sizes
- Download package
- Add to `/public`

### Deployment Best Practices

**Before Deploy:**

- Test on Vercel preview deployment (create PR, test preview URL)
- Review Vercel deployment logs for warnings
- Verify build succeeds without errors

**After Deploy:**

- Keep previous deployment available (Vercel keeps history)
- Monitor Sentry for errors (first 30 min)
- Be ready to rollback if critical issue (Vercel dashboard: Deployments →
Promote)

**Rollback Plan:**

- Vercel → Deployments → Select previous deployment → Promote to Production
- Estimated time: <2 minutes
