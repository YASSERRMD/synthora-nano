import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../database";
import { workspaceRepository } from "../repositories/workspace.repository";

describe("workspaceRepository", () => {
  beforeEach(async () => {
    await db.workspaces.clear();
  });

  describe("create", () => {
    it("creates a workspace with generated id and timestamps", async () => {
      const workspace = await workspaceRepository.create({
        name: "Test Workspace",
        description: "A test workspace",
      });

      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBe("Test Workspace");
      expect(workspace.description).toBe("A test workspace");
      expect(workspace.createdAt).toBeDefined();
      expect(workspace.updatedAt).toBeDefined();
      expect(workspace.schemaVersion).toBe(1);
    });
  });

  describe("getById", () => {
    it("returns a workspace by id", async () => {
      const created = await workspaceRepository.create({ name: "Test" });
      const found = await workspaceRepository.getById(created.id);
      expect(found.name).toBe("Test");
    });

    it("throws NotFoundError for non-existent id", async () => {
      await expect(
        workspaceRepository.getById("00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow("Workspace not found");
    });
  });

  describe("getAll", () => {
    it("returns all workspaces", async () => {
      await workspaceRepository.create({ name: "First" });
      await workspaceRepository.create({ name: "Second" });

      const all = await workspaceRepository.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("updates workspace fields", async () => {
      const created = await workspaceRepository.create({ name: "Original" });
      const updated = await workspaceRepository.update(created.id, {
        name: "Updated",
      });

      expect(updated.name).toBe("Updated");
      expect(updated.id).toBe(created.id);
      expect(updated.updatedAt).toBeDefined();
      expect(typeof updated.updatedAt).toBe("string");
    });
  });

  describe("delete", () => {
    it("deletes a workspace", async () => {
      const created = await workspaceRepository.create({ name: "To Delete" });
      await workspaceRepository.delete(created.id);

      await expect(workspaceRepository.getById(created.id)).rejects.toThrow();
    });
  });

  describe("getStats", () => {
    it("returns workspace statistics", async () => {
      const workspace = await workspaceRepository.create({ name: "Stats" });
      const stats = await workspaceRepository.getStats(workspace.id);

      expect(stats.paperCount).toBe(0);
      expect(stats.noteCount).toBe(0);
      expect(stats.conceptCount).toBe(0);
    });
  });
});
