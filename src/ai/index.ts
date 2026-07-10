export type {
  AICapabilityReport,
  AIAvailabilityStatus,
  AISession,
  AISessionConfig,
  AISessionState,
  AISessionManager,
  AIStreamChunk,
  AIPromptResult,
  AIContextUsage,
  AISummarizerAdapter,
  AILanguageDetectorAdapter,
  AITranslatorAdapter,
} from "./types";

export {
  detectCapabilities,
  getAvailabilityMessage,
} from "./capability-detector";

export {
  AIUnsupportedError,
  AIModelNotReadyError,
  AISessionCreationError,
  AIPromptError,
  AIAbortError,
  AITimeoutError,
  AIContextOverflowError,
  AIOutputValidationError,
  AINetworkError,
} from "./errors";

export { SessionManager } from "./adapters/session-manager";
export { validateStructuredOutput } from "./adapters/structured-output";
export { ContextMonitor } from "./adapters/context-monitor";
export { MockSessionManager } from "./adapters/mock-runtime";

export {
  paperMetadataPrompt,
  executiveSummaryPrompt,
  methodologyExtractionPrompt,
  groundedQAPrompt,
  PAPER_METADATA_PROMPT_VERSION,
  EXECUTIVE_SUMMARY_PROMPT_VERSION,
  METHODOLOGY_PROMPT_VERSION,
  GROUNDED_QA_PROMPT_VERSION,
} from "./prompts/prompt-templates";

export type { PromptTemplate } from "./prompts/prompt-templates";

export {
  PaperMetadataSchema,
  SectionClassificationSchema,
  ExecutiveSummarySchema,
  MethodologyExtractionSchema,
  FindingsExtractionSchema,
  LimitationsExtractionSchema,
  FutureWorkExtractionSchema,
  ConceptExtractionSchema,
  ComparisonMatrixSchema,
  GroundedAnswerSchema,
} from "./schemas/analysis-schemas";

export type {
  PaperMetadata,
  SectionClassification,
  ExecutiveSummary,
  MethodologyExtraction,
  FindingsExtraction,
  LimitationsExtraction,
  FutureWorkExtraction,
  ConceptExtraction,
  ComparisonMatrix,
  GroundedAnswer,
} from "./schemas/analysis-schemas";

export { AnalysisPipeline } from "./pipelines/analysis-pipeline";
export { SessionCompactor } from "./pipelines/compaction";
