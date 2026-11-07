# Phase 0 question bank evidence

Updated 7 November 2026. Covers P0.06 and P0.07. Scope and policies are in [phase0-decisions.md](phase0-decisions.md). This replaces the earlier fixture proof, candidate proofs, assistant audits, and Siyavula extraction proof; their full history is in git.

The 40 items in the full-subject and Chapter 2 files were **approved by the product owner on 7 November 2026** (`data/reviews/REV-OWNER-2026-11-07.json`); their fixture `status` is `OWNER_APPROVED_2026-11-07`. The legacy and Siyavula items remain `REVIEW_NEEDED`. The item-check tables below are the assistant's independent derivations that the owner reviewed.

## Files

| File | Items | Used by | Rights record |
|---|---|---|---|
| `generated/sample-fixtures/class-11-physics-full-subject-candidate.json` | 30 MCQs, all 14 chapters | `FULL_SUBJECT` | `RR-NIERA-ORIGINAL-2026-11-07` |
| `generated/sample-fixtures/class-11-physics-chapter-2-candidate.json` | 10 MCQs, Chapter 2 | `CHAPTER_FILTERED` (ch02) | `RR-NIERA-ORIGINAL-2026-11-07` |
| `generated/sample-fixtures/class-11-physics-siyavula-sourced-candidate.json` | 3 (2 short answer, 1 MCQ), Ch 3–4 | Neither template; licensed-source pilot | `RR-CCBY-SIYAVULA-2026-11-07` |
| `generated/sample-fixtures/class-11-physics-mcq.json` | 2 (1 MCQ, 1 numerical), Ch 2 | Neither; legacy repaired sample | Not assigned (origin unknown) |

## Record shape

Each item is one JSON object (`schemaVersion: phase0-question-v1`) holding `stableId`, `versionId`, `curriculum` (board, year, class, subject code, unit/chapter number and name, `chapterId`, `topicId`, `conceptIds`), `type`, `difficulty`, `marks`, `language`, `content` (stem, options, answerKey, solution), `tags`, `provenance`, and `review`. It is stored as JSONB later, with indexed columns for search. `versionId` is `sha256:` of the canonical item content, computed by `scripts/validate-phase0.mjs`; any edit to content changes it and voids prior review.

## Validation

`npm run validate:phase0` checks curriculum IDs, version hashes, MCQ options and keys, unique IDs and stems, template fit (counts, marks, difficulty, per-chapter slots), rights status, and reports approved supply per template. Result on 7 November 2026, after owner approval:

```
Checked 43 items across 3 fixtures; 43 versionIds recompute.
STRUCTURE PASS
FULL_SUBJECT: eligible approved items 40 for 30 slots; 0 chapter(s) short; difficulty short: none -> feasible
CHAPTER_FILTERED (checked for ch02): eligible approved items 13 for 10 slots; 0 chapter(s) short; difficulty short: none -> feasible
```

Supply counts only approved, rights-cleared items of the right type and marks inside the template's chapters, and checks each chapter's slot count and each difficulty level.

Exit code 0: structure is valid, and the shortage is reported rather than treated as a failure. Tamper test: changing one option text ("4 m east" to "5 m east") made the validator report `versionId does not recompute` and exit 1.

## Full-subject candidate: item checks

Keys after the option reorder that fixed an A/B/C/D skew of 3/8/19/0 to 8/8/7/7. Items 005, 013, 017, 025, 029 need difficulty calibration; 025 and 027 use the same square-root scaling idea.

| ID suffix | Chapter and stated difficulty | Answer and option check | Wording, solution, mapping, and difficulty finding |
|---|---|---|---|
| 001 | Ch 1, easy | `2.40 × 3 = 7.20 m`, B; other options have different values or significant-figure counts. | Exact multiplier preserves three significant figures. Stem and explanation are clear; significant figures belong to Ch 1. Easy is plausible. |
| 002 | Ch 1, medium | `F/v²` has units `kg/m`, C; other options have different dimensions. | Dimensional-analysis tag and solution fit Ch 1. Medium is plausible. |
| 003 | Ch 2, easy | Round trip displacement is zero, so average velocity is `0 m/s`, B. | The total time is given and direction does not affect zero displacement. Ch 2 mapping and easy label are plausible. |
| 004 | Ch 2, medium | `dx/dt = 3 + 2t = 7 m/s` at 2 s, C. | Instantaneous-velocity tag and derivative in solution match the stem. Medium is plausible. |
| 005 | Ch 2, hard | From `u+a/2=4` and `3u+9a/2=18`, subtracting gives `3a=6`, hence `2 m/s²`, D. | Both observations and origin are defined. The solution is correct. Hard may be high for a two-equation uniform-acceleration item; reviewer should calibrate. |
| 006 | Ch 3, easy | Perpendicular `3,4` components give magnitude `5 m`, C. | Vector-components tag and Ch 3 mapping match. Easy is plausible. |
| 007 | Ch 3, medium | Flight time `2(20)/10=4 s`; range `10×4=40 m`, C. | Same launch and landing height, gravity, and air-resistance assumptions are explicit. Projectile tag and medium label fit. |
| 008 | Ch 3, hard | `R/H=4cotθ=4` gives `θ=45°`, D; other listed angles differ. | The angle domain removes a cotangent branch concern. Ch 3 projectile mapping fits. Hard is plausible. |
| 009 | Ch 4, easy | `F/m=6/2=3 m/s²`, A. | Net force and magnitude are explicit. Ch 4 and easy fit. |
| 010 | Ch 4, medium | `|0.20(-5-10)|=3 N·s`, D. | Rebound direction and impulse magnitude are explicit; the signed intermediate result is handled correctly. Medium fits. |
| 011 | Ch 5, easy | `W=Fs=5×4=20 J`, A. | Parallel direction is stated. Ch 5 and easy fit. |
| 012 | Ch 5, hard | Momentum gives final speed `2 m/s`; `K_i=18 J`, `K_f=6 J`, loss `12 J`, D. | Stick-together and frictionless assumptions make the inelastic-collision model clear. Hard is plausible. |
| 013 | Ch 6, medium | Centre of mass `(1×0+3×4)/4=3 m`, A. | Point-mass positions and x-axis are explicit. Ch 6 fits; medium may be high for this direct calculation. |
| 014 | Ch 6, hard | Solid disk `I=MR²/2=0.25 kg·m²`; `τ/I=4 rad/s²`, D. | Central perpendicular axis and net torque are specified. Ch 6 includes moments of inertia of simple objects. Hard is plausible if the disk formula is available to students. |
| 015 | Ch 7, easy | `g(2R)/g(R)=1/4`, A. | Distance is measured from Earth's centre and rotation is excluded. Inverse-square gravity and easy fit. |
| 016 | Ch 7, medium | Circular-orbit speed scales as `r^(-1/2)`, so at `4R` it is `v/2`, B. | Same planet and circular orbit are explicit. Ch 7 and medium fit. |
| 017 | Ch 8, easy | Stress `100/(2×10⁻⁴)=5×10⁵ Pa`, D. | Force and area are specified; Ch 8 tensile-stress tag fits. The exponent step may warrant medium after reviewer calibration. |
| 018 | Ch 8, medium | `FL/(AY)=100×2/(10⁻⁶×2×10¹¹)=10⁻³ m=1 mm`, A. | Elastic-limit condition and area are explicit. Solution and Ch 8 Young's modulus tag fit. |
| 019 | Ch 9, easy | Pressure transmission gives `20×10=200 N`, C. | Ideal lift and piston area ratio are explicit; Ch 9 covers Pascal's law. Easy fits. |
| 020 | Ch 9, medium | `ρ(v₂²-v₁²)/2=1000(16-4)/2=6000 Pa`, A. | Horizontal ideal pipe supplies the equal-height, lossless assumptions. Bernoulli tag and medium fit. |
| 021 | Ch 10, easy | `mcΔT=0.50×400×10=2000 J`, B. | No phase change or loss is stated. Specific-heat tag and easy fit. |
| 022 | Ch 10, medium | `αLΔT=10⁻⁵×2×50=10⁻³ m=1 mm`, C. | Approximate expansion is appropriate for the linear coefficient. Ch 10 fits; medium is plausible. |
| 023 | Ch 11, medium | `ΔU=Q-W=500-200=300 J`, D. | Work is explicitly done by the gas, fixing the sign convention. First-law tag and medium fit. |
| 024 | Ch 11, hard | Rectangular cycle area `(3-1)×10⁵ × (4-1)×10⁻³=600 J`, A. | Expansion at high pressure and compression at low pressure fix the positive work. The two constant-volume legs are stated. The route could be described more explicitly for a novice, but the answer is determined. Ch 11 fits. |
| 025 | Ch 12, medium | RMS speed scales as `√T`; `T→4T` gives factor `2`, C. | Same gas fixes molecular mass. Kinetic-theory tag fits. Medium may be high for direct scaling. |
| 026 | Ch 12, hard | Mean-square speed scales as `T`, so doubles; at fixed `P=nk_BT`, number density halves, B. | Absolute temperature and pressure are explicit. Ch 12 mapping and hard label fit the two linked relations. |
| 027 | Ch 13, medium | `T=2π√(m/k)` gives factor `2` when `m→4m`, B. | Ideal oscillator and fixed spring constant are explicit. Ch 13 fits. This uses the same square-root scaling move as item 025; reviewer should decide whether the pair is too repetitive. |
| 028 | Ch 13, medium | At `|x|=A/2`, potential fraction is `1/4`, hence kinetic fraction `3/4`, A. | Ideal SHM and total energy are clear. Ch 13 energy mapping and medium fit. |
| 029 | Ch 14, medium | `v=fλ=240×1.5=360 m/s`, B. | Progressive-wave tag and Ch 14 mapping fit. Medium may be high for direct multiplication. |
| 030 | Ch 14, medium | Fundamental `300/(2×0.75)=200 Hz`; third harmonic `600 Hz`, B. | Both-end fixed boundary condition is explicit. Standing-wave harmonics belong to Ch 14. Medium fits. |

## Chapter 2 candidate: item checks

Key spread 2/3/3/2. Items 004, 007, 008 all use constant acceleration; reviewer should judge the overlap.

| ID suffix | Key and independent derivation | Option and explanation check | Scope, difficulty, and remarks |
|---:|:---|:---|:---|
| 001 | **A.** Taking east as positive, displacement is `+6 − 2 = +4 m`, east. | A is `4 m east`; B reverses direction; C uses the `8 m` path length; D has both wrong magnitude and direction. The solution separates displacement from distance. | Position and displacement fit Chapter 2. `EASY` is reasonable. No ambiguity found. |
| 002 | **C.** For `x = 5 m + (2 m/s)t`, `dx/dt = 2 m/s`. | A `7`, B `5`, and D `0.4 m/s` differ from the coefficient of time; C is `2 m/s`. The explanation correctly treats `5 m` as intercept. | Position-time relation and uniform velocity fit. `EASY` is reasonable. The graph is specified algebraically, which is sufficient to determine its slope. |
| 003 | **B.** Total distance divided by time is `90/15 = 6 m/s`. | A `15`, C `75`, and D `1350 m/s` do not equal the quotient; B does. The solution uses distance rather than displacement. | Average speed fits. `EASY` is reasonable. “Without reversing” is harmless though not needed to compute average speed from a stated travel distance. |
| 004 | **D.** Uniform acceleration is `(8 − 2)/3 = 2 m/s²`. | A `10`, B `3`, and C `6 m/s²` differ from the velocity change per time; D matches. The explanation's graph-slope statement is physically correct. | Uniform acceleration fits. `MEDIUM` may be generous for a one-step calculation. Follow-up metadata now says “acceleration from velocity change over time,” matching the stated data. |
| 005 | **B.** `v = dx/dt = 6t − 2`; at `t = 2`, `v = 10 m/s`. | A `7`, C `12`, and D `14 m/s` differ from the derivative value; B matches. The solution differentiates and substitutes correctly. | Instantaneous velocity and elementary differentiation fit. `MEDIUM` is reasonable. The stem gives position in metres and time in seconds, so units are determined. |
| 006 | **C.** Signed displacement is `(+4)(3) + (−2)(2) = +8 m`. | A `+12 m` counts only the first leg; B `+16 m` is total distance; C is net displacement; D has the wrong sign. The explanation's signed-area calculation is correct. | One-dimensional displacement fits. `MEDIUM` is reasonable. Follow-up metadata now says “net displacement from piecewise constant velocities,” matching the stated intervals. |
| 007 | **A.** Starting from rest, `s = at²/2 = 2(4²)/2 = 16 m`. | A is `16 m`; B `8`, C `32`, and D `4 m` differ. Positive acceleration along the line makes travelled distance equal the positive displacement. The solution is correct. | Uniformly accelerated motion fits. `MEDIUM` may be generous for direct substitution; subject review should settle difficulty. |
| 008 | **D.** `2u + 2a = 10` and `4u + 8a = 30`. Subtracting twice the first gives `4a = 10`, hence `a = 2.5 m/s²`. | A `7.5`, B `1.25`, and C `5 m/s²` differ from the simultaneous-equation result; D matches. The recorded explanation uses the same valid elimination. | Uniform-acceleration relations fit. `MEDIUM` is reasonable. The stem does not assume rest; the solution correctly solves for the unknown initial velocity. |
| 009 | **B.** `v = 3(t−1)(t−3)`. Direction changes at `t = 1` and `3 s`; positions at `0,1,3,4 s` are `0,4,0,4 m`. Distance is `4+4+4 = 12 m`. | A `4 m` is net displacement; B `12 m` is total distance; C `8` and D `16 m` do not match the three segment lengths. The explanation identifies both turning points. | Non-uniform straight-line motion and differentiation fit. `HARD` is reasonable because both turning points must be found. No ambiguity found. |
| 010 | **C.** `x_A=t²`, `x_B=8−2t`; they meet at the nonnegative root `t=2 s`. Then `v_A=+4`, `v_B=−2 m/s`; relative speed is `|4−(−2)|=6 m/s`. | A `4 m/s` is A's speed, B `2 m/s` is B's speed, C `6 m/s` is the relative speed, and D `8 m/s` is the initial separation's numerical value with wrong units. The explanation excludes the negative-time root and is correct. | Frame of reference and uniformly accelerated straight-line motion fit. `HARD` is reasonable. “Immediately before they meet” gives the same limiting relative speed as at the meeting instant because both velocities are continuous. |

## Siyavula licensed pilot

Three text-only items copied from the CC BY 4.0 unbranded EPUB, matched to their source entries by ordinal and checked against the asset hash. One rocket item was dropped (stem depended on outside context; source solution confused weight and apparent weight). Marks, difficulty, and whether the vector MCQ belongs in Ch 3 or Ch 4 need a teacher's judgment.

## Legacy two-item sample

Repaired earlier: the MCQ now states start from rest, positive acceleration, and `0 < t₁ < t₂`; the numerical uses 2 m at 2 s and 4.5 m at 3 s, both giving `a = 1 m/s²` (the old key of 2 matched neither observation).

| MCQ option | Check |
|---|---|
| A: `2(s₂ - s₁)/(t₂² - t₁²)` | Correct by subtraction of the two displacement equations. |
| B: `(s₂ - s₁)/(t₂² - t₁²)` | Half the acceleration. |
| C: `2(s₂ - s₁)/(t₂ - t₁)` | Units are m/s, so this cannot represent acceleration. |
| D: `2(s₂ + s₁)/(t₂² - t₁²)` | Substitution gives `a(t₂² + t₁²)/(t₂² - t₁²)`, which differs from `a` for positive `t₁` and nonzero acceleration. |

The blueprint example in [blueprint-engine.md](blueprint-engine.md) was corrected from 40 to 25 marks (`10×1 + 5×3`).

## Reviewing new or edited items

For each item in the two template fixtures: check syllabus fit, re-derive the key, confirm one correct option and plausible distractors, check solution, wording, difficulty, and duplicates. Then set `review.status`, `reviewer`, `reviewedAt`, and `evidenceId` on that exact `versionId` and rerun the validator. Rejected or revised items need replacements or a new version.
