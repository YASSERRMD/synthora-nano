import { db } from "../database";
import type { ComparisonProject } from "../schemas";
import { DatabaseError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const comparisonRepository = {
  async create(
    data: Omit<
      ComparisonProject,
      "id" | "createdAt" | "updatedAt" | "schemaVersion"
    >,
  ): Promise<ComparisonProject> {
    const project: ComparisonProject = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.comparisonProjects.add(project);
      return project;
    } catch (error) {
      throw new DatabaseError("Failed to create comparison project", {
        cause: error,
      });
    }
  },

  async getById(id: string): Promise<ComparisonProject | undefined> {
    return db.comparisonProjects.get(id);
  },

  async getByWorkspaceId(workspaceId: string): Promise<ComparisonProject[]> {
    return db.comparisonProjects
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("updatedAt");
  },

  async update(
    id: string,
    data: Partial<
      Omit<ComparisonProject, "id" | "createdAt" | "schemaVersion">
    >,
  ): Promise<ComparisonProject> {
    const existing = await db.comparisonProjects.get(id);
    if (!existing) {
      throw new DatabaseError("Comparison project not found");
    }

    const updated: ComparisonProject = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    await db.comparisonProjects.update(id, updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.comparisonProjects.delete(id);
  },
};
