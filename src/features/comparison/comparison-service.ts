import { db } from "../../db/database";
import type { ComparisonProject, ComparisonDimension } from "../../db/schemas";
import { DatabaseError, NotFoundError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export interface ComparisonMatrixRow {
  dimension: string;
  values: Record<string, string>;
}

export const comparisonService = {
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

  async getById(id: string): Promise<ComparisonProject> {
    const project = await db.comparisonProjects.get(id);
    if (!project) throw new NotFoundError("ComparisonProject");
    return project;
  },

  async getByWorkspaceId(workspaceId: string): Promise<ComparisonProject[]> {
    return db.comparisonProjects
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("createdAt");
  },

  async update(
    id: string,
    data: Partial<
      Omit<ComparisonProject, "id" | "createdAt" | "schemaVersion">
    >,
  ): Promise<ComparisonProject> {
    const existing = await this.getById(id);
    const updated: ComparisonProject = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    try {
      await db.comparisonProjects.update(id, updated);
      return updated;
    } catch (error) {
      throw new DatabaseError("Failed to update comparison project", {
        cause: error,
      });
    }
  },

  async delete(id: string): Promise<void> {
    await db.comparisonProjects.delete(id);
  },

  async generateMatrix(projectId: string): Promise<ComparisonMatrixRow[]> {
    const project = await this.getById(projectId);
    const papers = await Promise.all(
      project.selectedPaperIds.map((id) => db.papers.get(id)),
    );

    const validPapers = papers.filter(Boolean);
    if (validPapers.length === 0) return [];

    const analyses = await Promise.all(
      project.selectedPaperIds.map((id) =>
        db.paperAnalyses.where("paperId").equals(id).first(),
      ),
    );

    const rows: ComparisonMatrixRow[] = [];

    for (const dim of project.dimensions) {
      const values: Record<string, string> = {};
      for (let i = 0; i < validPapers.length; i++) {
        const paper = validPapers[i];
        const analysis = analyses[i];
        if (paper) {
          const key = paper.id;
          values[key] = this.extractDimensionValue(dim, analysis);
        }
      }
      rows.push({ dimension: dim.name, values });
    }

    return rows;
  },

  extractDimensionValue(
    dimension: ComparisonDimension,
    analysis: import("../../db/schemas").PaperAnalysis | undefined,
  ): string {
    if (!analysis) return "Not analyzed";

    const name = dimension.name.toLowerCase();
    if (name.includes("method"))
      return analysis.methodology ?? "Not identified";
    if (name.includes("dataset"))
      return analysis.datasets?.join(", ") ?? "Not identified";
    if (name.includes("metric"))
      return analysis.metrics?.join(", ") ?? "Not identified";
    if (name.includes("finding"))
      return analysis.majorFindings?.join("; ") ?? "Not identified";
    if (name.includes("limit"))
      return analysis.limitations?.join("; ") ?? "Not identified";
    return "Not identified";
  },
};
