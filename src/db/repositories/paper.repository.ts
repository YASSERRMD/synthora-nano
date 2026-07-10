import { db } from "../database";
import type { Paper, PaperChunk, PaperAnalysis } from "../schemas";
import { DatabaseError, NotFoundError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const paperRepository = {
  async create(
    data: Omit<Paper, "id" | "createdAt" | "updatedAt" | "schemaVersion">,
  ): Promise<Paper> {
    const paper: Paper = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.papers.add(paper);
      return paper;
    } catch (error) {
      throw new DatabaseError("Failed to create paper", { cause: error });
    }
  },

  async getById(id: string): Promise<Paper> {
    const paper = await db.papers.get(id);
    if (!paper) {
      throw new NotFoundError("Paper");
    }
    return paper;
  },

  async getByWorkspaceId(workspaceId: string): Promise<Paper[]> {
    return db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("createdAt");
  },

  async getByFileHash(
    workspaceId: string,
    fileHash: string,
  ): Promise<Paper | undefined> {
    return db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .and((p) => p.fileHash === fileHash)
      .first();
  },

  async update(
    id: string,
    data: Partial<Omit<Paper, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<Paper> {
    const existing = await this.getById(id);
    const updated: Paper = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    try {
      await db.papers.update(id, updated);
      return updated;
    } catch (error) {
      throw new DatabaseError("Failed to update paper", { cause: error });
    }
  },

  async delete(id: string): Promise<void> {
    await db.transaction(
      "rw",
      [db.papers, db.paperChunks, db.paperAnalyses],
      async () => {
        await db.paperChunks.where("paperId").equals(id).delete();
        await db.paperAnalyses.where("paperId").equals(id).delete();
        await db.papers.delete(id);
      },
    );
  },

  async search(workspaceId: string, query: string): Promise<Paper[]> {
    const lowerQuery = query.toLowerCase();
    return db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .and(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.abstract?.toLowerCase().includes(lowerQuery) ||
          p.authors.some((a) => a.name.toLowerCase().includes(lowerQuery)),
      )
      .toArray();
  },
};

export const paperChunkRepository = {
  async createMany(chunks: Omit<PaperChunk, "id">[]): Promise<PaperChunk[]> {
    const entities: PaperChunk[] = chunks.map((chunk) => ({
      ...chunk,
      id: generateId(),
    }));

    try {
      await db.paperChunks.bulkAdd(entities);
      return entities;
    } catch (error) {
      throw new DatabaseError("Failed to create paper chunks", {
        cause: error,
      });
    }
  },

  async getByPaperId(paperId: string): Promise<PaperChunk[]> {
    return db.paperChunks.where("paperId").equals(paperId).sortBy("chunkIndex");
  },

  async deleteByPaperId(paperId: string): Promise<void> {
    await db.paperChunks.where("paperId").equals(paperId).delete();
  },

  async countByPaperId(paperId: string): Promise<number> {
    return db.paperChunks.where("paperId").equals(paperId).count();
  },
};

export const paperAnalysisRepository = {
  async upsert(
    paperId: string,
    data: Omit<
      PaperAnalysis,
      "id" | "paperId" | "createdAt" | "updatedAt" | "schemaVersion"
    >,
  ): Promise<PaperAnalysis> {
    const existing = await db.paperAnalyses
      .where("paperId")
      .equals(paperId)
      .first();

    if (existing) {
      const updated: PaperAnalysis = {
        ...existing,
        ...data,
        updatedAt: now(),
      };
      await db.paperAnalyses.update(existing.id, updated);
      return updated;
    }

    const analysis: PaperAnalysis = {
      ...data,
      id: generateId(),
      paperId,
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    await db.paperAnalyses.add(analysis);
    return analysis;
  },

  async getByPaperId(paperId: string): Promise<PaperAnalysis | undefined> {
    return db.paperAnalyses.where("paperId").equals(paperId).first();
  },

  async deleteByPaperId(paperId: string): Promise<void> {
    await db.paperAnalyses.where("paperId").equals(paperId).delete();
  },
};
