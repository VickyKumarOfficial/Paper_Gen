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
  "totalMarks": 40,
  "durationMinutes": 60,
  "difficultyDistribution": { "Easy": 30, "Medium": 50, "Hard": 20 }
}
```

## Invariants
- `SECTION_COUNTS × MARKS = TOTAL_MARKS`
- `DIFFICULTY_DIST = 100%`
- Every slot must be `topicMapped`

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