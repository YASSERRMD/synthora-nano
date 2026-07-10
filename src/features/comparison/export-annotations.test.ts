import { describe, it, expect } from "vitest";
import { exportMatrixToCSV, exportMatrixToMarkdown } from "./export-matrix";
import {
  saveCellEdit,
  loadCellEdits,
  clearCellEdits,
  applyEditsToMatrix,
} from "./editable-cells";
import {
  addAnnotation,
  loadAnnotations,
  removeAnnotation,
  saveAnnotations,
  buildAnnotatedMatrix,
} from "./annotations";
import type { ComparisonProject } from "../../db/schemas";

const mockProject: ComparisonProject = {
  id: "proj1",
  workspaceId: "ws1",
  name: "Test Project",
  selectedPaperIds: ["p1", "p2"],
  dimensions: [
    { id: "d1", name: "Methodology" },
    { id: "d2", name: "Metrics" },
  ],
  createdAt: "",
  updatedAt: "",
  schemaVersion: 1,
};

const mockMatrix = [
  { dimension: "Methodology", values: { p1: "RCT", p2: "Survey" } },
  { dimension: "Metrics", values: { p1: "Accuracy", p2: "F1" } },
];

describe("exportMatrixToCSV", () => {
  it("generates CSV from matrix", () => {
    const titles = new Map([
      ["p1", "Paper A"],
      ["p2", "Paper B"],
    ]);
    const csv = exportMatrixToCSV(mockProject, mockMatrix, titles);
    expect(csv).toContain("Dimension");
    expect(csv).toContain("Paper A");
    expect(csv).toContain("RCT");
  });

  it("escapes CSV values", () => {
    const matrix = [{ dimension: "Test", values: { p1: "Value, with comma" } }];
    const titles = new Map([["p1", "Paper"]]);
    const csv = exportMatrixToCSV(
      { ...mockProject, selectedPaperIds: ["p1"] },
      matrix,
      titles,
    );
    expect(csv).toContain('"Value, with comma"');
  });
});

describe("exportMatrixToMarkdown", () => {
  it("generates markdown table", () => {
    const titles = new Map([
      ["p1", "Paper A"],
      ["p2", "Paper B"],
    ]);
    const md = exportMatrixToMarkdown(mockProject, mockMatrix, titles);
    expect(md).toContain("| Dimension |");
    expect(md).toContain("Paper A");
    expect(md).toContain("RCT");
    expect(md).toContain("---");
  });
});

describe("editable cells", () => {
  const projectId = "test-proj";

  it("saves and loads cell edits", () => {
    clearCellEdits(projectId);
    const edit = {
      projectId,
      paperId: "p1",
      dimensionId: "d1",
      originalValue: "Old",
      editedValue: "New",
      editedAt: new Date().toISOString(),
    };

    saveCellEdit(projectId, edit);
    const edits = loadCellEdits(projectId);
    expect(edits).toHaveLength(1);
    expect(edits[0]?.editedValue).toBe("New");
  });

  it("applies edits to matrix", () => {
    const edits = [
      {
        projectId,
        paperId: "p1",
        dimensionId: "d1",
        originalValue: "RCT",
        editedValue: "Modified RCT",
        editedAt: "",
      },
    ];

    const result = applyEditsToMatrix(
      mockMatrix,
      edits,
      mockProject.dimensions,
    );
    expect(result[0]?.values["p1"]).toBe("Modified RCT");
  });

  it("clears cell edits", () => {
    clearCellEdits(projectId);
    expect(loadCellEdits(projectId)).toHaveLength(0);
  });
});

describe("annotations", () => {
  const projectId = "annot-proj-unique";

  it("adds and loads annotations", () => {
    saveAnnotations(projectId, []);
    const annots = addAnnotation(
      projectId,
      "d1-p1",
      "Important finding",
      "user",
    );
    expect(annots).toHaveLength(1);

    const loaded = loadAnnotations(projectId);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.text).toBe("Important finding");
  });

  it("removes an annotation", () => {
    saveAnnotations(projectId, []);
    const annots = addAnnotation(projectId, "d1-p1", "Test", "user");
    const id = annots[0]?.id;
    if (id) {
      const remaining = removeAnnotation(projectId, id);
      expect(remaining).toHaveLength(0);
    }
  });

  it("builds annotated matrix", () => {
    saveAnnotations(projectId, []);
    const matrix = buildAnnotatedMatrix(mockProject, mockMatrix, []);
    expect(matrix.cells).toHaveLength(4);
    expect(matrix.annotations).toHaveLength(0);
  });
});
