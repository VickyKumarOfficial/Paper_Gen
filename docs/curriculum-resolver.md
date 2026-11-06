# Curriculum Resolver — Phase 0 Design

## Purpose
Maps `Class → Subject → Chapters → Topics → Concepts` as per official syllabus.

## Input
- `class` (Int): e.g., 11, 12
- `board` (String): e.g., CBSE, ISC, ICSE
- `subject` (String): e.g., Physics, Mathematics

## Output
```json
{
  "eligibleChapters": ["Units 1-8"],
  "topics": ["Kinematics", "Newton's Laws", ...],
  "prerequisites": ["Basic Algebra"],
  "allowedQuestionTypes": ["MCQ_SINGLE", "NUMERICAL"],
  "defaultPattern": "CBSE_2015"
}
```

## Data Source
- CBSE NCERT syllabus for classes 11/12
- Updated via quarterly version hash

## Implementation Notes
- Table: `curriculum` (PK: id, UK: class+board+subject+version_hash)
- Chapters & Topics are child records; filtered via `LEFT JOIN`