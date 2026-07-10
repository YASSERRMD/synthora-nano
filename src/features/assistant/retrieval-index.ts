export interface IndexEntry {
  id: string;
  paperId: string;
  chunkId?: string;
  title: string;
  text: string;
  section?: string;
  methodology?: string;
  findings?: string[];
  limitations?: string[];
  datasets?: string[];
  metrics?: string[];
}

export interface SearchResult {
  entry: IndexEntry;
  score: number;
  matchedFields: string[];
}

const index = new Map<string, IndexEntry>();

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function buildIndex(entries: IndexEntry[]): void {
  index.clear();
  for (const entry of entries) {
    index.set(entry.id, entry);
  }
}

export function searchIndex(
  query: string,
  options: {
    limit?: number;
    paperIds?: string[];
    section?: string;
    methodology?: string;
  } = {},
): SearchResult[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const { limit = 10, paperIds, section, methodology } = options;

  const results: SearchResult[] = [];

  for (const entry of index.values()) {
    if (paperIds && !paperIds.includes(entry.paperId)) continue;
    if (section && entry.section !== section) continue;
    if (methodology && entry.methodology !== methodology) continue;

    const entryTokens = new Set(tokenize(entry.text + " " + entry.title));
    const matchedFields: string[] = [];
    let score = 0;

    for (const token of queryTokens) {
      if (entryTokens.has(token)) {
        score += 1;
        matchedFields.push(token);
      }
    }

    if (score > 0) {
      results.push({
        entry,
        score: score / queryTokens.length,
        matchedFields: [...new Set(matchedFields)],
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function getIndexSize(): number {
  return index.size;
}

export function clearIndex(): void {
  index.clear();
}
