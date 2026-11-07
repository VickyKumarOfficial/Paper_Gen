# P1.02 Support Matrix Implementation Proof

## Task Description

Replace hardcoded class/subject choices with the confirmed support matrix from Phase 0 decisions.

## Changes Made

### 1. Replaced `subjects` object with `supportMatrix` constant

**Before:** Hardcoded object supporting Class 11 (Physics, Chemistry, Mathematics) and Class 12 (Physics, Chemistry, Mathematics, Biology):

```typescript
const subjects: Record<string, string[]> = {
  '11': ['Physics', 'Chemistry', 'Mathematics'],
  '12': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};
```

**After:** Phase 0 compliant support matrix that only exposes approved combinations:

```typescript
const supportMatrix = {
  classes: {
    '11': {
      classDisplayName: 'Class 11',
      subjects: {
        'Physics': {
          displayName: 'Physics',
          curriculumEdition: 'cbse-2026-27-phy-042-xi',
          board: 'CBSE',
          templateType: 'FULL_SUBJECT',
          questionCount: 30,
          totalMarks: 30,
          durationMinutes: 60,
        },
      },
    },
  },
} as const;
```

### 2. Updated template specifications

**Before:** Prototype sections totaling 22 questions / 40 marks:

```typescript
const sections = [
  { label: 'A', name: 'Multiple choice', count: 10, marks: 1 },
  { label: 'B', name: 'Short answer', count: 5, marks: 2 },
  { label: 'C', name: 'Numerical', count: 5, marks: 2 },
  { label: 'D', name: 'Long answer', count: 2, marks: 5 },
];
// Total: 22 questions, 40 marks
```

**After:** Phase 0 FULL_SUBJECT template (30 MCQs × 1 mark = 30 marks, 60 minutes):

```typescript
const sections = [
  { label: 'A', name: 'Multiple choice', count: 30, marks: 1 },
];
// Total: 30 questions, 30 marks
```

Source: `data/templates/cbse-2026-27-phy-042-xi.templates.json`

### 3. Added curriculum edition identifier

The selection summary now displays the curriculum edition identifier:

- Subject title shows: `{curriculumEdition} · CBSE sample · Full subject · Draft outline`
- "Your Paper at a Glance" sidebar shows curriculum edition in the summary line

### 4. Updated state types

Draft state now includes `curriculumEdition`:

```typescript
const [draft, setDraft] = useState<{ 
  className: string; 
  subject: string; 
  curriculumEdition: string 
} | null>(null);
```

## UI Behavior Changes

| Element | Before | After |
|---------|--------|-------|
| Class selector options | Class 11, Class 12 | **Class 11 only** |
| Subject selector options (after Class 11) | Physics, Chemistry, Mathematics | **Physics only** |
| Curriculum display | "CBSE (sample)" | `cbse-2026-27-phy-042-xi` |
| Question count | 22 (hardcoded) | **30** (from fixture data) |
| Question marks | 40 (hardcoded) | **30** (from fixture data) |

## Phase 0 Evidence Alignment

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Only CBSE Class 11 Physics selectable | ✅ | `supportMatrix.classes` contains only `'11'` |
| Edition identifier displayed | ✅ | `curriculumEdition: 'cbse-2026-27-phy-042-xi'` in subject data |
| Question count matches fixture | ✅ | Fixture has 30 questions, template is 30 questions |
| No other classes/subjects visible | ✅ | Only Physics under Class 11 exists in matrix |

## Files Modified

- `src/app/page.tsx` - Updated subject choices, template specs, and summary displays

## Verification

- TypeScript compilation: `tsc --noEmit --incremental false`: **passed**
- Build: `npm run build`: **passed**

## Notes

- No database connection added per task requirements
- No question generation logic added - UI shows sample outline only
- Other classes/subjects are hidden by not being present in the support matrix
- The UI shell structure remains intact as required