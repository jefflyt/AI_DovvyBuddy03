# PR-03: RAG Service — Content Ingestion & Vector Search

**Branch:** `feat/rag-service`
**Epic:** DovvyBuddy MVP - Phase 0
**Status:** Not Started
**Estimated Effort:** 10-12 hours (6-8 hours content curation + 4 hours implementation)

---

## Goal

Implement RAG retrieval over curated Tioman content using Google AI SDK
embeddings.

---

## Scope

**Included:**

- Create curated markdown content for Tioman (overview, sites, logistics,
safety)
- Offline embedding generation script using Google AI SDK (Gemini)
- RAG retrieval service with cosine similarity ranking

**Excluded:**

- Chat orchestration (PR-04)
- Frontend UI (PR-05)
- Real-time embedding generation (embeddings pre-generated offline)

---

## Backend Changes

### New Services

**RAGService** (`src/services/RAGService.ts`):

```typescript
interface RAGChunk {
  text: string
  source: string
  chunkId: string
  embedding: number[]
}

class RAGService {
  private embeddings: RAGChunk[]
  
  constructor() {
    // Load embeddings from JSON file
    this.embeddings = loadEmbeddings()
  }
  
  async retrieveContext(query: string, topK = 5): Promise<string[]> {
    // 1. Generate query embedding via Google AI SDK
    // 2. Compute cosine similarity against all chunks
    // 3. Sort by similarity descending
    // 4. Return top K chunk texts
  }
}
```

### New Utilities

**Vector Utils** (`src/utils/vectorUtils.ts`):

```typescript
// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number

// Normalize vector to unit length
function normalize(vector: number[]): number[]
```

### New Scripts

**Embedding Generation** (`scripts/generate-embeddings.ts`):

- Load markdown files from `/content`
- Chunk by h2/h3 headers (preserve context)
- Generate embeddings via Google AI SDK
- Save to `/content/embeddings.json` with metadata

---

## Frontend Changes

No changes

---

## Data Changes

### Content Files

Create `/content` directory with markdown files:

#### `/content/tioman-overview.md`

**Topics:**

- Location and geography
- Best season to visit (March-October, avoid monsoon November-February)
- Water conditions (visibility, temperature, currents)
- Marine life highlights (blacktip sharks, turtles, nudibranch, coral)
- Access (ferry from Mersing, flights to Tioman Airport)

**Length:** ~500-800 words

#### `/content/tioman-sites.md`

**Format:** One section (h2) per dive site

**Sites to cover (8 sites from PR-02):**

1. **Tiger Reef** - Intermediate, boat, 15-25m, strong currents, sharks, barracuda
2. **Chebeh** - Beginner, boat, 5-12m, calm, perfect for training/macro
3. **Renggis Island** - Beginner, shore, 3-10m, easy access, turtles, coral gardens
4. **Malang Rocks** - Advanced, boat, 20-30m, drift dive, pelagics, strong currents
5. **Soyak Island** - Intermediate, boat, 12-20m, wall dive, soft corals, lionfish
6. **Pirate Reef** - Intermediate, boat, 10-18m, wreck remnants, groupers
7. **Coral Garden** - Beginner, shore, 3-8m, house reef, macro photography
8. **Labas** - Advanced, boat, 18-28m, drift, schooling fish, occasional mantas

**Length:** ~100-150 words per site = 800-1200 words total

#### `/content/tioman-logistics.md`

**Topics:**

- Getting there (ferry schedule, airport options, travel time)
- Accommodations (budget to mid-range, dive resort recommendations)
- Local tips (cash-only, limited ATMs, mobile coverage)
- What to bring (reef-safe sunscreen, dive gear notes)

**Length:** ~400-600 words

#### `/content/padi-certification-guide.md`

**Topics:**

- **PADI Open Water Course:** Structure (theory, confined, open water), prerequisites, time commitment (3-4 days), common fears (mask clearing, sharks), what to expect.
- **PADI Advanced Open Water Course:** Benefits (depth, navigation), adventure dives (deep, nav, +3 others), prerequisites (OW cert), time commitment (2-3 days).
- **Why Get Certified:** Confidence, safety, access to deeper/better sites, global recognition.

**Length:** ~600-800 words

#### `/content/safety-general.md`

**Topics (DAN + PADI sourced):**

- No-fly rule (18-24 hours after diving)
- Dive planning basics (buddy system, dive tables/computer)
- Emergency contacts (DAN hotline, local emergency services)
- Environmental responsibility (no touching coral/marine life)
- When to seek medical help (DCS symptoms)

**Length:** ~500-700 words

**Total:** ~2500-3500 words across 4 files

### Generated Files

**`/content/embeddings.json`:**

```json
{
  "chunks": [
    {
      "chunkId": "tioman-overview-001",
      "text": "Tioman is located off the east coast of Peninsular Malaysia...",
      "source": "tioman-overview.md",
      "embedding": [0.123, -0.456, ...]
    },
    ...
  ],
  "metadata": {
    "generatedAt": "2025-12-17T10:30:00Z",
    "model": "models/embedding-001",
    "totalChunks": 42
  }
}
```

**Do not commit to Git** (add to `.gitignore`); regenerate when content changes

---

## Infra / Config

### Environment Variables

- `GOOGLE_AI_API_KEY` must be set for embedding generation

### Google AI SDK Setup

- Install: `@google/generative-ai`
- Use model: `models/embedding-001` or `models/text-embedding-004` (latest)
- Rate limits: 1500 requests/min (free tier) - sufficient for ~50 chunks

---

## Testing

### Unit Tests

**RAGService:**

- [ ] `retrieveContext("best sites for macro photography in Tioman")` returns relevant chunks
  - Expected: Chunks from Chebeh, Coral Garden (beginner sites with macro mentioned)
- [ ] `retrieveContext("advanced drift dives")` returns Malang Rocks, Tiger Reef
- [ ] `retrieveContext("non-relevant query")` returns empty or low-similarity
chunks

**Vector Utils:**

- [ ] `cosineSimilarity([1,0,0], [1,0,0])` returns 1.0
- [ ] `cosineSimilarity([1,0,0], [0,1,0])` returns 0.0
- [ ] `normalize([3,4])` returns [0.6, 0.8]

### Integration Tests

- [ ] Generate embeddings for test content (2 markdown files, ~500 words)
- [ ] Query RAG service with test query
- [ ] Validate top result matches expected source file

### Manual Tests

- [ ] Run `npm run generate-embeddings`
- [ ] Verify `embeddings.json` created with correct structure
- [ ] Verify chunk count matches expected (~40-50 chunks for 4 files)
- [ ] Test with diverse queries:
  - "best beginner sites" → Chebeh, Renggis Island, Coral Garden
  - "where can I see sharks" → Tiger Reef, Malang Rocks
  - "shore diving options" → Renggis Island, Coral Garden
  - "seasonal information" → tioman-overview chunks

---

## Dependencies

**Prerequisite PRs:**

- PR-01 merged (Google AI SDK installed)
- PR-02 merged (destination/site names coordinated with content)

**External Dependencies:**

- Google AI API key with sufficient quota
- Content review/approval (founder validation)

---

## Risks & Mitigations

### Risk: Google AI API Rate Limits or Quota Issues

**Impact:** Cannot generate embeddings **Mitigation:**

- Use generous free tier (1500 requests/min)
- Batch requests (50 chunks = 50 requests, well under limit)
- Cache embeddings (regenerate only when content changes)
- Monitor usage via Google AI Studio

### Risk: Content Quality Insufficient

**Impact:** RAG retrieval returns irrelevant or incomplete information
**Mitigation:**

- Manual content review by founder (experienced diver)
- Test with 20-30 diverse queries
- Iterate based on results
- Use vetted sources (local dive operators, PADI, DAN)
- Include citations/sources in content

### Risk: Chunking Strategy Loses Context

**Impact:** Retrieved chunks lack necessary context (e.g., site name,
destination) **Mitigation:**

- Chunk by h2/h3 headers (preserve section structure)
- Include parent heading in chunk metadata
- Test with queries that require cross-chunk context

### Risk: Embedding Model Changes Break Compatibility

**Impact:** Need to regenerate all embeddings **Mitigation:**

- Pin Google AI SDK version
- Document embedding model version in embeddings.json
- Keep content files in Git for easy regeneration

---

## Acceptance Criteria

- [ ] 4 markdown content files created (tioman-overview, tioman-sites, tioman- logistics, safety-general)
- [ ] Content reviewed and approved by founder
- [ ] Site names match exactly with PR-02 seed data
- [ ] `scripts/generate-embeddings.ts` generates embeddings successfully
- [ ] `embeddings.json` created with 40-50 chunks
- [ ] `RAGService.retrieveContext()` returns relevant chunks for test queries
- [ ] Unit tests pass for RAGService and vectorUtils
- [ ] Integration test validates RAG retrieval accuracy
- [ ] `.gitignore` updated to exclude `embeddings.json`
- [ ] `package.json` updated with `generate-embeddings` script

---

## Implementation Checklist

### Content Curation (6-8 hours)

- [ ] Research Tioman dive sites (dive operator websites, TripAdvisor, dive blogs)
- [ ] Draft `tioman-overview.md` (500-800 words)
- [ ] Draft `tioman-sites.md` with 8 site descriptions (800-1200 words)
- [ ] Draft `tioman-logistics.md` (400-600 words)
- [ ] Draft `safety-general.md` with DAN/PADI citations (500-700 words)
- [ ] Review content for accuracy and tone
- [ ] Validate site names match PR-02 seed data

### Implementation (4 hours)

- [ ] Create `/content` directory
- [ ] Add content markdown files
- [ ] Create `scripts/generate-embeddings.ts`
- [ ] Implement Google AI SDK integration (embedding generation)
- [ ] Implement chunking logic (split by h2/h3 headers)
- [ ] Create `src/services/RAGService.ts`
- [ ] Create `src/utils/vectorUtils.ts`
- [ ] Write unit tests for RAGService
- [ ] Write unit tests for vectorUtils
- [ ] Add `generate-embeddings` script to `package.json`
- [ ] Run embedding generation, verify output
- [ ] Update `.gitignore` to exclude `embeddings.json`
- [ ] Update README.md with content update workflow

---

## Notes

### Content Curation Guidelines

- **Tone:** Friendly, informative, non-promotional
- **Accuracy:** Verify all facts (depths, conditions, access) with multiple sources
- **Safety:** Always include appropriate disclaimers (e.g., "Conditions vary; check with local operators")
- **Citations:** Link to sources (DAN, PADI, local operators) where possible
- **Seasonal Info:** Specify monsoon season (November-February) clearly
- **Accessibility:** Mention skill level required for each site

### Chunking Strategy

- Chunk by h2 (main sections) or h3 (subsections) headers
- Aim for 100-300 words per chunk (optimal for retrieval)
- Include parent heading context (e.g., "Tioman Sites > Tiger Reef")
- Preserve markdown formatting (lists, bold) in chunk text

### Embedding Model Selection

- Use `models/embedding-001` (Google AI SDK standard model)
- Embedding dimension: 768 (check SDK documentation)
- Alternative: `models/text-embedding-004` if available (newer, potentially better quality)

### Testing Queries

- "best sites for beginners in Tioman"
- "advanced drift dives with strong currents"
- "where can I see turtles"
- "shore diving options"
- "when is the best time to visit Tioman for diving"
- "no-fly rule after diving"
- "what to do in a diving emergency"
