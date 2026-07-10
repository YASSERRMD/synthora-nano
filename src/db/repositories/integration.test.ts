import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../database";
import { workspaceRepository } from "../repositories/workspace.repository";
import {
  paperRepository,
  paperChunkRepository,
} from "../repositories/paper.repository";
import { noteRepository } from "../repositories/note.repository";
import { conceptRepository } from "../repositories/concept.repository";

describe("workspace deletion cascade", () => {
  beforeEach(async () => {
    await db.workspaces.clear();
    await db.papers.clear();
    await db.paperChunks.clear();
    await db.paperAnalyses.clear();
    await db.researchNotes.clear();
    await db.concepts.clear();
  });

  it("deletes workspace and cascades to papers", async () => {
    const workspace = await workspaceRepository.create({ name: "Test" });
    const paper = await paperRepository.create({
      workspaceId: workspace.id,
      title: "Test Paper",
      authors: [],
      fileName: "test.pdf",
      fileType: "pdf",
      fileHash: "abc123",
      status: "imported",
    });

    await workspaceRepository.delete(workspace.id);

    const papers = await paperRepository.getByWorkspaceId(workspace.id);
    expect(papers).toHaveLength(0);
    expect(await db.papers.get(paper.id)).toBeUndefined();
  });

  it("deletes workspace and cascades to notes", async () => {
    const workspace = await workspaceRepository.create({ name: "Test" });
    await noteRepository.create({
      workspaceId: workspace.id,
      title: "Test Note",
      body: "Note content",
      origin: "user",
    });

    await workspaceRepository.delete(workspace.id);

    const notes = await noteRepository.getByWorkspaceId(workspace.id);
    expect(notes).toHaveLength(0);
  });

  it("deletes workspace and cascades to concepts", async () => {
    const workspace = await workspaceRepository.create({ name: "Test" });
    await conceptRepository.create({
      workspaceId: workspace.id,
      canonicalName: "Test Concept",
      userConfirmed: false,
      aiSuggested: true,
    });

    await workspaceRepository.delete(workspace.id);

    const concepts = await conceptRepository.getByWorkspaceId(workspace.id);
    expect(concepts).toHaveLength(0);
  });
});

describe("paper duplicate detection", () => {
  beforeEach(async () => {
    await db.workspaces.clear();
    await db.papers.clear();
  });

  it("detects duplicate papers by file hash", async () => {
    const workspace = await workspaceRepository.create({ name: "Test" });
    await paperRepository.create({
      workspaceId: workspace.id,
      title: "Original",
      authors: [],
      fileName: "paper.pdf",
      fileType: "pdf",
      fileHash: "hash123",
      status: "imported",
    });

    const duplicate = await paperRepository.getByFileHash(
      workspace.id,
      "hash123",
    );
    expect(duplicate).toBeDefined();
    expect(duplicate!.title).toBe("Original");

    const unique = await paperRepository.getByFileHash(workspace.id, "hash456");
    expect(unique).toBeUndefined();
  });
});

describe("paper chunk operations", () => {
  beforeEach(async () => {
    await db.papers.clear();
    await db.paperChunks.clear();
  });

  it("creates and retrieves paper chunks", async () => {
    const chunks = await paperChunkRepository.createMany([
      {
        paperId: "paper-1",
        chunkIndex: 0,
        text: "First chunk",
        charOffsetStart: 0,
        charOffsetEnd: 11,
        estimatedTokens: 3,
        contentHash: "hash1",
        sequenceNumber: 0,
        schemaVersion: 1,
      },
      {
        paperId: "paper-1",
        chunkIndex: 1,
        text: "Second chunk",
        charOffsetStart: 12,
        charOffsetEnd: 24,
        estimatedTokens: 3,
        contentHash: "hash2",
        sequenceNumber: 1,
        schemaVersion: 1,
      },
    ]);

    expect(chunks).toHaveLength(2);

    const retrieved = await paperChunkRepository.getByPaperId("paper-1");
    expect(retrieved).toHaveLength(2);
    expect(retrieved[0]!.chunkIndex).toBe(0);
    expect(retrieved[1]!.chunkIndex).toBe(1);
  });
});
