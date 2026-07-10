import type { ComparisonProject } from "../../db/schemas";
import type { ComparisonMatrixRow } from "./comparison-service";
import { comparisonService } from "./comparison-service";
import {
  identifyAgreements,
  identifyContradictions,
  identifyResearchGaps,
} from "./comparison-analysis";
import { exportMatrixToCSV, exportMatrixToMarkdown } from "./export-matrix";

export interface ComparisonResult {
  project: ComparisonProject;
  matrix: ComparisonMatrixRow[];
  agreements: ReturnType<typeof identifyAgreements>;
  contradictions: ReturnType<typeof identifyContradictions>;
  gaps: ReturnType<typeof identifyResearchGaps>;
}

export async function runFullComparison(
  projectId: string,
): Promise<ComparisonResult> {
  const project = await comparisonService.getById(projectId);
  const matrix = await comparisonService.generateMatrix(projectId);

  const agreements = identifyAgreements(matrix);
  const contradictions = identifyContradictions(matrix);
  const gaps = identifyResearchGaps(matrix);

  return { project, matrix, agreements, contradictions, gaps };
}

export function exportComparison(
  project: ComparisonProject,
  matrix: ComparisonMatrixRow[],
  paperTitles: Map<string, string>,
  format: "csv" | "markdown",
): string {
  return format === "csv"
    ? exportMatrixToCSV(project, matrix, paperTitles)
    : exportMatrixToMarkdown(project, matrix, paperTitles);
}
