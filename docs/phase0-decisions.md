# Phase 0 decisions, scope, and policies

Decided 7 November 2026 by the product owner. This file is the single record for P0.01–P0.05 and the Phase 0 exit gate. It replaces the earlier separate Phase 0 notes (support decisions, rights record, curriculum evidence, coverage map, blueprint candidates, source inventory, internet sources, question-record contract, review log); their history is in git.

Data that implements these decisions lives in `data/curriculum/`, `data/templates/`, and `generated/sample-fixtures/`. Run `npm run validate:phase0` to check it. Question-level evidence is in [phase0-question-bank.md](phase0-question-bank.md).

## 1. Supported scope (P0.02)

| Class and subject | Curriculum edition | Pattern | Available |
|---|---|---|---|
| CBSE Class XI Physics | `cbse-2026-27-phy-042-xi` — CBSE Academic [Physics 042 syllabus](https://cbseacademic.nic.in/web_material/CurriculumMain27/SecPart2/Physics_SecP2_2026-27.pdf), linked from the [2026–27 index](https://cbseacademic.nic.in/curriculum_2027.html), retrieved 2026-11-07 | Niera practice pattern (section 2) | **Approved scope.** Selectable only once reviewed supply fills a template (section 5). |
| Every other class, subject, board, or JEE pattern in the UI | — | — | No. Must stay hidden or disabled. |

Edition note: the PDF cover says "Class XI-XII (2025-26)" but its Class XI course-structure page says 2026–27, and CBSE lists it under 2026–27. We pin 2026–27.

The edition has 10 units and 14 chapters. Stable chapter IDs have the form `cbse-2026-27-phy-042-xi-chNN` and are defined in `data/curriculum/cbse-2026-27-class11-physics.json`. Topic and concept IDs below chapter level are not assigned yet; chapter is the finest scope for now.

Selection behaviour: Class + Subject picks the pinned edition and default template with no other required input. Empty chapter selection means full subject. A selected chapter must belong to the pinned edition. A shortage is reported with counts; off-scope or unreviewed content is never inserted.

The official 70-mark, 3-hour CBSE theory structure is not used as Niera's practice pattern or weighting.

## 2. Approved paper templates (P0.03)

Defined in `data/templates/cbse-2026-27-phy-042-xi.templates.json`. These are Niera practice templates, not CBSE exam patterns.

| Field | `FULL_SUBJECT` (default) | `CHAPTER_FILTERED` |
|---|---|---|
| Scope | All 14 chapters | One selected chapter |
| Section | A: 30 single-correct MCQs × 1 mark | A: 10 single-correct MCQs × 1 mark |
| Total | 30 questions, 30 marks | 10 questions, 10 marks |
| Duration | 60 minutes | 20 minutes |
| Difficulty | 9 easy / 15 medium / 6 hard | 3 easy / 5 medium / 2 hard |
| Chapter allocation | 3 slots each for Ch 2 and Ch 3; 2 for each other chapter (`3+3+12×2 = 30`) | All 10 from the chosen chapter |

Arithmetic: `30×1 = 30`, `9+15+6 = 30`; `10×1 = 10`, `3+5+2 = 10`. The chapter rule is an even-coverage policy with extra Kinematics slots, not official weightage. Changing a template means a new template version.

## 3. Workflow, outputs, and retention (P0.04)

| Topic | Decision |
|---|---|
| Student editing | Students preview and may request a same-slot replacement. They cannot edit stem, options, key, or solution. Only authorized reviewers can, and any edit creates a new question version that needs fresh review. |
| Outputs | In-app preview and a printable paper PDF. Answer key and worked solutions are separate, explicitly selected files from the same finalized version. Any render or key-mapping failure blocks export. |
| Archive and presets | Save drafts and immutable finalized versions; users can reopen and duplicate. Presets and blueprint editing are deferred. |
| Retention | Users can delete. Abandoned drafts and temporary generated candidates expire after 30 days, failed/retry jobs after 7 days, temporary export files after 24 hours. Exports are regenerated from retained finalized versions. Treatment of audit/provenance records and backups is decided when Phase 7 implements cleanup. |

## 4. Rights and review policy (P0.05)

**Rights.** Allowed sources:

1. Niera-original questions, including AI-drafted items written for Niera. Rights record `RR-NIERA-ORIGINAL-2026-11-07`.
2. Openly licensed sources whose terms allow commercial reuse and adaptation (CC BY 4.0), with attribution kept on the item and printed in outputs. The only source cleared so far is Siyavula's unbranded *Physical Sciences Grade 11* EPUB (SHA-256 `3d893a43…77a0f9`, CC BY 4.0 notice inside the asset). Rights record `RR-CCBY-SIYAVULA-2026-11-07`. Siyavula's branded PDF/EPUB is CC BY-ND and is not allowed.

Blocked: NCERT/CBSE textbook and exercise text, past board/JEE/NEET papers, scraped banks, NC or ND licences (for example UBC OPBP is CC BY-NC-SA), datasets with unclear origin (PhysicsEval), and user uploads. Public availability is not permission. Adjacent Niera material (`../niera_app` Class 10 Maths practice bank, `../llm_testing` eval sets) is out of scope for this generator; the eval set must stay out of any bank.

Each item records source, creator, licence, attribution, `rightsRecordId`, and `rightsStatus`. Rights are rechecked on import, selection, and export.

**Review.** Every item starts as `REVIEW_NEEDED`. It becomes eligible for papers only when a qualified Physics teacher signs off its exact `versionId`, checking: syllabus mapping, independently derived key (worked calculation; a second model opinion does not count), single correct option, distractor quality, solution, clarity, difficulty and marks, duplicates, and rights. Any edit creates a new version and needs another review. AI-generated items in later phases follow the same rule.

**Reviewer (updated 7 November 2026):** the product owner chose to act as reviewer in place of a separate qualified teacher, and approved all 40 template items on 7 November 2026. Record: `data/reviews/REV-OWNER-2026-11-07.json`. Adding an independent Physics teacher later is recommended before public launch.

Reviewer sign-off is recorded per version in `review` on the item: `status` (`APPROVED` / `REJECTED` / `REVISE`), `reviewer`, `reviewedAt`, `evidenceId`.

## 5. Phase 0 exit status (P0.09)

| Gate item | State |
|---|---|
| Support matrix | Done (section 1) |
| Templates with valid arithmetic | Done (section 2) |
| Workflow and retention decisions | Done (section 3) |
| Rights record and review policy | Done (section 4) |
| Pinned curriculum IDs and versioned fixtures | Done; see [question bank](phase0-question-bank.md) and `npm run validate:phase0` |
| Reviewer sign-off on fixture items | Done. Product owner approved 40/40 items (`data/reviews/REV-OWNER-2026-11-07.json`). Validator: `FULL_SUBJECT` 40 eligible for 30 slots, `CHAPTER_FILTERED` (ch02) 13 for 10; no chapter or difficulty shortfall; both feasible. |

**Phase 0 is closed (7 November 2026).** The legacy two-item sample and the three Siyavula items are not approved and are not used by either template.
