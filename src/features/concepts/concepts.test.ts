import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  extractConcepts,
  rankConcepts,
  deduplicateConcepts,
} from "./concept-extraction";
import { conceptConfirmationService } from "./confirmation-service";
import { conceptGraphService } from "./graph-service";
import { backlinkService } from "./backlink-service";
import { listViewService } from "./list-view-service";
import type { PaperAnalysis } from "../../db/schemas";
import type { Concept } from "../../db/schemas";

vi.mock("../../db/repositories/concept.repository", () => ({
  conceptRepository: {
    create: vi.fn(),
    getById: vi.fn(),
    getByWorkspaceId: vi.fn(),
    getConfirmed: vi.fn(),
    getSuggested: vi.fn(),
    update: vi.fn(),
    merge: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getByPaperId: vi.fn(),
    linkPaper: vi.fn(),
    unlinkPaper: vi.fn(),
    linkNote: vi.fn(),
    unlinkNote: vi.fn(),
  },
}));

const mockAnalysis: PaperAnalysis = {
  id: "analysis-1",
  paperId: "paper-1",
  methodology: "Randomized Controlled Trial",
  datasets: ["MNIST", "CIFAR-10"],
  metrics: ["Accuracy", "F1-Score"],
  majorFindings: ["State-of-the-art performance", "Reduced training time"],
  limitations: ["Small dataset size", "Limited to image classification"],
  createdAt: "",
  updatedAt: "",
  schemaVersion: 1,
};

import { conceptRepository } from "../../db/repositories/concept.repository";

const mockConcept: Concept = {
  id: "concept-1",
  workspaceId: "ws-1",
  canonicalName: "Deep Learning",
  aliases: ["DL"],
  description: "A subset of ML",
  linkedPaperIds: ["paper-1"],
  linkedNoteIds: [],
  userConfirmed: false,
  aiSuggested: true,
  createdAt: "",
  updatedAt: "",
  schemaVersion: 1,
};

const mockConfirmedConcept: Concept = {
  ...mockConcept,
  id: "concept-2",
  canonicalName: "Neural Networks",
  userConfirmed: true,
  aiSuggested: false,
  linkedPaperIds: ["paper-1", "paper-2"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractConcepts", () => {
  it("extracts concepts from all analysis fields", () => {
    const concepts = extractConcepts(mockAnalysis);
    expect(concepts.length).toBeGreaterThanOrEqual(5);
    expect(concepts.map((c) => c.source)).toContain("methodology");
    expect(concepts.map((c) => c.source)).toContain("dataset");
    expect(concepts.map((c) => c.source)).toContain("metric");
    expect(concepts.map((c) => c.source)).toContain("finding");
    expect(concepts.map((c) => c.source)).toContain("limitation");
  });

  it("deduplicates extracted concepts", () => {
    const concepts = extractConcepts({
      ...mockAnalysis,
      methodology: "RCT",
      datasets: ["RCT"],
    });
    const names = concepts.map((c) => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("filters out very short terms", () => {
    const concepts = extractConcepts({
      ...mockAnalysis,
      methodology: "AI",
    });
    expect(concepts.find((c) => c.name === "AI")).toBeUndefined();
  });
});

describe("rankConcepts", () => {
  it("sorts by confidence descending", () => {
    const concepts = extractConcepts(mockAnalysis);
    const ranked = rankConcepts(concepts);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.confidence).toBeGreaterThanOrEqual(
        ranked[i]!.confidence,
      );
    }
  });
});

describe("deduplicateConcepts", () => {
  it("keeps highest confidence duplicate", () => {
    const concepts = [
      { name: "Test", source: "methodology" as const, confidence: 0.5 },
      { name: "test", source: "dataset" as const, confidence: 0.9 },
    ];
    const result = deduplicateConcepts(concepts);
    expect(result).toHaveLength(1);
    expect(result[0]!.confidence).toBe(0.9);
  });
});

describe("conceptConfirmationService", () => {
  it("gets pending concepts", async () => {
    vi.mocked(conceptRepository.getSuggested).mockResolvedValue([mockConcept]);
    const pending = await conceptConfirmationService.getPending("ws-1");
    expect(pending).toHaveLength(1);
    expect(pending[0]?.name).toBe("Deep Learning");
  });

  it("confirms a concept", async () => {
    vi.mocked(conceptRepository.update).mockResolvedValue({
      ...mockConcept,
      userConfirmed: true,
    });
    const result = await conceptConfirmationService.confirm("concept-1");
    expect(result.userConfirmed).toBe(true);
  });

  it("rejects a concept", async () => {
    vi.mocked(conceptRepository.delete).mockResolvedValue(undefined);
    await conceptConfirmationService.reject("concept-1");
    expect(conceptRepository.delete).toHaveBeenCalledWith("concept-1");
  });

  it("renames a concept", async () => {
    vi.mocked(conceptRepository.update).mockResolvedValue({
      ...mockConcept,
      canonicalName: "New Name",
    });
    const result = await conceptConfirmationService.rename(
      "concept-1",
      "New Name",
    );
    expect(result.canonicalName).toBe("New Name");
  });

  it("adds alias to concept", async () => {
    vi.mocked(conceptRepository.getById).mockResolvedValue(mockConcept);
    vi.mocked(conceptRepository.update).mockResolvedValue({
      ...mockConcept,
      aliases: ["DL", "New Alias"],
    });
    const result = await conceptConfirmationService.addAlias(
      "concept-1",
      "New Alias",
    );
    expect(result.aliases).toContain("New Alias");
  });
});

describe("conceptGraphService", () => {
  it("builds edges from shared papers", () => {
    const edges = conceptGraphService.buildEdges([
      mockConcept,
      mockConfirmedConcept,
    ]);
    expect(edges).toHaveLength(1);
    expect(edges[0]?.relationship).toBe("co-occurs");
  });

  it("explains relationship via shared papers", async () => {
    vi.mocked(conceptRepository.getById)
      .mockResolvedValueOnce(mockConcept)
      .mockResolvedValueOnce(mockConfirmedConcept);

    const explanation = await conceptGraphService.explainRelationship(
      "concept-1",
      "concept-2",
    );
    expect(explanation.sharedPapers).toContain("paper-1");
    expect(explanation.explanation).toContain("co-occur");
  });

  it("finds related concepts", async () => {
    vi.mocked(conceptRepository.getById).mockResolvedValue(mockConcept);
    vi.mocked(conceptRepository.getByWorkspaceId).mockResolvedValue([
      mockConcept,
      mockConfirmedConcept,
    ]);
    const related = await conceptGraphService.getRelatedConcepts(
      "concept-1",
      "ws-1",
    );
    expect(related).toHaveLength(1);
    expect(related[0]?.id).toBe("concept-2");
  });
});

describe("backlinkService", () => {
  it("finds related papers via shared concepts", async () => {
    const conceptWithMultiplePapers = {
      ...mockConcept,
      linkedPaperIds: ["paper-1", "paper-2", "paper-3"],
    };
    vi.mocked(conceptRepository.getByPaperId).mockResolvedValue([
      conceptWithMultiplePapers,
    ]);
    const related = await backlinkService.findRelatedPapers("paper-1");
    expect(related).toContain("paper-2");
    expect(related).toContain("paper-3");
    expect(related).not.toContain("paper-1");
  });

  it("gets concept connections", async () => {
    vi.mocked(conceptRepository.getById).mockResolvedValue(mockConcept);
    vi.mocked(conceptRepository.getByWorkspaceId).mockResolvedValue([
      mockConcept,
    ]);
    const connections =
      await backlinkService.getConceptConnections("concept-1");
    expect(connections.papers).toBeDefined();
    expect(connections.notes).toBeDefined();
  });
});

describe("listViewService", () => {
  it("focuses on a node with depth", () => {
    const graph = {
      nodes: [
        { id: "a", label: "A", type: "concept" as const, confirmed: true },
        { id: "b", label: "B", type: "concept" as const, confirmed: true },
        { id: "c", label: "C", type: "concept" as const, confirmed: false },
      ],
      edges: [
        { source: "a", target: "b", relationship: "co-occurs" as const },
        { source: "b", target: "c", relationship: "co-occurs" as const },
      ],
    };

    const focused = listViewService.focusMode(graph, "a", 1);
    expect(focused.nodes.map((n) => n.id)).toContain("a");
    expect(focused.nodes.map((n) => n.id)).toContain("b");
    expect(focused.nodes.map((n) => n.id)).not.toContain("c");
  });

  it("filters nodes by confirmed status", () => {
    const nodes = [
      {
        id: "a",
        label: "A",
        type: "concept" as const,
        confirmed: true,
        connections: 2,
      },
      {
        id: "b",
        label: "B",
        type: "concept" as const,
        confirmed: false,
        connections: 1,
      },
    ];
    const filtered = listViewService.filterNodes(nodes, {
      confirmedOnly: true,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("a");
  });

  it("sorts nodes by connections", () => {
    const nodes = [
      {
        id: "a",
        label: "A",
        type: "concept" as const,
        confirmed: true,
        connections: 1,
      },
      {
        id: "b",
        label: "B",
        type: "concept" as const,
        confirmed: true,
        connections: 5,
      },
    ];
    const sorted = listViewService.sortNodesByConnections(nodes);
    expect(sorted[0]?.id).toBe("b");
  });
});
