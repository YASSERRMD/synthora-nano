import { db } from "../../db/database";
import type { ResearchNote } from "../../db/schemas";
import { DatabaseError, NotFoundError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const notesService = {
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

  async getById(id: string): Promise<ResearchNote> {
    const note = await db.researchNotes.get(id);
    if (!note) throw new NotFoundError("Note");
    return note;
  },

  async getByWorkspaceId(workspaceId: string): Promise<ResearchNote[]> {
    return db.researchNotes
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("createdAt");
  },

  async getByPaperId(paperId: string): Promise<ResearchNote[]> {
    return db.researchNotes
      .where("paperId")
      .equals(paperId)
      .sortBy("createdAt");
  },

  async update(
    id: string,
    data: Partial<Omit<ResearchNote, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<ResearchNote> {
    const existing = await this.getById(id);
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
          n.title?.toLowerCase().includes(lowerQuery) ||
          n.body.toLowerCase().includes(lowerQuery) ||
          (n.tags?.some((t) => t.toLowerCase().includes(lowerQuery)) ?? false),
      )
      .toArray();
  },
};
