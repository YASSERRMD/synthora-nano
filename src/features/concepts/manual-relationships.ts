import { conceptGraphService } from "./graph-service";

export interface ManualRelationship {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: "related-to" | "contradicts" | "extends" | "method-of";
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = "synthora-manual-relationships";

export function loadManualRelationships(
  workspaceId: string,
): ManualRelationship[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${workspaceId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveManualRelationships(
  workspaceId: string,
  relationships: ManualRelationship[],
): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}-${workspaceId}`,
      JSON.stringify(relationships),
    );
  } catch {
    // Storage full
  }
}

export async function createManualRelationship(
  sourceId: string,
  targetId: string,
  type: ManualRelationship["relationshipType"],
  workspaceId: string,
): Promise<ManualRelationship> {
  await conceptGraphService.createManualRelationship(sourceId, targetId);

  const relationship: ManualRelationship = {
    id: crypto.randomUUID(),
    sourceConceptId: sourceId,
    targetConceptId: targetId,
    relationshipType: type,
    createdBy: "user",
    createdAt: new Date().toISOString(),
  };

  const existing = loadManualRelationships(workspaceId);
  existing.push(relationship);
  saveManualRelationships(workspaceId, existing);

  return relationship;
}

export function deleteManualRelationship(
  relationshipId: string,
  workspaceId: string,
): void {
  const existing = loadManualRelationships(workspaceId);
  const filtered = existing.filter((r) => r.id !== relationshipId);
  saveManualRelationships(workspaceId, filtered);
}

export function explainWhyConnected(
  sourceId: string,
  targetId: string,
  workspaceId: string,
): string {
  const manual = loadManualRelationships(workspaceId).filter(
    (r) =>
      (r.sourceConceptId === sourceId && r.targetConceptId === targetId) ||
      (r.sourceConceptId === targetId && r.targetConceptId === sourceId),
  );

  if (manual.length > 0) {
    const types = manual.map((r) => r.relationshipType).join(", ");
    return `Manually linked as: ${types}`;
  }

  return "Connected through shared papers in the knowledge base.";
}
