# PR-06: Lead Capture & Delivery

**Branch:** `feat/lead-capture` **Epic:** DovvyBuddy MVP - Phase 0 **Status:**
Not Started **Estimated Effort:** 8-10 hours

---

## Goal

Implement inline lead capture flow and email delivery to partner shops via SendGrid.

---

## Scope

**Included:**

- Lead capture modal triggered by chat context
- `/api/leads` endpoint for lead submission
- SendGrid email integration for lead delivery
- Lead storage with delivery status tracking
- Founder notification on delivery failure

**Excluded:**

- Partner dashboard (Phase 4)
- Webhook delivery (Phase 2+)
- Advanced lead analytics (Phase 1+)

---

## Backend Changes

### New Service

**LeadService** (`src/services/LeadService.ts`)

```typescript
interface CreateLeadInput {
  name: string
  email: string
  inquiryType: 'learn-to-dive' | 'advance-cert' | 'fun-dive' | 'other'
  destinationId?: string
  preferredShopId?: string
  context: {
    certLevel?: string
    interests?: string
    travelWindow?: string
    highlights?: string
  }
}

class LeadService {
  async createLead(data: CreateLeadInput): Promise<string>
  async deliverLead(leadId: string): Promise<boolean>
}
```

**Logic:**

1. `createLead()`: Validate input (Zod), insert into Lead table, return leadId
2. `deliverLead()`:
   - Fetch lead + destination + partner shop(s) from DB
   - Format email using template
   - Send via SendGrid
   - Update delivery_status ('pending' → 'delivered' or 'failed')
   - On failure: log error, notify founder

### New Endpoint

**`POST /api/leads`**

**Request:**

```typescript
{
  sessionToken: string
  name: string
  email: string
  destinationId?: string
  preferredShopId?: string
  context: {
    certLevel?: string
    interests?: string
    travelWindow?: string
    highlights?: string
  }
}
```

**Validation (Zod):**

```typescript
const leadRequestSchema = z.object({
  sessionToken: z.string().min(1),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  inquiryType: z.enum(['learn-to-dive', 'advance-cert', 'fun-dive', 'other']),
  destinationId: z.string().optional(),
  preferredShopId: z.string().optional(),
  context: z.object({
    certLevel: z.string().optional(),
    interests: z.string().max(500).optional(),
    travelWindow: z.string().max(200).optional(),
    highlights: z.string().max(1000).optional()
  })
})
```

**Response:**

```typescript
{
  success: boolean
  leadId?: string
  error?: string
}
```

**Error Handling:**

- 400: Invalid request (validation errors)
- 429: Rate limit (max 3 leads per session per hour)
- 500: Internal error

### Email Template

**Template** (`src/templates/leadEmail.ts`)

**Subject:** `New DovvyBuddy Lead: [Name] - [Destination]`

**Body (HTML + Plain Text):**

```html
Hi [Shop Name],

You've received a new lead from DovvyBuddy:

**Contact Information:**
Name: [Name]
Email: [Email]

**Dive Profile:**
Certification Level: [Cert Level or "Not specified"]
Interests: [Interests or "General diving"]
Travel Window: [Travel Window or "Flexible"]

**Conversation Highlights:**
[Highlights from conversation, e.g., "Looking for beginner-friendly sites with good macro photography opportunities. Interested in shore diving. Planning trip for April-May 2026."]

**Destination:**
[Destination Name, Country]

**Next Steps:**
Reply directly to [Email] to follow up. This lead was generated via DovvyBuddy's AI assistant and includes context from the diver's conversation.

---
DovvyBuddy - AI Diving Assistant
[NEXT_PUBLIC_APP_URL]
```

**Plain Text Version:** Same content, plain text formatting

### SendGrid Integration

**Setup:**

- Install `@sendgrid/mail`
- Configure API key from env var `SENDGRID_API_KEY`
- Verify sender email (use founder's email or <noreply@dovvybuddy.com>)

**Delivery Logic:**

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: shop.contactEmail,
  from: 'noreply@dovvybuddy.com', // Must be verified in SendGrid
  subject: `New DovvyBuddy Lead: ${lead.name} - ${destination.name}`,
  text: renderTextTemplate(lead, destination, shop),
  html: renderHtmlTemplate(lead, destination, shop)
}

try {
  await sgMail.send(msg)
  // Update delivery_status = 'delivered'
} catch (error) {
  // Log error, update delivery_status = 'failed', notify founder
}
```

**Founder Notification (on failure):**

```typescript
const founderMsg = {
  to: process.env.FOUNDER_EMAIL,
  from: 'noreply@dovvybuddy.com',
  subject: '⚠️ Lead Delivery Failed',
  text: `Lead ${leadId} failed to deliver to ${shop.contactEmail}. Error: ${error.message}`
}
await sgMail.send(founderMsg)
```

### Update ChatService

**Detect Lead Intent:**

Add to `ChatService.processMessage()`:

```typescript
const leadIntentKeywords = [
  'contact shop',
  'get quote',
  'interested in booking',
  'connect me',
  'talk to operator',
  'reach out to shop'
]

const messageContainsLeadIntent = leadIntentKeywords.some(keyword =>
  userMessage.toLowerCase().includes(keyword)
)

if (messageContainsLeadIntent || /* LLM suggests shop connection */) {
  metadata.triggerLeadCapture = true
}
```

---

## Frontend Changes

### New Component

#### LeadCaptureModal.tsx

**Props:**

```typescript
interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  sessionToken: string
  destinationId?: string
  conversationHighlights?: string
}
```

**Fields:**

- Name (required, text input)
- Email (required, email input)
- Certification Level (optional, dropdown: Open Water, Advanced, Rescue,
Divemaster, Instructor, Not yet certified)
- Interests (optional, textarea, placeholder: "e.g., macro photography, wreck
diving, sharks")
- Travel Window (optional, text input, placeholder: "e.g., April-May 2026")
- Consent checkbox (required): "I agree to share my information with partner
dive shops"
- Privacy notice link

**Submit Flow:**

1. Validate form (client-side)
2. POST to `/api/leads`
3. On success: show success message, close modal
4. On error: show error message, enable retry

**Success Message:**

```text
✅ Thanks! We've shared your information with our partner dive shops in [Destination].
They'll reach out to you at [email] within 24-48 hours.
```

### Update ChatMessage.tsx

**Trigger Modal:**

If message metadata includes `triggerLeadCapture: true`:

- Show "Connect with a Dive Shop" button below assistant message
- On click: open LeadCaptureModal with pre-filled conversation highlights

---

## Data Changes

Lead table already exists from PR-02

No migrations needed

---

## Infra / Config

### Environment Variables

**New:**

- `SENDGRID_API_KEY`: SendGrid API key
- `FOUNDER_EMAIL`: Founder's email for failure notifications

**SendGrid Setup:**

1. Create SendGrid account (free tier: 100 emails/day)
2. Generate API key
3. Verify sender email (<noreply@dovvybuddy.com> or founder's email)
4. Add to Vercel env vars

---

## Testing

### Unit Tests

**LeadService:**

- [ ] `createLead()` validates email format
- [ ] `createLead()` inserts to DB with correct data
- [ ] `deliverLead()` fetches lead + destination + shop correctly
- [ ] Email template renders with test data

### Integration Tests

**Happy Path:**

- [ ] POST to `/api/leads` with valid data
- [ ] Verify lead saved to DB (delivery_status='pending')
- [ ] Verify email sent to partner shop (use SendGrid sandbox)
- [ ] Verify delivery_status updated to 'delivered'

**Failure Case:**

- [ ] POST with invalid SendGrid API key
- [ ] Verify delivery_status updated to 'failed'
- [ ] Verify founder notification email sent

**Rate Limiting:**

- [ ] Submit 4 leads in 1 hour from same session
- [ ] Verify 4th request returns 429

### Manual Tests

**End-to-End:**

- [ ] In chat UI, say "I'd like to contact a dive shop"
- [ ] Verify "Connect with a Dive Shop" button appears
- [ ] Click button, modal opens
- [ ] Fill out form, submit
- [ ] Verify success message
- [ ] Check partner shop email inbox (or SendGrid activity log)
- [ ] Verify email received with correct data

**Edge Cases:**

- [ ] Submit without consent checkbox → error
- [ ] Submit with invalid email → error
- [ ] Submit twice in quick succession → second submission works (no duplicate
prevention yet)

---

## Dependencies

**Prerequisite PRs:**

- PR-02 merged (Lead table exists)
- PR-04 merged (ChatService can detect lead intent)
- PR-05 merged (Chat UI available)

**External Dependencies:**

- SendGrid account created
- Sender email verified
- Partner shop emails confirmed (or use test emails)

---

## Risks & Mitigations

### Risk: SendGrid Delivery Failure

**Impact:** Leads not delivered to partners; revenue lost **Mitigation:**

- Implement retry logic (1 retry after 5s delay)
- Log failures with full context
- Founder notification on failure
- Manual retry UI (defer to Phase 1)
- Test with SendGrid sandbox before production

### Risk: Emails Land in Spam

**Impact:** Partners don't see leads **Mitigation:**

- Verify sender domain (SPF, DKIM records)
- Warm up sending reputation (start with low volume)
- Use plain text + HTML (avoid spam triggers)
- Ask partners to whitelist <noreply@dovvybuddy.com>
- Monitor delivery rates via SendGrid dashboard

### Risk: Spam Submissions (Fake Leads)

**Impact:** Partners receive low-quality leads **Mitigation:**

- Rate limiting (max 3 leads per session per hour)

### Risk: Conversation Highlights Missing Context

**Impact:** Partners receive leads without enough information

**Mitigation:**

- Extract highlights from last 5 messages in conversation
- Include specific mentions (dive sites, dates, interests)
- Test with diverse conversations
- Iterate based on partner feedback

### Risk: Low-Quality or Spammy Leads

**Impact:** Partners receive low-quality leads, lose trust **Mitigation:**

- Rate limiting (max 3 leads per session per hour)
- Email validation (real email format)
- Defer CAPTCHA to Phase 1 if spam becomes issue
- Monitor lead quality via partner feedback

---

## Acceptance Criteria

- [ ] `LeadService` implemented with create and deliver methods
- [ ] `/api/leads` endpoint accepts request, saves to DB, sends email
- [ ] SendGrid integration sends email to partner shop
- [ ] Email template renders correctly with all fields
- [ ] Delivery status tracked (pending → delivered or failed)
- [ ] Founder notification sent on delivery failure
- [ ] `LeadCaptureModal` component renders with form
- [ ] Modal triggered when "Connect with Dive Shop" button clicked
- [ ] Form validation works (required fields, email format)
- [ ] Success/error messages displayed
- [ ] Rate limiting enforced (3 leads/hour per session)
- [ ] Unit tests pass
- [ ] Integration tests pass (sandbox mode)
- [ ] End-to-end manual test successful (email received)

---

## Implementation Checklist

- [ ] Install SendGrid: `npm install @sendgrid/mail`
- [ ] Create `src/services/LeadService.ts`
- [ ] Create `src/templates/leadEmail.ts` (HTML + plain text)
- [ ] Create `/api/leads/route.ts`
- [ ] Implement request validation (Zod)
- [ ] Implement rate limiting (3/hour per session)
- [ ] Implement SendGrid email sending
- [ ] Implement founder notification on failure
- [ ] Update `ChatService` to detect lead intent
- [ ] Create `components/LeadCaptureModal.tsx`
- [ ] Update `ChatMessage.tsx` to show "Connect" button
- [ ] Write unit tests for LeadService
- [ ] Write integration tests for /api/leads
- [ ] Configure SendGrid account, verify sender email
- [ ] Add SENDGRID_API_KEY and FOUNDER_EMAIL to env vars
- [ ] Test with SendGrid sandbox
- [ ] End-to-end manual test

---

## Notes

### Conversation Highlights Extraction

Extract from session context:

```typescript
const highlights = messages
  .filter(m => m.role === 'user')
  .slice(-5) // Last 5 user messages
  .map(m => `- ${m.content}`)
  .join('\n')
```

Or use LLM to summarize:

```typescript
const summary = await llm.summarize(conversationHistory, {
  prompt: "Summarize the diver's interests, experience level, and travel plans in 2-3 sentences."
})
```

### SendGrid Sandbox Mode

For testing, use sandbox mode to avoid sending real emails:

```typescript
const msg = {
  ...
  mailSettings: {
    sandboxMode: {
      enable: process.env.NODE_ENV !== 'production'
    }
  }
}
```

### Rate Limiting Implementation

Use in-memory Map for Phase 0:

```typescript
const leadSubmissions = new Map<string, number[]>() // sessionToken → timestamps

function checkRateLimit(sessionToken: string): boolean {
  const now = Date.now()
  const hourAgo = now - 3600000
  
  const submissions = leadSubmissions.get(sessionToken) || []
  const recentSubmissions = submissions.filter(ts => ts > hourAgo)
  
  if (recentSubmissions.length >= 3) {
    return false // Rate limit exceeded
  }
  
  recentSubmissions.push(now)
  leadSubmissions.set(sessionToken, recentSubmissions)
  return true
}
```

### Partner Shop Email Template Testing

Test with multiple scenarios:

1. All fields filled (name, email, cert level, interests, travel window, highlights)
2. Minimal fields (name, email only)
3. Learn-to-dive lead (no cert level, interested in Open Water course)
4. Multi-shop destination (email sent to all partner shops)
