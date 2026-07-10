import type { ComparisonProject } from "../../db/schemas";

export interface MatrixCell {
  paperId: string;
  dimensionId: string;
  value: string;
  isEdited: boolean;
  isUserAdded: boolean;
}

export interface AnnotatedMatrix {
  cells: MatrixCell[];
  annotations: MatrixAnnotation[];
  sourceReferences: string[];
}

export interface MatrixAnnotation {
  id: string;
  cellKey: string;
  text: string;
  author: string;
  createdAt: string;
}

const ANNOTATIONS_PREFIX = "synthora-annotations-";

export function saveAnnotations(
  projectId: string,
  annotations: MatrixAnnotation[],
): void {
  try {
    localStorage.setItem(
      `${ANNOTATIONS_PREFIX}${projectId}`,
      JSON.stringify(annotations),
    );
  } catch {
    // Storage full
  }
}

export function loadAnnotations(projectId: string): MatrixAnnotation[] {
  try {
    const stored = localStorage.getItem(`${ANNOTATIONS_PREFIX}${projectId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addAnnotation(
  projectId: string,
  cellKey: string,
  text: string,
  author: string = "user",
): MatrixAnnotation[] {
  const existing = loadAnnotations(projectId);
  const annotation: MatrixAnnotation = {
    id: crypto.randomUUID(),
    cellKey,
    text,
    author,
    createdAt: new Date().toISOString(),
  };
  existing.push(annotation);
  saveAnnotations(projectId, existing);
  return existing;
}

export function removeAnnotation(
  projectId: string,
  annotationId: string,
): MatrixAnnotation[] {
  const existing = loadAnnotations(projectId);
  const filtered = existing.filter((a) => a.id !== annotationId);
  saveAnnotations(projectId, filtered);
  return filtered;
}

export function buildAnnotatedMatrix(
  project: ComparisonProject,
  matrix: Array<{ dimension: string; values: Record<string, string> }>,
  annotations: MatrixAnnotation[],
): AnnotatedMatrix {
  const cells: MatrixCell[] = [];

  for (const row of matrix) {
    const dim = project.dimensions.find((d) => d.name === row.dimension);
    for (const [paperId, value] of Object.entries(row.values)) {
      cells.push({
        paperId,
        dimensionId: dim?.id ?? "",
        value,
        isEdited: false,
        isUserAdded: false,
      });
    }
  }

  return {
    cells,
    annotations,
    sourceReferences: project.sourceReferences ?? [],
  };
}
