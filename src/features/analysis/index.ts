export type {
  EvidenceReference,
  ExtractionResult,
  AnalysisStage,
  ProcessingCheckpoint,
  UserCorrection,
} from "./types";

export {
  classifySections,
  getChunksByCategory,
  concatenateChunks,
} from "./section-classifier";

export type { ClassifiedSection } from "./section-classifier";

export {
  saveCorrections,
  loadCorrections,
  applyCorrections,
  addCorrection,
  clearCorrections,
} from "./corrections";

export {
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
  createCheckpoint,
  updateCheckpoint,
  mergePartialAnalysis,
} from "./checkpoint";

export { validateCitations, buildEvidenceMap } from "./citation-validator";

export type { CitationValidationResult } from "./citation-validator";

export {
  createProgress,
  advanceProgress,
  buildAnalysisFromCheckpoint,
  isStageCompleted,
  getNextIncompleteStage,
} from "./progress";

export type { AnalysisProgress, AnalysisProgressStage } from "./progress";

export { attemptRecovery } from "./recovery";

export type { RecoveryResult } from "./recovery";
