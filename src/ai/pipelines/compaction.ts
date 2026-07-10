import { ContextMonitor } from "../adapters/context-monitor";
import type { AISessionManager } from "../types";

export interface CompactionResult {
  messagesRetained: number;
  messagesDropped: number;
  tokensSaved: number;
}

export class SessionCompactor {
  private contextMonitor: ContextMonitor;
  private sessionManager: AISessionManager;

  constructor(
    sessionManager: AISessionManager,
    contextMonitor: ContextMonitor,
  ) {
    this.sessionManager = sessionManager;
    this.contextMonitor = contextMonitor;
  }

  shouldCompact(): boolean {
    return this.contextMonitor.isNearOverflow();
  }

  async compact(sessionId: string): Promise<CompactionResult> {
    const compactionPoint = this.contextMonitor.suggestCompactionPoint();
    const history = this.contextMonitor.getUsageHistory();
    const messagesDropped = compactionPoint;
    const messagesRetained = history.length - compactionPoint;
    const tokensSaved = messagesDropped * 500;

    await this.sessionManager.compactSession(sessionId);
    this.contextMonitor.reset();

    return {
      messagesRetained,
      messagesDropped,
      tokensSaved,
    };
  }
}
