import { db } from "../../db/database";

export interface DataInventoryItem {
  type: string;
  count: number;
  storageEstimate: number;
}

export interface DataInventory {
  workspaceId: string;
  items: DataInventoryItem[];
  totalItems: number;
  estimatedSizeBytes: number;
}

export async function getDataInventory(
  workspaceId: string,
): Promise<DataInventory> {
  const papers = await db.papers
    .where("workspaceId")
    .equals(workspaceId)
    .count();
  const notes = await db.researchNotes
    .where("workspaceId")
    .equals(workspaceId)
    .count();
  const analyses = await db.paperAnalyses.count();
  const concepts = await db.concepts
    .where("workspaceId")
    .equals(workspaceId)
    .count();
  const threads = await db.chatThreads
    .where("workspaceId")
    .equals(workspaceId)
    .count();
  const comparisons = await db.comparisonProjects
    .where("workspaceId")
    .equals(workspaceId)
    .count();

  const items: DataInventoryItem[] = [
    { type: "Papers", count: papers, storageEstimate: papers * 500_000 },
    { type: "Notes", count: notes, storageEstimate: notes * 2_000 },
    { type: "Analyses", count: analyses, storageEstimate: analyses * 5_000 },
    { type: "Concepts", count: concepts, storageEstimate: concepts * 500 },
    { type: "Chat Threads", count: threads, storageEstimate: threads * 10_000 },
    {
      type: "Comparisons",
      count: comparisons,
      storageEstimate: comparisons * 3_000,
    },
  ];

  return {
    workspaceId,
    items,
    totalItems: items.reduce((sum, item) => sum + item.count, 0),
    estimatedSizeBytes: items.reduce(
      (sum, item) => sum + item.storageEstimate,
      0,
    ),
  };
}

export async function deleteWorkspaceData(
  workspaceId: string,
  options: {
    deletePapers?: boolean;
    deleteNotes?: boolean;
    deleteAnalyses?: boolean;
    deleteConcepts?: boolean;
    deleteThreads?: boolean;
    deleteComparisons?: boolean;
  } = {},
): Promise<{ deleted: number }> {
  let deleted = 0;

  if (options.deletePapers) {
    const papers = await db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();
    for (const paper of papers) {
      await db.paperChunks.where("paperId").equals(paper.id).delete();
      await db.paperAnalyses.where("paperId").equals(paper.id).delete();
      await db.papers.delete(paper.id);
      deleted++;
    }
  }

  if (options.deleteNotes) {
    const notes = await db.researchNotes
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();
    for (const note of notes) {
      await db.researchNotes.delete(note.id);
      deleted++;
    }
  }

  if (options.deleteConcepts) {
    const concepts = await db.concepts
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();
    for (const concept of concepts) {
      await db.concepts.delete(concept.id);
      deleted++;
    }
  }

  if (options.deleteThreads) {
    const threads = await db.chatThreads
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();
    for (const thread of threads) {
      await db.chatMessages.where("threadId").equals(thread.id).delete();
      await db.chatThreads.delete(thread.id);
      deleted++;
    }
  }

  if (options.deleteComparisons) {
    const comparisons = await db.comparisonProjects
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();
    for (const comp of comparisons) {
      await db.comparisonProjects.delete(comp.id);
      deleted++;
    }
  }

  return { deleted };
}
