# P1.03: Data Contracts Definition - Runtime Validation Schemas

## Status
✅ Completed - All contracts defined with Zod schemas

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
| `MCQOptionsSchema` | key-value pairs of options (2-6 choices) | MCQ options |
| `NumericalAnswerSchema` | answer, tolerance | Numerical answer |
| `QuestionContentSchema` | stem, options, answerKey, solution, tolerance | Question content |
| `QuestionCurriculumSchema` | board, academicYear, class, subject, subjectCode, unitNumber, chapterNumber, chapterName, chapterId, topicId, conceptIds | Curriculum reference |

#### Question Contract
| Schema | Fields | Purpose |
|--------|--------|---------|
| `QuestionSchema` | schemaVersion, stableId, versionId, curriculum, type, difficulty, marks, language, content, tags, provenance, review | Complete question definition |

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
- Hash input: { content, type, marks, difficulty, curriculum }
- Excludes: stableId, versionId, schemaVersion, review, provenance, tags, language
- Format: `sha256:<64-char-hash>`

### `validateQuestion(question: Question): ValidationResult<Question>`
Validates question structure and verifies versionId matches computed hash.

## Verification

### TypeScript Compilation
```bash
$ npx tsc --noEmit
# No errors
```

### Build Verification
```bash
$ npm run build
# Build successful
# Route: / - 2.82 kB / 105 kB first load JS
```

### Schema Validation Test
```typescript
import { QuestionSchema, validateQuestion } from './contracts';

// Load fixture data
const fixture = require('../generated/sample-fixtures/class-11-physics-mcq.json');
const result = validateQuestion(fixture);

// result.success === true for valid Phase 0 questions
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

## Related Documentation
- [Phase 0 Decisions](phase0-decisions.md) - Rights policy, review policy
- [Phase 0 Question Bank](phase0-question-bank.md) - Approved questions
- [P1.04 Schema Alignment](p1-04-schema-alignment.md) - Prisma schema mapping