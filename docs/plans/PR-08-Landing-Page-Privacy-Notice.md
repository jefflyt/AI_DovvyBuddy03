# PR-08: Landing Page & Privacy Notice

**Branch:** `feat/landing-page-privacy`
**Epic:** DovvyBuddy MVP - Phase 1
**Status:** Not Started
**Estimated Effort:** 4-6 hours

---

## Goal

Create SEO-optimized landing page with clear coverage messaging and privacy
notice.

---

## Scope

**Included:**

- Landing page at `/` with hero, features, coverage, CTA
- Privacy notice page at `/privacy`
- Footer component with links
- Basic SEO meta tags

**Excluded:**

- Advanced SEO (OpenGraph, structured data; defer to PR-12)
- Terms of Service (optional; can add if time permits)
- Marketing content beyond basic value prop

---

## Backend Changes

No backend changes

---

## Frontend Changes

### Update Landing Page

**`/app/page.tsx`** (Server Component for SEO)

**Sections:**

#### Hero Section

- **Headline:** "Plan Your Next Dive Trip with AI"
- **Subheadline:** "Get personalized dive site recommendations for Tioman,
Malaysia based on your experience level and interests"
- **CTA Button:** "Start Chatting" → links to `/chat`
- **Visual:** Hero image or illustration (dive-themed, optional)

#### Features Section

- **Feature 1:** "RAG-Grounded Information"
  - Curated, trustworthy content from local operators and safety organizations
- **Feature 2:** "Safety-First Guidance"
  - Clear disclaimers, vetted safety sources (DAN + PADI)
- **Feature 3:** "Qualified Lead Generation"
  - Connect with trusted partner dive shops with context-rich introductions

#### Coverage Section

- **Headline:** "Currently Covering: Tioman, Malaysia"
- **Description:** "We're starting with one destination to ensure quality. More
locations coming soon!"
- **Map/Visual:** Simple map showing Tioman location (optional)

#### Disclaimer Section

- **Clear Messaging:**
  - "No Booking Engine: We don't book trips, but we connect you with partners
who can"
  - "No Medical Advice: Always consult a dive physician for medical concerns"
  - "Information Only: Verify details with local operators"

#### CTA Section

- **Headline:** "Ready to explore Tioman?"
- **CTA Button:** "Get Started" → links to `/chat`

### New Privacy Notice Page

**`/app/privacy/page.tsx`**

**Content:**

#### What Data We Collect

- Name and email (when you submit a lead)
- Conversation context (your questions and our responses)
- Session information (anonymous session token, IP address for security)

#### How We Use Your Data

- Provide dive site recommendations
- Deliver qualified leads to partner dive shops
- Improve our service (analyze common questions, fix errors)

#### Data Retention

- Lead data: 12 months (or partner-defined policy)
- Session logs: 60 minutes (auto-expire after inactivity)
- Conversation history: Stored during session only (not persisted for guest
users)

#### Data Sharing

- We share lead data (name, email, dive interests) with partner dive shops you
choose to contact
- We do not sell or share data with third parties for marketing
- Partner shops are responsible for their own data handling

#### Your Rights

- Request deletion: Email [founder email] to delete your lead data
- Opt-out: Don't submit leads if you don't want data shared
- Questions: Contact [founder email]

#### Cookies & Tracking

- Session token (localStorage, no cookies)
- Analytics (Vercel Analytics, anonymized)
- No third-party advertising cookies

#### Changes to Policy

- We may update this policy; check back periodically
- Major changes will be announced on landing page

### New Footer Component

**`components/Footer.tsx`**

**Links:**

- Privacy Notice → `/privacy`
- (Optional) Terms of Service → `/terms`
- Contact: [founder email]
- GitHub (optional): link to public repo if open-source

**Copyright:** "© 2025 DovvyBuddy. Informational tool only. Not a booking
platform."

**Legal Disclaimer:** "DovvyBuddy is an informational tool. It does not provide
medical advice, dive planning services, or booking. Always verify information
with qualified professionals."

---

## Data Changes

No changes

---

## Infra / Config

No changes

---

## Testing

### Manual Tests

#### Landing Page

- [ ] Verify page loads at `/`
- [ ] Click CTA button → navigates to `/chat`
- [ ] Verify all sections render (Hero, Features, Coverage, Disclaimer, CTA)
- [ ] Test on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Verify footer links work

#### Privacy Notice

- [ ] Verify page loads at `/privacy`
- [ ] Read through content for accuracy
- [ ] Verify footer links work

#### SEO

- [ ] View page source, verify `<title>` tag present
- [ ] Verify `<meta name="description">` tag present
- [ ] Run Lighthouse audit (score > 90 for SEO, Accessibility, Best Practices)

---

## Dependencies

**Prerequisite PRs:**

- PR-05 merged (chat page exists for CTA link)

**External Dependencies:**

- Hero image or illustration (optional; can use solid color background)

---

## Risks & Mitigations

### Risk: Poor SEO (No Organic Traffic)

**Impact:** Reliance on partner referrals only **Mitigation:**

- Optimize meta tags (title, description)
- Use semantic HTML (h1, h2, strong, etc.)
- Add structured data in PR-12
- Focus on long-tail keywords: "Tioman diving guide", "best dive sites Tioman for beginners"

### Risk: Privacy Policy Doesn't Meet Legal Requirements

**Impact:** Legal liability, user trust issues **Mitigation:**

- Review with legal resources (PADI, DAN, or solo founder communities)
- Use template from privacy policy generator (e.g., TermsFeed, iubenda)
- Clearly state limitations (information only, no warranties)

---

## Acceptance Criteria

- [ ] Landing page renders at `/` with Hero, Features, Coverage, Disclaimer, CTA sections
- [ ] CTA buttons link to `/chat`
- [ ] Privacy notice page renders at `/privacy` with complete content
- [ ] Footer component displays on all pages with working links
- [ ] Mobile-responsive (tested on 375px, 768px, 1024px)
- [ ] Basic SEO meta tags present (title, description)
- [ ] Lighthouse SEO score > 90

---

## Implementation Checklist

- [ ] Update `/app/page.tsx` with landing page sections
- [ ] Create `components/Hero.tsx`, `components/Features.tsx`, `components/Coverage.tsx` (optional; can inline)
- [ ] Create `/app/privacy/page.tsx` with privacy notice content
- [ ] Create `components/Footer.tsx`
- [ ] Add Footer to root layout (`/app/layout.tsx`)
- [ ] Add basic SEO meta tags to landing page and privacy page
- [ ] Style with Tailwind CSS (consistent with chat UI)
- [ ] Test on mobile, tablet, desktop viewports
- [ ] Run Lighthouse audit, fix any major issues
- [ ] Proofread privacy notice for accuracy

---

## Notes

### SEO Meta Tags (Basic)

**Landing Page:**

```tsx
export const metadata = {
  title: 'DovvyBuddy - AI Diving Assistant for Tioman, Malaysia',
  description: 'Plan your dive trip to Tioman with AI-powered recommendations. Get site suggestions, safety guidance, and connect with trusted dive shops.'
}
```

**Privacy Page:**

```tsx
export const metadata = {
  title: 'Privacy Policy - DovvyBuddy',
  description: 'DovvyBuddy privacy policy: how we collect, use, and protect your data.'
}
```

### Hero Image

**Options:**

1. Use free stock photo from Unsplash (search "scuba diving Tioman")
2. Use solid color gradient background (no image)
3. Simple illustration (diving icon, coral, fish)

### Privacy Policy Template

Use template from:

- <https://www.termsfeed.com/privacy-policy-generator/>
- <https://www.iubenda.com/en/privacy-policy-generator>
- Adapt for specific use case (no booking, lead generation, guest-only)

### Footer Legal Disclaimer

```text
DovvyBuddy is an informational tool only. It does not provide medical advice, 
dive planning services, or booking. Always verify information with qualified 
dive professionals and operators. Use at your own risk.
```

### Long-Tail Keywords for SEO

Include naturally in landing page copy:

- "best dive sites in Tioman for beginners"
- "Tioman diving guide"
- "when to dive Tioman Malaysia"
- "Tioman dive trip planning"
- "beginner-friendly dive sites Tioman"

### Accessibility

- Use semantic HTML (h1, h2, nav, main, footer)
- Add alt text to images
- Ensure color contrast meets WCAG AA standards (use Lighthouse to check)
- Keyboard navigation works (tab through links, buttons)
