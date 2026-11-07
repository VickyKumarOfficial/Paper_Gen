# P1.03: Data Contracts Definition - Runtime Validation Schemas

## Status
✅ Completed - All contracts defined with Zod schemas

## Overview

Created comprehensive TypeScript interfaces and Zod 3.23.8 runtime validation schemas for the Niera Question Paper Generator Phase 1 implementation (P1.03). All schemas match Phase 0 fixture data structures exactly.

## Key Design Decisions

1. **Dual Question Format Support**: Supports both FullQuestion (structured with nested `content`, `curriculum`, `provenance`, `review` objects) and SimplifiedQuestion (flattened format with root-level `stem`, `options`, `chapterId`, `status`).

2. **Nullable Options**: MCQ options field accepts `null` for non-MCQ question types (e.g., SHORT_ANSWER questions in Siyavula-sourced fixtures have `options: null`).

3. **Version ID Computation**: SHA-256 hash computed from `{content, type, marks, difficulty, curriculum}` matching `./scripts/phase0-version-id.mjs` logic. For SimplifiedQuestion, content is reconstructed from root-level fields.

4. **Chapter-Level Granularity**: `topicId` is nullable for Phase 0 which only has chapter-level granularity.

## Verification Results

### All 45 Questions Validated Successfully

| Fixture File | Questions | Status |
|--------------|-----------|--------|
| class-11-physics-full-subject-candidate.json | 30/30 | ✓ Valid (Full format) |
| class-11-physics-chapter-2-candidate.json | 10/10 | ✓ Valid (Full format) |
| class-11-physics-siyavula-sourced-candidate.json | 3/3 | ✓ Valid (Full format with SHORT_ANSWER) |
| class-11-physics-mcq.json | 2/2 | ✓ Valid (Simplified format) |

### Build Verification
```bash
$ npm run build
✓ Compiled successfully
✓ Linting and checking validity of types passed
```

### Phase 0 Validation
```bash
$ npm run validate:phase0
Checked 43 items across 3 fixtures; 43 versionIds recompute.
STRUCTURE PASS
```

## Summary

Defined TypeScript interfaces and Zod runtime validation schemas for all data models in the Niera Question Paper Generator. Contracts match the Phase 0 fixture data structure exactly.

## Files Created

### `src/lib/contracts.ts`

Complete contract definitions including:

#### Enums
| Schema | Values | Purpose |
|--------|--------|---------|
| `QuestionTypeSchema` | MCQ_SINGLE, MCQ_MULTIPLE, NUMERICAL, ASSERT_REASON, MATCH_THE_COLUMNS, SHORT_ANSWER, COMPARISON | Question classification |
| `DifficultySchema` | EASY, MEDIUM, HARD | Difficulty levels |
| `QuestionStatusSchema` | REVIEW_NEEDED, APPROVED, REJECTED, REVISE | Review workflow states |
| `SectionTypeSchema` | MCQ_SINGLE, MCQ_MULTIPLE, NUMERICAL, SHORT_ANSWER, ASSERT_REASON | Blueprint section types |

#### Curriculum Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `CurriculumRequestSchema` | class, subject, chapterIds? | Request to fetch curriculum data |
| `UnitSchema` | unitId, unitNumber, unitRoman, unitName, chapterIds | Academic unit definition |
| `ChapterSchema` | chapterId, chapterNumber, chapterName, unitId, unitNumber | Chapter definition |
| `CurriculumResponseSchema` | schemaVersion, editionId, board, class, subject, units, chapters | Full curriculum response |

#### Blueprint Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `BlueprintSectionSchema` | label, type, count, marksEach | Section definition |
| `DifficultyCountsSchema` | EASY, MEDIUM, HARD | Difficulty distribution |
| `BlueprintSchema` | blueprintId, sections, totalMarks, durationMinutes, difficultyCounts | Paper blueprint |

#### Slot Contract
| Schema | Fields | Purpose |
|--------|--------|---------|
| `SlotSchema` | sectionIdx, questionType, marks, difficulty, chapterId | Empty slot to fill |

#### Provenance / Review Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `ProvenanceSchema` | sourceLabel, sourceTitle, sourceUrl, sourceItemId, creator, authoredAt, originType, extractedAt, licence, attribution, rightsRecordId, rightsStatus | Question source metadata |
| `ReviewSchema` | status, reviewer, reviewedAt, evidenceId | Review record |

#### Question Content Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `MCQOptionsSchema` | key-value pairs (nullable, 2-6 choices when present) | MCQ options; null for non-MCQ types |
| `NumericalAnswerSchema` | answer, tolerance | Numerical answer |
| `QuestionContentSchema` | stem, options (nullable), answerKey, solution, tolerance | Nested content object (Full format) |
| `QuestionCurriculumSchema` | board, academicYear, class, subject, subjectCode, unitNumber, chapterNumber, chapterName, chapterId, topicId, conceptIds | Curriculum reference |

#### Question Contract
| Schema | Fields | Purpose |
|--------|--------|---------|
| `FullQuestionSchema` | schemaVersion, stableId, versionId, curriculum, type, difficulty, marks, language, content, tags, provenance, review | Complete question with structured nested objects |
| `SimplifiedQuestionSchema` | schemaVersion, stableId, versionId, type, difficulty, marks, stem, options, answerKey, solution, tolerance, topicId, chapterId, status, tags, language, provenance, review, curriculum | Flattened format (e.g., mcq.json) |
| `QuestionSchema` | Union of FullQuestionSchema \| SimplifiedQuestionSchema | Accepts either format |

**Note**: 
- `options` accepts `null` for non-MCQ types (SHORT_ANSWER, NUMERICAL)
- `options` accepts record of strings for MCQ types
- `status` (string) replaces `review` (object) in SimplifiedQuestion format
- `chapterId` is at root level in SimplifiedQuestion format

#### Draft / Finalized Paper Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `DraftSchema` | draftId, request, blueprint, questions, createdAt, updatedAt, slotAssignments | Draft paper in progress |
| `FinalizedPaperSchema` | paperId, type, request, blueprint, questions, createdAt, finalizedAt, integrityHash | Immutable finalized paper |

#### Preview & Validation Contracts
| Schema | Fields | Purpose |
|--------|--------|---------|
| `PaperPreviewSchema` | class, subject, title, questions, sections, totalMarks, durationMinutes | Display preview |
| `ValidationResultSchema` | success, data, errors, errorPath | Schema validation result |

## Utility Functions

### `computeVersionId(question: Question): string`
Computes SHA-256 hash of question content for versioning:
- Hash input: `{ content, type, marks, difficulty, curriculum }`
- Excludes: stableId, versionId, schemaVersion, review, provenance, tags, language
- Format: `sha256:<64-char-hash>`

**Implementation Note**: For SimplifiedQuestion format, content is reconstructed from root-level fields (`stem`, `options`, `answerKey`, `solution`, `tolerance`) before hashing.

### `validateQuestion(question: Question): ValidationResult<Question>`
Validates question structure and verifies versionId matches computed hash.

## Verification

```bash
$ npm run build
# Build successful

$ npm run validate:phase0
# STRUCTURE PASS - All fixtures validated
```

## Reference Fixtures

Contracts validated against Phase 0 fixtures:
- `generated/sample-fixtures/class-11-physics-mcq.json`
- `generated/sample-fixtures/class-11-physics-full-subject-candidate.json`
- `generated/sample-fixtures/class-11-physics-chapter-2-candidate.json`
- `generated/sample-fixtures/class-11-physics-siyavula-sourced-candidate.json`

## Implementation Notes

1. **Zod Version**: 3.23.8 (already in dependencies)
2. **stableId**: Permanent identifier used across versions (distinct from display numbers)
3. **topicId**: Nullable for Phase 0 which only has chapter-level granularity
4. **versionId**: Optional in schema but required for validated questions
5. **All enums are exhaustive** - TypeScript will catch any missing cases
6. **options field handles null**: Non-MCQ questions (SHORT_ANSWER, etc.) use `options: null` in fixtures
7. **Version ID computation handles both formats**: Full format uses nested `content` object; Simplified format reconstructs from root fields
8. **Schema alignment**: Both Question schemas include `curriculum` as optional to support mcq.json format which has `chapterId` at root level instead of inside `curriculum`

## Related Documentation
- [Phase 0 Decisions](phase0-decisions.md) - Rights policy, review policy
- [Phase 0 Question Bank](phase0-question-bank.md) - Approved questions
- [P1.04 Schema Alignment](p1-04-schema-alignment.md) - Prisma schema mapping