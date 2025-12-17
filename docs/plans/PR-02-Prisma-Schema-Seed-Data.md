# PR-02: Prisma Schema, Migrations & Seed Data

**Branch:** `feat/database-schema`
**Epic:** DovvyBuddy MVP - Phase 0
**Status:** Not Started
**Estimated Effort:** 6-8 hours

---

## Goal

Finalize database schema, create initial migration, and seed Tioman destination
data.

---

## Scope

**Included:**

- Define Prisma schema for Destination, DiveSite, DiveShop, Lead, Session (optional)
- Create migration and apply to local/staging DB
- Seed 1 destination (Tioman) with 5-8 sites and 2 partner shops

**Excluded:**

- RAG content (PR-03)
- Lead delivery logic (PR-06)
- Chat UI (PR-05)

---

## Backend Changes

No API changes in this PR

---

## Frontend Changes

No changes

---

## Data Changes

### Prisma Schema

Create models in `prisma/schema.prisma`:

```prisma
model Destination {
  id         String     @id @default(cuid())
  name       String
  country    String
  isActive   Boolean    @default(true) @map("is_active")
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")
  
  diveSites  DiveSite[]
  diveShops  DiveShop[]
  leads      Lead[]
  
  @@map("destinations")
}

model DiveSite {
  id              String      @id @default(cuid())
  destinationId   String      @map("destination_id")
  name            String
  difficultyBand  String      @map("difficulty_band") // "beginner", "intermediate", "advanced"
  accessType      String      @map("access_type") // "shore", "boat", "liveaboard"
  isActive        Boolean     @default(true) @map("is_active")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  destination     Destination @relation(fields: [destinationId], references: [id])
  
  @@index([destinationId])
  @@index([isActive])
  @@map("dive_sites")
}

model DiveShop {
  id            String      @id @default(cuid())
  destinationId String      @map("destination_id")
  name          String
  contactEmail  String      @map("contact_email")
  websiteUrl    String?     @map("website_url")
  isPartner     Boolean     @default(false) @map("is_partner")
  isActive      Boolean     @default(true) @map("is_active")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")
  
  destination   Destination @relation(fields: [destinationId], references: [id])
  leads         Lead[]
  
  @@index([destinationId])
  @@index([isActive])
  @@map("dive_shops")
}

model Lead {
  id               String    @id @default(cuid())
  createdAt        DateTime  @default(now()) @map("created_at")
  name             String
  email            String
  destinationId    String?   @map("destination_id")
  preferredShopId  String?   @map("preferred_shop_id")
  contextJson      Json      @map("context_json") // { certLevel?, interests?, travelWindow?, highlights? }
  deliveryStatus   String    @default("pending") @map("delivery_status") // "pending", "delivered", "failed"
  deliveredAt      DateTime? @map("delivered_at")
  
  destination      Destination? @relation(fields: [destinationId], references: [id])
  preferredShop    DiveShop?    @relation(fields: [preferredShopId], references: [id])
  
  @@index([destinationId])
  @@index([deliveryStatus])
  @@map("leads")
}

model Session {
  id             String   @id @default(cuid())
  sessionToken   String   @unique @map("session_token")
  createdAt      DateTime @default(now()) @map("created_at")
  lastActivityAt DateTime @default(now()) @map("last_activity_at")
  contextJson    Json     @map("context_json") // conversation history, user profile hints
  
  @@index([sessionToken])
  @@map("sessions")
}
```

### Migrations

**Migration:** `init`

- Creates all tables with indexes
- Backward-compatible (greenfield project)

Run: `npx prisma migrate dev --name init`

### Seed Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Tioman destination
  const tioman = await prisma.destination.create({
    data: {
      name: 'Tioman',
      country: 'Malaysia',
      isActive: true,
    },
  })

  // Create dive sites
  const sites = [
    { name: 'Tiger Reef', difficulty: 'intermediate', access: 'boat' },
    { name: 'Chebeh', difficulty: 'beginner', access: 'boat' },
    { name: 'Renggis Island', difficulty: 'beginner', access: 'shore' },
    { name: 'Malang Rocks', difficulty: 'advanced', access: 'boat' },
    { name: 'Soyak Island', difficulty: 'intermediate', access: 'boat' },
    { name: 'Pirate Reef', difficulty: 'intermediate', access: 'boat' },
    { name: 'Coral Garden', difficulty: 'beginner', access: 'shore' },
    { name: 'Labas', difficulty: 'advanced', access: 'boat' },
  ]

  for (const site of sites) {
    await prisma.diveSite.create({
      data: {
        destinationId: tioman.id,
        name: site.name,
        difficultyBand: site.difficulty,
        accessType: site.access,
        isActive: true,
      },
    })
  }

  // Create partner dive shops (replace with real shop data)
  await prisma.diveShop.create({
    data: {
      destinationId: tioman.id,
      name: 'Tioman Dive Centre',
      contactEmail: 'info@tiomandive.com',
      websiteUrl: 'https://tiomandive.com',
      isPartner: true,
      isActive: true,
    },
  })

  await prisma.diveShop.create({
    data: {
      destinationId: tioman.id,
      name: 'B&J Diving Centre',
      contactEmail: 'booking@bjdiving.com',
      websiteUrl: 'https://bjdiving.com',
      isPartner: true,
      isActive: true,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Update `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Infra / Config

### Database Setup

- Ensure DATABASE_URL configured in `.env.local` for local development
- Configure DATABASE_URL in Vercel staging environment
- Run migration on staging DB after PR merge

---

## Testing

### Unit Testing

- [ ] Seed script runs without errors locally
- [ ] Verify correct number of records created (1 destination, 8 sites, 2 shops)

### Manual Testing

- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run `npx prisma db seed`
- [ ] Open Prisma Studio: `npx prisma studio`
- [ ] Verify Tioman destination exists with 8 dive sites
- [ ] Verify 2 partner shops exist with correct contact emails

---

## Dependencies

**Prerequisite PRs:**

- PR-01 merged (project skeleton exists, Prisma initialized)

**External Dependencies:**

- PostgreSQL database accessible (local or managed)
- Partner shop contact information confirmed (or use placeholders)

---

## Risks & Mitigations

### Risk: Seed Data Doesn't Match Content Files (PR-03)

**Impact:** RAG retrieval returns mismatched site names **Mitigation:**

- Coordinate seed script with content curation (PR-03)
- Use consistent naming convention (e.g., "Tiger Reef" in both DB and markdown)
- Validate site names match before PR-03 merge

### Risk: Partner Shop Contact Emails Invalid

**Impact:** Lead delivery (PR-06) fails **Mitigation:**

- Use placeholder emails for development/testing
- Confirm real partner emails before Phase 1 launch
- Add email validation to seed script

---

## Acceptance Criteria

- [ ] Prisma schema created with Destination, DiveSite, DiveShop, Lead, Session
models
- [ ] Indexes added on destination_id, is_active, delivery_status, session_token
- [ ] Migration `init` created and applied to local DB
- [ ] Seed script creates 1 destination (Tioman), 8 dive sites, 2 partner shops
- [ ] `package.json` updated with seed command
- [ ] Prisma Studio shows correct data structure
- [ ] Migration applied to Vercel staging DB (post-merge)

---

## Implementation Checklist

- [ ] Update `prisma/schema.prisma` with all models
- [ ] Add indexes to schema
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Create `prisma/seed.ts` with Tioman data
- [ ] Update `package.json` with seed command
- [ ] Install `ts-node` as dev dependency: `npm install -D ts-node`
- [ ] Run `npx prisma db seed` locally
- [ ] Verify data in Prisma Studio
- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Commit migration files to Git
- [ ] Update README.md with database setup instructions

---

## Notes

- Partner shop data (names, emails, websites) are placeholders; confirm real partners before Phase 1 launch
- Site names must match exactly with content files in PR-03 (e.g., "Tiger Reef" not "Tiger reef")
- Session table is optional for Phase 0; can use in-memory Map in ChatService instead
- Use `difficultyBand` values: "beginner", "intermediate", "advanced" (standardized)
- Use `accessType` values: "shore", "boat", "liveaboard" (standardized)
