import type { ComparisonProject } from "../../db/schemas";

export function exportMatrixToCSV(
  project: ComparisonProject,
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  paperTitles: Map<string, string>,
): string {
  const paperIds = project.selectedPaperIds;
  const headers = [
    "Dimension",
    ...paperIds.map((id) => paperTitles.get(id) ?? id),
  ];

  const rows = matrix.map((row) => {
    const values = paperIds.map((id) => row.values[id] ?? "Not identified");
    return [row.dimension, ...values];
  });

  const csvRows = [headers, ...rows];
  return csvRows.map((row) => row.map(escapeCSV).join(",")).join("\n");
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportMatrixToMarkdown(
  project: ComparisonProject,
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  paperTitles: Map<string, string>,
): string {
  const paperIds = project.selectedPaperIds;
  const headers = [
    "Dimension",
    ...paperIds.map((id) => paperTitles.get(id) ?? id),
  ];
  const separator = headers.map(() => "---");

  const rows = matrix.map((row) => {
    const values = paperIds.map((id) => row.values[id] ?? "Not identified");
    return [row.dimension, ...values];
  });

  const mdRows = [headers, separator, ...rows];
  return mdRows.map((row) => `| ${row.join(" | ")} |`).join("\n");
}
