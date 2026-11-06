# Niera Question Paper Generation — Standalone Product & Development Roadmap

**Status:** Standalone product specification and implementation roadmap, v2.0  
**Research date:** 7 November 2026  
**Audience:** Product owner, 2–3 developer team, QA reviewers, and AI coding agents  
**Scope:** Question paper creation ONLY: single-subject papers from **Class + Subject**, with optional chapter/topic filters; paper preview, edits, answer keys, solutions and print/export. No student submissions, assessment-taking, scoring, or response evaluation.  
**Important:** **No technology stack is specified in this document.** Implementation tools and frameworks are intentionally excluded.

## 0. Read this first: what is decided and what is not

**Decided**
- **Class and subject are the primary student inputs.** A paper must be possible without choosing a chapter.
- **Chapter/topic selection is secondary and optional.** Empty means eligible full-subject coverage, not “no content.”
- The paper must be stored as **structured question-paper data** so it remains editable, versioned, and exportable. A PDF alone is not the source of truth.
- Generation must follow an explicit **paper blueprint**. Do not ask a model to produce an entire paper in one unconstrained prompt.
- Prefer verified/reusable questions when available; generate new questions as needed, and validate before publication.
- Student-facing flows must be simple. Advanced controls appear only on demand.
- This is an **independent product/module**. Answer keys, question marks and solutions are generated as paper artifacts; this project does not evaluate student responses or depend on a separate evaluation product.
- **Question and answer accuracy outrank speed or visual polish.** Uncertain questions are not silently published.

**To verify against Niera's product data:** Which class ranges, boards/curricula, subjects, assessment patterns and source-question licenses are actually available. No specific coverage is claimed in this roadmap. The product must not offer an unsupported class/subject combination.

**Not yet independently proven:** Competitor claims of question accuracy and generation speed. The public-source review is complete; full comparative hands-on generation behind logins/paywalls has *not* been completed. Do not invent benchmark scores.

---

## 1. Product goal, user and success definition

### 1.1 User problem

A student wants useful practice without configuring an exam like a teacher. They should be able to choose **Class → Subject → Generate Paper**. If they want targeted revision, they can optionally select chapters/topics and customize the paper.

### 1.2 Primary users and needs

| User | Goal | Required experience |
|---|---|---|
| Student | Create a practice question paper | Minimal setup, accurate questions, clear preview, downloadable paper |
| Student targeting weaknesses | Revise selected concepts | Optional chapters/topics, understandable scope, focused paper |
| Teacher / internal content reviewer | Verify or adjust papers | Preview, replace/edit, validate answers and approve publication |
| Content administrator | Maintain permitted reusable questions and syllabus coverage | Structured items, provenance, review status, controlled publishing |

The main interface is student-first; reviewer/admin tools can be separate.

### 1.3 Release success criteria

1. A supported class/subject produces a valid **single-subject** paper without requiring chapter selection.
2. Optional chapter/topic selection confines the paper to those chosen areas.
3. Every published question has a stable ID, type, options if relevant, accepted answer(s), marks, mapped curriculum identifiers and review status.
4. The blueprint's counts, total marks, coverage and section structure match the actual paper.
5. Students can preview, save and download a question paper; answer keys and worked solutions are separate artifacts.
6. A finalized paper is reproducible from its saved version: question order, options, key, solutions and blueprint remain in sync.
7. Unverified, ambiguous or unsupported content must be held for review or replaced, **not shown as verified**.

---

## 2. Full student journey (source of truth for UX)

### Flow A — fastest possible paper (primary)

1. Student opens **Practice → Generate Question Paper**.
2. Student chooses **Class** (required). Only subjects actually supported for that class appear.
3. Student chooses **Subject** (required).
4. Screen displays a compact **default paper summary**: curriculum/pattern, question count, estimated time, difficulty mix and marks. The student must be able to see *what defaults will be used* without opening advanced settings.
5. Student selects **Generate paper**. Chapters/topics are **not required**.
6. System selects the eligible full-subject curriculum, creates a balanced blueprint, assembles/retrieves/generates questions, validates them and checks the final paper structure.
7. Student receives **Paper Preview** with question count, coverage summary, marks and time. If some requested coverage could not be satisfied, show an honest explanation and offer adjustment. Do not silently substitute unrelated chapters.
8. Student can **Save Paper**, **Download Paper**, **View Answer Key / Solutions** (as separately labelled artifacts), or **Customize / Regenerate**.
9. Every save or finalize action preserves the precise paper version. Editing after finalization creates a new version rather than silently changing an exported paper.
10. The student can generate another paper from the same subject or selected chapters; the system should minimize accidental repetition where sufficient valid questions exist.

### Flow B — topic/chapter-specific paper

1. Student selects Class and Subject.
2. Student opens optional **Choose chapters/topics**.
3. The UI lists chapters belonging to that class + subject + curriculum; expanding a chapter reveals its topics.
4. Student selects one or more chapters or topics. The summary states the exact selected scope.
5. Student generates the paper. Every question must be mapped to at least one selected scope identifier; no off-scope fallback is allowed without explicit consent.
6. If insufficient reviewed questions exist, offer **Generate additional validated questions**, **reduce count**, **broaden scope**, or **cancel**. Do not silently include a different chapter.
7. Continue through preview, revision and output as in Flow A.

### Flow C — advanced customization (optional)

After Class + Subject, the student may open **Customize paper** to modify: question count or total marks; difficulty (easy/medium/hard or balanced); duration; question types; curriculum/exam pattern (only compatible choices); chapter weightings; and optional instructions. Show how changes affect expected paper distribution before generation.

If a requested configuration is impossible (e.g., 30 four-mark questions but total requested marks 70), show a clear validation message and suggested fixes **before charging or launching generation**.

### Flow D — review and modify a generated paper

The preview supports, subject to permissions:
- View by section and question; show count, marks and mapped chapter/topic.
- **Replace one question** with an equivalent eligible candidate matching its blueprint slot.
- **Edit** wording/options where authorized; editing must invalidate the old answer validation until rechecked.
- **Regenerate only the selected question/section**, not the entire paper.
- **Shuffle question/order or options** only when answer-key mappings update correctly.
- **Save draft**, return later, or discard.
- Finalize/publish only after all quality checks pass.

### Flow E — an unsuccessful or interrupted generation

- Show a resumable generation state (preparing blueprint, finding questions, validating, assembling) without inventing a completion time.
- Keep the student's selections and any validated work if the operation fails.
- If quality requirements cannot be met, return **Needs changes / Needs review** with actionable options. Never label a partial set as a complete successful paper.
- On retry, do not create duplicate finalized papers or consume the same logical request twice without a clear policy.

---

## 3. Complete feature specification (behavior + acceptance)

Priority legend: **P0** = essential to the initial usable release; **P1** = needed for complete first-release workflow; **P2** = only after the core quality gates work. P2 is *not* a commitment to build everything immediately.

| ID | Priority | Feature | Exact functionality | Acceptance condition |
|---|---|---|---|---|
| F01 | P0 | Class selection | Required, show supported classes only | Cannot proceed with an unsupported/empty class |
| F02 | P0 | Subject selection | Required; list depends on selected class | Changing class clears invalid subject/topic selection |
| F03 | P0 | Curriculum/pattern default | Auto-select a valid documented default; show it in summary | No hidden unsupported assumption about board or exam pattern |
| F04 | P0 | Generate from whole subject | Empty chapter filter means eligible subject syllabus | Coverage allocated from eligible chapters, not random questions |
| F05 | P0 | Optional chapter/topic picker | Hierarchical browse, select/deselect, clear all | Questions outside selected scope are never silently used |
| F06 | P0 | Default blueprint | Auto-assign question counts, difficulty/coverage, marks/types | Blueprint is internally consistent and visible in summary |
| F07 | P0 | Blueprint validation | Validate feasible totals, sections and allocations | Bad configuration is rejected with correction guidance |
| F08 | P0 | Question bank | Retrieve reusable, versioned questions by metadata | Only permitted and eligible items are selected |
| F09 | P0 | Gap filling | Generate candidate items for unfilled blueprint slots | Candidate never bypasses validation/approval gate |
| F10 | P0 | Syllabus grounding | Ground selection/generation in supported curriculum and concept IDs | Each question has a valid topic/concept mapping |
| F11 | P0 | Objective question types | Single-correct MCQ, multiple-correct where permitted, numerical | Question data includes unambiguous accepted answer(s) and paper marks |
| F12 | P0 | Answer validation | Validate correct options/numerical values independently | Wrong or unresolved key cannot be published as verified |
| F13 | P0 | Duplicate prevention | Detect exact and near-duplicate stems/variants | Paper contains no accepted duplicates except intentional variants |
| F14 | P0 | Paper assembly | Sort questions into valid sections with marks/time/instructions | Section labels/counts/marks add up, stable question IDs |
| F15 | P0 | Paper preview | Readable questions, metadata and total paper overview | Student can review before taking/downloading |
| F16 | P0 | Structured paper record | Persist blueprint, paper version, questions and answer key | Paper remains editable and exportable without reparsing PDF |
| F17 | P1 | Question replacement | Replace specific question in same eligible blueprint slot | Totals, coverage and answer keys revalidated |
| F18 | P1 | Authorized editing | Edit question/options/solution under reviewer permissions | Edit creates new version and requires recheck |
| F19 | P1 | Save draft/history | Save paper configurations and editable draft versions | Student can reopen a prior draft; finalized versions immutable |
| F20 | P1 | Student paper-only view | Present question paper without revealing answers in the question section | Answer key/solutions appear only as explicitly selected separate artifacts |
| F21 | P1 | Download paper | Export readable print-ready paper | Math, tables, page numbers, sections and page breaks checked |
| F22 | P1 | Separate answer key/solutions | Generate keys and explanations tied to question version | No mismatch after edits, shuffle or replacements |
| F23 | P1 | Generation status/recovery | Resumable progress, retry and clear errors | No silent failure, duplicate publication or lost inputs |
| F24 | P1 | Coverage summary | Display selected/covered chapters and difficulty distribution | Summary corresponds to actual questions |
| F25 | P1 | Review/approval | Flag low-quality/ambiguous generated items for human review | Only approved or sufficiently verified items become publishable |
| F26 | P1 | Audit/provenance | Store question source, version, generation/review decisions | Every published answer can be traced |
| F27 | P1 | Paper archive and duplicate | List saved paper versions; duplicate a paper as an editable draft | Original finalized version is unchanged |
| F28 | P2 | Custom blueprint editor | Fine-grained chapter/type/marks allocations | Every edit is validated for feasibility |
| F29 | P2 | Saved presets | Let users reuse their preferred paper configuration | New paper starts from a saved preset without unexpected stale chapter settings |
| F30 | P2 | User-provided material | Optionally ground questions in authorized notes/textbooks | Sources and rights checked; no unlicensed bulk reuse |
| F31 | P2 | Multiple paper sets | Produce A/B variants from the same blueprint | Equivalent constraints and correct answer mapping |

**Scope rule:** Student-specific UX must remain minimal even when reviewer/admin workflows gain advanced controls. For a single-subject release, generating full three-subject JEE Main papers is **not implied** by merely supporting JEE-style single-subject patterns.

---

## 4. Functional behavior: what the generator must actually do

### 4.1 Curriculum resolver

Input: selected class, subject, default or chosen curriculum/exam pattern, optional topic filters.

Output: eligible chapters, topics, concepts, prerequisites if available, coverage weights, allowed question types and relevant paper templates.

Rules:
- Show only supported combinations. A subject name such as “Science” may map differently across classes/boards.
- Version curriculum relationships; changed syllabus must not silently alter an already published paper.
- If topics are selected, restrict candidates to the selected topic IDs. A question spanning multiple topics must be eligible under an explicit inclusion rule.
- For full-subject papers, use a documented coverage policy. It may weight chapter importance, instructional coverage and available bank quality, but must not present guesses as official exam weightage.

### 4.2 Paper blueprint builder

Before retrieving/generating questions, construct a machine-checkable blueprint with:
- Paper identity, class/subject/curriculum/version.
- Paper pattern, duration and total marks.
- Sections and question types.
- Number of questions and marks per question/section.
- Difficulty distribution and chapter/topic allocation.
- Required answer/solution information.
- Randomization/variation constraints.

**Invariants:** Every blueprint slot is accounted for; section counts equal actual counts; total marks equal the sum of question marks; every chosen chapter is eligible; question types fit the selected pattern. If impossible, return an informative error or ask for an explicit adjustment.

### 4.3 Retrieval-first question selection

For each blueprint slot, retrieve eligible bank items using filters for curriculum, concept, type, difficulty, marks, rights/provenance and validation status. Rank for fit, variety and freshness; suppress repeated questions within the paper and excessively repeated items across recent papers when possible.

Questions must not be selected solely because their surface text shares a keyword with the chapter. Require curriculum/concept alignment.

### 4.4 Controlled AI generation when bank supply is insufficient

Generate *candidates for specific uncovered blueprint slots*, not arbitrary papers. The generation request must specify curriculum/covered concepts, exact question type, difficulty target, marks, answer format, required solution and forbidden topics. Small batches are easier to validate and replace.

Generated questions start in **candidate/unverified** state. Source material and model output are not evidence that the answer is correct. Do not promise a guaranteed correct result from an AI model.

### 4.5 Quality validation pipeline

Use separate checks:

1. **Schema/structural:** Required fields, valid options, one correct key where required, no blank stem.
2. **Curriculum:** Correct class/subject/topic; not beyond configured scope.
3. **Answer correctness:** Check MCQ keys and numerical answers using an independent method appropriate to the domain; flag non-verifiable claims.
4. **Distractors:** No unintentionally correct extra option or duplicate choices in a single-correct item.
5. **Difficulty/clarity:** Check unambiguous wording and difficulty estimate; estimates remain approximate until calibrated on student performance.
6. **Similarity:** Detect exact duplicates and near-duplicate paraphrases.
7. **Mathematics/science display:** Correct symbols, formulas, units, diagrams/labels if any.
8. **Paper-level:** All blueprint allocations filled; totals and sections correct; no leaked answer key in student view.
9. **Review gate:** Hold/reject any unresolved candidate; allow reviewed replacements.

**Never use a single LLM self-confirmation as independent validation.** Use independent answer derivation, rule-based checks and/or qualified review for high-stakes questions.

### 4.6 Assembly, versioning and output

Create **one immutable finalized paper version** containing actual questions, option order, answer mapping, question marks, solutions and blueprint. Editing a finalized paper creates a new draft/version. The final paper may be:
- Displayed as a paper preview.
- Saved to a student paper library.
- Exported as a printable paper with **separate** answer key and solutions.

A print export must render equations and page boundaries legibly; do not print the answer key on the student paper by accident.

---

## 5. Essential data records (logical, not a database prescription)

| Record | Must contain | Why |
|---|---|---|
| Curriculum | Class, subject, curriculum version, chapters/topics/concepts | Reliable selection and scope |
| Blueprint | Sections, counts, types, marks, difficulty, coverage allocations | Explicit generation contract |
| Question | Stable ID, stem, options/answer type, key(s), solution, marks, concept IDs | Reusable, verifiable paper content |
| Question provenance | Source type, source reference/rights, reviewer, validation status, version | Audit and content quality |
| Paper draft | Request, blueprint, selected/generated items, edit history | Revision and recovery |
| Finalized paper | Immutable paper version, actual question/option order, answer key, solutions and marks | Consistent preview and exports |
| Generation job | Request ID, state, errors, retries, resource usage | Reliable operation |
| Saved paper reference | Owner, paper ID/version, title, created/updated timestamps | Reopen and manage generated papers |

**Critical distinction:** A paper's *question display number* is not its stable question identifier. If options or order are shuffled, remap the answer key accordingly. Numerical questions must have independently verified expected answers and clear formatting rules.

---

## 6. UX detail and edge cases developers must implement

| Situation | Required behavior |
|---|---|
| Class selected but no subject | Disable generation; prompt to choose subject |
| Class changed | Clear incompatible subject/chapter settings and explain reset |
| No chapter selected | Generate from entire eligible subject; do not treat as empty paper |
| Selected chapters too narrow | Offer count reduction, scope expansion or reviewed generation; no silent off-topic addition |
| No suitable verified bank question | Generate candidate and validate, or report insufficient supply |
| Generated answer cannot be verified | Hold/reject the question; never silently publish |
| Model returns fewer questions than requested | Fill gaps through verified selection/generation; block incomplete publication |
| Duplicate questions | Replace them before finalization |
| User requests impossible marks/count | Reject and suggest a feasible configuration |
| Student edits one question | Revalidate its key, marks and topic mapping; keep other questions intact |
| Student replaces a numerical with MCQ | Allow only if blueprint slot is adjusted and revalidated |
| User chooses JEE pattern incompatible with class/subject | Explain mismatch; offer valid patterns |
| Source question has unclear usage rights | Do not copy into distributable paper until rights are resolved |
| Download formatting drops symbols | Flag export validation failure; do not release corrupted paper |
| Generation timed out or user returns later | Preserve request/job state; permit a safe retry |
| Finalized paper is edited | Create a new paper version; preserve the prior export and key exactly |
| Student wants another paper | Generate a new version/request; reduce accidental repetition where supported |

---

## 7. Competitors — direct links and lessons

**Evidence labels:** **Owner observation** = the product owner's own prior exploration in this conversation. **Publicly documented** = page/README reviewed. **Unverified** = internal workings or output accuracy not independently measured. Pricing/feature availability can change; check directly before any build-vs-buy decision.

### 7.1 Original seven researched by the product owner

| Competitor / link | Supported observation or public feature | Niera lesson | Evidence limit |
|---|---|---|---|
| [CreateQuestionPaper](https://createquestionpaper.in/tool.html) | Easy flow (owner); public form has class, subject, topic, marks, difficulty, edits, key, Word/PDF | Strong **minimal input + expandable controls** reference | Paid/login restrictions; full generated-paper accuracy not tested |
| [Examin8](https://examin8.com/) | AI assisted interaction blocked by free plan (owner); site documents class/subject → blueprint → question selection → PDF | Study **bank-first selection and reusable preset blueprints** | Large-bank and accuracy claims vendor-reported |
| [Eklavvya](https://www.eklavvya.com/question-paper-generation/) | Free text-to-blueprint experience (owner); public docs describe AI, bank, blueprint and review roles | Study **explicit blueprint + review workflow** | Enterprise capabilities not hands-on verified |
| [Paperly](https://paperly.letsmakeit.in/dashboard) | Manual paper building (owner) | Study **editing and layout**, not generation accuracy | Dashboard requires access; public workflow incomplete |
| [TestVerse](https://testverse.co.in/) | Generated questions, but confusing UX (owner); public positioning for coaching/JEE workflows | Study **JEE question mix and avoid cluttered navigation** | Custom generation quality not verified here |
| [SCS Learning](https://scslearning.io/question-paper-generator/books) | Book-first generation (owner) | Study **source-grounded optional book input** | Book-specific results unavailable for independent check |
| [Sarthaks AI](https://test.sarthaks.com/sarthaks-ai/generate/new) · [public generator](https://test.sarthaks.com/ai-test-generator) | Easy conversational selection leading into online test (owner); public page supports subject/full-syllabus/chapter tests | Study **guided input collection**; online testing is outside Niera scope | Public sample has inconsistent section labels; not a measured overall error rate |

### 7.2 Additional products worth benchmarking

| Competitor / link | Publicly documented focus | Niera lesson / caution |
|---|---|---|
| [QPForge](https://www.qpforge.com/) | Syllabus/past-paper upload, blueprint, AI generation, PDF/DOCX | Useful **source-grounded paper workflow**, but Niera must not require a document for ordinary class+subject generation |
| [Neuva AI](https://neuvaai.com/tools/question-paper-generator) | Board/class/subject controls, question editing, sets and key export | Study question-level edits and structural checks; quality claims unverified |
| [QPaperLabs](https://www.qpaperlabs.com/) | Board/class/subject curriculum selection, teacher approval and exports (vendor-described) | Investigate curriculum/review experience; site features need direct validation |
| [Roboden](https://www.roboden.in/teachers) | Four-step teacher paper builder; AI or own-question input (public form) | Study step ordering and presets; confirm current URL/features before reuse |
| [Examaker](https://www.examaker.com/) | Textbook-based question selection, paper patterns, swapping and editing (vendor-described) | Review bank reuse/repetition management; verify with actual outputs |
| [QuestionWell](https://questionwell.org/) | AI-assisted question creation and selection | Study editable candidate questions, not JEE accuracy claims |

**Concrete public sample quality warning:** On Sarthaks' public Class XII Physics sample, instructions say “four sections” but enumerate A, B, C and E. This supports an automatic **section-sequence check**. Search-extracted mathematical notation can also appear corrupted; verify actual rendered output before diagnosing a PDF defect.

### 7.3 What this evidence does *not* prove

- That any competitor's answer keys are consistently correct.
- That a vendor actually uses a particular internal model or retrieval algorithm unless it documents that architecture.
- That paid offerings fail or succeed in a standardized live benchmark.
- That website marketing counts equal independently audited question-bank size or accuracy.

A hands-on comparison should use identical inputs (Class 11 Physics full-subject 30 questions; Class 12 Mathematics Integrals 15 questions; JEE Main Physics 20 MCQs + 5 numerical questions where supported). Save outputs and review answers independently. Until then, score quality as **not tested**, not zero or five stars.

---

## 8. Open-source GitHub projects — pros, cons and reuse decisions

These are **verified repository URLs**, but repository README descriptions are author claims, not independent production certifications. Licenses listed below are based on visible repository descriptions and must be rechecked on the exact commit and dependencies before incorporating code.

| Project / GitHub link | What it offers (pros) | What it does **not** solve / cons | Niera reuse recommendation |
|---|---|---|---|
| [Exam-Gen](https://github.com/014-Jayal/Exam-Gen) | **MIT**; PDF knowledge-base input, retrieval-grounded generation, mark-category distribution, preview and paper/key PDF | Not demonstrated as class+subject auto-curriculum, JEE-key-verified, or paper-authoring product | **Study** retrieval and constrained generation; benchmark before code reuse |
| [OpenAssess](https://github.com/collinsherriff/openassess) | **MIT**; question bank, tagging/editing, quiz/worksheet assembly, answer key, import/export formats, local-first workflow | Not built around autonomous class+subject syllabus generation or independent JEE numerical validation | **High-value reference** for item-bank and editing/export UX |
| [Exameow](https://github.com/heshengtao/exameow) | **Apache-2.0**; generates from documents, multiple question types, filtering, batching, practice/online quiz, local-first | Not verified for NCERT/JEE syllabus fidelity; AI accuracy explicitly not guaranteed; different product architecture | **Study** document-to-question creation UX; don't adopt wholesale |
| [Exam Paper Generator](https://github.com/vidhiomar/Exam_Paper_Generator) | Extracts a blueprint from uploaded past papers, offers structural dashboard and section-wise generation | README lists export, OCR fallback and other production capabilities as future improvements; license not confirmed here | **Study** blueprint extraction concept, not a ready core dependency |
| [examgen](https://github.com/RigiResearch/examgen) | Structured question inputs, question/option randomization, outputs for paper and online exams | Not an AI/curriculum-based generator; does not guarantee academic correctness | **Study** structured paper assembly and export |
| [ExamForge](https://github.com/tp-4016/examforge) | **MIT**; document-grounded generation, varied question types including calculations | Small project; no demonstrated JEE review/validation guarantees; AI keys may still be wrong | **Prototype reference only**, independently test code |

**Open-source guardrails:** “Open-source” is not the same as “zero operational cost.” Verify license obligations, model/data licenses, dependencies, activity, tests, maintenance, security, user-data handling and actual example outputs before using any project. Do not copy proprietary questions or copyrighted textbook content without rights.

**Build vs. reuse guidance:** Reuse good design patterns (bank filtering, blueprint structure, editor behavior, export concepts); do not assume one public repository satisfies Niera's complete curriculum and question-quality requirements.

---

## 9. Quality benchmarking and release gates

### 9.1 Benchmark datasets

Build small, manually reviewed fixtures before implementation:
1. **Full subject:** Supported Class 11 Physics curriculum, 30 mixed-difficulty questions, verified chapter allocation.
2. **Chapter filtered:** Supported Class 12 Mathematics curriculum, Integrals, 15 moderate questions, every question mapped to selected chapter.
3. **JEE-style single subject:** JEE Main Physics pattern configuration, 20 single-correct MCQs + 5 numerical questions, with explicitly recorded marking rules; this is a **custom benchmark template**, not a claim about the current official full JEE paper structure.
4. **Edge cases:** impossible total marks, tiny topic scope, duplicate candidates, wrong keys, invalid symbols, missing solutions, interrupted generation.

### 9.2 Evaluation metrics (report actual measurements, not guesses)

| Metric | How to measure | Gate |
|---|---|---|
| Question/answer correctness | Independent answer derivation and expert review | **No known unresolved key errors in release fixtures** |
| Curriculum alignment | Reviewer confirms valid class/subject/chapter/concept IDs | **No known off-scope released questions** |
| Blueprint compliance | Automated count, marks, section and distribution checks | **100% of finalized release fixtures pass structural checks** |
| Duplicate rate | Exact + semantic similarity review | **No accepted intra-paper duplicates in fixtures** |
| Export integrity | Visual check of math, tables, numbering and page layout | **All release samples readable; no answer key leakage** |
| Recovery reliability | Force timeout/retry and compare draft versions | **No silent data loss or double-publication in test fixtures** |
| Question/key consistency | Compare every exported question and option order to the exported key and solution | **All answers reference the intended final paper question** |
| Cost and latency | Measure per successful finalized paper | **Record actual results and set caps after testing** |

**Independent verification:** For numerical and quantitative science questions, verify the keyed answer independently of the generating model, and route unresolved questions to a qualified reviewer. Record reviewer decisions and reasons.

### 9.3 Competitor evaluation protocol (optional evidence enrichment, not a blocker to first prototype)

Use the three fixed benchmark prompts across the five most useful competitors: CreateQuestionPaper, Sarthaks, Eklavvya, TestVerse and QPForge/Neuva. For each save input settings, screenshots, generated paper, key, editing actions, time/credits and reviewer error count. Label gated tests **not tested**. Suggested assessment weights: correctness 30%, coverage 20%, ease 15%, blueprint 15%, editing/export 10%, reliability/cost 10%. Do **not** score untested products.

---

## 10. Sequential development roadmap — 2–3 developers

**Guiding rule:** Implement sequentially through shared contract and quality gates. After the core contract is stable, teammates may work on independently testable components in parallel.

### Phase 0 — Scope, curriculum inventory and acceptance fixtures

**Implement:** Identify supported class/subject/curriculum combinations; inspect existing Niera curriculum and question-bank content; define baseline paper patterns; collect consented/owned sample questions and benchmark fixtures. Record user journeys above as UX acceptance cases.

**Output:** Support matrix; curriculum coverage map; example full-subject and chapter-specific blueprint; sample correct questions/keys; open-decision list.

**Exit:** Product owner confirms supported selections and required source rights; no unsupported curriculum is advertised.

### Phase 1 — Primary student flow and shared contracts

**Implement:** Class selector, dependent subject selector, visible defaults, optional chapters/topics and optional customization; define logical records for curriculum, blueprint, question, draft and finalized paper. Create a mock-paper preview using **verified fixtures**, not live AI.

**Output:** Functional Class → Subject → Preview journey; machine-checkable contracts; invalid-input behaviors.

**Exit:** Every UX case in Flow A/B can be simulated; changing class resets invalid dependent selections; no topic selection generates full-subject scope.

### Phase 2 — Deterministic blueprint engine

**Implement:** Allocate questions by syllabus coverage, sections, marks and difficulty; enforce count and marks invariants. Build failure messages for impossible requests and insufficient coverage.

**Output:** Blueprint summaries and automated consistency tests.

**Exit:** All benchmark blueprints are feasible or rejected with accurate explanations; published blueprint sums are correct.

### Phase 3 — Question bank and selection

**Implement:** Import permitted questions with answer keys/solutions, stable IDs, curriculum/concept mappings and validation status; query by blueprint slot; rank/reduce duplicates; assemble from verified items where possible.

**Output:** Retrieval-only draft paper for at least one supported subject.

**Exit:** Verified-bank papers pass scope, duplication, marks and key checks; provenance is recorded.

### Phase 4 — Controlled AI gap generation + validation

**Implement:** Detect uncovered blueprint slots, generate small batches of candidates, normalize responses, validate correctness and scope independently, route failures to replacement/review. Add reviewer accept/reject/edit actions.

**Output:** Hybrid draft paper, validation log, rejected-question examples.

**Exit:** No generated question enters a finalized paper without passing the validation policy; unclear keys are held.

### Phase 5 — Preview, edit, outputs and versioning

**Implement:** Paper summary and question preview, one-question replacement, controlled editing, draft save/reopen, finalize version, print export, separate key/solutions and export checks.

**Output:** Finalized paper from full-subject and chapter-specific flows.

**Exit:** Replacement retains blueprint requirements; edits revalidate keys; published versions are immutable and output renders correctly.

### Phase 6 — Saved paper library and output verification

**Implement:** List/reopen saved drafts and finalized papers; duplicate prior papers into new drafts; ensure per-user access permissions; confirm preview, paper PDF, key and solutions use the same version. Add question-level and whole-paper export consistency checks.

**Output:** Generate → Preview/Edit → Save/Finalize → Download → Reopen/Duplicate flow.

**Exit:** All saved versions reopen identically; exports match their exact version; no cross-user access or answer-key mismatches.

### Phase 7 — Reliability, measurement and release

**Implement:** Job state and recovery, permissions, deduplication, error handling, data retention, logging, content-rights checks and end-to-end benchmark runs; polish accessible/mobile UX.

**Output:** QA evidence, known limitations, measured latency/cost, release checklist.

**Exit:** All critical quality gates in Section 9 pass; remaining unknowns or manual-review requirements are clearly disclosed.

### Suggested ownership

| Team member | Primary responsibility | Early pairing |
|---|---|---|
| Developer 1 | Student UX, paper preview/edit/output | Works with Dev 2 on blueprint contracts |
| Developer 2 | Curriculum, blueprint, question bank and assembly | Works with Dev 3 on question/answer validation |
| Developer 3 (if available) | AI candidate generation, validation, benchmarks and QA | Works with Dev 1 on question-level review UX |

With **two** developers, combine Dev 2 and Dev 3 responsibilities in smaller iterations. All developers review the same logical contracts before parallel work.

---

## 11. Guidance for AI coding agents and contributors

**Required reading:** This document and the existing Niera curriculum/question-content contracts, if present. This task is restricted to paper generation; do not modify other Niera subsystems.

Before each task:
1. Inspect the repository and current phase. Do not invent existing services, tables, methods or model performance.
2. State the smallest user-visible behavior being implemented and its acceptance tests.
3. Reuse Niera's existing curriculum IDs and question IDs where available; do not assume a separate evaluation module is in scope.
4. Keep curriculum resolution, question selection/generation, validation, assembly and export responsibilities separate.
5. Preserve the primary UX: **Class + Subject are sufficient.** Do not force optional questions before generation.
6. Prefer deterministic checks for marks, counts, permissions, allowed scope and version integrity.
7. Do not claim LLM-generated answers are correct because another prompt agrees.
8. Do not add external-source questions without recording reuse rights and provenance.
9. Keep the student-facing question paper separate from the explicitly requested answer-key and solutions files.
10. Add tests for success, invalid scope, impossible blueprint, wrong answer, duplicate, failed export, edit/replacement, save/reopen and retry.
11. Report changed behavior, test outcomes, unresolved issues and any deviation from this roadmap.
12. Do not advance to the next phase while the current exit checks are failing without explicit product-owner approval.

**Do not** prescribe or switch technology frameworks from this roadmap; the technology stack is intentionally excluded.

---

## 12. Decisions the product owner must resolve before Phase 1

The document is deliberately explicit where product rules have not yet been supplied:

1. **Initial supported class range** (for example, selected grades rather than promising every grade).
2. **Curriculum/board defaults** for each class; class + subject alone can be ambiguous, so show the chosen default.
3. **Initial subjects** and which ones have enough verified content.
4. **Default paper blueprint** per subject/class: count, marks, time, difficulty and types.
5. **Whether students may see/edit individual questions** or only request replacements; reviewers need controlled edit privileges regardless.
6. **Which output formats are mandatory at launch** (minimum: paper preview and downloadable paper; separately available key/solutions).
7. **Review policy** for AI-generated questions and accepted quantitative verification.
8. **Rights/licenses** for any existing textbook, PYQ and question-bank materials.
9. **Whether paper archives and saved presets are required at launch**, and the default retention policy.

**First assignment for the 2–3 person team:** Complete Phase 0's support matrix and two validated paper blueprints, then implement Phase 1's Class → Subject → Generate-preview flow using verified fixtures. Do **not** start model training or full-paper prompt generation first.

---

## 13. Source directory and verification notes

### Commercial/product sources

- CreateQuestionPaper: https://createquestionpaper.in/tool.html
- Examin8: https://examin8.com/
- Eklavvya: https://www.eklavvya.com/question-paper-generation/
- Paperly: https://paperly.letsmakeit.in/dashboard
- TestVerse: https://testverse.co.in/
- SCS Learning: https://scslearning.io/question-paper-generator/books
- Sarthaks: https://test.sarthaks.com/sarthaks-ai/generate/new ; https://test.sarthaks.com/ai-test-generator
- QPForge: https://www.qpforge.com/
- Neuva AI: https://neuvaai.com/tools/question-paper-generator
- QPaperLabs: https://www.qpaperlabs.com/
- Roboden: https://www.roboden.in/teachers
- Examaker: https://www.examaker.com/
- QuestionWell: https://questionwell.org/

### Open-source repositories

- https://github.com/014-Jayal/Exam-Gen
- https://github.com/collinsherriff/openassess
- https://github.com/heshengtao/exameow
- https://github.com/vidhiomar/Exam_Paper_Generator
- https://github.com/RigiResearch/examgen
- https://github.com/tp-4016/examforge

### Research integrity

Public site descriptions, repository READMEs and the product owner's hands-on notes are identified separately above. Several protected dashboard pages could not be exercised by public web access. No standardized login-gated competitor benchmark was completed; no accuracy or cost/latency scores are fabricated. The open-source projects were inspected for published capability descriptions, not security-audited or adopted. Reconfirm site URLs, licensing and current features at implementation time.

---

**Final product principle:** **Two required choices, one reliable paper.** Class + Subject → curriculum-aware blueprint → verified question selection / validated generation → editable preview → saved paper, printable paper, separate answer key and solutions.
