import {
  exportMatrixToCSV,
  exportMatrixToMarkdown,
} from "../comparison/export-matrix";
import type { ComparisonProject } from "../../db/schemas";

export function exportComparisonAsCSV(
  project: ComparisonProject,
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  paperTitles: Map<string, string>,
): string {
  return exportMatrixToCSV(project, matrix, paperTitles);
}

export function exportComparisonAsMarkdown(
  project: ComparisonProject,
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  paperTitles: Map<string, string>,
): string {
  return exportMatrixToMarkdown(project, matrix, paperTitles);
}

export function generateResearchBrief(
  paperTitles: string[],
  methodology: string[],
  findings: string[],
  limitations: string[],
): string {
  let brief = "# Research Brief\n\n";

  brief += "## Papers Reviewed\n\n";
  for (const title of paperTitles) {
    brief += `- ${title}\n`;
  }

  brief += "\n## Methodologies\n\n";
  for (const m of methodology) {
    brief += `- ${m}\n`;
  }

  brief += "\n## Key Findings\n\n";
  for (const f of findings) {
    brief += `- ${f}\n`;
  }

  brief += "\n## Limitations\n\n";
  for (const l of limitations) {
    brief += `- ${l}\n`;
  }

  return brief;
}
