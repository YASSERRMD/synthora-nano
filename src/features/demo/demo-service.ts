import { db } from "../../db/database";
import {
  DEMO_PAPERS,
  DEMO_ANALYSES,
  DEMO_CONCEPTS,
  DEMO_NOTES,
} from "./demo-data";

export async function seedDemoData(workspaceId: string): Promise<{
  papers: number;
  analyses: number;
  concepts: number;
  notes: number;
}> {
  const now = new Date().toISOString();

  await db.workspaces.add({
    id: workspaceId,
    name: "Demo Research Workspace",
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
  });

  let papers = 0;
  for (const paper of DEMO_PAPERS) {
    await db.papers.put({ ...paper, workspaceId });
    papers++;
  }

  let analyses = 0;
  for (const analysis of DEMO_ANALYSES) {
    await db.paperAnalyses.put({ ...analysis });
    analyses++;
  }

  let concepts = 0;
  for (const concept of DEMO_CONCEPTS) {
    await db.concepts.put({ ...concept, workspaceId });
    concepts++;
  }

  let notes = 0;
  for (const note of DEMO_NOTES) {
    await db.researchNotes.put({ ...note, workspaceId });
    notes++;
  }

  return { papers, analyses, concepts, notes };
}

export async function isDemoSeeded(workspaceId: string): Promise<boolean> {
  const workspace = await db.workspaces.get(workspaceId);
  return workspace?.name === "Demo Research Workspace";
}

export async function clearDemoData(workspaceId: string): Promise<void> {
  const papers = await db.papers
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  for (const paper of papers) {
    await db.paperChunks.where("paperId").equals(paper.id).delete();
    await db.paperAnalyses.where("paperId").equals(paper.id).delete();
    await db.papers.delete(paper.id);
  }

  const notes = await db.researchNotes
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  for (const note of notes) {
    await db.researchNotes.delete(note.id);
  }

  const concepts = await db.concepts
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  for (const concept of concepts) {
    await db.concepts.delete(concept.id);
  }

  await db.workspaces.delete(workspaceId);
}
