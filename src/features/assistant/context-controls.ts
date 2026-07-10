import { getContextUsage, type PackedContext } from "./context-budget";

export interface CompactionSuggestion {
  type: "truncate" | "summarize" | "remove-low-score";
  description: string;
  estimatedTokensSaved: number;
}

export function suggestCompactions(
  packed: PackedContext,
): CompactionSuggestion[] {
  const suggestions: CompactionSuggestion[] = [];
  const usage = getContextUsage(packed);

  if (usage.status === "critical") {
    const excess = packed.budget.usedTokens - packed.budget.maxTokens * 0.8;
    suggestions.push({
      type: "remove-low-score",
      description: "Remove lowest-scoring results to fit within budget",
      estimatedTokensSaved: Math.max(0, excess),
    });
  }

  if (usage.status !== "ok") {
    suggestions.push({
      type: "summarize",
      description: "Summarize long text passages to reduce token usage",
      estimatedTokensSaved: Math.floor(packed.budget.usedTokens * 0.3),
    });
  }

  if (packed.results.length > 3) {
    suggestions.push({
      type: "truncate",
      description: "Keep only top 3 results for focused context",
      estimatedTokensSaved: packed.results
        .slice(3)
        .reduce((sum, r) => sum + r.entry.text.length / 4, 0),
    });
  }

  return suggestions;
}

export function applyCompaction(
  packed: PackedContext,
  suggestion: CompactionSuggestion,
): PackedContext {
  switch (suggestion.type) {
    case "remove-low-score": {
      const sorted = [...packed.results].sort((a, b) => a.score - b.score);
      const toRemove = Math.ceil(sorted.length * 0.3);
      const remaining = sorted.slice(toRemove);
      return {
        ...packed,
        results: remaining,
        budget: {
          ...packed.budget,
          usedTokens: remaining.reduce(
            (sum, r) => sum + r.entry.text.length / 4,
            0,
          ),
          remainingTokens:
            packed.budget.maxTokens -
            remaining.reduce((sum, r) => sum + r.entry.text.length / 4, 0),
        },
        truncated: true,
      };
    }
    case "truncate": {
      const top3 = packed.results.slice(0, 3);
      return {
        ...packed,
        results: top3,
        budget: {
          ...packed.budget,
          usedTokens: top3.reduce((sum, r) => sum + r.entry.text.length / 4, 0),
          remainingTokens:
            packed.budget.maxTokens -
            top3.reduce((sum, r) => sum + r.entry.text.length / 4, 0),
        },
        truncated: true,
      };
    }
    default:
      return packed;
  }
}
