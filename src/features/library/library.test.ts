import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../db/database";
import { libraryService } from "./library-service";
import { notesService } from "../notes/notes-service";
import { activityService } from "../activity/activity-service";

describe("libraryService", () => {
  const workspaceId = "ws-test";

  beforeEach(async () => {
    await db.papers.clear();
    await db.paperChunks.clear();
    await db.paperAnalyses.clear();
    activityService.clear();
  });

  it("returns papers with default view", async () => {
    const result = await libraryService.getPapers(workspaceId, {
      filters: {},
      sort: { field: "createdAt", direction: "desc" },
      page: 0,
      pageSize: 20,
    });
    expect(result.papers).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("checks for duplicates", async () => {
    const isDuplicate = await libraryService.checkDuplicate(
      workspaceId,
      "hash123",
    );
    expect(isDuplicate).toBe(false);
  });

  it("returns paper stats", async () => {
    const stats = await libraryService.getPaperStats(workspaceId);
    expect(stats.total).toBe(0);
  });
});

describe("notesService", () => {
  beforeEach(async () => {
    await db.researchNotes.clear();
  });

  it("creates and retrieves a note", async () => {
    const note = await notesService.create({
      workspaceId: "ws-1",
      title: "Test Note",
      body: "This is a test note.",
      origin: "user",
    });

    expect(note.id).toBeDefined();
    expect(note.title).toBe("Test Note");

    const found = await notesService.getById(note.id);
    expect(found.body).toBe("This is a test note.");
  });

  it("updates a note", async () => {
    const note = await notesService.create({
      workspaceId: "ws-1",
      body: "Original",
      origin: "user",
    });

    const updated = await notesService.update(note.id, {
      body: "Updated",
    });
    expect(updated.body).toBe("Updated");
  });

  it("deletes a note", async () => {
    const note = await notesService.create({
      workspaceId: "ws-1",
      body: "To delete",
      origin: "user",
    });

    await notesService.delete(note.id);
    await expect(notesService.getById(note.id)).rejects.toThrow();
  });

  it("searches notes by content", async () => {
    await notesService.create({
      workspaceId: "ws-1",
      title: "Machine Learning",
      body: "Deep learning concepts",
      origin: "user",
    });

    await notesService.create({
      workspaceId: "ws-1",
      title: "Literature Review",
      body: "Related work in NLP",
      origin: "user",
    });

    const results = await notesService.search("ws-1", "machine");
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Machine Learning");
  });
});

describe("activityService", () => {
  beforeEach(() => {
    activityService.clear();
  });

  it("logs and retrieves activities", () => {
    activityService.log({
      type: "import",
      message: "Paper imported",
      status: "success",
    });

    const activities = activityService.getAll();
    expect(activities).toHaveLength(1);
    expect(activities[0]?.message).toBe("Paper imported");
  });

  it("limits activity log size", () => {
    for (let i = 0; i < 150; i++) {
      activityService.log({
        type: "import",
        message: `Activity ${i}`,
        status: "success",
      });
    }

    const activities = activityService.getAll();
    expect(activities.length).toBeLessThanOrEqual(100);
  });

  it("clears activities", () => {
    activityService.log({
      type: "import",
      message: "Test",
      status: "success",
    });
    activityService.clear();
    expect(activityService.getAll()).toHaveLength(0);
  });
});
