# HKS5 — Edge-Case Catalog for Niera QPG System

**Document Purpose:** A reference list of **high-probability, logically sound** edge cases and their mitigations.  
All cases below have been verified as **likely to occur** in a real-world academic question-paper generation workflow.

---

## 1. Mark Mismatch on Replacement (E1)

**Scenario**  
Student replaces a 1-mark MCQ with a 3-mark numerical question while keeping the same blueprint slot.

**Impact**  
Blueprint invariant breaks; total marks drift; section totals become inconsistent.

**Fix**  
- Block replacement if new question `marks` ≠ slot `marks`.  
- Require user to re-edit the blueprint first.

---

## 2. Multi-Disciplinary Question Duplication (E2)

**Scenario**  
A single question tagged to both “Work-Energy” and “Math Tools” topics gets selected for both filters simultaneously, printing twice.

**Impact**  
Paper feels repetitive; violates “no duplicate within paper” rule.

**Fix**  
- Enforce `primary_topic_id` for query filtering.  
- Secondary tags are advisory only (display metadata).

---

## 3. Curriculum Version Drift (E3)

**Scenario**  
Board publishes new syllabus version mid-session; user’s cached curriculum data is outdated.

**Impact**  
Questions become orphaned; validation flags them incorrectly.

**Fix**  
- Attach `curriculum_version_hash` to every question.  
- Re-validate before paper lock; prompt refresh if mismatch.

---

## 4. LaTeX Rendering Timeout (E5)

**Scenario**  
KaTeX takes >2 seconds to render a 100-term integral; PDF export stalls.

**Impact**  
User experience; potential crash.

**Fix**  
- Per-block `render_timeout: 2000ms`.  
- Fallback to cached SVG if available.

---

## 5. Unicode Language Glyphs Missing (E6)

**Scenario**  
Question in Hindi uses characters not supported by default PDF fonts; glyphs appear as boxes.

**Impact**  
Unreadable question; accessibility failure.

**Fix**  
- Embed Noto Sans (Devanagari, Tamil, Bengali) families in PDF bundle.  
- Add `language_code` field to question metadata.

---

## 6. Answer Key Not Recomputed After Shuffle (E8)

**Scenario**  
Student shuffles MCQ options; system forgets to update the answer-key mapping.

**Impact**  
Answer key points to wrong option.

**Fix**  
- Set `key_recomputed: true` mandatory flag whenever `shuffle: true`.  
- Validation pipeline aborts if flag missing.

---

## 7. Cross-Topic Semantic Duplication (E9)

**Scenario**  
Two different topics use near-identical wording; semantic similarity detector misses literal duplicates.

**Impact**  
Intra-paper duplication despite different topic tags.

**Fix**  
- Use MinHash LSH for fast approximate similarity.  
- Reject any pair with similarity > 0.85.

---

## 8. Partial Database Failure (E10)

**Scenario**  
Question bank DB times out during retrieval; paper generation halts midway.

**Impact**  
Incomplete paper; 500 error to user.

**Fix**  
- Circuit-breaker: return friendly error “Database temporarily unavailable.”  
- Allow user to retry after cooldown.

---

## 9. Timestamp Time-Zone Skew (E12)

**Scenario**  
User in IST (UTC+5:30) sees “Saved 2 hours ago” when the item was just saved.

**Impact**  
UX confusion; distrust in save functionality.

**Fix**  
- Store timestamps in UTC.  
- Localize display via frontend `Intl.DateTimeFormat(locale, { timeZone })`.

---

## 10. Nested Question Types (E13)

**Scenario**  
Match-The-Following embedded inside an MCQ (common in JEE-level papers).

**Impact**  
Flat schema fails; validation errors.

**Fix**  
- Schema extension: `subquestion_type: "match_the_following[]"` inside parent MCQ record.

---

## 11. Numerical Tolerance Edge (E14)

**Scenario**  
Expected answer 3.14, but key stores 3.141; auto-check rejects valid response.

**Impact**  
Frustrated student; support tickets.

**Fix**  
- Store `tolerance` field alongside key.  
- Validate: `Math.abs(key - student_answer) < tolerance`.

---

## 12. Wrong Type in Slot Expectation (E15)

**Scenario**  
Blueprint slot expects MCQ; gap generator emits numerical question.

**Impact**  
Slot remains unfilled; paper incomplete.

**Fix**  
- Slot schema validation before insertion: check `candidate.type === slot.type`.

---

## 13. Empty Section After Topic Filter (E17)

**Scenario**  
Student selects very niche topics; none have questions in the bank for that section.

**Impact**  
PDF prints an empty “Section C (5 marks)” with no questions.

**Fix**  
- Pre-flight: ensure every section has ≥1 candidate before allowing “Generate”.  
- If not, prompt scope broadening or count reduction.

---

## Summary Table

| # | Edge Code | Title | Fix |
|---|---|---|---|
| E1 | Mark Mismatch | Block replacement if marks differ |
| E2 | Multi-Disciplinary Duplication | Primary topic only for filtering |
| E3 | Curriculum Version Drift | Version hash check pre-locking |
| E5 | LaTeX Timeout | 2s timeout + SVG fallback |
| E6 | Unicode Glyphs | Embed Noto fonts per language |
| E8 | Key Not Recomputed | Mandatory `key_recomputed` flag |
| E9 | Semantic Duplicate | MinHash LSH, threshold 0.85 |
| E10 | DB Failure | Circuit-breaker + friendly error |
| E12 | TZ Skew | UTC + frontend localization |
| E13 | Nested Type | Extended schema for subquestions |
| E14 | Numerical Tolerance | Tolerance field in key storage |
| E15 | Wrong Type in Slot | Validate type before slot fill |
| E17 | Empty Section | Pre-flight count verification |

---

## Ready State

- All mitigations are coded or design-ready.  
- Edge cases documented for QA test plans in Phase 4+.  
- Each case maps to a test in `/tests/edge-cases.test.ts`.