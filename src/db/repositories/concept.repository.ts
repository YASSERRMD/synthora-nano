import { db } from "../database";
import type { Concept } from "../schemas";
import { DatabaseError, NotFoundError } from "../../types/errors";

export interface CreateConceptData {
  workspaceId: string;
  canonicalName: string;
  aliases?: string[];
  description?: string;
  linkedPaperIds?: string[];
  linkedNoteIds?: string[];
  userConfirmed: boolean;
  aiSuggested: boolean;
}

export const conceptRepository = {
  async create(data: CreateConceptData): Promise<Concept> {
    try {
      const now = new Date().toISOString();
      const concept: Concept = {
        id: crypto.randomUUID(),
        ...data,
        aliases: data.aliases ?? [],
        description: data.description ?? "",
        linkedPaperIds: data.linkedPaperIds ?? [],
        linkedNoteIds: data.linkedNoteIds ?? [],
        createdAt: now,
        updatedAt: now,
        schemaVersion: 1,
      };

      const id = await db.concepts.add(concept);
      return { ...concept, id };
    } catch (error) {
      throw new DatabaseError(`Failed to create concept: ${error}`);
    }
  },

  async getById(id: string): Promise<Concept> {
    const concept = await db.concepts.get(id);
    if (!concept) throw new NotFoundError("Concept");
    return concept;
  },

  async getByWorkspaceId(workspaceId: string): Promise<Concept[]> {
    return db.concepts.where("workspaceId").equals(workspaceId).toArray();
  },

  async getConfirmed(workspaceId: string): Promise<Concept[]> {
    return db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .filter((c) => c.userConfirmed)
      .toArray();
  },

  async getSuggested(workspaceId: string): Promise<Concept[]> {
    return db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .filter((c) => c.aiSuggested && !c.userConfirmed)
      .toArray();
  },

  async update(
    id: string,
    data: Partial<Omit<Concept, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<Concept> {
    const existing = await this.getById(id);
    const updated: Concept = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.concepts.put(updated);
    return updated;
  },

  async merge(sourceId: string, targetId: string): Promise<Concept> {
    const source = await this.getById(sourceId);
    const target = await this.getById(targetId);

    const mergedAliases = [
      ...new Set([
        ...(target.aliases ?? []),
        target.canonicalName,
        ...(source.aliases ?? []),
        source.canonicalName,
      ]),
    ];

    const mergedPaperIds = [
      ...new Set([
        ...(source.linkedPaperIds ?? []),
        ...(target.linkedPaperIds ?? []),
      ]),
    ];

    const mergedNoteIds = [
      ...new Set([
        ...(source.linkedNoteIds ?? []),
        ...(target.linkedNoteIds ?? []),
      ]),
    ];

    const updated = await this.update(targetId, {
      canonicalName: target.canonicalName,
      aliases: mergedAliases,
      description: target.description || source.description,
      linkedPaperIds: mergedPaperIds,
      linkedNoteIds: mergedNoteIds,
    });

    await db.concepts.delete(sourceId);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await db.concepts.delete(id);
  },

  async search(workspaceId: string, query: string): Promise<Concept[]> {
    const lower = query.toLowerCase();
    return db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .filter(
        (c) =>
          c.canonicalName.toLowerCase().includes(lower) ||
          (c.aliases ?? []).some((a) => a.toLowerCase().includes(lower)),
      )
      .toArray();
  },

  async getByPaperId(paperId: string): Promise<Concept[]> {
    return db.concepts
      .filter((c) => (c.linkedPaperIds ?? []).includes(paperId))
      .toArray();
  },

  async linkPaper(conceptId: string, paperId: string): Promise<Concept> {
    const concept = await this.getById(conceptId);
    const paperIds = new Set(concept.linkedPaperIds ?? []);
    paperIds.add(paperId);
    return this.update(conceptId, {
      linkedPaperIds: Array.from(paperIds),
    });
  },

  async unlinkPaper(conceptId: string, paperId: string): Promise<Concept> {
    const concept = await this.getById(conceptId);
    const paperIds = (concept.linkedPaperIds ?? []).filter(
      (id) => id !== paperId,
    );
    return this.update(conceptId, { linkedPaperIds: paperIds });
  },

  async linkNote(conceptId: string, noteId: string): Promise<Concept> {
    const concept = await this.getById(conceptId);
    const noteIds = new Set(concept.linkedNoteIds ?? []);
    noteIds.add(noteId);
    return this.update(conceptId, {
      linkedNoteIds: Array.from(noteIds),
    });
  },

  async unlinkNote(conceptId: string, noteId: string): Promise<Concept> {
    const concept = await this.getById(conceptId);
    const noteIds = (concept.linkedNoteIds ?? []).filter((id) => id !== noteId);
    return this.update(conceptId, { linkedNoteIds: noteIds });
  },
};
