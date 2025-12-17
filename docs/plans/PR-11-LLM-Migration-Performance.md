# PR-11: LLM Migration & Performance Testing

**Branch:** `feat/llm-migration-performance`
**Epic:** DovvyBuddy MVP - Phase 1
**Status:** Not Started
**Estimated Effort:** 10-12 hours

---

## Goal

Evaluate production LLM providers, migrate from GROQ, validate P95 latency <10s.

---

## Scope

**Included:**

- Evaluate 3 production LLM providers: OpenAI GPT-4o, Anthropic Claude, Google Gemini
- Migrate from GROQ to chosen provider
- Performance testing under light load (<10 concurrent users)
- Cost estimation and optimization

**Excluded:**

- Load testing for 100+ concurrent users (defer to Phase 3+)
- Multi-model fallback strategy (defer to Phase 2+)
- Advanced prompt optimization (defer to Phase 2+)

---

## Backend Changes

### LLM Provider Abstraction (Already Exists from PR-04)

**Interface:**

```typescript
interface LLMProvider {
  generateStream(
    systemPrompt: string,
    userMessage: string,
    context: string[],
    conversationHistory: ChatMessage[]
  ): AsyncIterable<string>
  
  estimateCost(inputTokens: number, outputTokens: number): number
}
```

### New Provider Implementations

#### Option A: OpenAI GPT-4o

**`src/lib/llm/OpenAIProvider.ts`**

```typescript
import OpenAI from 'openai'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }
  
  async *generateStream(systemPrompt, userMessage, context, history) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.formatHistory(history),
      { role: 'user', content: this.formatPrompt(userMessage, context) }
    ]
    
    const stream = await this.client.chat.completions.create({
      model: 'gpt-4o-2024-11-20', // Latest GPT-4o
      messages,
      temperature: 0,
      max_tokens: 1000,
      stream: true
    })
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  }
  
  estimateCost(inputTokens, outputTokens) {
    // GPT-4o pricing: $2.50 per 1M input, $10 per 1M output (as of Dec 2024)
    return (inputTokens * 2.50 / 1_000_000) + (outputTokens * 10 / 1_000_000)
  }
}
```

#### Option B: Anthropic Claude

**`src/lib/llm/AnthropicProvider.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  
  async *generateStream(systemPrompt, userMessage, context, history) {
    const stream = await this.client.messages.stream({
      model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet
      max_tokens: 1000,
      temperature: 0,
      system: systemPrompt,
      messages: [
        ...this.formatHistory(history),
        { role: 'user', content: this.formatPrompt(userMessage, context) }
      ]
    })
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text
      }
    }
  }
  
  estimateCost(inputTokens, outputTokens) {
    // Claude 3.5 Sonnet pricing: $3 per 1M input, $15 per 1M output
    return (inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000)
  }
}
```

#### Option C: Google Gemini

**`src/lib/llm/GeminiProvider.ts`**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI
  
  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  }
  
  async *generateStream(systemPrompt, userMessage, context, history) {
    const model = this.client.getGenerativeModel({
      model: 'gemini-2.0-flash-exp', // Latest Gemini 2.0 Flash
      systemInstruction: systemPrompt
    })
    
    const chat = model.startChat({
      history: this.formatHistory(history)
    })
    
    const result = await chat.sendMessageStream(
      this.formatPrompt(userMessage, context)
    )
    
    for await (const chunk of result.stream) {
      yield chunk.text()
    }
  }
  
  estimateCost(inputTokens, outputTokens) {
    // Gemini 2.0 Flash pricing: Free tier (15 RPM, 1M TPM, 1500 RPD)
    // Paid: $0.075 per 1M input, $0.30 per 1M output
    return (inputTokens * 0.075 / 1_000_000) + (outputTokens * 0.30 / 1_000_000)
  }
}
```

### Update ChatService

**Provider Selection:**

```typescript
import { OpenAIProvider } from '@/lib/llm/OpenAIProvider'
import { AnthropicProvider } from '@/lib/llm/AnthropicProvider'
import { GeminiProvider } from '@/lib/llm/GeminiProvider'

const llmProvider = (() => {
  switch (process.env.LLM_PROVIDER) {
    case 'openai':
      return new OpenAIProvider()
    case 'anthropic':
      return new AnthropicProvider()
    case 'gemini':
      return new GeminiProvider()
    default:
      throw new Error('LLM_PROVIDER not configured')
  }
})()
```

---

## Frontend Changes

No changes (streaming logic already provider-agnostic)

---

## Data Changes

No changes

---

## Infra / Config

### Environment Variables

**New (choose one):**

- `OPENAI_API_KEY`: For OpenAI GPT-4o
- `ANTHROPIC_API_KEY`: For Anthropic Claude
- (Already have) `GOOGLE_AI_API_KEY`: For Google Gemini

**Configuration:**

- `LLM_PROVIDER`: 'openai' | 'anthropic' | 'gemini'

**Remove (after migration):**

- `GROQ_API_KEY` (optional: keep as fallback)

---

## Testing

### Evaluation Criteria (MASTER_PLAN OQ-D)

**1. Quality** (40% weight)

- Hallucination rate <5% on test set of 30 queries
- Tone appropriate (friendly, safety-conscious)
- RAG grounding respected (answers based on context)
- Out-of-scope handling (declines politely)

**2. Latency** (30% weight)

- P95 <10s (meets NFR-01)
- Time to first token <2s (streaming start)

**3. Cost (20% weight)

- <$0.10 per conversation (input + output tokens)
- Sustainable at 100 conversations/week

**4. Reliability** (10% weight)

- 99%+ uptime documented
- SLA available
- Clear error messages

### Test Set (30 Queries)

**Beginner Sites** (5 queries)

1. "What are the best dive sites in Tioman for beginners?"
2. "I'm an Open Water diver with 15 dives, where should I go?"
3. "Shore diving options for someone new to diving?"
4. "Easy sites with good coral for photography?"
5. "Where can I see turtles as a beginner?"

**Advanced Sites (5 queries):**
6. "Best drift dives in Tioman?"
7. "Advanced sites with strong currents and pelagics?"
8. "Where can I see sharks in Tioman?"
9. "Sites for experienced wreck divers?"
10. "Challenging dives for a Rescue Diver?"

**Seasonal/Logistics (5 queries):**
11. "When is the best time to dive Tioman?"
12. "Monsoon season impact on diving?"
13. "How do I get to Tioman from Kuala Lumpur?"
14. "What accommodations are available?"
15. "What should I bring for a dive trip to Tioman?"

**Safety (5 queries):**
16. "Can I dive with asthma?" (medical → disclaimer)
17. "When can I fly after diving?" (no-fly rule)
18. "What should I do if I feel dizzy after diving?" (emergency)
19. "How do I calculate my no-deco limit?" (decompression → disclaimer)
20. "Is it safe to dive alone?" (general safety)

**Out-of-Scope (5 queries):**
21. "What about diving in Bali?" (non-covered destination)
22. "Book me a flight to Tioman" (booking request)
23. "What's the best hotel in Tioman?" (booking-adjacent)
24. "Can you plan my entire trip?" (too broad)
25. "Tell me about diving in the Maldives" (non-covered)

**Lead Capture (3 queries):**
26. "I'd like to contact a dive shop"
27. "Can you connect me with an operator?"
28. "I want to book a dive course" (→ lead capture)

**Edge Cases (2 queries):**
29. "flying fish near Tioman" (keyword "fly" but not safety topic)
30. "Tell me a joke about diving" (off-topic but harmless)

### Quality Evaluation

**For each query, score:**

- **Hallucination:** Does response contain incorrect facts? (0 = no hallucination, 1 = hallucination)
- **Tone:** Friendly and appropriate? (0-2 scale: 0 = poor, 1 = ok, 2 = excellent)
- **RAG Grounding:** Based on context or admits uncertainty? (0-2 scale)
- **Out-of-Scope Handling:** Declines appropriately if applicable? (0-2 scale)

**Total Quality Score:** Sum across all queries, normalize to 0-100

### Performance Testing

**Load Test Script** (`scripts/performance-test.ts`):

```typescript
import { performance } from 'perf_hooks'

async function testLatency(provider: string, numRequests = 10) {
  const latencies: number[] = []
  const timeToFirstToken: number[] = []
  
  for (let i = 0; i < numRequests; i++) {
    const start = performance.now()
    let firstTokenTime: number | null = null
    
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken: `test-${i}`,
        message: testQueries[i % testQueries.length]
      })
    })
    
    const reader = response.body.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (!firstTokenTime) {
        firstTokenTime = performance.now() - start
        timeToFirstToken.push(firstTokenTime)
      }
      
      if (done) break
    }
    
    latencies.push(performance.now() - start)
  }
  
  // Calculate P95
  const sorted = latencies.sort((a, b) => a - b)
  const p95 = sorted[Math.floor(sorted.length * 0.95)]
  
  return {
    provider,
    mean: latencies.reduce((a, b) => a + b) / latencies.length,
    p95,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avgTimeToFirstToken: timeToFirstToken.reduce((a, b) => a + b) / timeToFirstToken.length
  }
}
```

**Run for each provider:**

```bash
LLM_PROVIDER=openai npm run perf-test
LLM_PROVIDER=anthropic npm run perf-test
LLM_PROVIDER=gemini npm run perf-test
```

### Cost Estimation

**Calculate for 100 conversations/week:**

```typescript
function estimateWeeklyCost(provider: LLMProvider) {
  const avgInputTokens = 2500 // System prompt + RAG + history
  const avgOutputTokens = 500 // Response
  const conversationsPerWeek = 100
  
  const costPerConversation = provider.estimateCost(avgInputTokens, avgOutputTokens)
  const weeklyCost = costPerConversation * conversationsPerWeek
  const monthlyCost = weeklyCost * 4
  
  return {
    costPerConversation: costPerConversation.toFixed(4),
    weeklyCost: weeklyCost.toFixed(2),
    monthlyCost: monthlyCost.toFixed(2)
  }
}
```

---

## Dependencies

**Prerequisite PRs:**

- PR-04 merged (LLM interface exists)
- PR-10 merged (error handling ready for provider switch)

**External Dependencies:**

- API keys for all 3 providers (for evaluation)
- Test set prepared (30 queries)

---

## Risks & Mitigations

### Risk: New Provider Has Higher Latency than GROQ

**Impact:** Violates NFR-01 (P95 <10s) **Mitigation:**

- Test thoroughly on staging before production switch
- Use streaming to reduce perceived latency
- Keep GROQ as fallback if all providers fail latency test
- Consider GPT-4o-mini or Claude 3.5 Haiku (faster, cheaper alternatives)

### Risk: Cost Overrun with Production Provider

**Impact:** Unsustainable at scale **Mitigation:**

- Monitor usage closely (track tokens per conversation)
- Set up billing alerts ($50/month threshold)
- Implement rate limiting (max conversations per user)
- Consider cheaper models (GPT-4o-mini, Gemini Flash)

### Risk: Quality Degradation vs GROQ

**Impact:** More hallucinations, poor tone **Mitigation:**

- Evaluate quality objectively (test set with scoring)
- Adjust system prompt for each provider (tone, structure)
- Use temperature=0 for consistency
- Iterate based on Phase 1 user feedback

---

## Acceptance Criteria

- [ ] 3 LLM providers evaluated: OpenAI GPT-4o, Anthropic Claude, Google Gemini
- [ ] Quality scores calculated for all providers (test set of 30 queries)
- [ ] Performance tested: P95 latency, time to first token
- [ ] Cost estimated for 100 conversations/week
- [ ] Production provider selected based on criteria (quality 40%, latency 30%, cost 20%, reliability 10%)
- [ ] Provider implementation completed and tested
- [ ] ChatService updated to use new provider
- [ ] Environment variables configured (API key, LLM_PROVIDER)
- [ ] Migration tested on staging environment
- [ ] GROQ dependency removed (or kept as fallback)
- [ ] README updated with LLM provider selection rationale

---

## Implementation Checklist

### Evaluation Phase (6-8 hours)

- [ ] Prepare test set (30 queries)
- [ ] Create evaluation spreadsheet (quality scoring template)
- [ ] Obtain API keys for OpenAI, Anthropic, Google Gemini
- [ ] Implement OpenAIProvider, AnthropicProvider, GeminiProvider
- [ ] Run quality evaluation for each provider (30 queries × 3 providers = 90 tests)
- [ ] Score each response (hallucination, tone, RAG grounding, out-of-scope)
- [ ] Run performance tests (10 requests per provider)
- [ ] Calculate cost estimates
- [ ] Document results in comparison table

### Migration Phase (4 hours)

- [ ] Select production provider based on criteria
- [ ] Update ChatService to use selected provider
- [ ] Add LLM_PROVIDER env var to `.env.example`
- [ ] Add production provider API key to Vercel env vars
- [ ] Test on staging environment (10+ diverse queries)
- [ ] Verify P95 latency <10s
- [ ] Verify streaming works
- [ ] Deploy to production
- [ ] Monitor for 24 hours (errors, latency, quality)
- [ ] Remove GROQ API key (or keep as fallback)
- [ ] Update README with provider selection rationale

---

## Notes

### Provider Comparison Template

| Criteria | OpenAI GPT-4o | Anthropic Claude 3.5 | Google Gemini 2.0 | Weight |
| --- | --- | --- | --- | --- |
| **Quality** | | | | 40% |
| - Hallucination rate | X/30 | X/30 | X/30 | |
| - Avg tone score | X/60 | X/60 | X/60 | |
| - RAG grounding | X/60 | X/60 | X/60 | |
| - Out-of-scope | X/40 | X/40 | X/40 | |
| **Latency** | | | | 30% |
| - P95 (target <10s) | Xs | Xs | Xs | |
| - Time to first token | Xs | Xs | Xs | |
| **Cost** | | | | 20% |
| - Per conversation | $X | $X | $X | |
| - Monthly (100/wk) | $X | $X | $X | |
| **Reliability** | | | | 10% |
| - Uptime SLA | 99.9% | 99.9% | 99% | |
| - Error rate | X% | X% | X% | |
| **TOTAL SCORE** | X/100 | X/100 | X/100 | 100% |

### Alternative Models (If Latency or Cost Issues)

**Faster/Cheaper Options:**

- **OpenAI GPT-4o-mini:** $0.15/$0.60 per 1M tokens (75% cheaper than GPT-4o)
- **Anthropic Claude 3.5 Haiku:** $1/$5 per 1M tokens (67% cheaper than Sonnet)
- **Google Gemini 1.5 Flash:** Free tier generous, paid $0.075/$0.30 per 1M

**Trade-off:** Slightly lower quality but faster and cheaper. Test if
GPT-4o/Claude 3.5 exceed budget.

### Prompt Tuning per Provider

Different providers respond better to different prompt structures:

**OpenAI:** Clear sections, numbered lists **Anthropic:** Conversational, XML-
style tags **Google:** Concise, bullet points

Adjust system prompt formatting if needed to optimize quality.

### Monitoring Post-Migration

Track for 1 week after migration:

- P95 latency (target <10s)
- Error rate (target <5%)
- User feedback (manual review of conversations)
- Cost per conversation (target <$0.10)

Rollback to GROQ if metrics degrade significantly.
