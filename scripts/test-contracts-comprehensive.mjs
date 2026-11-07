import { z } from "zod";
import fs from "fs";

// Import from the actual contracts file
import {
  QuestionSchema,
  Question,
  computeVersionId,
  validateQuestion,
} from "./src/lib/contracts.ts";

// Test fixtures
const fixtures = [
  "generated/sample-fixtures/class-11-physics-full-subject-candidate.json",
  "generated/sample-fixtures/class-11-physics-chapter-2-candidate.json",
  "generated/sample-fixtures/class-11-physics-siyavula-sourced-candidate.json",
  "generated/sample-fixtures/class-11-physics-mcq.json",
];

console.log("=== Comprehensive Contract Validation Test ===\n");

let totalValid = 0;
let totalInvalid = 0;

for (const file of fixtures) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const questions = data.questions || [];
  
  console.log(`Testing ${file}: ${questions.length} questions`);
  
  for (const q of questions) {
    // First validate structure
    const result = QuestionSchema.safeParse(q);
    if (!result.success) {
      totalInvalid++;
      console.log(`  ✗ ${q.stableId}: Invalid structure`);
      for (const err of result.error.errors) {
        console.log(`    - ${err.path.join('.') || '(root)'}: ${err.message}`);
      }
      continue;
    }
    
    // Test validateQuestion function
    const validation = validateQuestion(q);
    if (!validation.success) {
      totalInvalid++;
      console.log(`  ✗ ${q.stableId}: Validation failed - ${validation.errors?.join(', ')}`);
    } else {
      totalValid++;
    }
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total valid: ${totalValid}`);
console.log(`Total invalid: ${totalInvalid}`);
