# PR-07: Out-of-Scope Handling & Safety Disclaimers

**Branch:** `feat/guardrails`
**Epic:** DovvyBuddy MVP - Phase 0
**Status:** Not Started
**Estimated Effort:** 4-6 hours

---

## Goal

Implement robust guardrails for out-of-scope queries (non-covered destinations,
booking, medical advice) and safety disclaimers in chat UI.

---

## Scope

### Included

- Enhanced system prompt for out-of-scope handling
- Safety disclaimer UI component
- Chat message metadata for disclaimer rendering
- Integration tests for all guardrail scenarios

#### Excluded

- Advanced safety classification (defer to Phase 2; keyword matching sufficient
for Phase 0)
- Multi-language disclaimers (English only for V1)

---

## Backend Changes

### Update ChatService System Prompt

#### Add to existing system prompt from PR-04

```text
OUT-OF-SCOPE HANDLING:

1. Non-Covered Destinations:
   Currently covered: Tioman, Malaysia
   
   If asked about other destinations (Bali, Maldives, Red Sea, Philippines, Thailand, etc.):
   "I currently only have detailed information about Tioman, Malaysia. Would you like to know more about diving in Tioman? I can help you find the perfect dive sites based on your experience level and interests."
   
2. Booking Requests:
   If asked to book flights, hotels, or dives:
   "I can't help with bookings, but I can connect you with a trusted partner dive shop in Tioman who can assist with arranging your trip. Would you like me to put you in touch?"
   [Set triggerLeadCapture = true in metadata]
   
3. Medical Advice:
   If asked about diving with medical conditions (asthma, diabetes, heart condition, etc.):
   "[DISCLAIMER] This is general information only, not personalized medical advice. Diving with certain medical conditions can be dangerous. Please consult a dive physician or contact DAN (Divers Alert Network) before diving. For emergencies, contact local emergency services immediately."
   [Set showDisclaimer = true in metadata]
   
4. Decompression Calculations:
   If asked to calculate decompression stops, no-decompression limits, or dive tables:
   "[DISCLAIMER] I cannot calculate decompression schedules or dive profiles. Please use dive tables, a dive computer, or consult a qualified dive professional for dive planning. Never rely on AI for safety-critical calculations."
   [Set showDisclaimer = true in metadata]
   
5. Emergency Situations:
   If user describes an emergency (injured, DCS symptoms, lost at sea, etc.):
   "[URGENT] This is a medical emergency. STOP using this chat and contact emergency services immediately:
   - Malaysia Emergency: 999
   - DAN Emergency Hotline: +1-919-684-9111
   - Local dive operator for assistance
   I cannot provide emergency medical advice. Get professional help now."
   [Set showDisclaimer = true in metadata]
```

### Update SafetyGuardService

#### Expand Keyword Lists

```typescript
const safetyKeywords = {
  medical: [
    'asthma', 'diabetes', 'heart', 'medication', 'medical',
    'doctor', 'condition', 'disease', 'surgery', 'injury',
    'pregnant', 'epilepsy', 'seizure'
  ],
  decompression: [
    'decompression', 'deco', 'bends', 'DCS', 'nitrogen',
    'calculate', 'dive table', 'no-deco limit', 'NDL',
    'safety stop', 'deco stop'
  ],
  emergency: [
    'emergency', 'help', 'urgent', 'injured', 'accident',
    'lost', 'missing', 'panic', 'drowning', 'unconscious',
    'bleeding', 'pain', 'symptoms'
  ],
  noFly: [
    'fly', 'flight', 'airplane', 'aircraft', 'altitude'
  ]
}

function detectSafetyTopics(message: string): SafetyDetectionResult {
  const lowerMessage = message.toLowerCase()
  const topics: string[] = []
  
  if (safetyKeywords.medical.some(kw => lowerMessage.includes(kw))) {
    topics.push('medical')
  }
  if (safetyKeywords.decompression.some(kw => lowerMessage.includes(kw))) {
    topics.push('decompression')
  }
  if (safetyKeywords.emergency.some(kw => lowerMessage.includes(kw))) {
    topics.push('emergency')
  }
  if (safetyKeywords.noFly.some(kw => lowerMessage.includes(kw))) {
    topics.push('noFly')
  }
  
  return {
    isSafetyTopic: topics.length > 0,
    topics,
    disclaimer: topics.length > 0 ? generateDisclaimer(topics) : undefined
  }
}
```

---

## Frontend Changes

### New Component

#### SafetyDisclaimer.tsx

```typescript
interface SafetyDisclaimerProps {
  type?: 'general' | 'emergency' | 'medical' | 'decompression'
}

export function SafetyDisclaimer({ type = 'general' }: SafetyDisclaimerProps) {
  const content = {
    general: '⚠️ Safety Reminder: This is general information only. Consult a qualified dive professional for personalized advice.',
    emergency: '🚨 EMERGENCY: Contact emergency services immediately. Do not rely on this chat for emergency medical advice.',
    medical: '⚠️ Medical Disclaimer: This is not medical advice. Consult a dive physician or DAN before diving with any medical condition.',
    decompression: '⚠️ Safety Critical: Never rely on AI for decompression calculations. Use dive tables, a computer, or consult a professional.'
  }
  
  return (
    <div className={`border-l-4 p-3 mb-2 ${type === 'emergency' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <p className="text-sm font-semibold">{content[type]}</p>
    </div>
  )
}
```

### Update ChatMessage.tsx

#### Conditional Disclaimer Rendering

```typescript
export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div>
      {message.metadata?.showDisclaimer && (
        <SafetyDisclaimer type={message.metadata.disclaimerType} />
      )}
      <div className="message-bubble">
        {message.content}
      </div>
    </div>
  )
}
```

---

## Data Changes

No changes

---

## Infra / Config

No changes

---

## Testing

### Integration Tests

**Test Case 1**: Non-Covered Destination

- Request: `{ message: "What are the best dive sites in Bali?" }`
- Expected:
  - Response: "I currently only have detailed information about Tioman, Malaysia..."
  - No disclaimer shown
  - Redirects to covered destination

**Test Case 2**: Booking Request

- Request: `{ message: "Book me a dive trip to Tioman" }`
- Expected:
  - Response: "I can't help with bookings, but I can connect you with..."
  - Metadata: `triggerLeadCapture: true`
  - No disclaimer shown

**Test Case 3**: Medical Query

- Request: `{ message: "Can I dive with asthma?" }`
- Expected:
  - Response includes: "This is general information only, not personalized medical advice..."
  - Metadata: `showDisclaimer: true, disclaimerType: 'medical'`
  - Defers to dive physician/DAN

**Test Case 4**: Decompression Calculation

- Request: `{ message: "Calculate my no-deco limit for 25m dive" }`
- Expected:
  - Response: "I cannot calculate decompression schedules..."
  - Metadata: `showDisclaimer: true, disclaimerType: 'decompression'`

**Test Case 5**: Emergency

- Request: `{ message: "My buddy is unconscious underwater, what do I do?" }`
- Expected:
  - Response: "[URGENT] This is a medical emergency. STOP using this chat..."
  - Metadata: `showDisclaimer: true, disclaimerType: 'emergency'`
  - Lists emergency contact numbers

**Test Case 6**: No-Fly Rule (Not Medical)

- Request: `{ message: "When can I fly after diving?" }`
- Expected:
  - Response: General guidance on 18-24 hour no-fly rule (from safety-general.md)
  - Metadata: `showDisclaimer: true` (safety topic, but informational)
  - Not medical advice (no specific recommendations)

**Test Case 7**: General Safety (No Disclaimer)

- Request: `{ message: "Is it safe to dive in Tioman?" }`
- Expected:
  - Response: General information about conditions, safety measures
  - NO disclaimer (not medical, not safety-critical)

**Test Case 8**: Edge Case - Multi-Destination

- Request: `{ message: "I'm planning trips to both Bali and Tioman, can you help?" }`
- Expected:
  - Response: "I can help with Tioman planning. For Bali, you'd need to check
other resources..."

### Manual Tests

#### Prompt Testing (Diverse Queries)

- [ ] "What about the Maldives?" → Declines, redirects to Tioman
- [ ] "Book my flight" → Declines, offers partner shop connection
- [ ] "Can I dive with diabetes?" → Disclaimer, defers to physician
- [ ] "How do I calculate deco stops?" → Disclaimer, defers to dive
computer/tables
- [ ] "I feel dizzy after diving" → Emergency response, urgent contact info
- [ ] "When should I avoid flying?" → General no-fly guidance with disclaimer
- [ ] "Is Tioman safe?" → General safety info, no disclaimer
- [ ] "Best beginner sites?" → Normal response, no disclaimer

#### UI Testing

- [ ] Verify SafetyDisclaimer renders with correct styling (yellow for general, red for emergency)
- [ ] Verify disclaimer appears above assistant message
- [ ] Verify multiple disclaimers in one conversation don't stack awkwardly

---

## Dependencies

### Prerequisite PRs

- PR-04 merged (SafetyGuardService exists, ChatService system prompt)
- PR-05 merged (Chat UI available, ChatMessage component)

### External Dependencies

- None

---

## Risks & Mitigations

### Risk: Keyword-Based Detection Misses Edge Cases (False Negatives)

**Impact** Users receive medical/safety-critical advice without disclaimer
**Mitigation**

- Log all safety-topic detections for manual review
- Err on side of caution (broad keyword matching)
- Improve classification in Phase 1 (LLM-based intent detection)
- Include legal disclaimer in footer/privacy notice

### Risk: Too Many Disclaimers Frustrate Users (False Positives)

**Impact** Users annoyed by unnecessary warnings **Mitigation**

- Test keyword lists with diverse queries (20-30 test cases)
- Remove overly broad keywords (e.g., "fly" might match "butterfly fish")
- Use context (e.g., "fly after diving" triggers disclaimer, but "flying fish" does not)
- Iterate based on Phase 0 user feedback

### Risk: Users Ignore Emergency Warning

**Impact** User continues chatting instead of seeking emergency help
**Mitigation**

- Make emergency disclaimer highly visible (red, bold, urgent language)
- Explicitly say "STOP using this chat"
- List emergency contact numbers prominently
- Consider blocking further messages after emergency detected (defer to Phase 1)

---

## Acceptance Criteria

- [ ] System prompt updated with out-of-scope handling rules
- [ ] SafetyGuardService expanded with comprehensive keyword lists
- [ ] SafetyDisclaimer component renders with correct styling
- [ ] ChatMessage conditionally renders disclaimer based on metadata
- [ ] Integration tests pass for all 8 test cases
- [ ] Manual testing confirms guardrails work for 20+ diverse queries
- [ ] Emergency scenarios trigger urgent response
- [ ] Non-covered destinations redirect to Tioman
- [ ] Booking requests trigger lead capture flow
- [ ] Medical/decompression queries show appropriate disclaimers

---

## Implementation Checklist

- [ ] Update `ChatService` system prompt (copy from spec above)
- [ ] Update `SafetyGuardService.detectSafetyTopics()` with expanded keywords
- [ ] Create `components/SafetyDisclaimer.tsx`
- [ ] Update `ChatMessage.tsx` to conditionally render disclaimer
- [ ] Write integration tests for all 8 test cases
- [ ] Run integration tests, verify all pass
- [ ] Manual testing with 20+ queries (document results)
- [ ] Update README.md with guardrail documentation

---

## Notes

### Emergency Contact Numbers

Include in emergency response:

- **Malaysia Emergency:** 999 (police, ambulance, fire)
- **DAN Emergency Hotline:** +1-919-684-9111 (24/7, international)
- **Local Dive Operator:** Suggest user contact their booked operator

### Legal Disclaimer (Footer/Privacy)

Add to landing page footer and privacy notice:

```text
DovvyBuddy is an informational tool only. It does not provide medical advice, dive planning services, or booking. Always verify information with qualified dive professionals and operators. Use at your own risk.
```

### Context-Aware Keywords

Improve accuracy with context:

```typescript
// "fly" in context of post-diving is safety topic
if (message.includes('fly') && (message.includes('after') || message.includes('diving'))) {
  topics.push('noFly')
}

// "fly" in context of "flying fish" is not safety topic
if (message.includes('flying fish') || message.includes('butterfly')) {
  // Skip noFly topic
}
```

Defer advanced context detection to Phase 1 (use LLM for classification)

### Testing Queries by Category

#### Non-Covered Destinations

- "What about Bali?"
- "Best sites in the Maldives?"
- "I want to dive the Great Barrier Reef"

#### Booking

- "Book my flight"
- "Reserve a hotel"
- "I want to book a dive course"

#### Medical

- "Can I dive with asthma?"
- "I'm on medication, is it safe?"
- "I had surgery last month"

#### Decompression

- "Calculate my NDL"
- "How long is my safety stop?"
- "What's my no-deco limit at 30m?"

#### Emergency

- "My buddy is unconscious"
- "I feel dizzy and nauseous after diving"
- "I think I have the bends"

#### No-Fly

- "When can I fly after diving?"
- "Is it safe to fly tomorrow?"
- "Flight altitude after diving"

#### General Safety (No Disclaimer)

- "Is Tioman safe for diving?"
- "What are the safety measures?"
- "Are the currents strong?"
- "What should I know about Tioman weather?"
- "Best time of year to dive Tioman?"
