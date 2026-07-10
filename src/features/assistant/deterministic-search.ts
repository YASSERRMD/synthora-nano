import { weightedSearch, type WeightedSearchOptions } from "./weighted-search";
import { packContext, type PackedContext } from "./context-budget";
import type { SearchResult } from "./retrieval-index";

export interface DeterministicResult {
  query: string;
  results: SearchResult[];
  packed: PackedContext;
  answer: string;
}

export function deterministicSearch(
  query: string,
  options: WeightedSearchOptions = {},
): DeterministicResult {
  const results = weightedSearch(query, {
    ...options,
    limit: options.limit ?? 5,
  });
  const packed = packContext(results);

  const answer =
    results.length > 0
      ? results
          .map(
            (r, i) =>
              `${i + 1}. ${r.entry.title} (score: ${r.score.toFixed(2)})`,
          )
          .join("\n")
      : "No relevant results found.";

  return { query, results, packed, answer };
}

export function getSearchSummary(result: DeterministicResult): string {
  if (result.results.length === 0) {
    return `No results for "${result.query}"`;
  }
  return `${result.results.length} results found for "${result.query}" (${result.packed.budget.usedTokens} tokens)`;
}
