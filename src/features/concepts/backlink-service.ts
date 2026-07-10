import { conceptRepository } from "../../db/repositories/concept.repository";

export interface Backlink {
  sourceType: "paper" | "note";
  sourceId: string;
  sourceTitle: string;
  targetType: "paper" | "note";
  targetId: string;
  targetTitle: string;
  relationship: string;
}

export const backlinkService = {
  async getPaperBacklinks(paperId: string): Promise<Backlink[]> {
    const concepts = await conceptRepository.getByPaperId(paperId);
    const backlinks: Backlink[] = [];

    for (const concept of concepts) {
      const linkedPapers = concept.linkedPaperIds ?? [];
      for (const linkedId of linkedPapers) {
        if (linkedId !== paperId) {
          backlinks.push({
            sourceType: "paper",
            sourceId: paperId,
            sourceTitle: paperId,
            targetType: "paper",
            targetId: linkedId,
            targetTitle: linkedId,
            relationship: `shares concept: ${concept.canonicalName}`,
          });
        }
      }
    }

    return backlinks;
  },

  async getNoteBacklinks(noteId: string): Promise<Backlink[]> {
    const concepts = await conceptRepository.getByWorkspaceId("");
    const backlinks: Backlink[] = [];

    for (const concept of concepts) {
      if ((concept.linkedNoteIds ?? []).includes(noteId)) {
        for (const paperId of concept.linkedPaperIds ?? []) {
          backlinks.push({
            sourceType: "note",
            sourceId: noteId,
            sourceTitle: noteId,
            targetType: "paper",
            targetId: paperId,
            targetTitle: paperId,
            relationship: `linked via concept: ${concept.canonicalName}`,
          });
        }
      }
    }

    return backlinks;
  },

  async findRelatedPapers(paperId: string): Promise<string[]> {
    const concepts = await conceptRepository.getByPaperId(paperId);
    const relatedPaperIds = new Set<string>();

    for (const concept of concepts) {
      for (const linkedId of concept.linkedPaperIds ?? []) {
        if (linkedId !== paperId) {
          relatedPaperIds.add(linkedId);
        }
      }
    }

    return Array.from(relatedPaperIds);
  },

  async findPapersByConcept(conceptId: string): Promise<string[]> {
    const concept = await conceptRepository.getById(conceptId);
    return concept.linkedPaperIds ?? [];
  },

  async getConceptConnections(conceptId: string): Promise<{
    papers: string[];
    notes: string[];
    otherConcepts: string[];
  }> {
    const concept = await conceptRepository.getById(conceptId);
    const papers = concept.linkedPaperIds ?? [];
    const notes = concept.linkedNoteIds ?? [];

    const allConcepts = await conceptRepository.getByWorkspaceId(
      concept.workspaceId,
    );
    const otherConcepts = allConcepts
      .filter((c) => c.id !== conceptId)
      .filter((c) => {
        const sharedPapers = (c.linkedPaperIds ?? []).filter((id) =>
          papers.includes(id),
        );
        return sharedPapers.length > 0;
      })
      .map((c) => c.id);

    return { papers, notes, otherConcepts };
  },
};
