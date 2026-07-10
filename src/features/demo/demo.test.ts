import { describe, it, expect, vi } from "vitest";
import { seedDemoData, isDemoSeeded, clearDemoData } from "./demo-service";

vi.mock("../../db/database", () => ({
  db: {
    workspaces: {
      add: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    papers: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    paperAnalyses: {
      put: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    paperChunks: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    },
    concepts: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    researchNotes: {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}));

describe("demo-service", () => {
  it("seeds demo data", async () => {
    const result = await seedDemoData("demo-ws-1");
    expect(result.papers).toBe(3);
    expect(result.analyses).toBe(3);
    expect(result.concepts).toBe(2);
    expect(result.notes).toBe(1);
  });

  it("checks if demo is seeded", async () => {
    const result = await isDemoSeeded("demo-ws-1");
    expect(typeof result).toBe("boolean");
  });

  it("clears demo data", async () => {
    await clearDemoData("demo-ws-1");
  });
});
