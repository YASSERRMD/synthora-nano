import type { SearchResult } from "./retrieval-index";

export interface ContextBudget {
  maxTokens: number;
  usedTokens: number;
  remainingTokens: number;
}

export interface PackedContext {
  results: SearchResult[];
  budget: ContextBudget;
  truncated: boolean;
}

const CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function packContext(
  results: SearchResult[],
  maxTokens: number = 8000,
): PackedContext {
  let usedTokens = 0;
  const packed: SearchResult[] = [];
  let truncated = false;

  for (const result of results) {
    const resultTokens = estimateTokens(result.entry.text);
    if (usedTokens + resultTokens <= maxTokens) {
      packed.push(result);
      usedTokens += resultTokens;
    } else {
      truncated = true;
      break;
    }
  }

  return {
    results: packed,
    budget: {
      maxTokens,
      usedTokens,
      remainingTokens: maxTokens - usedTokens,
    },
    truncated,
  };
}

export function getContextUsage(packed: PackedContext): {
  percentage: number;
  status: "ok" | "warning" | "critical";
} {
  const percentage = (packed.budget.usedTokens / packed.budget.maxTokens) * 100;

  let status: "ok" | "warning" | "critical" = "ok";
  if (percentage > 90) status = "critical";
  else if (percentage > 75) status = "warning";

  return { percentage, status };
}
