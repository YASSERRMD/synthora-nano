import { db } from "../../db/database";
import type { WorkspaceSnapshot } from "./export-service";

export interface ImportResult {
  success: boolean;
  workspaceId: string;
  papersImported: number;
  notesImported: number;
  conceptsImported: number;
  errors: string[];
}

export async function validateSnapshot(
  data: unknown,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Invalid snapshot format"] };
  }

  const snapshot = data as Record<string, unknown>;

  if (!snapshot["meta"] || typeof snapshot["meta"] !== "object") {
    errors.push("Missing meta section");
  } else {
    const meta = snapshot["meta"] as Record<string, unknown>;
    if (!meta["version"]) errors.push("Missing version in meta");
    if (!meta["checksum"]) errors.push("Missing checksum in meta");
    if (!meta["exportedAt"]) errors.push("Missing exportedAt in meta");
  }

  if (!snapshot["workspace"] || typeof snapshot["workspace"] !== "object") {
    errors.push("Missing workspace section");
  }

  if (!Array.isArray(snapshot["papers"])) {
    errors.push("Missing or invalid papers array");
  }

  if (!Array.isArray(snapshot["notes"])) {
    errors.push("Missing or invalid notes array");
  }

  return { valid: errors.length === 0, errors };
}

export async function importSnapshot(
  snapshot: WorkspaceSnapshot,
  strategy: "merge" | "replace" = "merge",
): Promise<ImportResult> {
  const errors: string[] = [];
  let papersImported = 0;
  let notesImported = 0;
  let conceptsImported = 0;

  try {
    if (strategy === "replace") {
      await db.workspaces.delete(snapshot.workspace.id);
    }

    const existingWorkspace = await db.workspaces.get(snapshot.workspace.id);

    if (!existingWorkspace) {
      await db.workspaces.add({
        id: snapshot.workspace.id,
        name: snapshot.workspace.name,
        createdAt: snapshot.workspace.createdAt,
        updatedAt: snapshot.workspace.updatedAt,
        schemaVersion: 1,
      });
    }

    for (const paper of snapshot.papers) {
      const existing = await db.papers.get(paper.id);
      if (!existing || strategy === "merge") {
        try {
          await db.papers.put({
            ...paper,
            workspaceId: snapshot.workspace.id,
            fileType: paper.fileType as "pdf" | "txt" | "md" | "html",
            fileHash: "",
            status: "active",
            authors: [],
            updatedAt: new Date().toISOString(),
            schemaVersion: 1,
          } as never);
          papersImported++;
        } catch (e) {
          errors.push(`Failed to import paper ${paper.id}: ${e}`);
        }
      }
    }

    for (const note of snapshot.notes) {
      try {
        await db.researchNotes.put({
          ...note,
          workspaceId: snapshot.workspace.id,
          origin: "user",
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
        } as never);
        notesImported++;
      } catch (e) {
        errors.push(`Failed to import note ${note.id}: ${e}`);
      }
    }

    for (const concept of snapshot.concepts) {
      try {
        await db.concepts.put({
          ...concept,
          workspaceId: snapshot.workspace.id,
          description: "",
          linkedNoteIds: [],
          userConfirmed: true,
          aiSuggested: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schemaVersion: 1,
        } as never);
        conceptsImported++;
      } catch (e) {
        errors.push(`Failed to import concept ${concept.id}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Import failed: ${e}`);
  }

  return {
    success: errors.length === 0,
    workspaceId: snapshot.workspace.id,
    papersImported,
    notesImported,
    conceptsImported,
    errors,
  };
}
