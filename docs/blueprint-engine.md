# Blueprint Engine — Phase 2 Design

## Purpose
Creates a machine-checkable blueprint contract before question retrieval.

## Input
- `class`
- `subject`
- `chapterIds` (optional)
- `customConfig` (overrides)

## Output
```json
{
  "sections": [
    { "label": "A", "type": "MCQ_SINGLE", "marks": 1, "count": 10 },
    { "label": "B", "type": "NUMERICAL", "marks": 3, "count": 5 }
  ],
  "totalMarks": 25,
  "durationMinutes": 60,
  "difficultyDistribution": { "Easy": 30, "Medium": 50, "Hard": 20 }
}
```

## Invariants
- `SECTION_COUNTS × MARKS = TOTAL_MARKS`
- `DIFFICULTY_DIST = 100%`
- Every slot must be `topicMapped`

For this aggregate example, the section count is 10 + 5 = 15 and the marks total is 10 × 1 + 5 × 3 = 25. The difficulty percentages total 30 + 50 + 20 = 100. Topic mapping, permitted types, curriculum scope, and per-slot assignment cannot be checked from these aggregate rows; they require a pinned curriculum and expanded slots before this can be a valid executable blueprint.

## Validation
```ts
if (totalMarks !== sum(sectionMarks)) throw Error('Invariants broken');
```

## Implementation Notes
- Table: `blueprint` (JSON config column)
- Pre-flight check: `SELECT count(*) FROM questions WHERE topic IN (...)`

## Phase 2 Exit
- All templates pass feasibility check
- 100% invariant compliance in test fixtures
