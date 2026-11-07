/**
 * Curriculum Resolver - Phase 1 Implementation
 *
 * Loads and resolves curriculum data for supported class+subject combinations.
 * Currently only supports CBSE Class 11 Physics (edition: cbse-2026-27-phy-042-xi).
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  CurriculumRequest,
  CurriculumRequestSchema,
  CurriculumResponse,
  CurriculumResponseSchema,
  Unit,
  UnitSchema,
  Chapter,
  ChapterSchema,
} from "./contracts";

/** Supported curriculum edition identifier */
export const SUPPORTED_EDITION_ID = "cbse-2026-27-phy-042-xi";

/** Supported class and subject combinations */
export const SUPPORTED_CURRICULUMS = [
  { board: "CBSE", class: 11, subject: "Physics", editionId: SUPPORTED_EDITION_ID },
] as const;

/** Curriculum file name mapping */
const CURRICULUM_FILES: Record<string, string> = {
  "cbse-2026-27-phy-042-xi": "cbse-2026-27-class11-physics.json",
};

/** Custom error for unsupported curriculum */
export class UnsupportedCurriculumError extends Error {
  constructor(
    public readonly board: string,
    public readonly classLevel: number,
    public readonly subject: string,
  ) {
    super(
      `Curriculum not supported: ${board} Class ${classLevel} ${subject}. ` +
        `Supported: CBSE Class 11 Physics (edition: ${SUPPORTED_EDITION_ID})`,
    );
    this.name = "UnsupportedCurriculumError";
  }
}

/** Custom error for invalid chapter IDs */
export class InvalidChapterIdError extends Error {
  constructor(
    public readonly invalidIds: string[],
    public readonly validIds: string[],
  ) {
    super(
      `Invalid chapter IDs: ${invalidIds.join(", ")}. ` +
        `Valid chapter IDs: ${validIds.join(", ")}`,
    );
    this.name = "InvalidChapterIdError";
  }
}

/** Custom error for missing curriculum file */
export class CurriculumFileNotFoundError extends Error {
  constructor(public readonly editionId: string, public readonly filePath: string) {
    super(`Curriculum file not found for edition ${editionId}: ${filePath}`);
    this.name = "CurriculumFileNotFoundError";
  }
}

/**
 * Resolve curriculum data for a given request.
 *
 * @param request - Curriculum request with class, subject, and optional chapterIds filter
 * @returns Promise resolving to validated curriculum response
 * @throws UnsupportedCurriculumError if class/subject not supported
 * @throws InvalidChapterIdError if any chapterId in filter doesn't exist
 * @throws CurriculumFileNotFoundError if curriculum file is missing
 */
export async function resolveCurriculum(
  request: CurriculumRequest,
): Promise<CurriculumResponse> {
  // Validate request schema
  const parsedRequest = CurriculumRequestSchema.parse(request);

  // Check if curriculum is supported
  const supported = SUPPORTED_CURRICULUMS.find(
    (c) =>
      c.board.toLowerCase() === "cbse" && // Currently only CBSE
      c.class === parsedRequest.class &&
      c.subject.toLowerCase() === parsedRequest.subject.toLowerCase(),
  );

  if (!supported) {
    throw new UnsupportedCurriculumError("CBSE", parsedRequest.class, parsedRequest.subject);
  }

  // Load curriculum file
  const fileName = CURRICULUM_FILES[supported.editionId];
  if (!fileName) {
    throw new CurriculumFileNotFoundError(supported.editionId, "unknown");
  }

  const filePath = path.resolve(process.cwd(), "data", "curriculum", fileName);

  let rawData: string;
  try {
    rawData = await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new CurriculumFileNotFoundError(supported.editionId, filePath);
    }
    throw error;
  }

  // Parse and validate curriculum data
  let curriculumData: unknown;
  try {
    curriculumData = JSON.parse(rawData);
  } catch (error) {
    throw new Error(`Failed to parse curriculum JSON: ${(error as Error).message}`);
  }

  // Validate against response schema (full curriculum)
  const fullCurriculum = CurriculumResponseSchema.parse(curriculumData);

  // Verify edition matches
  if (fullCurriculum.editionId !== supported.editionId) {
    throw new Error(
      `Curriculum edition mismatch: expected ${supported.editionId}, got ${fullCurriculum.editionId}`,
    );
  }

  // If no chapter filter, return full curriculum
  if (!parsedRequest.chapterIds || parsedRequest.chapterIds.length === 0) {
    return fullCurriculum;
  }

  // Filter chapters by requested chapterIds
  const requestedChapterIds = parsedRequest.chapterIds;
  const allChapterIds = fullCurriculum.chapters.map((c) => c.chapterId);

  // Validate all requested chapter IDs exist
  const invalidIds = requestedChapterIds.filter((id) => !allChapterIds.includes(id));
  if (invalidIds.length > 0) {
    throw new InvalidChapterIdError(invalidIds, allChapterIds);
  }

  // Filter chapters
  const filteredChapters = fullCurriculum.chapters.filter((c) =>
    requestedChapterIds.includes(c.chapterId),
  );

  // Filter units to only include those that have at least one chapter in the filtered set
  const filteredChapterIds = new Set(filteredChapters.map((c) => c.chapterId));
  const filteredUnits = fullCurriculum.units.filter((unit) =>
    unit.chapterIds.some((id) => filteredChapterIds.has(id)),
  );

  // Build filtered response
  const filteredResponse: CurriculumResponse = {
    schemaVersion: fullCurriculum.schemaVersion,
    editionId: fullCurriculum.editionId,
    board: fullCurriculum.board,
    class: fullCurriculum.class,
    subject: fullCurriculum.subject,
    units: filteredUnits,
    chapters: filteredChapters,
  };

  // Validate filtered response
  return CurriculumResponseSchema.parse(filteredResponse);
}

/**
 * Get list of supported curriculums
 */
export function getSupportedCurriculums(): ReadonlyArray<{
  board: string;
  class: number;
  subject: string;
  editionId: string;
}> {
  return SUPPORTED_CURRICULUMS;
}

/**
 * Check if a curriculum is supported
 */
export function isCurriculumSupported(board: string, classLevel: number, subject: string): boolean {
  return SUPPORTED_CURRICULUMS.some(
    (c) =>
      c.board.toLowerCase() === board.toLowerCase() &&
      c.class === classLevel &&
      c.subject.toLowerCase() === subject.toLowerCase(),
  );
}