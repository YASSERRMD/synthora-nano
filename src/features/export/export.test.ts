import { describe, it, expect, vi } from "vitest";
import { validateSnapshot, importSnapshot } from "./import-service";
import { getDataInventory, deleteWorkspaceData } from "./privacy-service";
import { sanitizeHTML, sanitizeMarkdown, validateFileSize } from "./sanitizer";
import type { WorkspaceSnapshot } from "./export-service";

vi.mock("../../db/database", () => ({
  db: {
    workspaces: {
      get: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    papers: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    notes: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    researchNotes: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    paperAnalyses: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      count: vi.fn().mockResolvedValue(0),
    },
    paperChunks: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    concepts: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    chatThreads: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    chatMessages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    comparisonProjects: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        }),
      }),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

const mockSnapshot: WorkspaceSnapshot = {
  meta: {
    version: "0.1.0",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    checksum: "abc123",
    includesSourceFiles: false,
  },
  workspace: {
    id: "ws-1",
    name: "Test Workspace",
    createdAt: "",
    updatedAt: "",
  },
  papers: [
    {
      id: "p1",
      title: "Paper 1",
      fileName: "paper1.pdf",
      fileType: "pdf",
      createdAt: "",
    },
  ],
  notes: [{ id: "n1", title: "Note 1", body: "Some notes", createdAt: "" }],
  analyses: [
    {
      paperId: "p1",
      methodology: "RCT",
      majorFindings: ["Found something"],
    },
  ],
  concepts: [{ id: "c1", canonicalName: "Concept A", linkedPaperIds: ["p1"] }],
  comparisons: [],
};

describe("validateSnapshot", () => {
  it("validates a correct snapshot", async () => {
    const result = await validateSnapshot(mockSnapshot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects null input", async () => {
    const result = await validateSnapshot(null);
    expect(result.valid).toBe(false);
  });

  it("rejects missing meta", async () => {
    const result = await validateSnapshot({
      workspace: {},
      papers: [],
      notes: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing meta section");
  });

  it("rejects missing workspace", async () => {
    const result = await validateSnapshot({
      meta: { version: "1", checksum: "x", exportedAt: "" },
      papers: [],
      notes: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing workspace section");
  });
});

describe("importSnapshot", () => {
  it("imports a snapshot", async () => {
    const result = await importSnapshot(mockSnapshot);
    expect(result.success).toBe(true);
    expect(result.workspaceId).toBe("ws-1");
  });
});

describe("privacy-service", () => {
  it("gets data inventory", async () => {
    const inventory = await getDataInventory("ws-1");
    expect(inventory.items).toBeDefined();
    expect(inventory.totalItems).toBe(0);
  });

  it("deletes workspace data", async () => {
    const result = await deleteWorkspaceData("ws-1", {
      deletePapers: true,
      deleteNotes: true,
    });
    expect(result.deleted).toBe(0);
  });
});

describe("sanitizer", () => {
  it("removes script tags from HTML", () => {
    const html = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
  });

  it("removes event handlers", () => {
    const html = '<div onclick="alert(1)">Test</div>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain("onclick");
  });

  it("sanitizes markdown", () => {
    const md = "Hello\n<script>alert(1)</script>\nWorld";
    const result = sanitizeMarkdown(md);
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
  });

  it("validates file size within limit", () => {
    const result = validateFileSize(1000, 1);
    expect(result.valid).toBe(true);
  });

  it("rejects oversized files", () => {
    const result = validateFileSize(2 * 1024 * 1024, 1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds");
  });
});
