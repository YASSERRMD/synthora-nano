import type { PaperAnalysis } from "../../db/schemas";
import type { UserCorrection } from "./types";

const STORAGE_KEY_PREFIX = "synthora-corrections-";

function getStorageKey(paperId: string): string {
  return `${STORAGE_KEY_PREFIX}${paperId}`;
}

export function saveCorrections(
  paperId: string,
  corrections: UserCorrection[],
): void {
  try {
    localStorage.setItem(getStorageKey(paperId), JSON.stringify(corrections));
  } catch {
    // Storage full or unavailable
  }
}

export function loadCorrections(paperId: string): UserCorrection[] {
  try {
    const stored = localStorage.getItem(getStorageKey(paperId));
    if (!stored) return [];
    return JSON.parse(stored) as UserCorrection[];
  } catch {
    return [];
  }
}

export function applyCorrections(
  analysis: PaperAnalysis,
  corrections: UserCorrection[],
): PaperAnalysis {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: Record<string, any> = { ...analysis };

  for (const correction of corrections) {
    const fieldParts = correction.fieldPath.split(".");
    result = setNestedField(result, fieldParts, correction.correctedValue);
  }

  return result as PaperAnalysis;
}

function setNestedField(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  if (path.length === 0) return obj;

  const [head, ...rest] = path;
  if (!head) return obj;

  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }

  const nested = obj[head];
  if (typeof nested === "object" && nested !== null && !Array.isArray(nested)) {
    return {
      ...obj,
      [head]: setNestedField(nested as Record<string, unknown>, rest, value),
    };
  }

  return obj;
}

export function addCorrection(
  paperId: string,
  fieldPath: string,
  originalValue: unknown,
  correctedValue: unknown,
): UserCorrection[] {
  const existing = loadCorrections(paperId);
  const newCorrection: UserCorrection = {
    fieldPath,
    originalValue,
    correctedValue,
    correctedAt: new Date().toISOString(),
  };

  const filtered = existing.filter((c) => c.fieldPath !== fieldPath);
  filtered.push(newCorrection);

  saveCorrections(paperId, filtered);
  return filtered;
}

export function clearCorrections(paperId: string): void {
  try {
    localStorage.removeItem(getStorageKey(paperId));
  } catch {
    // ignore
  }
}
