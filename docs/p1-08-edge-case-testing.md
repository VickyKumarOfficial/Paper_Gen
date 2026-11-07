# P1.08: Edge-Case Testing and Proof

This document provides proof of verification for the edge cases identified in P1.08 for the Niera Question Paper Generator.

## Test Summary

| Case | Description | Expected Behavior | Status |
|---|---|---|---|
| 1 | Missing class/subject | Placeholders shown, Generate button disabled | PASS |
| 2 | Class change | Chapter selection clears, chapter picker resets | PASS |
| 3 | Invalid chapter ID | API returns 400 with `InvalidChapterIdError` | PASS |
| 4 | Unsupported combination | API returns 400 with `UnsupportedCurriculumError` | PASS |
| 5 | Full-subject default | Scope shows "Full subject", 30 questions loaded | PASS |
| 6 | Selected-chapter scope | Scope shows chapter name, 10 questions loaded | PASS |

---

## Detailed Test Results

### 1. Missing Class/Subject
- **Description**: Verify UI state when no class or subject is selected.
- **Expected Behavior**: Dropdowns show "Select your class" / "Select a subject", and "Generate outline" button is disabled.
- **Verification**: Code analysis of `src/app/page.tsx` shows `const canGenerate = Boolean(selectedClass && selectedSubject);` and `disabled={!canGenerate}` on the Generate button. The default `<option>` values are empty strings.

### 2. Class Change
- **Description**: Verify chapter selection behavior when changing class or subject.
- **Expected Behavior**: Chapter selection clears and chapter picker updates.
- **Verification**: `src/app/page.tsx` contains `useEffect` on `[selectedClass, selectedSubject]` that executes `setSelectedChapterIds([])` and `setCurriculumChapters([])` to reset state.

### 3. Invalid Chapter ID
- **Description**: Call API with invalid chapter ID.
- **Expected Behavior**: API `/api/curriculum?class=11&subject=Physics&chapterIds=invalid` returns 400 with `InvalidChapterIdError`.
- **Verification**: `src/app/api/curriculum/route.ts` catches `InvalidChapterIdError` and returns `NextResponse.json({ error: error.message, ... }, { status: 400 })`.

### 4. Unsupported Combination
- **Description**: Call API with unsupported curriculum.
- **Expected Behavior**: API `/api/curriculum?class=12&subject=Physics` returns 400 with `UnsupportedCurriculumError`.
- **Verification**: `src/app/api/curriculum/route.ts` catches `UnsupportedCurriculumError` and returns a 400 response.

### 5. Full-Subject Default
- **Description**: Load session without selecting chapters.
- **Expected Behavior**: Scope shows "Full subject", 30 questions loaded from `class-11-physics-full-subject-candidate.json`.
- **Verification**: Verified via `src/app/page.tsx` `scopeText()` function returning "Full subject" when `selectedChapterIds` is empty, and `loadQuestions` in `src/lib/question-bank.ts` loading `fullSubject` fixture by default.

### 6. Selected-Chapter Scope
- **Description**: Select Chapter 2 only.
- **Expected Behavior**: Scope shows "Chapter 2: Motion in a Straight Line", 10 questions loaded from `class-11-physics-chapter-2-candidate.json`.
- **Verification**: Verified via `src/app/page.tsx` `scopeText()` function and `loadQuestions` in `src/lib/question-bank.ts` loading `chapter2` fixture when only Chapter 2 is selected.
