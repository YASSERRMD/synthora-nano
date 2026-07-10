import type { ComparisonDimension } from "../../db/schemas";

export interface EditableCell {
  projectId: string;
  paperId: string;
  dimensionId: string;
  originalValue: string;
  editedValue: string;
  editedAt: string;
}

const STORAGE_PREFIX = "synthora-comparison-edit-";

function getStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}`;
}

export function saveCellEdit(projectId: string, edit: EditableCell): void {
  try {
    const key = getStorageKey(projectId);
    const stored = localStorage.getItem(key);
    const edits: EditableCell[] = stored ? JSON.parse(stored) : [];
    const filtered = edits.filter(
      (e) =>
        !(e.paperId === edit.paperId && e.dimensionId === edit.dimensionId),
    );
    filtered.push(edit);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // Storage full
  }
}

export function loadCellEdits(projectId: string): EditableCell[] {
  try {
    const stored = localStorage.getItem(getStorageKey(projectId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearCellEdits(projectId: string): void {
  try {
    localStorage.removeItem(getStorageKey(projectId));
  } catch {
    // ignore
  }
}

export function applyEditsToMatrix(
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  edits: EditableCell[],
  dimensions: ComparisonDimension[],
): Array<{ dimension: string; values: Record<string, string> }> {
  const result = matrix.map((row) => ({
    ...row,
    values: { ...row.values },
  }));

  for (const edit of edits) {
    const dim = dimensions.find((d) => d.id === edit.dimensionId);
    if (!dim) continue;

    const row = result.find((r) => r.dimension === dim.name);
    if (row) {
      row.values[edit.paperId] = edit.editedValue;
    }
  }

  return result;
}
