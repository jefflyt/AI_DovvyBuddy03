# PR-05: Chat UI (Frontend)

**Branch:** `feat/chat-ui` **Epic:** DovvyBuddy MVP - Phase 0 **Status:** Not
Started **Estimated Effort:** 6-8 hours

---

## Goal

Build web chat interface with message bubbles, input, and streaming response
handling.

---

## Scope

**Included:**

- `/chat` page with message list and input
- Streaming response handling (SSE or ReadableStream)
- Session token generation and persistence (localStorage)
- Mobile-responsive UI with Tailwind CSS

**Excluded:**

- Lead capture UI (PR-06)
- Safety disclaimer UI (PR-07)
- "New chat" button (PR-09)
- Advanced UX polish (PR-09)

---

## Backend Changes

No changes (API already exists from PR-04)

---

## Frontend Changes

### New Page

**`/app/chat/page.tsx`** (Client Component)

**State:**

```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    showDisclaimer?: boolean
    triggerLeadCapture?: boolean
  }
}

const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [sessionToken, setSessionToken] = useState('')
```

**Logic:**

1. On mount: generate session token (UUID), store in localStorage
2. On send message:
   - Add user message to messages array
   - Call `/api/chat` with streaming
   - Append assistant response tokens in real-time
   - Auto-scroll to bottom
3. Handle errors: show error message, enable retry

### New Components

#### ChatMessage.tsx

```typescript
interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}
```

**Features:**

- User vs assistant styling (different colors, alignment)
- Timestamp display
- Markdown rendering (optional for Phase 0; plain text sufficient)
- Streaming indicator (blinking cursor for assistant messages)

#### ChatInput.tsx

```typescript
interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}
```

**Features:**

- Textarea with auto-resize (up to 5 lines)
- Send button (enabled only if input not empty and not loading)
- Enter key sends message (Shift+Enter for new line)
- Character limit (2000 chars, display count)

### Styling (Tailwind CSS)

**Layout:**

- Full viewport height (`h-screen`)
- Fixed header with logo/title
- Scrollable message area (`flex-1 overflow-y-auto`)
- Fixed input area at bottom

**Message Bubbles:**

- User: Blue background, right-aligned
- Assistant: Gray background, left-aligned
- Max width: 80% on desktop, 90% on mobile
- Padding, rounded corners, subtle shadow

**Responsive:**

- Mobile-first design (min-width 320px)
- Desktop: max-width 768px, centered
- Test on iOS Safari and Android Chrome

---

## Data Changes

No changes

---

## Infra / Config

No changes

---

## Testing

### Manual Tests

**Basic Flow:**

- [ ] Open `/chat` in browser
- [ ] Verify page loads without errors
- [ ] Send message: "What are the best dive sites in Tioman for beginners?"
- [ ] Verify response streams in (tokens appear incrementally)
- [ ] Verify message appears in chat history
- [ ] Send second message to test conversation continuity
- [ ] Verify session token persists on page reload

**Mobile Responsive:**

- [ ] Test on mobile viewport (375px width)
- [ ] Verify message bubbles don't overflow
- [ ] Verify input area remains fixed at bottom
- [ ] Test on actual iOS Safari and Android Chrome devices

**Edge Cases:**

- [ ] Empty message: verify send button disabled
- [ ] Very long message (>2000 chars): verify character limit enforced
- [ ] Multiple rapid messages: verify queueing works (wait for response before
sending next)
- [ ] Network error: verify error message displayed with retry option
- [ ] Long conversation (20+ messages): verify scrolling works, no performance
issues

**Session Token Persistence:**

- [ ] Send message, note session token in localStorage
- [ ] Reload page
- [ ] Verify same session token loaded
- [ ] Send message, verify conversation continues

---

## Dependencies

**Prerequisite PRs:**

- PR-04 merged (`/api/chat` endpoint available)

**External Dependencies:**

- None

---

## Risks & Mitigations

### Risk: Streaming Doesn't Work on Older Browsers

**Impact:** Users on older browsers see no response

**Mitigation:**

- Feature detection for ReadableStream/SSE
- Fallback to non-streaming (defer to Phase 1)
- Display browser compatibility warning

### Risk: Message History Grows Unbounded

**Impact:** Performance degradation in long conversations

**Mitigation:**

- Limit client-side message display to last 50 messages
- Older messages remain in session context on backend
- Add "Load more" button for scroll history (defer to Phase 1)

### Risk: Auto-Scroll Interrupts User Reading

**Impact:** User annoyed if they're reading older messages while new message
arrives

**Mitigation:**

- Only auto-scroll if user is at bottom of chat
- Detect scroll position; skip auto-scroll if user scrolled up
- Add "Scroll to bottom" button when not at bottom

---

## Acceptance Criteria

- [ ] `/chat` page renders with empty message list
- [ ] Session token generated on mount and persisted in localStorage
- [ ] User can send message via send button or Enter key
- [ ] Assistant response streams in token-by-token
- [ ] Messages displayed in correct order (user/assistant alternating)
- [ ] Conversation history visible (scrollable)
- [ ] Mobile-responsive (tested on 320px, 375px, 768px widths)
- [ ] Character limit enforced (2000 chars)
- [ ] Send button disabled when input empty or loading
- [ ] Page reloads preserve session token
- [ ] Error handling: network errors display user-friendly message

---

## Implementation Checklist

- [ ] Create `/app/chat/page.tsx` (client component)
- [ ] Create `components/ChatMessage.tsx`
- [ ] Create `components/ChatInput.tsx`
- [ ] Implement session token generation (UUID)
- [ ] Implement localStorage persistence
- [ ] Implement streaming fetch to `/api/chat`

  ```typescript
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, message })
  })
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    // Parse SSE format and append tokens
  }
  ```

- [ ] Implement auto-scroll logic
- [ ] Implement character limit validation
- [ ] Implement enter key handling (Enter = send, Shift+Enter = new line)
- [ ] Add error handling for fetch failures
- [ ] Style with Tailwind CSS (mobile-first)
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile devices (iOS Safari, Android Chrome)

---

## Notes

### Session Token Generation

```typescript
import { v4 as uuidv4 } from 'uuid'

// On mount
useEffect(() => {
  const stored = localStorage.getItem('dovvybuddy-session-token')
  if (stored) {
    setSessionToken(stored)
  } else {
    const newToken = uuidv4()
    localStorage.setItem('dovvybuddy-session-token', newToken)
    setSessionToken(newToken)
  }
}, [])
```

### Streaming Parse Logic

SSE format from PR-04:

```text
data: {"token": "Hello"}
data: {"token": " there"}
data: {"done": true, "metadata": {...}}
```

Parse each line:

```typescript
const lines = chunk.split('\n')
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const data = JSON.parse(line.slice(6))
    if (data.token) {
      // Append token to current assistant message
    } else if (data.done) {
      // Finalize message with metadata
    }
  }
}
```

### Auto-Scroll Logic

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null)

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

useEffect(() => {
  scrollToBottom()
}, [messages])
```

### Character Limit Display

```typescript
<div className="text-sm text-gray-500">
  {input.length} / 2000
</div>
```

### Responsive Breakpoints

- Mobile: < 640px (Tailwind `sm:`)
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Target:** Works well on all sizes, optimized for mobile (most users)
