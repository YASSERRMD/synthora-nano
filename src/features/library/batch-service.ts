import { db } from "../../db/database";
import type { Paper } from "../../db/schemas";

export interface BatchOperation {
  type: "delete" | "move" | "tag" | "status";
  paperIds: string[];
  payload?: Record<string, unknown>;
}

export interface BatchResult {
  success: number;
  failed: number;
  errors: string[];
}

export const batchService = {
  async executeBatch(operation: BatchOperation): Promise<BatchResult> {
    const result: BatchResult = { success: 0, failed: 0, errors: [] };

    for (const paperId of operation.paperIds) {
      try {
        switch (operation.type) {
          case "delete":
            await db.transaction(
              "rw",
              [db.papers, db.paperChunks, db.paperAnalyses],
              async () => {
                await db.paperChunks.where("paperId").equals(paperId).delete();
                await db.paperAnalyses
                  .where("paperId")
                  .equals(paperId)
                  .delete();
                await db.papers.delete(paperId);
              },
            );
            result.success++;
            break;

          case "status": {
            const status = operation.payload?.["status"] as Paper["status"];
            if (status) {
              await db.papers.update(paperId, {
                status,
                updatedAt: new Date().toISOString(),
              });
              result.success++;
            }
            break;
          }

          default:
            result.errors.push(`Unknown operation type: ${operation.type}`);
            result.failed++;
        }
      } catch (err) {
        result.failed++;
        result.errors.push(
          `Paper ${paperId}: ${err instanceof Error ? err.message : "unknown"}`,
        );
      }
    }

    return result;
  },

  async getPaperDetails(paperId: string) {
    const paper = await db.papers.get(paperId);
    if (!paper) return null;

    const chunks = await db.paperChunks
      .where("paperId")
      .equals(paperId)
      .toArray();

    const analysis = await db.paperAnalyses
      .where("paperId")
      .equals(paperId)
      .first();

    const notes = await db.researchNotes
      .where("paperId")
      .equals(paperId)
      .toArray();

    return {
      paper,
      chunks,
      analysis,
      notes,
      stats: {
        chunkCount: chunks.length,
        totalTokens: chunks.reduce((sum, c) => sum + c.estimatedTokens, 0),
        noteCount: notes.length,
        hasAnalysis: !!analysis,
      },
    };
  },
};
