import { searchIndex, type SearchResult } from "./retrieval-index";

export interface WeightedSearchOptions {
  limit?: number;
  paperIds?: string[];
  section?: string;
  methodology?: string;
  fieldWeights?: Record<string, number>;
  diversityEnabled?: boolean;
}

const DEFAULT_FIELD_WEIGHTS: Record<string, number> = {
  title: 2.0,
  methodology: 1.5,
  findings: 1.5,
  limitations: 1.2,
  datasets: 1.0,
  metrics: 1.0,
  text: 1.0,
};

export function weightedSearch(
  query: string,
  options: WeightedSearchOptions = {},
): SearchResult[] {
  const results = searchIndex(query, {
    limit: (options.limit ?? 10) * 3,
    paperIds: options.paperIds,
    section: options.section,
    methodology: options.methodology,
  });

  const weights = { ...DEFAULT_FIELD_WEIGHTS, ...options.fieldWeights };

  const weighted = results.map((r) => {
    let adjustedScore = r.score;
    for (const field of r.matchedFields) {
      const weight = weights[field] ?? 1.0;
      adjustedScore *= weight;
    }
    return { ...r, score: adjustedScore };
  });

  weighted.sort((a, b) => b.score - a.score);

  const limited = weighted.slice(0, options.limit ?? 10);

  if (options.diversityEnabled) {
    return applyDiversity(limited);
  }

  return limited;
}

function applyDiversity(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const diversified: SearchResult[] = [];

  for (const result of results) {
    if (!seen.has(result.entry.paperId)) {
      seen.add(result.entry.paperId);
      diversified.push(result);
    }
  }

  return diversified;
}
