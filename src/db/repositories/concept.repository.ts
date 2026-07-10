import { db } from "../database";
import type { Concept } from "../schemas";
import { DatabaseError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const conceptRepository = {
  async create(
    data: Omit<Concept, "id" | "createdAt" | "updatedAt" | "schemaVersion">,
  ): Promise<Concept> {
    const concept: Concept = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.concepts.add(concept);
      return concept;
    } catch (error) {
      throw new DatabaseError("Failed to create concept", { cause: error });
    }
  },

  async getById(id: string): Promise<Concept | undefined> {
    return db.concepts.get(id);
  },

  async getByWorkspaceId(workspaceId: string): Promise<Concept[]> {
    return db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("canonicalName");
  },

  async update(
    id: string,
    data: Partial<Omit<Concept, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<Concept> {
    const existing = await db.concepts.get(id);
    if (!existing) {
      throw new DatabaseError("Concept not found");
    }

    const updated: Concept = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    try {
      await db.concepts.update(id, updated);
      return updated;
    } catch (error) {
      throw new DatabaseError("Failed to update concept", { cause: error });
    }
  },

  async confirm(id: string): Promise<Concept> {
    return this.update(id, { userConfirmed: true, aiSuggested: false });
  },

  async delete(id: string): Promise<void> {
    await db.concepts.delete(id);
  },

  async findByName(
    workspaceId: string,
    name: string,
  ): Promise<Concept | undefined> {
    const lowerName = name.toLowerCase();
    return db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .and(
        (c) =>
          c.canonicalName.toLowerCase() === lowerName ||
          (c.aliases !== undefined &&
            c.aliases.some((a) => a.toLowerCase() === lowerName)),
      )
      .first();
  },

  async merge(sourceId: string, targetId: string): Promise<Concept> {
    const source = await db.concepts.get(sourceId);
    const target = await db.concepts.get(targetId);

    if (!source || !target) {
      throw new DatabaseError("Both concepts must exist for merge");
    }

    const merged: Concept = {
      ...target,
      aliases: [
        ...(target.aliases ?? []),
        source.canonicalName,
        ...(source.aliases ?? []),
      ],
      linkedPaperIds: [
        ...new Set([
          ...(target.linkedPaperIds ?? []),
          ...(source.linkedPaperIds ?? []),
        ]),
      ],
      linkedNoteIds: [
        ...new Set([
          ...(target.linkedNoteIds ?? []),
          ...(source.linkedNoteIds ?? []),
        ]),
      ],
      userConfirmed: target.userConfirmed || source.userConfirmed,
      updatedAt: now(),
    };

    await db.transaction("rw", [db.concepts], async () => {
      await db.concepts.update(targetId, merged);
      await db.concepts.delete(sourceId);
    });

    return merged;
  },
};
