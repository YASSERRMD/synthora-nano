import { db } from "../../db/database";

export interface StorageEstimate {
  workspaces: number;
  papers: number;
  chunks: number;
  analyses: number;
  notes: number;
  concepts: number;
  comparisonProjects: number;
  chatThreads: number;
  chatMessages: number;
  totalDocuments: number;
  estimatedUsageBytes: number;
}

export const storageService = {
  async getEstimate(): Promise<StorageEstimate> {
    const [
      workspaces,
      papers,
      chunks,
      analyses,
      notes,
      concepts,
      comparisons,
      threads,
      messages,
    ] = await Promise.all([
      db.workspaces.count(),
      db.papers.count(),
      db.paperChunks.count(),
      db.paperAnalyses.count(),
      db.researchNotes.count(),
      db.concepts.count(),
      db.comparisonProjects.count(),
      db.chatThreads.count(),
      db.chatMessages.count(),
    ]);

    return {
      workspaces,
      papers,
      chunks,
      analyses,
      notes,
      concepts,
      comparisonProjects: comparisons,
      chatThreads: threads,
      chatMessages: messages,
      totalDocuments: papers + chunks + analyses + notes,
      estimatedUsageBytes: 0,
    };
  },

  async getQuotaEstimate(): Promise<{
    usage: number;
    quota: number;
    usagePercent: number;
  }> {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
        usagePercent: estimate.quota
          ? ((estimate.usage ?? 0) / estimate.quota) * 100
          : 0,
      };
    }
    return { usage: 0, quota: 0, usagePercent: 0 };
  },

  async resetAll(): Promise<void> {
    await db.delete();
    window.location.reload();
  },
};
