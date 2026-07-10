import { db } from "../database";
import type { Workspace } from "../schemas";
import { DatabaseError, NotFoundError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const workspaceRepository = {
  async create(data: {
    name: string;
    description?: string;
  }): Promise<Workspace> {
    const workspace: Workspace = {
      id: generateId(),
      name: data.name,
      description: data.description,
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.workspaces.add(workspace);
      return workspace;
    } catch (error) {
      throw new DatabaseError("Failed to create workspace", { cause: error });
    }
  },

  async getById(id: string): Promise<Workspace> {
    const workspace = await db.workspaces.get(id);
    if (!workspace) {
      throw new NotFoundError("Workspace");
    }
    return workspace;
  },

  async getAll(): Promise<Workspace[]> {
    return db.workspaces.orderBy("updatedAt").reverse().toArray();
  },

  async update(
    id: string,
    data: Partial<Pick<Workspace, "name" | "description">>,
  ): Promise<Workspace> {
    const existing = await this.getById(id);
    const updated: Workspace = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    try {
      await db.workspaces.update(id, updated);
      return updated;
    } catch (error) {
      throw new DatabaseError("Failed to update workspace", { cause: error });
    }
  },

  async delete(id: string): Promise<void> {
    const workspace = await this.getById(id);

    await db.transaction(
      "rw",
      [
        db.workspaces,
        db.papers,
        db.paperChunks,
        db.paperAnalyses,
        db.researchNotes,
        db.concepts,
        db.comparisonProjects,
        db.chatThreads,
        db.chatMessages,
      ],
      async () => {
        const paperIds = await db.papers
          .where("workspaceId")
          .equals(id)
          .primaryKeys();

        for (const paperId of paperIds) {
          await db.paperChunks.where("paperId").equals(paperId).delete();
          await db.paperAnalyses.where("paperId").equals(paperId).delete();
        }

        await db.papers.where("workspaceId").equals(id).delete();
        await db.researchNotes.where("workspaceId").equals(id).delete();
        await db.concepts.where("workspaceId").equals(id).delete();
        await db.comparisonProjects.where("workspaceId").equals(id).delete();

        const threadIds = await db.chatThreads
          .where("workspaceId")
          .equals(id)
          .primaryKeys();
        for (const threadId of threadIds) {
          await db.chatMessages.where("threadId").equals(threadId).delete();
        }
        await db.chatThreads.where("workspaceId").equals(id).delete();

        await db.workspaces.delete(id);
      },
    );

    void workspace;
  },

  async getStats(id: string) {
    const paperCount = await db.papers.where("workspaceId").equals(id).count();
    const noteCount = await db.researchNotes
      .where("workspaceId")
      .equals(id)
      .count();
    const conceptCount = await db.concepts
      .where("workspaceId")
      .equals(id)
      .count();

    return { paperCount, noteCount, conceptCount };
  },
};
