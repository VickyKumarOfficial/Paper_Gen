/**
 * Niera Question Paper Generator - Phase 1 Contracts
 *
 * Runtime validation schemas and TypeScript types for:
 * - CurriculumRequest / CurriculumResponse
 * - Blueprint / BlueprintSection
 * - Slot
 * - Question
 * - Draft / FinalizedPaper
 * - PaperPreview
 * - ValidationResult
 *
 * Reference fixtures:
 * - class-11-physics-mcq.json
 * - class-11-physics-full-subject-candidate.json
 * - class-11-physics-chapter-2-candidate.json
 * - class-11-physics-siyavula-sourced-candidate.json
 */

import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

/** Question type identifiers */
export const QuestionTypeSchema = z.enum([
  "MCQ_SINGLE",
  "NUMERICAL",
  "MCQ_MULTIPLE",
  "ASSERT_REASON",
  "MATCH_THE_COLUMNS",
  "SHORT_ANSWER",
  "COMPARISON",
]);

export type QuestionType = z.infer<typeof QuestionTypeSchema>;

/** Difficulty levels */
export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export type Difficulty = z.infer<typeof DifficultySchema>;

/** Question status in review workflow */
export const QuestionStatusSchema = z.enum([
  "REVIEW_NEEDED",
  "APPROVED",
  "REJECTED",
  "REVISE",
]);

export type QuestionStatus = z.infer<typeof QuestionStatusSchema>;

/** Section type in a paper blueprint */
export const SectionTypeSchema = z.enum([
  "MCQ_SINGLE",
  "MCQ_MULTIPLE",
  "NUMERICAL",
  "SHORT_ANSWER",
  "ASSERT_REASON",
]);

export type SectionType = z.infer<typeof SectionTypeSchema>;

// ============================================================================
// CURRICULUM CONTRACTS
// ============================================================================

/** Request to fetch curriculum data */
export const CurriculumRequestSchema = z.object({
  /** Class level (e.g., 11 for Class XI) */
  class: z.number().int().min(1).max(12),
  /** Subject name (e.g., "Physics", "Mathematics") */
  subject: z.string().min(1),
  /** Optional filter: chapter IDs to fetch specific chapters */
  chapterIds: z.array(z.string()).optional(),
});

export type CurriculumRequest = z.infer<typeof CurriculumRequestSchema>;

/** Academic unit within a curriculum */
export const UnitSchema = z.object({
  unitId: z.string(),
  unitNumber: z.number().int(),
  unitRoman: z.string(),
  unitName: z.string(),
  chapterIds: z.array(z.string()),
});

export type Unit = z.infer<typeof UnitSchema>;

/** Chapter definition */
export const ChapterSchema = z.object({
  chapterId: z.string(),
  chapterNumber: z.number().int(),
  chapterName: z.string(),
  unitId: z.string(),
  unitNumber: z.number().int(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

/** Response with full curriculum data */
export const CurriculumResponseSchema = z.object({
  /** Schema version identifier */
  schemaVersion: z.string(),
  /** Edition identifier (e.g., "cbse-2026-27-phy-042-xi") */
  editionId: z.string(),
  /** Education board (e.g., "CBSE", "ICSE") */
  board: z.string(),
  /** Class level */
  class: z.number().int(),
  /** Subject name */
  subject: z.string(),
  /** Units in the curriculum */
  units: z.array(UnitSchema),
  /** Chapters in the curriculum */
  chapters: z.array(ChapterSchema),
});

export type CurriculumResponse = z.infer<typeof CurriculumResponseSchema>;

// ============================================================================
// BLUEPRINT CONTRACTS
// ============================================================================

/** Section definition in a paper blueprint */
export const BlueprintSectionSchema = z.object({
  /** Section label (e.g., "A", "B") */
  label: z.string(),
  /** Type of questions in this section */
  type: SectionTypeSchema,
  /** Number of questions in this section */
  count: z.number().int().positive(),
  /** Marks per question */
  marksEach: z.number().int().positive(),
});

export type BlueprintSection = z.infer<typeof BlueprintSectionSchema>;

/** Difference in difficulty counts */
export const DifficultyCountsSchema = z.object({
  EASY: z.number().int().nonnegative(),
  MEDIUM: z.number().int().nonnegative(),
  HARD: z.number().int().nonnegative(),
});

export type DifficultyCounts = z.infer<typeof DifficultyCountsSchema>;

/** Paper blueprint definition */
export const BlueprintSchema = z.object({
  /** Unique blueprint identifier */
  blueprintId: z.string().optional(),
  /** Sections in this blueprint */
  sections: z.array(BlueprintSectionSchema),
  /** Total marks for the paper */
  totalMarks: z.number().int().positive(),
  /** Duration in minutes */
  durationMinutes: z.number().int().positive(),
  /** Count of questions at each difficulty level */
  difficultyCounts: DifficultyCountsSchema,
});

export type Blueprint = z.infer<typeof BlueprintSchema>;

// ============================================================================
// SLOT CONTRACT
// ============================================================================

/** An empty slot to be filled with a question */
export const SlotSchema = z.object({
  /** Index of the section this slot belongs to */
  sectionIdx: z.number().int().nonnegative(),
  /** Type of question to place in this slot */
  questionType: QuestionTypeSchema,
  /** Marks for this slot */
  marks: z.number().int().positive(),
  /** Difficulty level for this slot */
  difficulty: DifficultySchema,
  /** Chapter this slot draws questions from */
  chapterId: z.string(),
});

export type Slot = z.infer<typeof SlotSchema>;

// ============================================================================
// PROVENANCE / REVIEW CONTRACTS
// ============================================================================

/** Provenance metadata for a question */
export const ProvenanceSchema = z.object({
  /** Source identifier */
  sourceLabel: z.string().optional(),
  /** Source title if available */
  sourceTitle: z.string().nullable(),
  /** Source URL if available */
  sourceUrl: z.string().nullable(),
  /** Source item identifier */
  sourceItemId: z.string().nullable(),
  /** Creator entity */
  creator: z.string(),
  /** Date authored */
  authoredAt: z.string().optional(),
  /** Origin type */
  originType: z.string().optional(),
  /** Extraction timestamp */
  extractedAt: z.string().nullable(),
  /** License information */
  licence: z.string().nullable(),
  /** Attribution text */
  attribution: z.string().nullable(),
  /** Rights record identifier */
  rightsRecordId: z.string(),
  /** Rights status */
  rightsStatus: z.enum(["CLEARED_UNDER_POLICY", "NEEDS_REVIEW", "RESTRICTED"]),
});

export type Provenance = z.infer<typeof ProvenanceSchema>;

/** Review record for a question */
export const ReviewSchema = z.object({
  /** Review status */
  status: QuestionStatusSchema,
  /** Reviewer name */
  reviewer: z.string().nullable(),
  /** Date reviewed */
  reviewedAt: z.string().nullable(),
  /** Evidence identifier */
  evidenceId: z.string().nullable(),
});

export type Review = z.infer<typeof ReviewSchema>;

// ============================================================================
// QUESTION CONTENT CONTRACTS
// ============================================================================

/** MCQ options (key-value pairs) */
export const MCQOptionsSchema = z.record(z.string()).refine(
  (opts) => Object.keys(opts).length >= 2 && Object.keys(opts).length <= 6,
  { message: "MCQ options must have between 2 and 6 choices" },
);

/** Numerical question answer with optional tolerance */
export const NumericalAnswerSchema = z.object({
  /** Correct numerical answer */
  answer: z.number(),
  /** Acceptable tolerance for comparison */
  tolerance: z.number().optional(),
});

/** Question content - can be MCQ, numerical, or other types */
export const QuestionContentSchema = z.object({
  /** Question stem / prompt */
  stem: z.string().min(1),
  /** MCQ options (key: letter, value: text) */
  options: z.record(z.string()).optional(),
  /** Answer key - string for MCQ, number for numerical */
  answerKey: z.union([z.string(), z.number()]),
  /** Solution / working steps (optional) */
  solution: z.string().optional(),
  /** Tolerance for numerical questions */
  tolerance: z.number().optional(),
});

export type QuestionContent = z.infer<typeof QuestionContentSchema>;

/** Curriculum reference within a question */
export const QuestionCurriculumSchema = z.object({
  /** Board identifier */
  board: z.string(),
  /** Academic year */
  academicYear: z.string(),
  /** Class level */
  class: z.number().int(),
  /** Subject name */
  subject: z.string(),
  /** Subject code */
  subjectCode: z.string(),
  /** Unit number */
  unitNumber: z.number().int(),
  /** Chapter number */
  chapterNumber: z.number().int(),
  /** Chapter name */
  chapterName: z.string(),
  /** Chapter identifier */
  chapterId: z.string(),
  /** Topic ID (null for chapter-level granularity) */
  topicId: z.string().nullable(),
  /** List of concept IDs */
  conceptIds: z.array(z.string()),
});

export type QuestionCurriculum = z.infer<typeof QuestionCurriculumSchema>;

// ============================================================================
// QUESTION CONTRACT
// ============================================================================

/** Complete question definition (full schema with content object) */
export const FullQuestionSchema = z.object({
  /** Schema version */
  schemaVersion: z.string().optional(),
  /** Stable identifier (permanent, used across versions) */
  stableId: z.string(),
  /** Version identifier (SHA-256 hash of content) */
  versionId: z.string().optional(),
  /** Curriculum reference */
  curriculum: QuestionCurriculumSchema,
  /** Question type */
  type: QuestionTypeSchema,
  /** Difficulty level */
  difficulty: DifficultySchema,
  /** Marks for this question */
  marks: z.number().int().positive(),
  /** Language code */
  language: z.string().optional(),
  /** Question content (stem, options, answer, solution) */
  content: QuestionContentSchema,
  /** Tags for categorization */
  tags: z.array(z.string()).optional(),
  /** Provenance metadata */
  provenance: ProvenanceSchema,
  /** Review record */
  review: ReviewSchema,
});

export type FullQuestion = z.infer<typeof FullQuestionSchema>;

/** Simplified question definition (flatter structure as in mcq.json) */
export const SimplifiedQuestionSchema = z.object({
  /** Schema version */
  schemaVersion: z.string().optional(),
  /** Stable identifier (permanent, used across versions) */
  stableId: z.string(),
  /** Version identifier (SHA-256 hash of content) */
  versionId: z.string().optional(),
  /** Question type */
  type: QuestionTypeSchema,
  /** Difficulty level */
  difficulty: DifficultySchema,
  /** Marks for this question */
  marks: z.number().int().positive(),
  /** Question stem */
  stem: z.string().min(1),
  /** MCQ options (key: letter, value: text) */
  options: z.record(z.string()).optional(),
  /** Answer key - string for MCQ, number for numerical */
  answerKey: z.union([z.string(), z.number()]),
  /** Solution / working steps */
  solution: z.string().optional(),
  /** Tolerance for numerical questions */
  tolerance: z.number().optional(),
  /** Topic ID (chapter-level granularity) */
  topicId: z.string().nullable().optional(),
  /** Chapter ID */
  chapterId: z.string(),
  /** Status in review workflow */
  status: QuestionStatusSchema.optional(),
  /** Tags for categorization */
  tags: z.array(z.string()).optional(),
  /** Language code */
  language: z.string().optional(),
  /** Provenance metadata */
  provenance: ProvenanceSchema.optional(),
  /** Review record */
  review: ReviewSchema.optional(),
  /** Curriculum reference (optional in simplified format) */
  curriculum: QuestionCurriculumSchema.optional(),
});

export type SimplifiedQuestion = z.infer<typeof SimplifiedQuestionSchema>;

/** Complete question definition - accepts both full and simplified formats */
export const QuestionSchema = z.union([FullQuestionSchema, SimplifiedQuestionSchema]);

export type Question = z.infer<typeof QuestionSchema>;

// ============================================================================
// SLOT MAPPING CONTRACT
// ============================================================================

/** Question assigned to a slot */
export const QuestionSlotSchema = z.object({
  /** Slot being filled */
  slot: SlotSchema,
  /** Question placed in the slot */
  question: QuestionSchema,
});

export type QuestionSlot = z.infer<typeof QuestionSlotSchema>;

// ============================================================================
// DRAFT CONTRACT
// ============================================================================

/** Draft paper in progress */
export const DraftSchema = z.object({
  /** Draft identifier */
  draftId: z.string().optional(),
  /** Original request that created this draft */
  request: CurriculumRequestSchema,
  /** Blueprint for this paper */
  blueprint: BlueprintSchema,
  /** Questions in the draft */
  questions: z.array(QuestionSchema),
  /** Creation timestamp */
  createdAt: z.string(),
  /** Last update timestamp */
  updatedAt: z.string(),
  /** Metadata for slot assignments */
  slotAssignments: z.record(z.string(), z.number().int()).optional(),
});

export type Draft = z.infer<typeof DraftSchema>;

// ============================================================================
// FINALIZED PAPER CONTRACT (immutable)
// ============================================================================

/** Finalized paper - immutable snapshot of a draft */
export const FinalizedPaperSchema = z.object({
  /** Finalized paper identifier */
  paperId: z.string(),
  /** Paper type identifier */
  type: z.literal("FINALIZED"),
  /** Original request */
  request: CurriculumRequestSchema,
  /** Blueprint used */
  blueprint: BlueprintSchema,
  /** Questions in the finalized paper */
  questions: z.array(QuestionSchema),
  /** Creation timestamp */
  createdAt: z.string(),
  /** Finalization timestamp */
  finalizedAt: z.string(),
  /** Hash of all question versions for integrity verification */
  integrityHash: z.string(),
});

export type FinalizedPaper = z.infer<typeof FinalizedPaperSchema>;

// ============================================================================
// PAPER PREVIEW CONTRACT
// ============================================================================

/** Paper preview for display */
export const PaperPreviewSchema = z.object({
  /** Class level */
  class: z.number().int(),
  /** Subject name */
  subject: z.string(),
  /** Paper title */
  title: z.string(),
  /** Questions in preview */
  questions: z.array(QuestionSchema),
  /** Section information */
  sections: z.array(BlueprintSectionSchema),
  /** Total marks */
  totalMarks: z.number().int(),
  /** Duration in minutes */
  durationMinutes: z.number().int(),
});

export type PaperPreview = z.infer<typeof PaperPreviewSchema>;

// ============================================================================
// VALIDATION RESULT CONTRACT
// ============================================================================

/** Result of schema validation */
export const ValidationResultSchema = z.object({
  /** Whether validation passed */
  success: z.boolean(),
  /** Data that was validated */
  data: z.any().optional(),
  /** Error details if validation failed */
  errors: z.array(z.string()).optional(),
  /** Error path if validation failed */
  errorPath: z.array(z.union([z.string(), z.number()])).optional(),
});

export type ValidationResult<T = unknown> = {
  success: boolean;
  data?: T;
  errors?: string[];
  errorPath?: Array<string | number>;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Compute versionId from question content.
 *
 * The versionId is computed from: { content, type, marks, difficulty, curriculum }
 * versionId, review, provenance, tags, language, stableId and schemaVersion are excluded.
 */
export function computeVersionId(question: Question): string {
  const crypto = require("node:crypto");

  // Type assertion to handle Zod inference union issue
  const q = question as {
    content: QuestionContent;
    type: QuestionType;
    marks: number;
    difficulty: Difficulty;
    curriculum: QuestionCurriculum;
  };

  const payload = {
    content: q.content,
    type: q.type,
    marks: q.marks,
    difficulty: q.difficulty,
    curriculum: q.curriculum,
  };

  // Sort object keys recursively
  const sortedPayload = sortObjectKeys(payload);
  const json = JSON.stringify(sortedPayload);
  const hash = crypto.createHash("sha256").update(json, "utf8").digest("hex");

  return `sha256:${hash}`;
}

/** Recursively sort object keys for canonical JSON representation */
function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    const sorted: Record<string, unknown> = {};
    for (const key of keys) {
      const val = (value as Record<string, unknown>)[key];
      if (val !== undefined) {
        sorted[key] = sortObjectKeys(val);
      }
    }
    return sorted;
  }
  return value;
}

/**
 * Validate a question and verify its versionId matches.
 */
export function validateQuestion(question: Question): ValidationResult<Question> {
  const parsed = QuestionSchema.safeParse(question);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.errors.map((e) => e.message),
    };
  }

  // Verify versionId if present
  if (question.versionId) {
    const computed = computeVersionId(question);
    if (question.versionId !== computed) {
      return {
        success: false,
        errors: [`versionId mismatch: expected ${computed}, got ${question.versionId}`],
      };
    }
  }

  return { success: true, data: parsed.data };
}