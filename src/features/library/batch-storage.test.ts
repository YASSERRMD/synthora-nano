import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../db/database";
import { batchService } from "./batch-service";
import { storageService } from "./storage-service";

describe("batchService", () => {
  beforeEach(async () => {
    await db.papers.clear();
    await db.paperChunks.clear();
    await db.paperAnalyses.clear();
  });

  it("executes delete batch operation", async () => {
    await db.papers.add({
      id: "p1",
      workspaceId: "ws1",
      title: "Paper 1",
      authors: [],
      fileName: "p1.pdf",
      fileType: "pdf",
      fileHash: "h1",
      status: "parsed",
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    });

    const result = await batchService.executeBatch({
      type: "delete",
      paperIds: ["p1"],
    });

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    const remaining = await db.papers.count();
    expect(remaining).toBe(0);
  });

  it("returns paper details", async () => {
    await db.papers.add({
      id: "p1",
      workspaceId: "ws1",
      title: "Paper 1",
      authors: [],
      fileName: "p1.pdf",
      fileType: "pdf",
      fileHash: "h1",
      status: "parsed",
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    });

    const details = await batchService.getPaperDetails("p1");
    expect(details).not.toBeNull();
    expect(details?.paper.title).toBe("Paper 1");
    expect(details?.stats.chunkCount).toBe(0);
  });

  it("returns null for non-existent paper", async () => {
    const details = await batchService.getPaperDetails("nonexistent");
    expect(details).toBeNull();
  });
});

describe("storageService", () => {
  beforeEach(async () => {
    await db.workspaces.clear();
    await db.papers.clear();
    await db.paperChunks.clear();
    await db.paperAnalyses.clear();
    await db.researchNotes.clear();
    await db.concepts.clear();
    await db.comparisonProjects.clear();
    await db.chatThreads.clear();
    await db.chatMessages.clear();
  });

  it("returns storage estimate", async () => {
    const estimate = await storageService.getEstimate();
    expect(estimate.workspaces).toBe(0);
    expect(estimate.papers).toBe(0);
    expect(estimate.totalDocuments).toBe(0);
  });

  it("returns quota estimate", async () => {
    const quota = await storageService.getQuotaEstimate();
    expect(quota.usagePercent).toBeGreaterThanOrEqual(0);
  });
});
