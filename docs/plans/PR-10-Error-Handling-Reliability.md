# PR-10: Error Handling & Reliability Improvements

**Branch:** `feat/error-handling-reliability`
**Epic:** DovvyBuddy MVP - Phase 1
**Status:** Not Started
**Estimated Effort:** 8-10 hours

---

## Goal

Harden error handling for LLM/RAG/email failures, add retry logic, improve
observability.

---

## Scope

**Included:**

- Retry logic for GROQ API failures (exponential backoff)
- Graceful degradation for RAG failures
- Sentry integration for error tracking
- Founder notification on critical failures
- Enhanced error logging

**Excluded:**

- Advanced monitoring dashboard (defer to Phase 2+)
- Custom alerting platform (use email notifications for V1)
- Automated error recovery (defer to Phase 2+)

---

## Backend Changes

### Update ChatService

**Add Retry Logic for GROQ API:**

```typescript
async function callLLMWithRetry(prompt: string, context: string[], maxRetries = 1): Promise<string> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: buildMessages(prompt, context),
        stream: true
      })
      
      return response // Success
      
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (400, 401, 403)
      if (error.status && error.status < 500) {
        throw error
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // All retries failed, log and throw
  logger.error('LLM call failed after retries', {
    error: lastError,
    prompt: prompt.substring(0, 200),
    attempts: maxRetries + 1
  })
  
  Sentry.captureException(lastError, {
    tags: { component: 'ChatService', operation: 'callLLMWithRetry' },
    extra: { promptPreview: prompt.substring(0, 200) }
  })
  
  throw new Error('Service temporarily unavailable. Please try again in a moment.')
}
```

**Fallback Message on Persistent Failure:**

```typescript
catch (error) {
  // User-friendly error message
  return {
    content: "I'm having trouble right now. Please try again in a moment. If the issue persists, contact our support.",
    error: true
  }
}
```

### Update RAGService

**Graceful Degradation if Embeddings Missing:**

```typescript
async retrieveContext(query: string, topK = 5): Promise<string[]> {
  try {
    // Load embeddings
    const embeddings = await loadEmbeddings()
    
    if (!embeddings || embeddings.length === 0) {
      logger.warn('Embeddings file missing or empty', {
        query,
        component: 'RAGService'
      })
      
      // Continue without RAG context (LLM only)
      return []
    }
    
    // Normal RAG retrieval
    // ...
    
  } catch (error) {
    logger.error('RAG retrieval failed', {
      error,
      query,
      component: 'RAGService'
    })
    
    Sentry.captureException(error, {
      tags: { component: 'RAGService', operation: 'retrieveContext' }
    })
    
    // Graceful degradation: return empty context (LLM without RAG)
    return []
  }
}
```

### Update LeadService

**Retry Logic for SendGrid:**

```typescript
async deliverLead(leadId: string): Promise<boolean> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { destination, preferredShop } })
  
  try {
    // First attempt
    await sgMail.send(formatEmail(lead))
    
    // Success
    await prisma.lead.update({
      where: { id: leadId },
      data: { deliveryStatus: 'delivered', deliveredAt: new Date() }
    })
    
    return true
    
  } catch (error) {
    logger.error('Lead delivery failed (first attempt)', {
      error,
      leadId,
      shopEmail: lead.preferredShop.contactEmail
    })
    
    // Retry once after 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    try {
      await sgMail.send(formatEmail(lead))
      
      // Retry success
      await prisma.lead.update({
        where: { id: leadId },
        data: { deliveryStatus: 'delivered', deliveredAt: new Date() }
      })
      
      return true
      
    } catch (retryError) {
      // Both attempts failed
      logger.error('Lead delivery failed (retry attempt)', {
        error: retryError,
        leadId
      })
      
      await prisma.lead.update({
        where: { id: leadId },
        data: { deliveryStatus: 'failed' }
      })
      
      // Notify founder
      await notifyFounderOfFailure(leadId, lead, retryError)
      
      Sentry.captureException(retryError, {
        tags: { component: 'LeadService', operation: 'deliverLead' },
        extra: { leadId, shopEmail: lead.preferredShop.contactEmail }
      })
      
      return false
    }
  }
}
```

**Founder Notification:**

```typescript
async function notifyFounderOfFailure(leadId: string, lead: Lead, error: Error) {
  try {
    await sgMail.send({
      to: process.env.FOUNDER_EMAIL,
      from: 'noreply@dovvybuddy.com',
      subject: '⚠️ DovvyBuddy: Lead Delivery Failed',
      text: `
Lead delivery failed after retry.

Lead ID: ${leadId}
Name: ${lead.name}
Email: ${lead.email}
Destination: ${lead.destination?.name}
Shop: ${lead.preferredShop?.name} (${lead.preferredShop?.contactEmail})

Error: ${error.message}

Action required: Manually forward this lead to the shop or retry from admin dashboard.

View lead: ${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${leadId}
      `.trim()
    })
  } catch (notificationError) {
    logger.error('Failed to notify founder of lead delivery failure', {
      error: notificationError,
      leadId
    })
  }
}
```

### Sentry Integration

**Install Sentry:**

```bash
npm install @sentry/nextjs
```

**Initialize Sentry:**

`sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% for V1 (low traffic)
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  }
})
```

`sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})
```

**Capture Errors:**

```typescript
import * as Sentry from '@sentry/nextjs'

// In API routes or services
try {
  // ...
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'ChatService', operation: 'processMessage' },
    extra: { sessionToken, userMessage: message.substring(0, 200) }
  })
  throw error
}
```

### Enhanced Logging

**Structured Logger** (`src/lib/logger.ts`):

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

// Usage:
// logger.info({ component: 'ChatService', action: 'session_started' }, 'New session')
// logger.error({ component: 'LeadService', error }, 'Lead delivery failed')
```

**Key Events to Log:**

- Session creation (INFO)
- User messages (INFO, sanitized)
- RAG retrieval (INFO, query + top results)
- Lead submission (INFO, sanitized)
- Lead delivery attempts (INFO success, ERROR failure)
- LLM API calls (INFO, latency + token count)
- Errors (ERROR, full context)

---

## Frontend Changes

### Update ChatMessage Component

**User-Friendly Error Display:**

```typescript
export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  if (message.error) {
    return (
      <div className="border-l-4 border-red-500 bg-red-50 p-3 my-2">
        <p className="font-semibold text-red-900">Oops, something went wrong.</p>
        <p className="text-sm text-red-700">Please try again. If the issue persists, contact support.</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }
  
  // ... normal render
}
```

### Update LeadCaptureModal

**Error Handling on Submission Failure:**

```typescript
async function handleSubmit() {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    
    if (!response.ok) {
      throw new Error('Lead submission failed')
    }
    
    // Success
    setSuccess(true)
    
  } catch (error) {
    setError('Failed to submit lead. Please try again or contact us directly.')
  }
}
```

---

## Data Changes

No schema changes

---

## Infra / Config

### Environment Variables

**New:**

- `SENTRY_DSN`: Sentry project DSN (server-side)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry project DSN (client-side)
- `FOUNDER_EMAIL`: Founder's email for critical failure notifications
- `LOG_LEVEL`: Log level (info, warn, error; default: info)

### Sentry Setup

1. Create Sentry account (free tier: 5K events/month)
2. Create project (Next.js)
3. Copy DSN
4. Add to Vercel env vars

---

## Testing

### Integration Tests

**LLM Retry Logic:**

- [ ] Simulate GROQ API timeout (mock network failure)
- [ ] Verify retry with exponential backoff
- [ ] Verify fallback message after retries exhausted
- [ ] Verify error logged and sent to Sentry

**RAG Graceful Degradation:**

- [ ] Delete `embeddings.json` temporarily
- [ ] Send message, verify RAG returns empty context
- [ ] Verify LLM still responds (without RAG grounding)
- [ ] Verify warning logged

**Lead Delivery Retry:**

- [ ] Simulate SendGrid failure (invalid API key)
- [ ] Submit lead, verify first attempt fails
- [ ] Verify retry after 5 seconds
- [ ] Verify delivery_status updated to 'failed' after both attempts
- [ ] Verify founder notification email sent
- [ ] Verify error captured in Sentry

### Manual Tests

**Error Scenarios:**

- [ ] Disable GROQ API key, send message → verify user-friendly error + retry
button
- [ ] Click retry, verify works
- [ ] Disable SendGrid API key, submit lead → verify error message
- [ ] Check Sentry dashboard, verify errors captured
- [ ] Check founder email, verify notification received
- [ ] Check logs (Vercel), verify structured logging

---

## Dependencies

**Prerequisite PRs:**

- PR-04 merged (ChatService)
- PR-06 merged (LeadService)
- PR-09 merged (UX with retry button)

**External Dependencies:**

- Sentry account created
- FOUNDER_EMAIL configured

---

## Risks & Mitigations

### Risk: Retry Logic Causes High Latency (>10s)

**Impact:** Violates NFR-01, poor UX **Mitigation:**

- Limit to 1 retry (total 2 attempts)
- Use short timeout (5s per attempt)
- Monitor P95 latency, adjust if needed
- Show loading state to user

### Risk: Sentry Event Quota Exceeded

**Impact:** No error tracking **Mitigation:**

- Free tier: 5K events/month (sufficient for V1 scale)
- Set up alerts when approaching quota
- Filter out noisy errors (e.g., network timeouts, 404s)
- Upgrade to paid plan if needed ($26/month for 50K events)

---

## Acceptance Criteria

- [ ] GROQ API retry logic implemented with exponential backoff (max 1 retry)
- [ ] RAG graceful degradation if embeddings missing
- [ ] SendGrid retry logic (1 retry after 5s)
- [ ] Founder notification sent on lead delivery failure
- [ ] Sentry integrated (client + server)
- [ ] Errors captured in Sentry (LLM failures, RAG failures, lead delivery
failures)
- [ ] Enhanced structured logging (pino)
- [ ] User-friendly error messages (no stack traces)
- [ ] Retry button works in chat UI
- [ ] Integration tests pass for all error scenarios
- [ ] Manual testing confirms errors logged and tracked

---

## Implementation Checklist

- [ ] Install Sentry: `npm install @sentry/nextjs`
- [ ] Install pino: `npm install pino`
- [ ] Create `sentry.client.config.ts` and `sentry.server.config.ts`
- [ ] Create `src/lib/logger.ts`
- [ ] Update `ChatService.processMessage()` with retry logic
- [ ] Update `RAGService.retrieveContext()` with graceful degradation
- [ ] Update `LeadService.deliverLead()` with retry + founder notification
- [ ] Implement `notifyFounderOfFailure()` function
- [ ] Add Sentry error capture to all try/catch blocks
- [ ] Add structured logging to key operations
- [ ] Update `ChatMessage.tsx` with user-friendly error display
- [ ] Update `LeadCaptureModal.tsx` with error handling
- [ ] Write integration tests for retry logic
- [ ] Configure Sentry project, copy DSN
- [ ] Add SENTRY_DSN and FOUNDER_EMAIL to env vars
- [ ] Test error scenarios manually
- [ ] Verify errors appear in Sentry dashboard

---

## Notes

### Exponential Backoff Calculation

```typescript
const delay = Math.pow(2, attempt) * 1000
// attempt 0: 1s
// attempt 1: 2s
// attempt 2: 4s (not used, max retries = 1)
```

### Error Logging Best Practices

**DO:**

- Log structured data (JSON)
- Include context (component, operation, IDs)
- Sanitize PII (user emails, messages) in logs
- Use appropriate log levels (INFO, WARN, ERROR)

**DON'T:**

- Log full stack traces to console (use Sentry instead)
- Log sensitive data (API keys, passwords)
- Log in tight loops (performance impact)

### Sentry Sampling

For V1, use 100% sampling (all errors captured). Reduce in Phase 2+ if volume
increases:

```typescript
Sentry.init({
  sampleRate: 1.0, // 100% of errors
  tracesSampleRate: 0.1 // 10% of traces (performance monitoring)
})
```

### Founder Notification Email Template

Keep brief and actionable:

- Lead ID + link to admin (if admin dashboard exists)
- Error message
- Clear action required
- No technical jargon

### Vercel Logs

Access at: <https://vercel.com/[team]/[project]/logs>

Filter by:

- Deployment (production vs preview)
- Status (errors only)
- Time range

Note: Vercel log retention is limited (7 days on free tier). Export important
logs or ship to external service (defer to Phase 2).
