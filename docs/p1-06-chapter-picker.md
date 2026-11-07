# Chapter Picker UI — Phase 1 Implementation (P1.06)

## Purpose
Provides an optional chapter/topic picker UI component that allows users to filter curriculum content by selecting specific chapters within a subject.

## Feature Overview

### Files Created/Modified

1. **`src/components/ChapterPicker.tsx`** (NEW)
   - Client component with TypeScript types
   - Displays chapters as checkboxes grouped by unit
   - Includes "Select All" / "Clear All" controls
   - Shows selection count: "X of Y chapters selected"
   - Handles disabled state when no curriculum is loaded

2. **`src/app/page.tsx`** (MODIFIED)
   - Added state: `selectedChapterIds`, `curriculumChapters`, `curriculumUnits`, `loading`
   - Integrates with `resolveCurriculum()` from curriculum-resolver
   - Clears chapter selection when class/subject changes
   - Displays scope in preview sidebar and selection note

3. **`tsconfig.json`** (MODIFIED)
   - Added `@/*` path alias for cleaner imports

4. **`src/app/globals.css`** (MODIFIED)
   - Added CSS styles for chapter picker component

## Component Interface

```typescript
interface ChapterPickerProps {
  chapters: Chapter[];
  selectedChapterIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  units?: Array<{ unitId: string; unitNumber: number; unitRoman: string; unitName: string }>;
}
```

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ User selects    │     │                 │     │ Curriculum API   │
│ class/subject   │────▶│ resolveCurriculum() │──▶│ Load chapters &  │
│                 │     │                 │     │ units from JSON  │
└─────────────────┘     └─────────────────┘     └──────────────────┘
                                                     │
                                                     ▼
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ Chapters &      │◀────│  state update   │◀────│ Extract data     │
│ Units loaded    │     │                 │     │                  │
└─────────────────┘     └─────────────────┘     └──────────────────┘
                                                     │
                                                     ▼
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ User selects    │     │                 │     │ Filter questions │
│ chapters        │────▶│  selectedIds    │────▶│ by chapter ID    │
│                 │     │  state          │     │                  │
└─────────────────┘     └─────────────────┘     └──────────────────┘
```

## UI Behavior

### Empty Selection State
- When no chapters are selected: "Full subject" displayed in sidebar
- Chapter picker shows all chapters with checkboxes unchecked

### Single Chapter Selection
- Sidebar shows: "Chapter 2: Electrostatics"
- Preview title reflects the scope

### Multiple Chapter Selection (1-3 chapters)
- Sidebar shows: "Chapter 2: Electrostatics, Chapter 3: Current Electricity"
- Comma-separated list format

### Multiple Chapter Selection (4+ chapters)
- Sidebar shows: "4 chapters selected"
- Count-based summary

### Clearing Selection
- "Clear All" button resets to full subject
- Changing class/subject also clears chapter selection

## Styling

The component follows existing UI patterns:
- Tailwind CSS classes
- Dark mode support via `dark:text-gray-400`
- Uses existing `text-button` class for action buttons
- Responsive grid layout

## Unit Grouping

Chapters are grouped by unit with:
- Roman numeral header (e.g., "I.", "II.", "III.")
- Unit name (e.g., "Physical World and Measurement")
- Chapters listed with checkboxes under each unit

## State Management

| State Variable | Type | Purpose |
|---------------|------|---------|
| `selectedClass` | `string` | Current class selection |
| `selectedSubject` | `string` | Current subject selection |
| `selectedChapterIds` | `string[]` | Array of selected chapter IDs |
| `curriculumChapters` | `Chapter[]` | Chapters from resolved curriculum |
| `curriculumUnits` | `UnitInfo[]` | Units from resolved curriculum |
| `loading` | `boolean` | Async loading state |

## Error Handling

- Invalid class/subject combinations: `resolveCurriculum()` throws `UnsupportedCurriculumError`
- Missing curriculum file: `resolveCurriculum()` throws `CurriculumFileNotFoundError`
- UI gracefully handles errors by clearing chapter list

## Performance Considerations

- Curriculum data is loaded once per class/subject change
- Unit names derived from hard-coded mapping to avoid additional lookups
- Chapters sorted by unit number for consistent display order

## Future Enhancements

- Add support for topic-level filtering (beyond Chapter granularity)
- Persist chapter selections in URL parameters for shareable links
- Add keyboard navigation for accessibility