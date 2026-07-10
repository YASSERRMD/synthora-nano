import { db } from "../database";
import type { ResearchNote } from "../schemas";
import { DatabaseError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const noteRepository = {
  async create(
    data: Omit<
      ResearchNote,
      "id" | "createdAt" | "updatedAt" | "schemaVersion"
    >,
  ): Promise<ResearchNote> {
    const note: ResearchNote = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.researchNotes.add(note);
      return note;
    } catch (error) {
      throw new DatabaseError("Failed to create note", { cause: error });
    }
  },

  async getById(id: string): Promise<ResearchNote | undefined> {
    return db.researchNotes.get(id);
  },

  async getByWorkspaceId(workspaceId: string): Promise<ResearchNote[]> {
    return db.researchNotes
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("updatedAt");
  },

  async getByPaperId(paperId: string): Promise<ResearchNote[]> {
    return db.researchNotes
      .where("paperId")
      .equals(paperId)
      .sortBy("updatedAt");
  },

  async update(
    id: string,
    data: Partial<Omit<ResearchNote, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<ResearchNote> {
    const existing = await db.researchNotes.get(id);
    if (!existing) {
      throw new DatabaseError("Note not found");
    }

    const updated: ResearchNote = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    try {
      await db.researchNotes.update(id, updated);
      return updated;
    } catch (error) {
      throw new DatabaseError("Failed to update note", { cause: error });
    }
  },

  async delete(id: string): Promise<void> {
    await db.researchNotes.delete(id);
  },

  async search(workspaceId: string, query: string): Promise<ResearchNote[]> {
    const lowerQuery = query.toLowerCase();
    return db.researchNotes
      .where("workspaceId")
      .equals(workspaceId)
      .and(
        (n) =>
          (n.title !== undefined &&
            n.title.toLowerCase().includes(lowerQuery)) ||
          n.body.toLowerCase().includes(lowerQuery) ||
          (n.tags !== undefined &&
            n.tags.some((t) => t.toLowerCase().includes(lowerQuery))),
      )
      .toArray();
  },
};
