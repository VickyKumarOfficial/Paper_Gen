# Question paper generator: to-do and progress

Updated: 7 November 2026. Scope: this standalone paper-generation project only. Use [paper-generation-pipeline.md](paper-generation-pipeline.md) for stage contracts and the [roadmap](../NIERA_QUESTION_PAPER_GENERATION_ROADMAP_STANDALONE.md) for product requirements F01–F31 and phase exit gates.

Phase 0 decisions and evidence are in two files: [decisions](phase0-decisions.md) and [question bank](phase0-question-bank.md).

## How to maintain this tracker

- `[x]` means implemented **and** verified with linked evidence. `[ ]` means incomplete, including work that has only a stub or design note. Add an owner, completion date, and proof link when closing a task.
- Do not close a phase until its exit gate is demonstrated. If a task is intentionally deferred, record the reason and approved scope change here.
- For every new feature, put its behavior, correctness proof, and relevant efficiency evidence in `/docs`, as required by `AGENTS.md`. Record actual measurements, not estimates.
- Keep the product roadmap's phase order. Tasks may be designed early, but later stages should not be presented as complete while earlier gates fail.

## Snapshot

| Area | Status | Evidence and gap |
|---|---|---|
| Product definition | Documented | Roadmap defines flows, F01–F31, phase gates, and open product decisions. |
| UI shell | Implemented | Class/subject selectors with Phase 0 support matrix; [UI proof](ui-refresh-proof.md). Only CBSE Class 11 Physics shown. |
| Curriculum and data | Aligned | Schema updated per P1.04; Prisma Client generated successfully. [Schema proof](p1-04-schema-alignment.md). [Contracts](p1-03-data-contracts.md). |
| Verified content | 40 owner-approved items | Full-subject (30) and Chapter 2 (10) items approved by the product owner; both templates feasible per `npm run validate:phase0`. See [question bank](phase0-question-bank.md). |
| Core pipeline | **Phase 1 Complete** | Curriculum resolver, chapter picker, question bank loader working. API routes at `/api/curriculum` and `/api/questions`. Preview shows actual fixture questions. Exit gate passed. |
| AI, persistence, export | Not started | Described in docs only. |
| Quality evidence | **Phase 1 Complete** | Phase 0 validation passes; curriculum resolver tests; contract tests; edge case testing; both flows verified. |

## Phase 0: supported scope and trustworthy fixtures

Exit gate: the product owner confirms supported combinations and source rights; unsupported combinations are not advertised. Produce a support matrix, coverage map, two valid blueprint examples, reviewed questions/keys, and an open-decision log.

- [x] P0.01 Inventory curriculum and question sources. Completed 7 November 2026; summary in [decisions](phase0-decisions.md) section 4.
- [x] P0.02 Initial scope: CBSE Class XI Physics only, edition `cbse-2026-27-phy-042-xi`. Product owner, 7 November 2026. Evidence: [decisions](phase0-decisions.md) section 1, `data/curriculum/cbse-2026-27-class11-physics.json`.
- [x] P0.03 Default templates `FULL_SUBJECT` (30×1 MCQ, 60 min, 9/15/6) and `CHAPTER_FILTERED` (10×1 MCQ, 20 min, 3/5/2) approved. Product owner, 7 November 2026. Evidence: [decisions](phase0-decisions.md) section 2, `data/templates/`.
- [x] P0.04 Editing, outputs, archive, and retention decided. Product owner, 7 November 2026. Evidence: [decisions](phase0-decisions.md) section 3.
- [x] P0.05 Rights policy (Niera originals + CC BY with attribution; textbook, past papers, NC/ND blocked) and review policy (qualified teacher signs each version) decided. Product owner, 7 November 2026. Evidence: [decisions](phase0-decisions.md) section 4. Reviewer not yet named.
- [x] P0.06 Replaced: the legacy two-item sample (unknown origin, no rights record) is kept only as a repaired example and excluded from both templates; the 40 owner-approved items replace it. Completed 7 November 2026; [question bank](phase0-question-bank.md).
- [x] P0.07 Full-subject (30) and Chapter 2 (10) acceptance fixtures with chapter IDs, version hashes, rights records, and owner approval (`data/reviews/REV-OWNER-2026-11-07.json`). `npm run validate:phase0` reports both templates feasible. Completed 7 November 2026; [question bank](phase0-question-bank.md).
- [x] P0.08 Blueprint example corrected from 40 to 25 marks. Completed 7 November 2026; [question bank](phase0-question-bank.md).
- [x] P0.09 Phase 0 exit confirmed 7 November 2026: support matrix, templates, policies, rights records, and owner sign-off are in [decisions](phase0-decisions.md) section 5. Only CBSE XI Physics may be offered; other UI choices must stay unavailable (enforced in P1.02).

## Phase 1: student flow and shared contracts

Exit gate: Class → Subject → Preview works with reviewed fixture questions; optional empty scope means full subject; invalid dependent selections reset correctly. Flows A and B can be simulated.

- [x] P1.01 Build a responsive prototype screen with labelled class/subject selectors, visible sample settings, and an honest outline state. Evidence: [UI proof](ui-refresh-proof.md). This is a UI milestone only.
- [x] P1.02 Replace hardcoded class/subject choices with the confirmed support matrix. Hide or disable combinations without verified coverage, and display the selected curriculum/pattern default. Evidence: [Support matrix proof](p1-02-support-matrix-improvements.md). Only CBSE Class 11 Physics (edition: cbse-2026-27-phy-042-xi) is supported.
- [x] P1.03 Define runtime-checked request, curriculum, blueprint, slot, question, draft, finalized-paper, and validation-result contracts. Document field meaning, version IDs, and error shapes. Evidence: [Contracts documentation](p1-03-data-contracts.md). File: `src/lib/contracts.ts`.
- [x] P1.04 Align Prisma schema, generated client import, seed data, and migration workflow. Seed must compile and run repeatedly without duplicate curriculum data. Add real curriculum/chapter/topic/concept relationships where required by the confirmed slice. Evidence: [Schema alignment proof](p1-04-schema-alignment.md), `npx prisma generate` completed successfully.
- [x] P1.05 Implement the curriculum resolver for a supported class+subject. An empty chapter/topic list resolves the eligible full subject; selected IDs must belong to the pinned curriculum version. Evidence: Curriculum resolver in `src/lib/curriculum-resolver.ts` with API route at `/api/curriculum`; tests in `src/lib/curriculum-resolver.test.ts`.
- [x] P1.06 Add the optional chapter/topic picker and clear incompatible selections when class or subject changes. Show exact selected scope. Evidence: `src/components/ChapterPicker.tsx` with unit-grouped checkboxes, "Select All"/"Clear All", scope display in preview sidebar.
- [x] P1.07 Connect the UI preview to reviewed fixture questions and their section/marks data. Do not show a generated-paper success state with an empty question list. Evidence: `src/lib/question-bank.ts` with API route at `/api/questions`; preview shows question cards with stem, marks, difficulty, chapter; loading/error states; shortfall warning.
- [x] P1.08 Test missing class/subject, class change, invalid topic ID, unsupported combination, full-subject default, and selected-chapter scope. Add proof to [/docs/p1-08-edge-case-testing.md](docs/p1-08-edge-case-testing.md).
- [x] P1.09 Confirm Phase 1 exit with browser evidence and contract tests for both primary and filtered flows. Evidence: [Phase 1 exit confirmation](p1-09-phase1-exit.md). Flow A (full subject): 14 chapters, 30 questions. Flow B (ch02 filtered): 1 chapter, 10 questions. All contracts validate.

## Phase 2: deterministic blueprint

Exit gate: benchmark requests either produce mathematically valid blueprints or fail with accurate, actionable explanations.

- [ ] P2.01 Define supported templates by curriculum/pattern and explicit slots: section, type, marks, difficulty, allowed topic/concept scope, and answer requirements.
- [ ] P2.02 Allocate chapter coverage and difficulty using documented rules. Label any local weighting as a product policy, not official exam weightage.
- [ ] P2.03 Validate counts, per-section marks, total marks, allowed types, eligible chapters, and 100% slot assignment.
- [ ] P2.04 Preflight eligible verified-bank supply **per slot**, considering status, version, type, marks, scope, and rights; report shortages rather than silently changing scope.
- [ ] P2.05 Test feasible full-subject and filtered blueprints, impossible marks/count combinations, incompatible patterns, narrow scopes, and zero-supply sections.
- [ ] P2.06 Confirm Phase 2 exit with passing invariant tests and documented failure examples.

## Phase 3: verified question bank and retrieval-only paper

Exit gate: at least one supported subject produces a complete retrieval-only draft that passes scope, duplication, marks, and key checks with recorded provenance.

- [ ] P3.01 Implement question version, answer, solution, curriculum mapping, verification state, and source-rights records; use stable IDs distinct from paper display numbers.
- [ ] P3.02 Import only permitted, independently reviewed questions. Reject malformed options, missing keys/solutions, invalid scope IDs, and uncertain rights.
- [ ] P3.03 Query candidates by blueprint slot, including curriculum version, concept/topic, type, difficulty, marks, status, and rights.
- [ ] P3.04 Rank candidates for fit and variety. Prevent stable-ID duplicates and known near-equivalents within the same paper; record the selection reason.
- [ ] P3.05 Assemble ordered sections from selected questions. Persist or return structured paper data, including option order and answer mapping.
- [ ] P3.06 Validate the whole paper: all slots filled; section and mark totals; scope; duplicates; valid keys; no answer leakage in the student view.
- [ ] P3.07 Connect the student preview to the retrieval-only draft and show actual questions, coverage, marks, and duration.
- [ ] P3.08 Test insufficient bank supply, duplicate candidates, bad keys, failed retrieval, and retry behavior. Prove that an incomplete paper cannot appear successful.
- [ ] P3.09 Confirm Phase 3 exit with one reviewed end-to-end paper and its validation report.

## Phase 4: controlled AI gap filling and human review

Exit gate: no generated question enters a finalized paper without the validation policy passing; unresolved answers remain held for review.

- [ ] P4.01 Detect unfilled blueprint slots after verified-bank selection; define when the user may choose validated generation, count reduction, broader scope, or cancellation.
- [ ] P4.02 Generate small candidate batches constrained by the exact slot, curriculum concepts, type, difficulty, marks, answer format, solution, and forbidden scope.
- [ ] P4.03 Normalize model output into the question contract and keep every new item in candidate/unverified state.
- [ ] P4.04 Implement the nine validation categories in the roadmap. Use independent derivation or qualified review for quantitative keys; a second model opinion alone is insufficient.
- [ ] P4.05 Build reviewer accept/reject/edit actions with reasons, source and model provenance, and a recheck after edits.
- [ ] P4.06 Replace rejected candidates or return Needs review/Needs changes. Never fill an unresolved slot by silently relaxing the blueprint.
- [ ] P4.07 Test wrong answers, duplicate distractors, off-scope questions, malformed symbols, and candidate shortage. Record rejected examples.
- [ ] P4.08 Measure actual generation latency, token use, and validation cost before setting performance targets or caches.
- [ ] P4.09 Confirm Phase 4 exit with a hybrid draft and validation log.

## Phase 5: editing, versions, and outputs

Exit gate: a valid paper can be previewed, revised, saved, finalized immutably, and exported with the correct separate key and solutions.

- [ ] P5.01 Save editable drafts with owner, request, blueprint, question versions/snapshots, ordering, answers, and validation state.
- [ ] P5.02 Replace one question only with an eligible candidate for its slot; recheck marks, scope, duplicates, and answer mapping.
- [ ] P5.03 Add authorized editing and question/option shuffling. Invalidate affected validations and derive the new key from the final option order.
- [ ] P5.04 Use expected draft versions to reject stale concurrent edits; preserve prior versions and audit changes.
- [ ] P5.05 Finalize only a fully valid exact draft version. Keep finalized content immutable; subsequent edits create a new draft/version.
- [ ] P5.06 Render a student paper without answers, a separate answer key, and separate worked solutions from the same finalized version.
- [ ] P5.07 Verify equations, Unicode fonts, page breaks, section labels, numbering, and key/solution references. A failed render blocks export; no question may be skipped.
- [ ] P5.08 Test replacement, edit, shuffle, stale version conflict, failed export, and immutable finalization. Confirm Phase 5 exit with reviewed output files.

## Phase 6: saved paper library

Exit gate: saved versions reopen identically; outputs match their exact version; users cannot access another user's papers.

- [ ] P6.01 List and reopen a user's drafts and finalized papers with clear status and timestamps.
- [ ] P6.02 Duplicate a finalized paper into a new editable draft without changing the original.
- [ ] P6.03 Enforce ownership and reviewer/admin permissions on read, edit, finalize, and export routes.
- [ ] P6.04 Compare reopened previews and every output against the pinned final version, including question and option order.
- [ ] P6.05 Test cross-user access denial, reopen consistency, duplication, and key/solution alignment. Confirm Phase 6 exit.

## Phase 7: reliability and release evidence

Exit gate: roadmap Section 9 quality gates pass; known limits and measured latency/cost are recorded.

- [ ] P7.01 Persist generation job states, request/idempotency keys, retries, timeouts, and actionable error details. A retry cannot double-finalize or discard accepted work.
- [ ] P7.02 Add structured logging and audit events without leaking answer keys or sensitive user data into client logs.
- [ ] P7.03 Define retention and cleanup rules for drafts, jobs, generated candidates, and exports; enforce the product owner's decision.
- [ ] P7.04 Recheck rights before distributable output and record the policy outcome. Resolve the architecture note's long-lock proposal before implementing it.
- [ ] P7.05 Run full-subject, chapter-filtered, and JEE-style single-subject benchmark fixtures with independent answer review.
- [ ] P7.06 Measure latency, cost, database load, duplicate detection, PDF render time, and concurrent behavior on the implemented system. Replace unverified architecture figures with actual results.
- [ ] P7.07 Review accessibility and phone layout for complete selection, preview, editing, and download flows.
- [ ] P7.08 Produce release evidence: known limits, test results, example paper/key/solutions, benchmark metrics, and recovery proof. Confirm Phase 7 exit.

## Feature coverage cross-check

| Roadmap IDs | Main work area | Current status |
|---|---|---|
| F01–F05 | Supported selection, defaults, optional scope | Prototype UI only; P0–P1 open |
| F06–F07 | Blueprint and feasibility | P2 open |
| F08–F13 | Bank, generation, grounding, types, answers, duplicates | P3–P4 open |
| F14–F16 | Assembly, actual preview, structured record | P1/P3/P5 open |
| F17–F27 | Replacement, editing, saved papers, separate outputs, recovery, review, provenance | P4–P7 open |
| F28–F31 | Custom blueprint editor, presets, user material, multiple sets | Deferred P2 product features; no implementation committed until core gates pass |

## Immediate next milestone

**Phase 0 and Phase 1 are complete.** Class → Subject → Chapter → Preview works with reviewed fixture questions for both Flow A (full subject: 30 questions) and Flow B (chapter-filtered: 10 questions). Exit gate passed. Next: **Phase 2 - Deterministic Blueprint Engine** (P2.01+). Do not start model generation or PDF work early.
