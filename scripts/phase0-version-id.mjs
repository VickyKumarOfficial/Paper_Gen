// Phase 0 question versionId.
//
// Canonicalisation (exact):
//   1. Build the object { content, type, marks, difficulty, curriculum } from the item.
//      versionId, review, provenance, tags, language, stableId and schemaVersion are excluded.
//   2. Serialise recursively with object keys sorted by UTF-16 code unit order
//      (Array.prototype.sort default), arrays kept in order, no whitespace,
//      values encoded by JSON.stringify (null kept, undefined keys dropped).
//   3. Hash the UTF-8 bytes with SHA-256; versionId = "sha256:" + lowercase hex.
import { createHash } from "node:crypto";

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function computeVersionId(item) {
  const { content, type, marks, difficulty, curriculum } = item;
  const payload = canonicalJson({ content, type, marks, difficulty, curriculum });
  return `sha256:${createHash("sha256").update(payload, "utf8").digest("hex")}`;
}
