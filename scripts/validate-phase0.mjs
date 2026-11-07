// Phase 0 structural validator. Plain Node, no dependencies.
// Exit 0 when structure passes (supply shortage is reported, not failed); exit 1 on any structural error.
// versionId canonicalisation is documented in ./phase0-version-id.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeVersionId } from "./phase0-version-id.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const errors = [];
const err = (m) => errors.push(m);

const curriculum = read("data/curriculum/cbse-2026-27-class11-physics.json");
const tplFile = read("data/templates/cbse-2026-27-phy-042-xi.templates.json");
const chapters = new Map(curriculum.chapters.map((c) => [c.chapterId, c]));
const tpl = Object.fromEntries(tplFile.templates.map((t) => [t.mode, t]));

const FIX = "generated/sample-fixtures/";
const fixtures = {
  full: { file: FIX + "class-11-physics-full-subject-candidate.json", template: "FULL_SUBJECT" },
  ch02: { file: FIX + "class-11-physics-chapter-2-candidate.json", template: "CHAPTER_FILTERED", chapterId: "cbse-2026-27-phy-042-xi-ch02" },
  siyavula: { file: FIX + "class-11-physics-siyavula-sourced-candidate.json" },
};

const seenIds = new Map();
const seenStems = new Map();
const norm = (s) => s.replace(/\s+/g, " ").trim().toLowerCase();
const tally = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
const sameCounts = (a, b) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] || 0) === (b[k] || 0));
};
let hashCount = 0;

for (const [key, fx] of Object.entries(fixtures)) {
  const data = read(fx.file);
  const items = data.items || data.questions || [];
  fx.items = items;
  for (const q of items) {
    const id = `${fx.file}:${q.stableId}`;
    if (q.schemaVersion !== "phase0-question-v1") err(`${id}: schemaVersion is not phase0-question-v1`);
    const c = q.curriculum || {};
    const ch = chapters.get(c.chapterId);
    if (!ch) err(`${id}: chapterId ${c.chapterId} not in curriculum`);
    else {
      if (ch.chapterNumber !== c.chapterNumber) err(`${id}: chapterNumber ${c.chapterNumber} != ${ch.chapterNumber}`);
      if (ch.chapterName !== c.chapterName) err(`${id}: chapterName "${c.chapterName}" != "${ch.chapterName}"`);
      if (ch.unitNumber !== c.unitNumber) err(`${id}: unitNumber ${c.unitNumber} != ${ch.unitNumber}`);
    }
    if (c.topicId !== null) err(`${id}: topicId must be null`);
    if (!Array.isArray(c.conceptIds) || c.conceptIds.length) err(`${id}: conceptIds must be []`);
    if (q.versionId !== computeVersionId(q)) err(`${id}: versionId does not recompute`);
    else hashCount++;
    if (q.review?.status !== "REVIEW_NEEDED" && q.review?.status !== "APPROVED") err(`${id}: unexpected review.status ${q.review?.status}`);
    if (q.type === "MCQ_SINGLE") {
      const opts = q.content?.options || {};
      const vals = Object.values(opts).map(norm);
      if (Object.keys(opts).length !== 4) err(`${id}: MCQ needs exactly 4 options`);
      if (new Set(vals).size !== vals.length) err(`${id}: MCQ options not distinct`);
      if (!(q.content?.answerKey in opts)) err(`${id}: answerKey ${q.content?.answerKey} not in options`);
    }
    if (seenIds.has(q.stableId)) err(`${id}: duplicate stableId (also in ${seenIds.get(q.stableId)})`);
    seenIds.set(q.stableId, fx.file);
    const stem = norm(q.content?.stem || "");
    if (seenStems.has(stem)) err(`${id}: duplicate stem (also ${seenStems.get(stem)})`);
    seenStems.set(stem, id);
    if (fx.template && q.provenance?.rightsStatus !== "CLEARED_UNDER_POLICY") err(`${id}: rights not cleared`);
    if (fx.template && !q.provenance?.rightsRecordId) err(`${id}: missing rightsRecordId`);
  }
}

function checkTemplate(fx) {
  const t = tpl[fx.template];
  const items = fx.items;
  const sec = t.sections[0];
  const tag = `${fx.file} vs ${fx.template}`;
  if (items.length !== t.totalQuestions) err(`${tag}: count ${items.length} != ${t.totalQuestions}`);
  if (items.some((q) => q.type !== sec.type || q.marks !== sec.marksEach)) err(`${tag}: type/marks mismatch`);
  const marks = items.reduce((s, q) => s + q.marks, 0);
  if (marks !== t.totalMarks) err(`${tag}: marks ${marks} != ${t.totalMarks}`);
  if (!sameCounts(tally(items, (q) => q.difficulty), t.difficultyCounts)) err(`${tag}: difficulty counts mismatch`);
  const byCh = tally(items, (q) => q.curriculum.chapterId);
  const expected = t.chapterSlotCounts || { [fx.chapterId]: t.totalQuestions };
  if (!sameCounts(byCh, expected)) err(`${tag}: per-chapter counts mismatch ${JSON.stringify(byCh)}`);
}
checkTemplate(fixtures.full);
checkTemplate(fixtures.ch02);

const all = Object.values(fixtures).flatMap((f) => f.items);
console.log(`Checked ${all.length} items across ${Object.keys(fixtures).length} fixtures; ${hashCount} versionIds recompute.`);
if (errors.length) {
  console.error(`STRUCTURE FAIL: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("STRUCTURE PASS");

// Supply: only APPROVED, rights-cleared items of the right type/marks count.
const usable = all.filter(
  (q) => q.review?.status === "APPROVED" && q.provenance?.rightsStatus === "CLEARED_UNDER_POLICY",
);
for (const t of tplFile.templates) {
  const sec = t.sections[0];
  const pool = usable.filter((q) => q.type === sec.type && q.marks === sec.marksEach);
  const slots = t.chapterSlotCounts || { "cbse-2026-27-phy-042-xi-ch02": t.totalQuestions };
  const inScope = pool.filter((q) => q.curriculum.chapterId in slots);
  const short = Object.entries(slots).filter(
    ([ch, n]) => inScope.filter((q) => q.curriculum.chapterId === ch).length < n,
  ).length;
  // Aggregate difficulty check: enough in-scope approved items at each level.
  const diffShort = Object.entries(t.difficultyCounts || {}).filter(
    ([d, n]) => inScope.filter((q) => q.difficulty === d).length < n,
  ).map(([d]) => d);
  const feasible = inScope.length >= t.totalQuestions && short === 0 && diffShort.length === 0;
  const scope = t.chapterSlotCounts ? "" : " (checked for ch02)";
  console.log(
    `${t.mode}${scope}: eligible approved items ${inScope.length} for ${t.totalQuestions} slots; ` +
      `${short} chapter(s) short; difficulty short: ${diffShort.join(",") || "none"} -> ` +
      `${feasible ? "feasible" : "NOT yet feasible"}`,
  );
}
