import { describe, it, expect, beforeEach } from "vitest";
import {
  classifySections,
  getChunksByCategory,
  concatenateChunks,
} from "./section-classifier";
import {
  saveCorrections,
  loadCorrections,
  addCorrection,
  clearCorrections,
  applyCorrections,
} from "./corrections";
import {
  saveCheckpoint,
  loadCheckpoint,
  clearCheckpoint,
  createCheckpoint,
  updateCheckpoint,
} from "./checkpoint";
import { validateCitations, buildEvidenceMap } from "./citation-validator";
import {
  createProgress,
  advanceProgress,
  isStageCompleted,
  getNextIncompleteStage,
} from "./progress";
import type { PaperChunk, PaperAnalysis } from "../../db/schemas";

function makeChunk(overrides: Partial<PaperChunk> = {}): PaperChunk {
  return {
    id: crypto.randomUUID(),
    paperId: crypto.randomUUID(),
    chunkIndex: 0,
    text: "Sample text content for testing purposes.",
    charOffsetStart: 0,
    charOffsetEnd: 40,
    estimatedTokens: 10,
    contentHash: "hash123",
    sequenceNumber: 0,
    schemaVersion: 1,
    ...overrides,
  };
}

describe("Section Classifier", () => {
  it("classifies introduction sections", () => {
    const chunks = [makeChunk({ sectionHeading: "Introduction" })];
    const sections = classifySections(chunks);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.category).toBe("introduction");
  });

  it("classifies methodology sections", () => {
    const chunks = [makeChunk({ sectionHeading: "Methodology" })];
    const sections = classifySections(chunks);
    expect(sections[0]?.category).toBe("methodology");
  });

  it("groups chunks by heading", () => {
    const chunks = [
      makeChunk({ sectionHeading: "Results", chunkIndex: 0 }),
      makeChunk({ sectionHeading: "Results", chunkIndex: 1 }),
      makeChunk({ sectionHeading: "Introduction", chunkIndex: 2 }),
    ];
    const sections = classifySections(chunks);
    expect(sections).toHaveLength(2);
  });

  it("concatenates chunks in order", () => {
    const chunks = [
      makeChunk({ text: "First", chunkIndex: 1 }),
      makeChunk({ text: "Second", chunkIndex: 0 }),
    ];
    const result = concatenateChunks(chunks);
    expect(result).toBe("Second\n\nFirst");
  });

  it("filters chunks by category", () => {
    const chunks = [
      makeChunk({ sectionHeading: "Methodology" }),
      makeChunk({ sectionHeading: "Results" }),
    ];
    const sections = classifySections(chunks);
    const methodChunks = getChunksByCategory(sections, "methodology");
    expect(methodChunks).toHaveLength(1);
  });
});

describe("Corrections", () => {
  beforeEach(() => {
    clearCorrections("test-paper-id");
  });

  it("saves and loads corrections", () => {
    const corrections = [
      {
        fieldPath: "methodology",
        originalValue: "old",
        correctedValue: "new",
        correctedAt: new Date().toISOString(),
      },
    ];
    saveCorrections("test-paper-id", corrections);
    const loaded = loadCorrections("test-paper-id");
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.fieldPath).toBe("methodology");
  });

  it("adds a correction", () => {
    addCorrection("test-paper-id", "methodology", "old", "new");
    const corrections = loadCorrections("test-paper-id");
    expect(corrections).toHaveLength(1);
  });

  it("replaces existing correction for same field", () => {
    addCorrection("test-paper-id", "methodology", "v1", "v2");
    addCorrection("test-paper-id", "methodology", "v2", "v3");
    const corrections = loadCorrections("test-paper-id");
    expect(corrections).toHaveLength(1);
    expect(corrections[0]?.correctedValue).toBe("v3");
  });

  it("applies corrections to analysis", () => {
    const analysis = {
      id: "1",
      paperId: "1",
      methodology: "Original",
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    } as PaperAnalysis;
    const corrections = [
      {
        fieldPath: "methodology",
        originalValue: "Original",
        correctedValue: "Corrected",
        correctedAt: "",
      },
    ];
    const result = applyCorrections(analysis, corrections);
    expect(result.methodology).toBe("Corrected");
  });

  it("clears corrections", () => {
    addCorrection("test-paper-id", "methodology", "old", "new");
    clearCorrections("test-paper-id");
    expect(loadCorrections("test-paper-id")).toHaveLength(0);
  });
});

describe("Checkpoint", () => {
  beforeEach(() => {
    clearCheckpoint("test-paper-id");
  });

  it("creates a checkpoint", () => {
    const checkpoint = createCheckpoint("test-paper-id");
    expect(checkpoint.paperId).toBe("test-paper-id");
    expect(checkpoint.completedStages).toHaveLength(0);
  });

  it("saves and loads checkpoint", () => {
    const checkpoint = createCheckpoint("test-paper-id");
    saveCheckpoint(checkpoint);
    const loaded = loadCheckpoint("test-paper-id");
    expect(loaded).not.toBeNull();
    expect(loaded?.paperId).toBe("test-paper-id");
  });

  it("updates checkpoint with completed stage", () => {
    const checkpoint = createCheckpoint("test-paper-id");
    const updated = updateCheckpoint(checkpoint, "metadata", {
      oneSentenceContribution: "Test contribution",
    });
    expect(updated.completedStages).toContain("metadata");
    expect(updated.partialResults.oneSentenceContribution).toBe(
      "Test contribution",
    );
  });

  it("clears checkpoint", () => {
    const checkpoint = createCheckpoint("test-paper-id");
    saveCheckpoint(checkpoint);
    clearCheckpoint("test-paper-id");
    expect(loadCheckpoint("test-paper-id")).toBeNull();
  });
});

describe("Citation Validator", () => {
  it("validates analysis with evidence", () => {
    const analysis = {
      id: "1",
      paperId: "1",
      majorFindings: ["Finding A"],
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    } as PaperAnalysis;

    const evidenceMap = buildEvidenceMap([
      {
        id: "chunk-1",
        text: "Finding A is supported by evidence in the paper text.",
        pageStart: 1,
      },
    ]);

    const result = validateCitations(analysis, evidenceMap);
    expect(result.valid).toBe(true);
  });

  it("flags findings without evidence", () => {
    const analysis = {
      id: "1",
      paperId: "1",
      majorFindings: ["Unsupported finding"],
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    } as PaperAnalysis;

    const evidenceMap = buildEvidenceMap([]);
    const result = validateCitations(analysis, evidenceMap);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

describe("Progress", () => {
  it("creates initial progress", () => {
    const progress = createProgress("paper-1");
    expect(progress.currentStage).toBe("metadata");
    expect(progress.percentComplete).toBe(0);
  });

  it("advances progress", () => {
    const progress = createProgress("paper-1");
    const next = advanceProgress(progress, "metadata");
    expect(next.completedStages).toContain("metadata");
    expect(next.currentStage).toBe("section-classification");
  });

  it("comtes all stages", () => {
    let progress = createProgress("paper-1");
    const stages = [
      "metadata",
      "section-classification",
      "executive-summary",
      "methodology",
      "datasets-tools",
      "findings",
      "limitations",
      "future-work",
      "synthesis",
    ] as const;

    for (const stage of stages) {
      progress = advanceProgress(progress, stage);
    }

    expect(progress.currentStage).toBe("complete");
    expect(progress.percentComplete).toBe(100);
  });

  it("checks stage completion", () => {
    const progress = createProgress("paper-1");
    const updated = advanceProgress(progress, "metadata");
    expect(isStageCompleted(updated, "metadata")).toBe(true);
    expect(isStageCompleted(updated, "methodology")).toBe(false);
  });

  it("gets next incomplete stage", () => {
    const progress = createProgress("paper-1");
    const updated = advanceProgress(progress, "metadata");
    expect(getNextIncompleteStage(updated)).toBe("section-classification");
  });
});
