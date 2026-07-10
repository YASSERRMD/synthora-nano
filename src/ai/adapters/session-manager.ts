import type {
  AISession,
  AISessionConfig,
  AISessionManager,
  AIStreamChunk,
  AIPromptResult,
} from "../types";
import {
  AIUnsupportedError,
  AISessionCreationError,
  AIPromptError,
  AIAbortError,
} from "../errors";

let sessionCounter = 0;

function generateSessionId(): string {
  sessionCounter += 1;
  return `ai-session-${sessionCounter}-${Date.now()}`;
}

export class SessionManager implements AISessionManager {
  private sessions = new Map<string, AISession & { modelSession: unknown }>();

  async createSession(config?: AISessionConfig): Promise<AISession> {
    if (!window.LanguageModel) {
      throw new AIUnsupportedError();
    }

    const sessionConfig: Record<string, unknown> = {};
    if (config?.systemPrompt) {
      sessionConfig["systemPrompt"] = config.systemPrompt;
    }
    if (config?.temperature !== undefined) {
      sessionConfig["temperature"] = config.temperature;
    }
    if (config?.topK !== undefined) {
      sessionConfig["topK"] = config.topK;
    }
    if (config?.topP !== undefined) {
      sessionConfig["topP"] = config.topP;
    }

    let modelSession: unknown;
    try {
      modelSession = await window.LanguageModel.createSession(sessionConfig);
    } catch (err) {
      throw new AISessionCreationError(
        `Session creation failed: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }

    const session: AISession & { modelSession: unknown } = {
      id: generateSessionId(),
      state: "ready",
      config: config ?? {},
      contextUsage: null,
      createdAt: new Date().toISOString(),
      modelSession,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async sendPrompt(sessionId: string, prompt: string): Promise<AIPromptResult> {
    const session = this.getSessionInternal(sessionId);

    if (session.state !== "ready") {
      throw new AIPromptError(
        `Cannot prompt session in state: ${session.state}`,
      );
    }

    session.state = "streaming";
    const warnings: string[] = [];

    try {
      const langModel = session.modelSession as {
        prompt: (input: string) => Promise<string>;
        promptStreaming?: (input: string) => AsyncIterable<string>;
      };

      let text: string;
      if (langModel.prompt) {
        text = await langModel.prompt(prompt);
      } else {
        throw new AIPromptError("Session does not support prompt method");
      }

      session.state = "ready";
      return {
        text,
        usage: session.contextUsage,
        warnings,
      };
    } catch (err) {
      session.state = "error";
      if (err instanceof AIAbortError) throw err;
      throw new AIPromptError(
        `Prompt failed: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  async *streamPrompt(
    sessionId: string,
    prompt: string,
  ): AsyncGenerator<AIStreamChunk> {
    const session = this.getSessionInternal(sessionId);

    if (session.state !== "ready") {
      throw new AIPromptError(
        `Cannot prompt session in state: ${session.state}`,
      );
    }

    session.state = "streaming";

    const langModel = session.modelSession as {
      promptStreaming?: (input: string) => AsyncIterable<string>;
    };

    if (!langModel.promptStreaming) {
      const fullResult = await this.sendPrompt(sessionId, prompt);
      yield {
        text: fullResult.text,
        done: true,
        usage: fullResult.usage ?? undefined,
      };
      return;
    }

    try {
      const stream = langModel.promptStreaming(prompt);
      for await (const chunk of stream) {
        yield { text: chunk, done: false };
      }
      yield { text: "", done: true, usage: session.contextUsage ?? undefined };
    } catch (err) {
      session.state = "error";
      if (err instanceof Error && err.name === "AbortError") {
        throw new AIAbortError();
      }
      throw new AIPromptError(
        `Stream failed: ${err instanceof Error ? err.message : "unknown"}`,
      );
    } finally {
      if (session.state === "streaming") {
        session.state = "ready";
      }
    }
  }

  abortSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = "idle";
      if (session.config.abortSignal) {
        session.config.abortSignal.dispatchEvent(new Event("abort"));
      }
    }
  }

  destroySession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.state = "destroyed";
      this.sessions.delete(sessionId);
    }
  }

  getSession(sessionId: string): AISession | undefined {
    const full = this.sessions.get(sessionId);
    if (!full) return undefined;
    const { modelSession: _, ...sessionData } = full;
    return sessionData;
  }

  async compactSession(sessionId: string): Promise<void> {
    const session = this.getSessionInternal(sessionId);
    session.state = "compacting";
    session.contextUsage = null;
    session.state = "ready";
  }

  destroyAllSessions(): void {
    for (const id of this.sessions.keys()) {
      this.destroySession(id);
    }
  }

  private getSessionInternal(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new AIPromptError(`Session not found: ${sessionId}`);
    }
    if (session.state === "destroyed") {
      throw new AIPromptError(`Session has been destroyed: ${sessionId}`);
    }
    return session;
  }
}
