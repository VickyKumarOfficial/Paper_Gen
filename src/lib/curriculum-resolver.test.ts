/**
 * Curriculum Resolver Tests - Phase 1
 *
 * Run with: npx ts-node src/lib/curriculum-resolver.test.ts
 */

import { resolveCurriculum, UnsupportedCurriculumError, InvalidChapterIdError, CurriculumFileNotFoundError, isCurriculumSupported, getSupportedCurriculums, SUPPORTED_EDITION_ID } from "./curriculum-resolver";
import { CurriculumRequest, CurriculumResponseSchema } from "./contracts";

// ============================================================================
// Test Utilities
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: (error as Error).message });
    console.log(`✗ ${name}`);
    console.log(`  ${(error as Error).message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertThrows(fn: () => Promise<unknown>, errorClass: new (...args: unknown[]) => Error, messageContains?: string): Promise<void> {
  return fn()
    .then(() => {
      throw new Error(`Expected ${errorClass.name} to be thrown`);
    })
    .catch((error) => {
      if (!(error instanceof errorClass)) {
        throw new Error(`Expected ${errorClass.name}, got ${error.constructor.name}: ${error.message}`);
      }
      if (messageContains && !error.message.includes(messageContains)) {
        throw new Error(`Error message does not contain "${messageContains}": ${error.message}`);
      }
    });
}

// ============================================================================
// Test Suites
// ============================================================================

async function runAllTests() {
  console.log("Running Curriculum Resolver Tests...\n");

  // ---------------------------------------------------------------------------
  // Full Subject Resolution (no chapterIds)
  // ---------------------------------------------------------------------------
  await runTest("Full subject resolution returns all 14 chapters", async () => {
    const request: CurriculumRequest = { class: 11, subject: "Physics" };
    const response = await resolveCurriculum(request);

    CurriculumResponseSchema.parse(response);
    assertEqual(response.editionId, SUPPORTED_EDITION_ID, "editionId");
    assertEqual(response.class, 11, "class");
    assertEqual(response.subject, "Physics", "subject");
    assertEqual(response.board, "CBSE", "board");
    assertEqual(response.chapters.length, 14, "chapters count");
    assertEqual(response.units.length, 10, "units count");

    const expectedChapterIds = [
      "cbse-2026-27-phy-042-xi-ch01", "cbse-2026-27-phy-042-xi-ch02", "cbse-2026-27-phy-042-xi-ch03",
      "cbse-2026-27-phy-042-xi-ch04", "cbse-2026-27-phy-042-xi-ch05", "cbse-2026-27-phy-042-xi-ch06",
      "cbse-2026-27-phy-042-xi-ch07", "cbse-2026-27-phy-042-xi-ch08", "cbse-2026-27-phy-042-xi-ch09",
      "cbse-2026-27-phy-042-xi-ch10", "cbse-2026-27-phy-042-xi-ch11", "cbse-2026-27-phy-042-xi-ch12",
      "cbse-2026-27-phy-042-xi-ch13", "cbse-2026-27-phy-042-xi-ch14",
    ];
    const actualChapterIds = response.chapters.map((c) => c.chapterId).sort();
    assertEqual(actualChapterIds, [...expectedChapterIds].sort(), "chapter IDs");
  });

  await runTest("Full subject resolution returns all 10 units with correct structure", async () => {
    const request: CurriculumRequest = { class: 11, subject: "Physics" };
    const response = await resolveCurriculum(request);

    const unit1 = response.units.find((u) => u.unitId === "cbse-2026-27-phy-042-xi-u01");
    assertTrue(!!unit1, "Unit 1 found");
    assertEqual(unit1!.unitNumber, 1, "Unit 1 number");
    assertEqual(unit1!.unitRoman, "I", "Unit 1 Roman");
    assertEqual(unit1!.unitName, "Physical World and Measurement", "Unit 1 name");
    assertEqual(unit1!.chapterIds.length, 1, "Unit 1 chapter count");
    assertEqual(unit1!.chapterIds[0], "cbse-2026-27-phy-042-xi-ch01", "Unit 1 chapter ID");

    const unit2 = response.units.find((u) => u.unitId === "cbse-2026-27-phy-042-xi-u02");
    assertTrue(!!unit2, "Unit 2 found");
    assertEqual(unit2!.chapterIds.length, 2, "Unit 2 chapter count");
  });

  await runTest("Full subject resolution with empty chapterIds array returns all chapters", async () => {
    const request: CurriculumRequest = { class: 11, subject: "Physics", chapterIds: [] };
    const response = await resolveCurriculum(request);
    assertEqual(response.chapters.length, 14, "chapters count with empty array");
  });

  // ---------------------------------------------------------------------------
  // Chapter-Filtered Resolution (with valid chapterIds)
  // ---------------------------------------------------------------------------
  await runTest("Chapter-filtered resolution returns only requested chapters", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["cbse-2026-27-phy-042-xi-ch02", "cbse-2026-27-phy-042-xi-ch03"],
    };
    const response = await resolveCurriculum(request);

    assertEqual(response.chapters.length, 2, "filtered chapters count");
    const chapterIds = response.chapters.map((c) => c.chapterId).sort();
    assertEqual(chapterIds, ["cbse-2026-27-phy-042-xi-ch02", "cbse-2026-27-phy-042-xi-ch03"], "filtered chapter IDs");
  });

  await runTest("Chapter-filtered resolution returns only units containing requested chapters", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["cbse-2026-27-phy-042-xi-ch02", "cbse-2026-27-phy-042-xi-ch03"],
    };
    const response = await resolveCurriculum(request);

    assertEqual(response.units.length, 1, "filtered units count");
    assertEqual(response.units[0].unitId, "cbse-2026-27-phy-042-xi-u02", "filtered unit ID");
  });

  await runTest("Chapter-filtered resolution returns multiple units when chapters span units", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["cbse-2026-27-phy-042-xi-ch01", "cbse-2026-27-phy-042-xi-ch04"],
    };
    const response = await resolveCurriculum(request);

    assertEqual(response.chapters.length, 2, "chapters count");
    assertEqual(response.units.length, 2, "units count");
    const unitIds = response.units.map((u) => u.unitId).sort();
    assertEqual(unitIds, ["cbse-2026-27-phy-042-xi-u01", "cbse-2026-27-phy-042-xi-u03"], "unit IDs");
  });

  await runTest("Chapter-filtered resolution preserves chapter order from original curriculum", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: [
        "cbse-2026-27-phy-042-xi-ch05",
        "cbse-2026-27-phy-042-xi-ch01",
        "cbse-2026-27-phy-042-xi-ch14",
      ],
    };
    const response = await resolveCurriculum(request);

    const chapterNumbers = response.chapters.map((c) => c.chapterNumber);
    assertEqual(chapterNumbers, [1, 5, 14], "chapter order preserved");
  });

  await runTest("Single chapter resolution works correctly", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["cbse-2026-27-phy-042-xi-ch07"],
    };
    const response = await resolveCurriculum(request);

    assertEqual(response.chapters.length, 1, "single chapter count");
    assertEqual(response.chapters[0].chapterId, "cbse-2026-27-phy-042-xi-ch07", "chapter ID");
    assertEqual(response.chapters[0].chapterName, "Gravitation", "chapter name");
    assertEqual(response.units.length, 1, "single unit count");
    assertEqual(response.units[0].unitId, "cbse-2026-27-phy-042-xi-u06", "unit ID");
  });

  // ---------------------------------------------------------------------------
  // Error on Invalid ChapterId
  // ---------------------------------------------------------------------------
  await runTest("Invalid chapterId throws InvalidChapterIdError", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["cbse-2026-27-phy-042-xi-ch99"],
    };
    await assertThrows(
      () => resolveCurriculum(request),
      InvalidChapterIdError as unknown as new (...args: unknown[]) => Error,
      "Invalid chapter IDs: cbse-2026-27-phy-042-xi-ch99",
    );
  });

  await runTest("Multiple invalid chapterIds all reported in error", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["invalid-ch01", "invalid-ch02", "cbse-2026-27-phy-042-xi-ch01"],
    };
    await assertThrows(
      () => resolveCurriculum(request),
      InvalidChapterIdError as unknown as new (...args: unknown[]) => Error,
      "Invalid chapter IDs: invalid-ch01, invalid-ch02",
    );
  });

  await runTest("Error message includes valid chapter IDs for debugging", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["non-existent"],
    };
    try {
      await resolveCurriculum(request);
      throw new Error("Expected InvalidChapterIdError");
    } catch (error: unknown) {
      const err = error as Error;
      assertTrue(err instanceof InvalidChapterIdError, "error type");
      assertTrue(err.message.includes("cbse-2026-27-phy-042-xi-ch01"), "error message includes valid IDs");
    }
  });

  await runTest("InvalidChapterIdError exposes invalidIds and validIds properties", async () => {
    const request: CurriculumRequest = {
      class: 11,
      subject: "Physics",
      chapterIds: ["bad-id"],
    };
    try {
      await resolveCurriculum(request);
      throw new Error("Expected InvalidChapterIdError");
    } catch (error: unknown) {
      const err = error as InvalidChapterIdError;
      assertTrue(err instanceof InvalidChapterIdError, "error type");
      assertEqual(err.invalidIds.length, 1, "invalidIds length");
      assertEqual(err.invalidIds[0], "bad-id", "invalidIds value");
      assertEqual(err.validIds.length, 14, "validIds length");
    }
  });

  // ---------------------------------------------------------------------------
  // Error on Unsupported Class/Subject
  // ---------------------------------------------------------------------------
  await runTest("Unsupported class throws UnsupportedCurriculumError", async () => {
    const request: CurriculumRequest = { class: 12, subject: "Physics" };
    await assertThrows(
      () => resolveCurriculum(request),
      UnsupportedCurriculumError as unknown as new (...args: unknown[]) => Error,
      "Curriculum not supported",
    );
  });

  await runTest("Unsupported subject throws UnsupportedCurriculumError", async () => {
    const request: CurriculumRequest = { class: 11, subject: "Chemistry" };
    await assertThrows(
      () => resolveCurriculum(request),
      UnsupportedCurriculumError as unknown as new (...args: unknown[]) => Error,
      "Curriculum not supported",
    );
  });

  await runTest("Unsupported class (Class 10) throws UnsupportedCurriculumError", async () => {
    const request: CurriculumRequest = { class: 10, subject: "Physics" };
    await assertThrows(
      () => resolveCurriculum(request),
      UnsupportedCurriculumError as unknown as new (...args: unknown[]) => Error,
      "Curriculum not supported",
    );
  });

  await runTest("UnsupportedCurriculumError exposes board, class, subject properties", async () => {
    const request: CurriculumRequest = { class: 9, subject: "Biology" };
    try {
      await resolveCurriculum(request);
      throw new Error("Expected UnsupportedCurriculumError");
    } catch (error: unknown) {
      const err = error as UnsupportedCurriculumError;
      assertTrue(err instanceof UnsupportedCurriculumError, "error type");
      assertEqual(err.board, "CBSE", "error board");
      assertEqual(err.classLevel, 9, "error class");
      assertEqual(err.subject, "Biology", "error subject");
    }
  });

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------
  await runTest("Case-insensitive subject matching works (lowercase)", async () => {
    const request: CurriculumRequest = { class: 11, subject: "physics" };
    const response = await resolveCurriculum(request);
    assertEqual(response.chapters.length, 14, "case-insensitive subject");
  });

  await runTest("Case-insensitive subject matching works (mixed case)", async () => {
    const request: CurriculumRequest = { class: 11, subject: "PhYsIcS" };
    const response = await resolveCurriculum(request);
    assertEqual(response.chapters.length, 14, "mixed-case subject");
  });

  await runTest("Request validation rejects invalid class (zero)", async () => {
    const request = { class: 0, subject: "Physics" };
    try {
      await resolveCurriculum(request as CurriculumRequest);
      throw new Error("Expected validation error");
    } catch (error) {
      assertTrue((error as Error).message.includes("class"), "class validation error");
    }
  });

  await runTest("Request validation rejects invalid class (13)", async () => {
    const request = { class: 13, subject: "Physics" };
    try {
      await resolveCurriculum(request as CurriculumRequest);
      throw new Error("Expected validation error");
    } catch (error) {
      assertTrue((error as Error).message.includes("class"), "class validation error");
    }
  });

  await runTest("Request validation rejects empty subject", async () => {
    const request = { class: 11, subject: "" };
    try {
      await resolveCurriculum(request as CurriculumRequest);
      throw new Error("Expected validation error");
    } catch (error) {
      assertTrue((error as Error).message.includes("subject"), "subject validation error");
    }
  });

  // ---------------------------------------------------------------------------
  // Helper Functions
  // ---------------------------------------------------------------------------
  await runTest("isCurriculumSupported returns true for supported curriculum", async () => {
    assertTrue(isCurriculumSupported("CBSE", 11, "Physics"), "supported curriculum");
  });

  await runTest("isCurriculumSupported returns false for unsupported class", async () => {
    assertTrue(!isCurriculumSupported("CBSE", 12, "Physics"), "unsupported class");
  });

  await runTest("isCurriculumSupported returns false for unsupported subject", async () => {
    assertTrue(!isCurriculumSupported("CBSE", 11, "Chemistry"), "unsupported subject");
  });

  await runTest("isCurriculumSupported is case-insensitive", async () => {
    assertTrue(isCurriculumSupported("cbse", 11, "physics"), "case-insensitive check");
  });

  await runTest("getSupportedCurriculums returns correct data", async () => {
    const supported = getSupportedCurriculums();
    assertEqual(supported.length, 1, "supported curriculums count");
    assertEqual(supported[0].board, "CBSE", "board");
    assertEqual(supported[0].class, 11, "class");
    assertEqual(supported[0].subject, "Physics", "subject");
    assertEqual(supported[0].editionId, SUPPORTED_EDITION_ID, "editionId");
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log(`\n--- Test Results ---`);
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${results.length}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});