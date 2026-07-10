import type { AIContextUsage } from "../types";
import { AIContextOverflowError } from "../errors";

export class ContextMonitor {
  private usageHistory: AIContextUsage[] = [];
  private readonly overflowThreshold: number;

  constructor(options?: { overflowThreshold?: number }) {
    this.overflowThreshold = options?.overflowThreshold ?? 0.9;
  }

  trackUsage(usage: AIContextUsage): void {
    this.usageHistory.push(usage);
  }

  getCurrentUsage(): AIContextUsage | null {
    return this.usageHistory.length > 0
      ? this.usageHistory[this.usageHistory.length - 1]!
      : null;
  }

  isNearOverflow(): boolean {
    const usage = this.getCurrentUsage();
    return usage ? usage.usageRatio >= this.overflowThreshold : false;
  }

  wouldOverflow(addedTokens: number): boolean {
    const usage = this.getCurrentUsage();
    if (!usage) return false;
    return usage.tokensUsed + addedTokens > usage.maxTokens;
  }

  checkOverflow(addedTokens: number): void {
    if (this.wouldOverflow(addedTokens)) {
      const usage = this.getCurrentUsage();
      const overflow = usage
        ? usage.tokensUsed + addedTokens - usage.maxTokens
        : addedTokens;
      throw new AIContextOverflowError(
        `Context overflow by ~${overflow} tokens`,
        overflow,
      );
    }
  }

  suggestCompactionPoint(): number {
    if (this.usageHistory.length <= 2) return 0;
    const targetTokens = Math.floor(
      (this.usageHistory[0]?.maxTokens ?? 0) * 0.5,
    );

    let tokensUsed = 0;
    for (let i = 0; i < this.usageHistory.length; i++) {
      const usage = this.usageHistory[i];
      if (usage) tokensUsed = usage.tokensUsed;
      if (tokensUsed <= targetTokens) return i + 1;
    }
    return Math.floor(this.usageHistory.length / 2);
  }

  reset(): void {
    this.usageHistory = [];
  }

  getUsageHistory(): readonly AIContextUsage[] {
    return this.usageHistory;
  }
}
