import type {
  AISession,
  AISessionConfig,
  AISessionManager,
  AIStreamChunk,
  AIPromptResult,
} from "../types";

export class MockSessionManager implements AISessionManager {
  private sessions = new Map<
    string,
    { config: AISessionConfig; state: string }
  >();
  private promptHandler: ((prompt: string) => string) | null = null;
  private counter = 0;

  setPromptHandler(handler: (prompt: string) => string): void {
    this.promptHandler = handler;
  }

  async createSession(config?: AISessionConfig): Promise<AISession> {
    this.counter += 1;
    const id = `mock-session-${this.counter}`;
    this.sessions.set(id, { config: config ?? {}, state: "ready" });
    return {
      id,
      state: "ready",
      config: config ?? {},
      contextUsage: null,
      createdAt: new Date().toISOString(),
    };
  }

  async sendPrompt(
    _sessionId: string,
    prompt: string,
  ): Promise<AIPromptResult> {
    const text = this.promptHandler
      ? this.promptHandler(prompt)
      : `Mock response to: ${prompt.slice(0, 100)}`;
    return {
      text,
      usage: null,
      warnings: [],
    };
  }

  async *streamPrompt(
    _sessionId: string,
    prompt: string,
  ): AsyncGenerator<AIStreamChunk> {
    const text = this.promptHandler
      ? this.promptHandler(prompt)
      : `Mock response to: ${prompt.slice(0, 100)}`;
    const words = text.split(" ");
    for (const word of words) {
      yield { text: word + " ", done: false };
    }
    yield { text: "", done: true };
  }

  abortSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.state = "idle";
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getSession(sessionId: string): AISession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    return {
      id: sessionId,
      state: session.state as import("../types").AISessionState,
      config: session.config,
      contextUsage: null,
      createdAt: new Date().toISOString(),
    };
  }

  async compactSession(_sessionId: string): Promise<void> {
    // no-op for mock
  }

  clear(): void {
    this.sessions.clear();
    this.promptHandler = null;
  }
}
