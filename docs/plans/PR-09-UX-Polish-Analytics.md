# PR-09: UX Polish & Analytics Integration

**Branch:** `feat/ux-analytics`
**Epic:** DovvyBuddy MVP - Phase 1
**Status:** Not Started
**Estimated Effort:** 6-8 hours

---

## Goal

Improve chat UX, add "New chat" functionality, integrate Vercel Analytics for
event tracking.

---

## Scope

**Included:**

- UX improvements: loading states, error messages, retry button
- "New chat" button to reset conversation
- Vercel Analytics custom events
- Session cleanup (60-min expiry enforcement)

**Excluded:**

- Advanced analytics dashboard (defer to Phase 2+)
- User feedback mechanism (defer to Phase 2+)
- Message history pagination (defer to Phase 1.1)

---

## Backend Changes

### Update ChatService

**Emit Analytics Events:**

```typescript
import { track } from '@vercel/analytics'

async processMessage(sessionToken: string, userMessage: string) {
  // Existing logic...
  
  // Track session start (first message only)
  if (session.messages.length === 0) {
    track('session_started', {
      sessionToken,
      timestamp: new Date().toISOString()
    })
  }
  
  // Track recommendation shown (if response contains site names)
  if (responseContainsSiteNames(assistantResponse)) {
    track('recommendation_shown', {
      sessionToken,
      destination: 'Tioman'
    })
  }
  
  // Track lead flow started (if triggerLeadCapture)
  if (metadata.triggerLeadCapture) {
    track('lead_flow_started', {
      sessionToken,
      destination: destinationId
    })
  }
}
```

### Update LeadService

**Emit Analytics Event:**

```typescript
async createLead(data: CreateLeadInput) {
  // Existing logic...
  
  track('lead_submitted', {
    leadId: lead.id,
    destinationId: lead.destinationId,
    timestamp: new Date().toISOString()
  })
  
  return lead.id
}
```

### New Endpoint (Optional)

**`DELETE /api/session/:sessionToken`**

For "New chat" functionality (clear session on server if using DB):

- Deletes session from database (if using Session table)
- Returns 200 OK

If using in-memory Map, this endpoint is optional (client-side token
regeneration sufficient)

---

## Frontend Changes

### Update ChatInput Component

**Add Loading State:**

```typescript
interface ChatInputProps {
  // ... existing props
  isLoading: boolean
}

export function ChatInput({ isLoading, ...props }: ChatInputProps) {
  return (
    <div>
      <textarea disabled={isLoading} />
      <button disabled={isLoading || !value}>
        {isLoading ? <Spinner /> : 'Send'}
      </button>
    </div>
  )
}
```

### Update ChatMessage Component

**Add Retry Button (on Error):**

```typescript
interface ChatMessageProps {
  message: Message
  onRetry?: () => void
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  if (message.error) {
    return (
      <div className="error-message">
        <p>⚠️ Oops, something went wrong.</p>
        {onRetry && (
          <button onClick={onRetry}>Try Again</button>
        )}
      </div>
    )
  }
  
  // ... existing render logic
}
```

### New Component: NewChatButton

**`components/NewChatButton.tsx`**

```typescript
export function NewChatButton() {
  const router = useRouter()
  
  const handleNewChat = () => {
    // Clear localStorage session token
    localStorage.removeItem('dovvybuddy-session-token')
    
    // Generate new token
    const newToken = uuidv4()
    localStorage.setItem('dovvybuddy-session-token', newToken)
    
    // Reload page (clears message state)
    router.refresh()
  }
  
  return (
    <button onClick={handleNewChat}>
      🔄 New Chat
    </button>
  )
}
```

**Place in Chat Page Header:**

```tsx
<header>
  <h1>DovvyBuddy</h1>
  <NewChatButton />
</header>
```

### Analytics Integration

**Install Vercel Analytics:**

```bash
npm install @vercel/analytics
```

**Add to Root Layout (`/app/layout.tsx`):**

```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Track Custom Events:**

```typescript
import { track } from '@vercel/analytics'

// In chat page when message sent
track('message_sent', {
  sessionToken,
  messageLength: message.length
})

// In LeadCaptureModal when modal opened
track('lead_capture_opened', {
  sessionToken,
  destination: 'Tioman'
})
```

### Session Cleanup (Client-Side)

**Implement 60-Min Expiry:**

```typescript
// In chat page, on mount
useEffect(() => {
  const sessionData = localStorage.getItem('dovvybuddy-session-data')
  if (sessionData) {
    const { token, timestamp } = JSON.parse(sessionData)
    const age = Date.now() - timestamp
    
    if (age > 60 * 60 * 1000) { // 60 minutes
      // Session expired, clear and regenerate
      localStorage.removeItem('dovvybuddy-session-token')
      localStorage.removeItem('dovvybuddy-session-data')
      const newToken = uuidv4()
      localStorage.setItem('dovvybuddy-session-token', newToken)
      localStorage.setItem('dovvybuddy-session-data', JSON.stringify({
        token: newToken,
        timestamp: Date.now()
      }))
    }
  }
}, [])
```

---

## Data Changes

No schema changes Optional: Add `expires_at` column to Session table (if using
DB for sessions)

---

## Infra / Config

### Vercel Analytics

- Enable Vercel Analytics in Vercel dashboard (Project Settings → Analytics)
- Free tier sufficient for V1 (<2500 events/month)

---

## Testing

### Manual Tests

**Loading States:**

- [ ] Send message, verify send button disabled and shows spinner
- [ ] Verify textarea disabled during loading
- [ ] Verify loading state clears when response completes

**Error Handling:**

- [ ] Simulate error (disable GROQ API key temporarily)
- [ ] Send message, verify error message displayed
- [ ] Click "Try Again" button, verify retry works

**New Chat:**

- [ ] Start conversation (send 3-5 messages)
- [ ] Click "New Chat" button
- [ ] Verify conversation cleared
- [ ] Verify new session token generated (check localStorage)
- [ ] Send new message, verify new conversation starts

**Session Expiry:**

- [ ] Start session, note timestamp in localStorage
- [ ] Manually change timestamp to 61 minutes ago
- [ ] Reload page, verify session expired and new token generated

**Analytics:**

- [ ] Start session (send first message)
- [ ] Verify `session_started` event tracked in Vercel Analytics dashboard
- [ ] Get recommendation (ask about dive sites)
- [ ] Verify `recommendation_shown` event tracked
- [ ] Open lead capture modal
- [ ] Verify `lead_capture_opened` event tracked
- [ ] Submit lead
- [ ] Verify `lead_submitted` event tracked

---

## Dependencies

**Prerequisite PRs:**

- PR-05 merged (Chat UI exists)
- PR-06 merged (Lead capture exists)

**External Dependencies:**

- Vercel Analytics enabled in dashboard

---

## Risks & Mitigations

### Risk: Analytics Tracking Breaks if Vercel Analytics API Changes

**Impact:** No event tracking, can't measure success metrics **Mitigation:**

- Use official SDK (pinned version)
- Monitor for breaking changes
- Analytics is non-critical for core functionality (app works without it)

### Risk: Session Expiry Too Aggressive (Users Frustrated)

**Impact:** Users lose context mid-conversation **Mitigation:**

- 60-minute expiry (MASTER_PLAN OQ-05 decision)
- Test with real users in Phase 0
- Can extend to 90 min in Phase 1.1 if feedback indicates issue

---

## Acceptance Criteria

- [ ] Loading spinner displays during message send
- [ ] Send button and textarea disabled during loading
- [ ] Error message displays on API failure
- [ ] "Try Again" button works on error
- [ ] "New Chat" button clears conversation and generates new session token
- [ ] Session expiry enforced (60 min inactivity)
- [ ] Vercel Analytics installed and tracking events
- [ ] Custom events tracked: session_started, recommendation_shown,
lead_flow_started, lead_submitted
- [ ] Analytics events visible in Vercel Analytics dashboard

---

## Implementation Checklist

- [ ] Install Vercel Analytics: `npm install @vercel/analytics`
- [ ] Add Analytics component to root layout
- [ ] Update `ChatInput.tsx` with loading state
- [ ] Update `ChatMessage.tsx` with error state and retry button
- [ ] Create `components/NewChatButton.tsx`
- [ ] Add NewChatButton to chat page header
- [ ] Implement session expiry logic in chat page
- [ ] Add analytics tracking to `ChatService.processMessage()`
- [ ] Add analytics tracking to `LeadService.createLead()`
- [ ] Add analytics tracking to chat page (message_sent)
- [ ] Add analytics tracking to LeadCaptureModal (lead_capture_opened)
- [ ] Test loading states, error handling, retry
- [ ] Test "New Chat" functionality
- [ ] Test session expiry (manual timestamp manipulation)
- [ ] Verify analytics events in Vercel dashboard

---

## Notes

### Vercel Analytics Events

**Standard Events (auto-tracked):**

- Page views
- Navigation
- Web Vitals (LCP, FID, CLS)

**Custom Events (manually tracked):**

- `session_started`: First message sent (per session)
- `recommendation_shown`: Assistant response contains dive site names
- `lead_flow_started`: Lead capture triggered
- `lead_capture_opened`: Lead modal opened
- `lead_submitted`: Lead form submitted (track inquiry_type: learn-to-dive, advance-cert, fun-dive)
- `message_sent`: User sends message (optional, for volume tracking)

### Analytics Dashboard

Access at: <https://vercel.com/[team]/[project]/analytics>

**Key Metrics to Monitor:**

- Sessions started (daily, weekly)
- Recommendations shown (% of sessions)
- Lead flow conversion rate (lead_submitted / session_started)
- Session duration (time between first and last message)

### Session Cleanup (Server-Side - Optional)

If using Session table in database, add cron job to delete expired sessions:

```typescript
// /api/cron/cleanup-sessions (Vercel Cron)
export async function GET() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  await prisma.session.deleteMany({
    where: {
      lastActivityAt: {
        lt: oneHourAgo
      }
    }
  })
  
  return new Response('OK')
}
```

Configure in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup-sessions",
    "schedule": "0 * * * *" // Every hour
  }]
}
```

Defer to Phase 1.1 if using in-memory Map (no cleanup needed)

### Spinner Component

```tsx
export function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
```
