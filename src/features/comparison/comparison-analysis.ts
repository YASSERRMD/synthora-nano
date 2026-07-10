import type { ComparisonMatrixRow } from "./comparison-service";

export interface AgreementsResult {
  agreements: Array<{
    dimension: string;
    papers: string[];
    evidence: string;
  }>;
}

export interface ContradictionsResult {
  contradictions: Array<{
    dimension: string;
    paper1: string;
    paper2: string;
    evidence: string;
  }>;
}

export interface ResearchGapsResult {
  gaps: Array<{
    dimension: string;
    description: string;
    uncertainty: "high" | "medium" | "low";
  }>;
}

export function identifyAgreements(
  rows: ComparisonMatrixRow[],
): AgreementsResult {
  const agreements: AgreementsResult["agreements"] = [];

  for (const row of rows) {
    const uniqueValues = new Set(
      Object.values(row.values).filter((v) => v !== "Not identified"),
    );
    if (uniqueValues.size === 1 && uniqueValues.size > 0) {
      agreements.push({
        dimension: row.dimension,
        papers: Object.keys(row.values),
        evidence: Array.from(uniqueValues)[0] ?? "",
      });
    }
  }

  return { agreements };
}

export function identifyContradictions(
  rows: ComparisonMatrixRow[],
): ContradictionsResult {
  const contradictions: ContradictionsResult["contradictions"] = [];

  for (const row of rows) {
    const entries = Object.entries(row.values).filter(
      ([, v]) => v !== "Not identified",
    );
    const uniqueValues = new Set(entries.map(([, v]) => v));

    if (uniqueValues.size > 1) {
      const paperIds = entries.map(([k]) => k);
      if (paperIds.length >= 2) {
        contradictions.push({
          dimension: row.dimension,
          paper1: paperIds[0]!,
          paper2: paperIds[1]!,
          evidence: `Different approaches: ${Array.from(uniqueValues).join(" vs ")}`,
        });
      }
    }
  }

  return { contradictions };
}

export function identifyResearchGaps(
  rows: ComparisonMatrixRow[],
): ResearchGapsResult {
  const gaps: ResearchGapsResult["gaps"] = [];

  for (const row of rows) {
    const notIdentifiedCount = Object.values(row.values).filter(
      (v) => v === "Not identified",
    ).length;
    const totalCount = Object.values(row.values).length;

    if (totalCount > 0 && notIdentifiedCount / totalCount > 0.5) {
      gaps.push({
        dimension: row.dimension,
        description: `Potential gap: ${notIdentifiedCount} of ${totalCount} papers did not address ${row.dimension.toLowerCase()}.`,
        uncertainty: "medium",
      });
    }
  }

  return { gaps };
}

export function generateChronologicalView(
  papers: Array<{ id: string; title: string; publicationYear?: number }>,
): Array<{ year: number; papers: Array<{ id: string; title: string }> }> {
  const yearMap = new Map<number, Array<{ id: string; title: string }>>();

  for (const paper of papers) {
    const year = paper.publicationYear ?? 0;
    const existing = yearMap.get(year) ?? [];
    existing.push({ id: paper.id, title: paper.title });
    yearMap.set(year, existing);
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, yearPapers]) => ({ year, papers: yearPapers }));
}
