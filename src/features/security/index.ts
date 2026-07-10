export { generateCSPHeader, applyCSP } from "./csp";
export type { CSPConfig } from "./csp";

export {
  validateContent,
  validateFileSize,
  validateNoteContent,
  validateConceptName,
  validateDescription,
  sanitizeContentForImport,
} from "./content-validator";
export type { ValidationResult } from "./content-validator";

export {
  logDiagnostic,
  getDiagnostics,
  clearDiagnostics,
  getDiagnosticsByCategory,
  getDiagnosticsByLevel,
  getRecentDiagnostics,
  getErrorSummary,
} from "./diagnostics";
export type { DiagnosticEntry } from "./diagnostics";

export {
  reportError,
  getErrors,
  clearErrors,
  getRecoverableErrors,
  getUnrecoverableErrors,
  getErrorsByType,
  getRecentErrors,
} from "./error-center";
export type { RecoverableError } from "./error-center";
