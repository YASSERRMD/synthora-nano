import { conceptRepository } from "../../db/repositories/concept.repository";
import type { Concept } from "../../db/schemas";

export interface GraphNode {
  id: string;
  label: string;
  type: "concept" | "paper";
  confirmed: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: "co-occurs" | "shared-by" | "mentioned-in";
}

export interface ConceptGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RelationshipExplanation {
  sourceId: string;
  targetId: string;
  sharedPapers: string[];
  sharedNotes: string[];
  explanation: string;
}

export const conceptGraphService = {
  async getGraph(workspaceId: string): Promise<ConceptGraph> {
    const concepts = await conceptRepository.getConfirmed(workspaceId);
    const allConcepts = await conceptRepository.getByWorkspaceId(workspaceId);

    const nodes: GraphNode[] = allConcepts.map((c) => ({
      id: c.id,
      label: c.canonicalName,
      type: "concept" as const,
      confirmed: c.userConfirmed,
    }));

    const edges = this.buildEdges(concepts);

    return { nodes, edges };
  },

  buildEdges(concepts: Concept[]): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const paperConceptMap = new Map<string, string[]>();

    for (const concept of concepts) {
      for (const paperId of concept.linkedPaperIds ?? []) {
        const existing = paperConceptMap.get(paperId) ?? [];
        existing.push(concept.id);
        paperConceptMap.set(paperId, existing);
      }
    }

    const edgeSet = new Set<string>();
    for (const conceptIds of paperConceptMap.values()) {
      for (let i = 0; i < conceptIds.length; i++) {
        for (let j = i + 1; j < conceptIds.length; j++) {
          const a = conceptIds[i]!;
          const b = conceptIds[j]!;
          const key = [a, b].sort().join(":");
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({
              source: a,
              target: b,
              relationship: "co-occurs",
            });
          }
        }
      }
    }

    return edges;
  },

  async explainRelationship(
    sourceId: string,
    targetId: string,
  ): Promise<RelationshipExplanation> {
    const source = await conceptRepository.getById(sourceId);
    const target = await conceptRepository.getById(targetId);

    const sharedPapers = (source.linkedPaperIds ?? []).filter((id) =>
      (target.linkedPaperIds ?? []).includes(id),
    );

    const sharedNotes = (source.linkedNoteIds ?? []).filter((id) =>
      (target.linkedNoteIds ?? []).includes(id),
    );

    let explanation = "";
    if (sharedPapers.length > 0) {
      explanation = `These concepts co-occur in ${sharedPapers.length} paper(s).`;
    } else if (sharedNotes.length > 0) {
      explanation = `These concepts are linked through ${sharedNotes.length} note(s).`;
    } else {
      explanation = "No direct shared sources found.";
    }

    return {
      sourceId,
      targetId,
      sharedPapers,
      sharedNotes,
      explanation,
    };
  },

  async getRelatedConcepts(
    conceptId: string,
    workspaceId: string,
  ): Promise<Concept[]> {
    const concept = await conceptRepository.getById(conceptId);
    const allConcepts = await conceptRepository.getByWorkspaceId(workspaceId);

    const related = allConcepts.filter((c) => {
      if (c.id === conceptId) return false;
      const sharedPapers = (concept.linkedPaperIds ?? []).filter((id) =>
        (c.linkedPaperIds ?? []).includes(id),
      );
      return sharedPapers.length > 0;
    });

    return related;
  },

  async createManualRelationship(
    sourceId: string,
    targetId: string,
  ): Promise<void> {
    const source = await conceptRepository.getById(sourceId);
    const target = await conceptRepository.getById(targetId);

    const sharedPapers = new Set([
      ...(source.linkedPaperIds ?? []),
      ...(target.linkedPaperIds ?? []),
    ]);

    await conceptRepository.update(sourceId, {
      linkedPaperIds: Array.from(sharedPapers),
    });

    await conceptRepository.update(targetId, {
      linkedPaperIds: Array.from(sharedPapers),
    });
  },
};
