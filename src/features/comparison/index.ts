export { comparisonService } from "./comparison-service";
export type { ComparisonMatrixRow } from "./comparison-service";
export {
  identifyAgreements,
  identifyContradictions,
  identifyResearchGaps,
  generateChronologicalView,
} from "./comparison-analysis";
export type {
  AgreementsResult,
  ContradictionsResult,
  ResearchGapsResult,
} from "./comparison-analysis";

export { exportMatrixToCSV, exportMatrixToMarkdown } from "./export-matrix";

export {
  saveCellEdit,
  loadCellEdits,
  clearCellEdits,
  applyEditsToMatrix,
} from "./editable-cells";
export type { EditableCell } from "./editable-cells";

export {
  saveAnnotations,
  loadAnnotations,
  addAnnotation,
  removeAnnotation,
  buildAnnotatedMatrix,
} from "./annotations";
export type {
  MatrixAnnotation,
  AnnotatedMatrix,
  MatrixCell,
} from "./annotations";

export { runFullComparison, exportComparison } from "./comparison-orchestrator";
export type { ComparisonResult } from "./comparison-orchestrator";
