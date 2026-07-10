import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../db/database";
import {
  paperRepository,
  paperAnalysisRepository,
} from "../../db/repositories/paper.repository";
import { classifySections, concatenateChunks } from "./section-classifier";
import { buildEvidenceMap, validateCitations } from "./citation-validator";
import { createProgress, advanceProgress } from "./progress";
import type { PaperChunk } from "../../db/schemas";

describe("analysis pipeline integration", () => {
  beforeEach(async () => {
    await db.papers.clear();
    await db.paperChunks.clear();
    await db.paperAnalyses.clear();
  });

  it("classifies chunks and validates citations end-to-end", async () => {
    const paper = await paperRepository.create({
      workspaceId: crypto.randomUUID(),
      title: "Test Paper",
      authors: [{ name: "Author" }],
      fileName: "test.pdf",
      fileType: "pdf",
      fileHash: "hash1",
      status: "parsed",
    });

    const chunks = await import("../../db/repositories/paper.repository").then(
      (m) =>
        m.paperChunkRepository.createMany([
          {
            paperId: paper.id,
            chunkIndex: 0,
            sectionHeading: "Introduction",
            text: "This paper introduces a novel approach to research.",
            charOffsetStart: 0,
            charOffsetEnd: 50,
            estimatedTokens: 12,
            contentHash: "c1",
            sequenceNumber: 0,
            schemaVersion: 1,
          },
          {
            paperId: paper.id,
            chunkIndex: 1,
            sectionHeading: "Methodology",
            text: "We used a mixed methods approach with 200 participants.",
            charOffsetStart: 50,
            charOffsetEnd: 110,
            estimatedTokens: 14,
            contentHash: "c2",
            sequenceNumber: 1,
            schemaVersion: 1,
          },
        ]),
    );

    const classified = classifySections(chunks);
    expect(classified.length).toBeGreaterThanOrEqual(2);

    const allText = concatenateChunks(chunks);
    expect(allText).toContain("novel approach");

    const evidenceMap = buildEvidenceMap(chunks);
    const analysis = await paperAnalysisRepository.upsert(paper.id, {
      oneSentenceContribution: "Novel research approach introduced.",
      executiveSummary: "This paper introduces a novel approach to research.",
      methodology: "Mixed methods with 200 participants.",
      majorFindings: [
        "This paper introduces a novel approach to research.",
        "We used a mixed methods approach with 200 participants.",
      ],
    });

    const validation = validateCitations(analysis, evidenceMap);
    expect(validation.valid).toBe(true);
  });

  it("tracks progress through analysis stages", () => {
    let progress = createProgress("test-paper");
    expect(progress.currentStage).toBe("metadata");

    progress = advanceProgress(progress, "metadata");
    expect(progress.completedStages).toContain("metadata");

    progress = advanceProgress(progress, "section-classification");
    progress = advanceProgress(progress, "executive-summary");
    progress = advanceProgress(progress, "methodology");
    progress = advanceProgress(progress, "datasets-tools");
    progress = advanceProgress(progress, "findings");
    progress = advanceProgress(progress, "limitations");
    progress = advanceProgress(progress, "future-work");
    progress = advanceProgress(progress, "synthesis");

    expect(progress.currentStage).toBe("complete");
    expect(progress.percentComplete).toBe(100);
  });

  it("detects unverified extraction warnings", async () => {
    const chunks: PaperChunk[] = [
      {
        id: "chunk-1",
        paperId: "p1",
        chunkIndex: 0,
        text: "Limited text",
        charOffsetStart: 0,
        charOffsetEnd: 12,
        estimatedTokens: 3,
        contentHash: "h",
        sequenceNumber: 0,
        schemaVersion: 1,
      },
    ];

    const evidenceMap = buildEvidenceMap(chunks);
    const analysis = await paperAnalysisRepository.upsert("p1", {
      majorFindings: [
        "This paper introduces a completely unsupported finding that has no evidence.",
      ],
    });

    const validation = validateCitations(analysis, evidenceMap);
    expect(validation.valid).toBe(false);
  });
});
