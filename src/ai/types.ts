export type AIAvailabilityStatus =
  | "unsupported"
  | "unavailable"
  | "downloading"
  | "downloadable"
  | "ready"
  | "error";

export type AISessionState =
  | "idle"
  | "creating"
  | "ready"
  | "streaming"
  | "compacting"
  | "error"
  | "destroyed";

export interface AICapabilityReport {
  languageModel: boolean;
  summarizer: boolean;
  languageDetector: boolean;
  translator: boolean;
  availability: AIAvailabilityStatus;
  downloadProgress?: number;
  maxContextTokens?: number;
}

export interface AISessionConfig {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
}

export interface AIStreamChunk {
  text: string;
  done: boolean;
  usage?: AIContextUsage;
}

export interface AIContextUsage {
  tokensUsed: number;
  tokensRemaining: number;
  maxTokens: number;
  usageRatio: number;
}

export interface AISession {
  id: string;
  state: AISessionState;
  config: AISessionConfig;
  contextUsage: AIContextUsage | null;
  createdAt: string;
}

export interface AIPromptResult {
  text: string;
  usage: AIContextUsage | null;
  warnings: string[];
}

export interface AISessionManager {
  createSession(config?: AISessionConfig): Promise<AISession>;
  sendPrompt(sessionId: string, prompt: string): Promise<AIPromptResult>;
  streamPrompt(
    sessionId: string,
    prompt: string,
  ): AsyncGenerator<AIStreamChunk>;
  abortSession(sessionId: string): void;
  destroySession(sessionId: string): void;
  getSession(sessionId: string): AISession | undefined;
  compactSession(sessionId: string): Promise<void>;
}

export interface AISummarizerAdapter {
  summarize(
    text: string,
    options?: { length?: "short" | "medium" | "long" },
  ): Promise<string>;
}

export interface AILanguageDetectorAdapter {
  detect(text: string): Promise<{ language: string; confidence: number }[]>;
}

export interface AITranslatorAdapter {
  translate(text: string, targetLanguage: string): Promise<string>;
}

export type StructuredOutputSchema = Record<string, unknown>;
