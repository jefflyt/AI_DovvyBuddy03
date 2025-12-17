# PR-04: Chat Orchestration & Google AI Integration

**Branch:** `feat/chat-service`
**Epic:** DovvyBuddy MVP - Phase 0
**Status:** Not Started
**Estimated Effort:** 8-10 hours

---

## Goal

Implement chat orchestration using Google ADK for workflow orchestration and Google AI SDK (Gemini) for LLM reasoning, with session management and safety guardrails.

**Architecture:**

- **Google ADK**: Orchestrates the conversation flow (search → analyze → respond)
- **Google AI SDK**: Provides Gemini model for actual reasoning and generation
- **Brevo API**: Sends lead capture emails when needed
- **NEXT_PUBLIC_APP_URL**: Links leads back to dashboard

---

## Scope

**Included:**

- Chat orchestration service using Google ADK (session context, RAG integration, LLM calls)
- Google AI SDK (Gemini) integration for reasoning and generation
- Safety topic detection service
- `/api/chat` endpoint with streaming support
- System prompt engineering for covered destinations and safety disclaimers

**Excluded:**

- Frontend chat UI (PR-05)
- Lead capture logic (PR-06)
- Out-of-scope UI components (PR-07)

---

## Backend Changes

### New Services

#### **ChatService** (`src/services/ChatService.ts`)

**Interface:**

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    showDisclaimer?: boolean
    triggerLeadCapture?: boolean
  }
}

interface SessionContext {
  sessionToken: string
  messages: ChatMessage[]
  createdAt: Date
  lastActivityAt: Date
}

class ChatService {
  async processMessage(
    sessionToken: string,
    userMessage: string
  ): Promise<AsyncIterable<string>>
}
```

**Logic:**

1. Load/create session context (in-memory Map for Phase 0; DB optional)
2. Call `SafetyGuardService.detectSafetyTopics(userMessage)`
3. If safety topic: inject disclaimer prompt
4. Call `RAGService.retrieveContext(userMessage)` (top 5 chunks)
5. Use Google ADK to orchestrate the flow:
   - **Search**: Retrieve relevant context from RAG
   - **Analyze**: Detect intent and safety concerns
   - **Draft**: Generate response using Gemini
6. Build prompt: system instructions + RAG context + conversation history
7. Call Google AI SDK (Gemini model) with streaming
8. Update session context with user message + assistant response
9. If lead capture triggered, use Brevo API to send email
10. Return streaming response

**LLM Interface Abstraction:**

```typescript
interface LLMProvider {
  generateStream(prompt: string, context: string[]): AsyncIterable<string>
}

class GoogleAILLMProvider implements LLMProvider {
  // Google AI SDK (Gemini) implementation
  // Uses @google/generative-ai package
}

class GoogleADKOrchestrator {
  // Orchestrates: Search (RAG) → Analyze (Safety) → Draft (Gemini)
  async orchestrateResponse(
    userMessage: string,
    sessionContext: SessionContext
  ): Promise<AsyncIterable<string>>
}
```

#### **SafetyGuardService** (`src/services/SafetyGuardService.ts`)

**Interface:**

```typescript
interface SafetyDetectionResult {
  isSafetyTopic: boolean
  disclaimer?: string
  topics?: string[] // e.g., ["medical", "decompression"]
}

class SafetyGuardService {
  detectSafetyTopics(message: string): SafetyDetectionResult
}
```

**Logic:** Keyword matching

- Medical: "asthma", "diabetes", "heart condition", "medication", "medical",
"doctor"
- Decompression: "decompression", "bends", "DCS", "nitrogen", "calculate stops"
- Emergency: "emergency", "help", "urgent", "injured", "accident"
- No-fly: "fly", "flight", "airplane" (context: after diving)

**Disclaimer Template:**

```text
⚠️ SAFETY REMINDER: This is general information only, not personalized medical or dive planning advice. For medical concerns, consult a dive physician or DAN (Divers Alert Network). For emergencies, contact local emergency services immediately. For dive planning, always consult with a qualified dive professional.
```

### New Endpoint

**`POST /api/chat`**

**Request:**

```typescript
{
  sessionToken: string
  message: string
}
```

**Validation (Zod):**

```typescript
const chatRequestSchema = z.object({
  sessionToken: z.string().min(1),
  message: z.string().min(1).max(2000)
})
```

**Response:** Server-Sent Events (SSE) stream

```text
data: {"token": "Hello"}
data: {"token": " there"}
data: {"token": "!"}
data: {"done": true, "metadata": {"showDisclaimer": false}}
```

**Error Handling:**

- 400: Invalid request (missing fields, message too long)
- 429: Rate limit exceeded
- 500: Internal error (GROQ API failure, RAG failure)
- 503: Service unavailable (after retry)

### System Prompt Template

```text
You are DovvyBuddy, an AI assistant for recreational divers planning dive trips.

COVERAGE:
- You provide information ONLY about: Tioman, Malaysia
- If asked about other destinations (Bali, Maldives, Red Sea, etc.), respond: "I currently only have detailed information about Tioman, Malaysia. Would you like to know more about diving in Tioman?"

CAPABILITIES:
- Learn-to-dive guidance: Explain PADI Open Water course structure, prerequisites, and common fears for non-certified users
- Certification advancement: Explain PADI Advanced Open Water benefits and requirements for OW divers
- Destination discovery: Help users find dive sites matching their experience level and interests
- Site recommendations: Suggest specific sites based on certification level, interests (macro, wreck, sharks, drift)
- Safety guidance: Provide general safety information (always include disclaimers)
- Logistics: Share practical information about getting there, accommodations, best season

STRICT LIMITATIONS:
- NO booking: If asked to book flights/hotels/dives, respond: "I can't help with bookings, but I can connect you with a trusted partner dive shop in Tioman who can assist with training or guided dives. Would you like me to arrange an introduction?"
- NO medical advice: If asked about diving with medical conditions, respond with disclaimer and defer to dive physician/DAN
- NO decompression calculations: If asked to calculate decompression stops, respond: "I cannot calculate decompression schedules. Please use dive tables, a dive computer, or consult a dive professional."
- NO personalized dive plans: Provide general information only; defer actual dive planning to qualified professionals

CONTEXT USAGE:
- Always base your answers on the provided context chunks
- If the context doesn't contain relevant information, say: "I don't have specific information about that for Tioman. Let me know if you'd like to know about [suggest related topic from context]."
- Cite specific dive sites when relevant

TONE:
- Friendly and enthusiastic about diving
- Safety-conscious (always err on side of caution)
- Honest about limitations (don't make up information)
- Helpful (guide users toward next steps, even if you can't help directly)

Current context: {RAG_CHUNKS}
Conversation history: {CONVERSATION_HISTORY}
```

---

## Frontend Changes

**No changes** (UI in PR-05)

---

## Data Changes

### Session Storage

**Option A (Phase 0):** In-memory Map

```typescript
const sessions = new Map<string, SessionContext>()
```

**Option B (Future):** Use Session table from PR-02

- Persist sessions for analytics
- Defer to PR-09 (Analytics Integration)

---

## Infra / Config

### Environment Variables

- `GOOGLE_AI_API_KEY` must be set (for Gemini model access)
- `BREVO_API_KEY` must be set (for lead capture email delivery)
- `NEXT_PUBLIC_APP_URL` must be set (for dashboard links in emails)

### Google AI SDK Configuration

- Install: `@google/generative-ai` (already installed in PR-01)
- Model: `gemini-1.5-flash` (recommended for speed and streaming)
- Alternative: `gemini-1.5-pro` (better reasoning, higher cost)
- Temperature: 0.7 (balanced creativity and consistency)
- Max tokens: 1000 (sufficient for most responses)
- Safety settings: Block harmful content (medical advice, dangerous activities)

### Google ADK Integration

- Install: `@google/genkit` and `@genkit-ai/googleai`
- Orchestration flow:
  1. **Input**: User message + session context
  2. **Search Step**: RAG retrieval (top 5 chunks)
  3. **Analyze Step**: Safety detection + intent classification
  4. **Draft Step**: Gemini generation with context
  5. **Output**: Streaming response with metadata

### Brevo Configuration

- Install: `@getbrevo/brevo` (already installed in PR-01)
- Used for: Lead capture email delivery
- Template: Professional email with dashboard link

### Rate Limiting

- Implement per-session: 20 requests per minute
- Use `express-rate-limit` or custom middleware

---

## Testing

### Unit Tests

#### ChatService

- [ ] `processMessage()` calls SafetyGuardService
- [ ] If safety topic detected, disclaimer included in prompt
- [ ] RAG context included in prompt (verify format)
- [ ] Session context updated after message processed

#### SafetyGuardService

- [ ] `detectSafetyTopics("Can I dive with asthma?")` returns `{ isSafetyTopic: true, topics: ["medical"] }`
- [ ] `detectSafetyTopics("Best beginner sites?")` returns `{ isSafetyTopic: false }`
- [ ] `detectSafetyTopics("Calculate decompression stops")` returns `{ isSafetyTopic: true, topics: ["decompression"] }`

### Integration Tests

#### Test Case 1: Happy Path

- Request: `{ sessionToken: "test-123", message: "What are the best dive sites in Tioman for beginners?" }`
- Expected:
  - Response includes site names from RAG (Chebeh, Renggis Island, Coral Garden)
  - Streaming works (tokens arrive incrementally)
  - No disclaimer

#### Test Case 2: Out-of-Scope Destination

- Request: `{ message: "What about diving in Bali?" }`
- Expected:
  - Response declines politely
  - Redirects to Tioman

#### Test Case 3: Medical Query

- Request: `{ message: "Can I dive with asthma?" }`
- Expected:
  - Response includes disclaimer
  - Does NOT provide medical advice
  - Defers to dive physician/DAN

#### Test Case 4: Booking Request

- Request: `{ message: "Book me a dive trip to Tioman" }`
- Expected:
  - Response declines booking
  - Offers to connect with partner shop
  - Metadata includes `triggerLeadCapture: true` (for PR-06)

### Manual Tests (Postman/curl)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "test-session-001",
    "message": "What are the best dive sites for macro photography in Tioman?"
  }'
```

- [ ] Verify streaming response (tokens arrive incrementally)
- [ ] Test with 10+ diverse queries (beginner sites, advanced sites, safety, out-of-scope)
- [ ] Verify session context persists across multiple messages
- [ ] Test rate limiting (21st request within 1 min returns 429)

---

## Dependencies

**Prerequisite PRs:**

- PR-03 merged (RAG service available)

**External Dependencies:**

- GROQ API key with sufficient quota
- RAG embeddings generated (from PR-03)

---

## Risks & Mitigations

### Risk: GROQ API Latency >10s (NFR-01 Violation)

**Impact:** Poor UX, potential user abandonment **Mitigation:**

- Use streaming to reduce perceived latency (tokens appear immediately)
- Monitor P95 latency in logs
- Add timeout (15s) with fallback error message
- Plan migration to production LLM in PR-11

### Risk: LLM Hallucinates Despite RAG Grounding

**Impact:** Users receive incorrect information (e.g., wrong site depths, wrong season) **Mitigation:**

- Strong system prompt with "I don't know" instructions
- Temperature = 0 for deterministic outputs
- Manual review of Phase 0 conversations (founder logs all interactions)
- Add evaluation suite in PR-11 (test queries with expected answers)

### Risk: Safety Guardrails Too Strict (False Positives)

**Impact:** Users frustrated by unnecessary disclaimers **Mitigation:**

- Use keyword matching (simple, predictable)
- Log all safety detections for manual review
- Iterate on keyword list based on Phase 0 feedback
- Plan LLM-based classification in Phase 1 (more nuanced)

### Risk: Session Context Grows Unbounded

**Impact:** Memory leak in long conversations; prompt becomes too long for LLM
**Mitigation:**

- Limit conversation history to last 10 messages
- Implement session expiry (60 min inactivity, from MASTER_PLAN OQ-05)
- Add session cleanup cron job (defer to PR-09)

---

## Acceptance Criteria

- [ ] `ChatService` implemented with session management
- [ ] `SafetyGuardService` detects safety topics via keyword matching
- [ ] `POST /api/chat` endpoint accepts request, returns streaming response
- [ ] GROQ SDK integrated with `llama-3.3-70b-versatile` model
- [ ] System prompt includes coverage, limitations, safety disclaimers
- [ ] RAG context included in prompt (top 5 chunks)
- [ ] Rate limiting enforced (20 requests/min per session)
- [ ] Unit tests pass for ChatService and SafetyGuardService
- [ ] Integration tests pass for happy path, out-of-scope, safety queries
- [ ] Manual testing with 10+ diverse queries successful
- [ ] LLM interface abstracted for Phase 1 migration

---

## Implementation Checklist

- [ ] Install GROQ SDK: `npm install groq-sdk`
- [ ] Create `src/services/ChatService.ts`
- [ ] Create `src/services/SafetyGuardService.ts`
- [ ] Create `src/lib/llm/LLMProvider.ts` (interface)
- [ ] Create `src/lib/llm/GROQLLMProvider.ts` (implementation)
- [ ] Create `/api/chat/route.ts` endpoint
- [ ] Implement request validation (Zod schema)
- [ ] Implement session management (in-memory Map)
- [ ] Implement rate limiting middleware
- [ ] Write system prompt template
- [ ] Write unit tests for ChatService
- [ ] Write unit tests for SafetyGuardService
- [ ] Write integration tests for /api/chat
- [ ] Test with Postman/curl (10+ queries)
- [ ] Document API in README.md

---

## Notes

### GROQ Model Selection

- **Recommended:** `llama-3.3-70b-versatile`
  - Latest Llama 3.3 model
  - Fast inference (GROQ optimized)
  - Good balance of quality and speed

- **Alternative:** `mixtral-8x7b-32768`
  - Smaller model (lower cost)
  - Longer context window (32K tokens)
  - Slightly lower quality than Llama 3.3

### Session Expiry

- Implement 60-minute inactivity expiry (MASTER_PLAN OQ-05)
- Clean up expired sessions periodically (defer to PR-09 cron job)

### Conversation History Management

- Keep last 10 messages in context (5 user + 5 assistant)
- Truncate older messages to prevent prompt bloat
- Total prompt length: system prompt (~500 tokens) + RAG context (~1000 tokens)
  - history (~1000 tokens) = ~2500 tokens (well under 8K limit)

### Streaming Implementation

- Use Server-Sent Events (SSE) or ReadableStream
- Send tokens as `data: {"token": "..."}\n\n`
- Send final metadata as `data: {"done": true, "metadata": {...}}\n\n`
- Handle connection errors gracefully
