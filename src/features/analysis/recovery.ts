import type { PaperAnalysis } from "../../db/schemas";
import type { AnalysisStage } from "./types";
import { loadCheckpoint, clearCheckpoint } from "./checkpoint";
import { loadCorrections, applyCorrections } from "./corrections";

export interface RecoveryResult {
  recovered: boolean;
  analysis: Partial<PaperAnalysis>;
  stagesCompleted: AnalysisStage[];
  warnings: string[];
}

export function attemptRecovery(paperId: string): RecoveryResult | null {
  const checkpoint = loadCheckpoint(paperId);
  if (!checkpoint) return null;

  const corrections = loadCorrections(paperId);
  let partial = { ...checkpoint.partialResults };

  if (corrections.length > 0) {
    partial = applyCorrections(partial as PaperAnalysis, corrections);
  }

  const warnings: string[] = [];

  if (checkpoint.completedStages.length === 0) {
    warnings.push("No stages were completed. Starting fresh.");
    clearCheckpoint(paperId);
    return null;
  }

  warnings.push(
    `Recovered ${checkpoint.completedStages.length} completed stages from checkpoint.`,
  );

  return {
    recovered: true,
    analysis: partial,
    stagesCompleted: checkpoint.completedStages,
    warnings,
  };
}
