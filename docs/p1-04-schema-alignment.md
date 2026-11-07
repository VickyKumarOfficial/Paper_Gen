# P1.04: Prisma Schema Alignment with Phase 0 Data Model

## Status
✅ Completed - Schema updated and Prisma Client generated successfully

## Summary
Updated `prisma/schema.prisma` to align with Phase 0 JSON data structures for curriculum, chapters, questions, and templates.

## Changes Made

### 1. Curriculum Model
Added missing fields to match Phase 0 curriculum JSON structure:

| Field | Type | Purpose |
|-------|------|---------|
| `editionId` | String @unique | Unique identifier from curriculum JSON (e.g., "cbse-2026-27-phy-042-xi") |
| `subjectCode` | String? | Subject code (e.g., "042") |
| `academicYear` | String? | Academic year (e.g., "2026-27") |
| `sourceUrl` | String? | URL to original curriculum document |
| `retrievedAt` | String? | Date when source was retrieved |
| `versionHash` | String? @unique | Cryptographic hash for version identification |
| `units` | Json? | Units array with unitId, unitNumber, unitName, chapterIds |
| `chapters` | Json? | Raw chapters array for Phase 0 compatibility |

### 2. Chapter Model (New)
Created dedicated Chapter model to track individual chapters:

| Field | Type | Purpose |
|-------|------|---------|
| `chapterId` | String @unique | Unique ID from curriculum JSON |
| `number` | Int | Chapter number (1-14) |
| `title` | String | Chapter name |
| `unitId` | String? | Parent unit ID |
| `unitNumber` | Int? | Parent unit number |
| `curriculumId` | String | Foreign key to Curriculum |

### 3. Unit Model (New)
Created optional Unit model for Phase 1+ structured unit tracking:

| Field | Type | Purpose |
|-------|------|---------|
| `unitId` | String @unique | Unique unit identifier |
| `unitNumber` | Int | Unit number (1-10) |
| `unitRoman` | String? | Roman numeral representation |
| `name` | String | Unit name |
| `chapterIds` | Json? | Array of associated chapter IDs |

### 4. Question Model (Expanded)
Added fields to match Phase 0 question fixture structure:

| Field | Type | Purpose |
|-------|------|---------|
| `versionId` | String | Computed hash of content for versioning |
| `content` | Json | Question content (stem, options, answerKey, solution, language, tags) |
| `difficulty` | String? | Difficulty level (EASY, MEDIUM, HARD) |
| `language` | String? | Language code, defaults to "en" |
| `tags` | String[] | Array of topic tags |
| `topicId` | String? | Topic reference (null for Phase 0) |
| `chapterId` | String? | Foreign key to Chapter |
| `review` | Json? | Review metadata (status, reviewer, reviewedAt, evidenceId) |
| `provenance` | Json? | Source tracking information |

### 5. Template Model (New)
Created Template model for paper blueprints:

| Field | Type | Purpose |
|-------|------|---------|
| `templateId` | String @unique | Unique template identifier |
| `mode` | String | Template mode (FULL_SUBJECT, CHAPTER_FILTERED) |
| `status` | String? | Approval status |
| `durationMinutes` | Int? | Exam duration |
| `totalQuestions` | Int? | Number of questions |
| `totalMarks` | Int? | Total marks |
| `sections` | Json? | Section definitions |
| `difficultyCounts` | Json? | Easy/Medium/Hard distribution |
| `chapterSlotCounts` | Json? | Per-chapter slot allocation |
| `editionId` | String? | Curriculum edition reference |

### 6. QuestionTemplate Model (New)
Created junction table for Template-Question many-to-many relationship.

## Indexes Added
```prisma
Curriculum: @@index([board, class, subject])
Curriculum: @@index([subjectCode])
Chapter: @@index([curriculumId])
Chapter: @@index([unitId])
Chapter: @@index([chapterId])
Question: @@index([curriculumId])
Question: @@index([chapterId])
Question: @@index([topicId])
Question: @@index([difficulty])
Question: @@index([versionId])
Question: @@index([type, difficulty])
Template: @@index([editionId])
Template: @@index([mode])
Template: @@index([status])
QuestionTemplate: @@unique([templateId, questionId])
```

## Backward Compatibility
- Retained existing `Topic` model (Phase 0 simplified)
- Kept original `Question` `stem`, `options`, `answerKey` fields conceptually in `content` JSON
- Maintained `QuestionStatus` enum for Phase 0+ compatibility

## Seed Data Compatibility
The schema now supports loading from:
- `data/curriculum/cbse-2026-27-class11-physics.json`
- `data/templates/cbse-2026-27-phy-042-xi.templates.json`
- `generated/sample-fixtures/*.json`

## Usage Example
```typescript
// Fetch all questions for a chapter with curriculum context
const questions = await prisma.question.findMany({
  where: { chapterId: "chapter-id" },
  include: {
    curriculum: true,
    chapter: true,
  }
});

// Query by difficulty with version hash
const easyQuestions = await prisma.question.findMany({
  where: { 
    difficulty: "EASY",
    versionId: { startsWith: "sha256:" }
  }
});
```

## Prisma Client Generation
```bash
npx prisma generate
```

Output: ✅ Successfully generated to `./lib/generated/prisma`