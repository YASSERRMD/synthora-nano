export {
  buildIndex,
  searchIndex,
  getIndexSize,
  clearIndex,
} from "./retrieval-index";
export type { IndexEntry, SearchResult } from "./retrieval-index";

export { weightedSearch } from "./weighted-search";
export type { WeightedSearchOptions } from "./weighted-search";

export { packContext, estimateTokens, getContextUsage } from "./context-budget";
export type { ContextBudget, PackedContext } from "./context-budget";

export { chatThreadService } from "./chat-service";
export type { CreateThreadData, SendMessageData } from "./chat-service";

export {
  validateCitations,
  validateConversationCitations,
  getOverallCitationHealth,
} from "./citation-validator";
export type { CitationValidation } from "./citation-validator";

export {
  getModeConfig,
  getAvailableModes,
  validateModeSelection,
  ASSISTANT_MODES,
} from "./modes";
export type { AssistantMode, AssistantModeConfig } from "./modes";
