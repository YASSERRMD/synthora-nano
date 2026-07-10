import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../db/database";
import { comparisonService } from "./comparison-service";
import {
  identifyAgreements,
  identifyContradictions,
  identifyResearchGaps,
  generateChronologicalView,
} from "./comparison-analysis";
import type { ComparisonMatrixRow } from "./comparison-service";

describe("comparisonService", () => {
  beforeEach(async () => {
    await db.comparisonProjects.clear();
    await db.papers.clear();
    await db.paperAnalyses.clear();
  });

  it("creates a comparison project", async () => {
    const project = await comparisonService.create({
      workspaceId: "ws1",
      name: "Test Comparison",
      selectedPaperIds: [],
      dimensions: [{ id: "d1", name: "Methodology" }],
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe("Test Comparison");
  });

  it("retrieves a comparison project", async () => {
    const created = await comparisonService.create({
      workspaceId: "ws1",
      name: "Test",
      selectedPaperIds: [],
      dimensions: [],
    });

    const found = await comparisonService.getById(created.id);
    expect(found.name).toBe("Test");
  });

  it("updates a comparison project", async () => {
    const created = await comparisonService.create({
      workspaceId: "ws1",
      name: "Original",
      selectedPaperIds: [],
      dimensions: [],
    });

    const updated = await comparisonService.update(created.id, {
      name: "Updated",
    });
    expect(updated.name).toBe("Updated");
  });

  it("deletes a comparison project", async () => {
    const created = await comparisonService.create({
      workspaceId: "ws1",
      name: "To Delete",
      selectedPaperIds: [],
      dimensions: [],
    });

    await comparisonService.delete(created.id);
    await expect(comparisonService.getById(created.id)).rejects.toThrow();
  });

  it("generates empty matrix for no papers", async () => {
    const project = await comparisonService.create({
      workspaceId: "ws1",
      name: "Empty",
      selectedPaperIds: [],
      dimensions: [{ id: "d1", name: "Methodology" }],
    });

    const matrix = await comparisonService.generateMatrix(project.id);
    expect(matrix).toHaveLength(0);
  });
});

describe("comparison analysis", () => {
  const rows: ComparisonMatrixRow[] = [
    {
      dimension: "Methodology",
      values: { p1: "RCT", p2: "RCT" },
    },
    {
      dimension: "Metrics",
      values: { p1: "Accuracy", p2: "F1" },
    },
    {
      dimension: "Datasets",
      values: { p1: "Not identified", p2: "Not identified" },
    },
  ];

  it("identifies agreements", () => {
    const result = identifyAgreements(rows);
    expect(result.agreements).toHaveLength(1);
    expect(result.agreements[0]?.dimension).toBe("Methodology");
  });

  it("identifies contradictions", () => {
    const result = identifyContradictions(rows);
    expect(result.contradictions).toHaveLength(1);
    expect(result.contradictions[0]?.dimension).toBe("Metrics");
  });

  it("identifies research gaps", () => {
    const result = identifyResearchGaps(rows);
    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]?.dimension).toBe("Datasets");
  });

  it("generates chronological view", () => {
    const papers = [
      { id: "1", title: "Paper A", publicationYear: 2020 },
      { id: "2", title: "Paper B", publicationYear: 2022 },
      { id: "3", title: "Paper C", publicationYear: 2020 },
    ];

    const view = generateChronologicalView(papers);
    expect(view).toHaveLength(2);
    expect(view[0]?.year).toBe(2020);
    expect(view[0]?.papers).toHaveLength(2);
    expect(view[1]?.year).toBe(2022);
  });

  it("extracts dimension values from analysis", async () => {
    const analysis = {
      id: "a1",
      paperId: "p1",
      methodology: "Deep learning approach",
      datasets: ["ImageNet", "CIFAR-10"],
      metrics: ["Accuracy", "F1"],
      createdAt: "",
      updatedAt: "",
      schemaVersion: 1,
    };

    const dim1 = { id: "d1", name: "Methodology" };
    const dim2 = { id: "d2", name: "Datasets" };
    const dim3 = { id: "d3", name: "Metrics" };

    expect(comparisonService.extractDimensionValue(dim1, analysis)).toBe(
      "Deep learning approach",
    );
    expect(comparisonService.extractDimensionValue(dim2, analysis)).toBe(
      "ImageNet, CIFAR-10",
    );
    expect(comparisonService.extractDimensionValue(dim3, analysis)).toBe(
      "Accuracy, F1",
    );
  });

  it("handles undefined analysis", () => {
    const dim = { id: "d1", name: "Methodology" };
    expect(comparisonService.extractDimensionValue(dim, undefined)).toBe(
      "Not analyzed",
    );
  });
});
