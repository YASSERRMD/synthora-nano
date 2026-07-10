import type { PaperAnalysis } from "../../db/schemas";
import type { ProcessingCheckpoint } from "./types";

export type AnalysisProgressStage =
  | "metadata"
  | "section-classification"
  | "executive-summary"
  | "methodology"
  | "datasets-tools"
  | "findings"
  | "limitations"
  | "future-work"
  | "synthesis"
  | "complete";

export interface AnalysisProgress {
  paperId: string;
  currentStage: AnalysisProgressStage;
  completedStages: AnalysisProgressStage[];
  totalStages: number;
  percentComplete: number;
  startedAt: string;
  updatedAt: string;
}

const STAGES: AnalysisProgressStage[] = [
  "metadata",
  "section-classification",
  "executive-summary",
  "methodology",
  "datasets-tools",
  "findings",
  "limitations",
  "future-work",
  "synthesis",
];

export function createProgress(paperId: string): AnalysisProgress {
  return {
    paperId,
    currentStage: "metadata",
    completedStages: [],
    totalStages: STAGES.length,
    percentComplete: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function advanceProgress(
  progress: AnalysisProgress,
  completedStage: AnalysisProgressStage,
): AnalysisProgress {
  if (completedStage === "complete") {
    return {
      ...progress,
      currentStage: "complete",
      completedStages: STAGES,
      percentComplete: 100,
      updatedAt: new Date().toISOString(),
    };
  }

  const completed = [...progress.completedStages, completedStage];
  const nextIndex = STAGES.indexOf(completedStage) + 1;
  const nextStage = nextIndex < STAGES.length ? STAGES[nextIndex]! : "complete";

  return {
    ...progress,
    currentStage: nextStage,
    completedStages: completed,
    percentComplete: Math.round((completed.length / STAGES.length) * 100),
    updatedAt: new Date().toISOString(),
  };
}

export function buildAnalysisFromCheckpoint(
  checkpoint: ProcessingCheckpoint,
): Partial<PaperAnalysis> {
  return checkpoint.partialResults;
}

export function isStageCompleted(
  progress: AnalysisProgress,
  stage: AnalysisProgressStage,
): boolean {
  return progress.completedStages.includes(stage);
}

export function getNextIncompleteStage(
  progress: AnalysisProgress,
): AnalysisProgressStage | null {
  for (const stage of STAGES) {
    if (!progress.completedStages.includes(stage)) {
      return stage;
    }
  }
  return null;
}
