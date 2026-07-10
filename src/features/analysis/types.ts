import type { PaperAnalysis } from "../../db/schemas";

export interface EvidenceReference {
  chunkId?: string;
  pageStart?: number;
  pageEnd?: number;
  sectionHeading?: string;
  text: string;
  charOffsetStart?: number;
  charOffsetEnd?: number;
}

export interface ExtractionResult<T> {
  data: T;
  evidence: EvidenceReference[];
  warnings: string[];
  confidence: "high" | "medium" | "low";
}

export type AnalysisStage =
  | "metadata"
  | "section-classification"
  | "executive-summary"
  | "methodology"
  | "datasets-tools"
  | "findings"
  | "limitations"
  | "future-work"
  | "synthesis";

export interface ProcessingCheckpoint {
  paperId: string;
  completedStages: AnalysisStage[];
  partialResults: Partial<PaperAnalysis>;
  startedAt: string;
  updatedAt: string;
}

export interface UserCorrection {
  fieldPath: string;
  originalValue: unknown;
  correctedValue: unknown;
  correctedAt: string;
}
