import type { PaperAnalysis } from "../../db/schemas";
import type { ProcessingCheckpoint } from "./types";

const CHECKPOINT_PREFIX = "synthora-checkpoint-";

function getCheckpointKey(paperId: string): string {
  return `${CHECKPOINT_PREFIX}${paperId}`;
}

export function saveCheckpoint(checkpoint: ProcessingCheckpoint): void {
  try {
    localStorage.setItem(
      getCheckpointKey(checkpoint.paperId),
      JSON.stringify(checkpoint),
    );
  } catch {
    // Storage full or unavailable
  }
}

export function loadCheckpoint(paperId: string): ProcessingCheckpoint | null {
  try {
    const stored = localStorage.getItem(getCheckpointKey(paperId));
    if (!stored) return null;
    return JSON.parse(stored) as ProcessingCheckpoint;
  } catch {
    return null;
  }
}

export function clearCheckpoint(paperId: string): void {
  try {
    localStorage.removeItem(getCheckpointKey(paperId));
  } catch {
    // ignore
  }
}

export function createCheckpoint(paperId: string): ProcessingCheckpoint {
  return {
    paperId,
    completedStages: [],
    partialResults: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function updateCheckpoint(
  checkpoint: ProcessingCheckpoint,
  stage: import("./types").AnalysisStage,
  partialData: Partial<PaperAnalysis>,
): ProcessingCheckpoint {
  return {
    ...checkpoint,
    completedStages: [...checkpoint.completedStages, stage],
    partialResults: { ...checkpoint.partialResults, ...partialData },
    updatedAt: new Date().toISOString(),
  };
}

export function mergePartialAnalysis(
  partial: Partial<PaperAnalysis>,
  corrections: import("./types").UserCorrection[],
): Partial<PaperAnalysis> {
  let result = { ...partial };

  for (const correction of corrections) {
    const fieldParts = correction.fieldPath.split(".");
    if (fieldParts.length === 1 && fieldParts[0]) {
      result = {
        ...result,
        [fieldParts[0]]: correction.correctedValue,
      } as Partial<PaperAnalysis>;
    }
  }

  return result;
}
