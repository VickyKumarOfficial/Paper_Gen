/**
 * Question Bank - Phase 1 Implementation
 *
 * Loads and validates questions from Phase 0 fixture files.
 * Currently supports CBSE Class 11 Physics (edition: cbse-2026-27-phy-042-xi).
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  Question,
  QuestionSchema,
  QuestionCurriculum,
  validateQuestion,
} from "./contracts";

/** Supported curriculum edition identifier */
export const SUPPORTED_EDITION_ID = "cbse-2026-27-phy-042-xi";

/** Fixture file mapping for the supported edition */
const FIXTURE_FILES: Record<string, { fullSubject: string; chapter2: string }> = {
  "cbse-2026-27-phy-042-xi": {
    fullSubject: "class-11-physics-full-subject-candidate.json",
    chapter2: "class-11-physics-chapter-2-candidate.json",
  },
};

/** Chapter ID for Chapter 2 (Motion in a Straight Line) */
const CHAPTER_2_ID = "cbse-2026-27-phy-042-xi-ch02";

/** Custom error for unsupported curriculum edition */
export class UnsupportedEditionError extends Error {
  constructor(public readonly editionId: string) {
    super(`Question fixtures not available for edition: ${editionId}. Supported: ${SUPPORTED_EDITION_ID}`);
    this.name = "UnsupportedEditionError";
  }
}

/** Custom error for missing fixture file */
export class FixtureFileNotFoundError extends Error {
  constructor(public readonly editionId: string, public readonly filePath: string) {
    super(`Question fixture file not found for edition ${editionId}: ${filePath}`);
    this.name = "FixtureFileNotFoundError";
  }
}

/** Custom error for question validation failures */
export class QuestionValidationError extends Error {
  constructor(public readonly errors: string[], public readonly questionIndex: number) {
    super(`Question validation failed at index ${questionIndex}: ${errors.join("; ")}`);
    this.name = "QuestionValidationError";
  }
}

/**
 * Load questions from fixture files for a given curriculum edition and optional chapter filter.
 *
 * @param curriculumEdition - The curriculum edition identifier (e.g., "cbse-2026-27-phy-042-xi")
 * @param chapterIds - Optional array of chapter IDs to filter questions. If provided and includes chapter 2,
 *                     loads the chapter-2 fixture. If empty or not provided, loads full subject fixture.
 * @returns Promise resolving to array of validated Question objects
 * @throws UnsupportedEditionError if edition is not supported
 * @throws FixtureFileNotFoundError if fixture file is missing
 * @throws QuestionValidationError if any question fails schema validation
 */
export async function loadQuestions(
  curriculumEdition: string,
  chapterIds?: string[]
): Promise<Question[]> {
  // Check if edition is supported
  if (curriculumEdition !== SUPPORTED_EDITION_ID) {
    throw new UnsupportedEditionError(curriculumEdition);
  }

  // Determine which fixture to load
  const isChapter2Only = chapterIds?.length === 1 && chapterIds[0] === CHAPTER_2_ID;
  const fixtureKey = isChapter2Only ? "chapter2" : "fullSubject";
  const fileName = FIXTURE_FILES[curriculumEdition][fixtureKey];

  const filePath = path.resolve(process.cwd(), "generated", "sample-fixtures", fileName);

  // Load fixture file
  let rawData: string;
  try {
    rawData = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new FixtureFileNotFoundError(curriculumEdition, filePath);
    }
    throw error;
  }

  // Parse JSON
  let fixtureData: unknown;
  try {
    fixtureData = JSON.parse(rawData);
  } catch (error) {
    throw new Error(`Failed to parse fixture JSON: ${(error as Error).message}`);
  }

  // Extract questions array from fixture (handle both full-subject and chapter-2 formats)
  let questions: unknown[] = [];
  if (isChapter2Only) {
    // Chapter 2 fixture has questions at root level
    questions = (fixtureData as { questions: unknown[] }).questions || [];
  } else {
    // Full subject fixture has questions at root level
    questions = (fixtureData as { questions: unknown[] }).questions || [];
  }

  if (!Array.isArray(questions)) {
    throw new Error("Fixture does not contain a valid questions array");
  }

  // Validate each question against schema
  const validatedQuestions: Question[] = [];
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const result = await validateQuestion(question as Question);

    if (!result.success) {
      throw new QuestionValidationError(result.errors || ["Unknown validation error"], i);
    }

    validatedQuestions.push(result.data!);
  }

  // If specific chapter IDs requested (other than chapter 2), filter the loaded questions
  if (chapterIds && chapterIds.length > 0 && !isChapter2Only) {
    const requestedChapterIds = new Set(chapterIds);
    return validatedQuestions.filter((q) => {
      // Handle both FullQuestion (with curriculum.chapterId) and SimplifiedQuestion (with chapterId at root)
      const qCurriculum = "curriculum" in q ? q.curriculum : undefined;
      const chapterId = qCurriculum?.chapterId ?? ("chapterId" in q ? q.chapterId : undefined);
      return chapterId && requestedChapterIds.has(chapterId);
    });
  }

  return validatedQuestions;
}

/**
 * Get the total number of questions available in the full subject fixture.
 * Useful for checking if we have enough questions for a template.
 */
export async function getTotalQuestionCount(curriculumEdition: string): Promise<number> {
  const questions = await loadQuestions(curriculumEdition);
  return questions.length;
}

/**
 * Get the number of questions available for specific chapters.
 */
export async function getChapterQuestionCount(
  curriculumEdition: string,
  chapterIds: string[]
): Promise<number> {
  const questions = await loadQuestions(curriculumEdition, chapterIds);
  return questions.length;
}

/**
 * Get available chapter IDs that have questions in the fixture.
 * Currently only Chapter 2 has a dedicated fixture; full subject has all chapters.
 */
export function getAvailableChapterIds(curriculumEdition: string): string[] {
  if (curriculumEdition !== SUPPORTED_EDITION_ID) {
    return [];
  }
  // For now, we know Chapter 2 has a dedicated fixture
  // In the future, this could be derived from the full subject fixture
  return [CHAPTER_2_ID];
}