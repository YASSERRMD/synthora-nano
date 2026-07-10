import type { PaperAnalysis } from "../../db/schemas";

export interface ExtractedConcept {
  name: string;
  source: "methodology" | "finding" | "limitation" | "dataset" | "metric";
  confidence: number;
}

const COMMON_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "need",
  "dare",
  "ought",
  "used",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "don",
  "now",
  "this",
  "that",
  "these",
  "those",
  "and",
  "but",
  "or",
  "if",
  "while",
  "also",
  "which",
  "who",
  "whom",
  "its",
  "it",
  "we",
  "our",
  "their",
  "they",
  "them",
  "about",
  "up",
  "down",
  "well",
  "however",
  "although",
  "though",
  "since",
  "because",
  "therefore",
  "furthermore",
  "moreover",
  "additionally",
  "using",
  "based",
  "show",
  "shows",
  "shown",
  "propose",
  "proposed",
  "present",
  "presented",
  "results",
  "result",
  "approach",
  "method",
  "methods",
  "model",
  "study",
  "paper",
  "work",
  "research",
  "data",
  "analysis",
]);

export function extractConcepts(analysis: PaperAnalysis): ExtractedConcept[] {
  const concepts: ExtractedConcept[] = [];
  const seen = new Set<string>();

  function addConcepts(
    items: string[] | undefined,
    source: ExtractedConcept["source"],
    baseConfidence: number,
  ): void {
    if (!items) return;
    for (const item of items) {
      const cleaned = cleanTerm(item);
      if (cleaned && !seen.has(cleaned.toLowerCase())) {
        seen.add(cleaned.toLowerCase());
        concepts.push({
          name: cleaned,
          source,
          confidence: baseConfidence,
        });
      }
    }
  }

  addConcepts(
    analysis.methodology ? [analysis.methodology] : [],
    "methodology",
    0.9,
  );
  addConcepts(analysis.datasets, "dataset", 0.85);
  addConcepts(analysis.metrics, "metric", 0.8);
  addConcepts(analysis.majorFindings, "finding", 0.7);
  addConcepts(analysis.limitations, "limitation", 0.6);

  return concepts;
}

function cleanTerm(term: string): string {
  const cleaned = term
    .trim()
    .replace(/^[,;.\s]+/, "")
    .replace(/[,;.\s]+$/, "");

  if (cleaned.length < 3 || cleaned.length > 200) return "";
  if (COMMON_WORDS.has(cleaned.toLowerCase())) return "";

  return cleaned;
}

export function rankConcepts(concepts: ExtractedConcept[]): ExtractedConcept[] {
  return [...concepts].sort((a, b) => b.confidence - a.confidence);
}

export function deduplicateConcepts(
  concepts: ExtractedConcept[],
): ExtractedConcept[] {
  const byName = new Map<string, ExtractedConcept>();

  for (const concept of concepts) {
    const key = concept.name.toLowerCase();
    const existing = byName.get(key);
    if (!existing || concept.confidence > existing.confidence) {
      byName.set(key, concept);
    }
  }

  return Array.from(byName.values());
}
