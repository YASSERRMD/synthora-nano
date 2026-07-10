import { describe, it, expect, beforeEach } from "vitest";
import {
  buildIndex,
  searchIndex,
  getIndexSize,
  clearIndex,
  type IndexEntry,
} from "./retrieval-index";
import { weightedSearch } from "./weighted-search";
import { packContext, estimateTokens, getContextUsage } from "./context-budget";
import {
  validateCitations,
  getOverallCitationHealth,
} from "./citation-validator";
import {
  getModeConfig,
  getAvailableModes,
  validateModeSelection,
} from "./modes";
import type { ChatMessage } from "../../db/schemas";

const mockEntries: IndexEntry[] = [
  {
    id: "entry-1",
    paperId: "paper-1",
    title: "Deep Learning for Image Classification",
    text: "This paper presents a new deep learning approach for image classification using convolutional neural networks.",
    section: "methodology",
    methodology: "Convolutional Neural Network",
    findings: ["Achieved 95% accuracy", "Reduced training time by 30%"],
    datasets: ["ImageNet", "CIFAR-10"],
    metrics: ["Accuracy", "F1-Score"],
  },
  {
    id: "entry-2",
    paperId: "paper-2",
    title: "Transfer Learning in NLP",
    text: "We explore transfer learning techniques for natural language processing tasks using transformer models.",
    section: "findings",
    methodology: "Transfer Learning",
    findings: ["State-of-the-art on GLUE", "Improved generalization"],
    datasets: ["GLUE", "SQuAD"],
    metrics: ["BLEU", "ROUGE"],
  },
  {
    id: "entry-3",
    paperId: "paper-1",
    chunkId: "chunk-1",
    title: "Deep Learning for Image Classification - Results",
    text: "Our approach achieved state-of-the-art results on ImageNet with 95% accuracy.",
    section: "results",
  },
];

const mockMessage: ChatMessage = {
  id: "msg-1",
  threadId: "thread-1",
  role: "assistant",
  content: "Based on paper-1, the approach achieves 95% accuracy.",
  citations: ["paper-1", "paper-2"],
  createdAt: "",
};

beforeEach(() => {
  clearIndex();
});

describe("retrieval-index", () => {
  it("builds and queries index", () => {
    buildIndex(mockEntries);
    expect(getIndexSize()).toBe(3);
  });

  it("searches by query", () => {
    buildIndex(mockEntries);
    const results = searchIndex("deep learning image");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.entry.paperId).toBe("paper-1");
  });

  it("filters by paper IDs", () => {
    buildIndex(mockEntries);
    const results = searchIndex("learning", { paperIds: ["paper-2"] });
    expect(results.every((r) => r.entry.paperId === "paper-2")).toBe(true);
  });

  it("filters by section", () => {
    buildIndex(mockEntries);
    const results = searchIndex("results", { section: "results" });
    expect(results.every((r) => r.entry.section === "results")).toBe(true);
  });

  it("returns empty for no match", () => {
    buildIndex(mockEntries);
    const results = searchIndex("xyz_nonexistent");
    expect(results).toHaveLength(0);
  });

  it("clears index", () => {
    buildIndex(mockEntries);
    clearIndex();
    expect(getIndexSize()).toBe(0);
  });
});

describe("weighted-search", () => {
  it("applies field weights", () => {
    buildIndex(mockEntries);
    const results = weightedSearch("deep learning", { limit: 5 });
    expect(results.length).toBeGreaterThan(0);
  });

  it("diversifies results by paper", () => {
    buildIndex(mockEntries);
    const results = weightedSearch("learning", {
      limit: 10,
      diversityEnabled: true,
    });
    const paperIds = results.map((r) => r.entry.paperId);
    expect(new Set(paperIds).size).toBe(paperIds.length);
  });
});

describe("context-budget", () => {
  it("estimates tokens", () => {
    expect(estimateTokens("hello")).toBe(2);
    expect(estimateTokens("")).toBe(0);
  });

  it("packs context within budget", () => {
    buildIndex(mockEntries);
    const results = searchIndex("deep learning");
    const packed = packContext(results, 100);
    expect(packed.budget.usedTokens).toBeLessThanOrEqual(100);
  });

  it("reports truncation", () => {
    const results = mockEntries.map((entry, i) => ({
      entry,
      score: 1 - i * 0.1,
      matchedFields: ["text"],
    }));
    const packed = packContext(results, 10);
    expect(packed.truncated).toBe(true);
  });

  it("computes context usage", () => {
    const packed = {
      results: [],
      budget: { maxTokens: 100, usedTokens: 80, remainingTokens: 20 },
      truncated: false,
    };
    const usage = getContextUsage(packed);
    expect(usage.percentage).toBe(80);
    expect(usage.status).toBe("warning");
  });
});

describe("citation-validator", () => {
  it("validates correct citations", () => {
    const paperIds = new Set(["paper-1", "paper-2"]);
    const result = validateCitations(mockMessage, paperIds);
    expect(result.isValid).toBe(true);
    expect(result.invalidCitations).toHaveLength(0);
  });

  it("detects invalid citations", () => {
    const paperIds = new Set(["paper-1"]);
    const msg: ChatMessage = {
      ...mockMessage,
      citations: ["paper-1", "nonexistent"],
    };
    const result = validateCitations(msg, paperIds);
    expect(result.isValid).toBe(false);
    expect(result.invalidCitations).toContain("nonexistent");
  });

  it("detects warnings", () => {
    const paperIds = new Set(["paper-1", "paper-2"]);
    const msg: ChatMessage = {
      ...mockMessage,
      warnings: ["Citation may be inaccurate"],
    };
    const result = validateCitations(msg, paperIds);
    expect(result.isValid).toBe(false);
    expect(result.hasWarnings).toBe(true);
  });

  it("computes overall health", () => {
    const validations = [
      {
        messageId: "1",
        validCitations: [],
        invalidCitations: [],
        hasWarnings: false,
        isValid: true,
      },
      {
        messageId: "2",
        validCitations: [],
        invalidCitations: ["x"],
        hasWarnings: false,
        isValid: false,
      },
    ];
    const health = getOverallCitationHealth(validations);
    expect(health.healthPercentage).toBe(50);
  });
});

describe("modes", () => {
  it("returns mode config", () => {
    const config = getModeConfig("ask-selected-paper");
    expect(config.label).toBe("Ask Selected Paper");
    expect(config.maxPapers).toBe(1);
  });

  it("lists modes requiring papers", () => {
    const modes = getAvailableModes(true);
    expect(modes.every((m) => m.requiresPapers)).toBe(true);
  });

  it("validates mode selection", () => {
    expect(validateModeSelection("ask-selected-paper", 1).valid).toBe(true);
    expect(validateModeSelection("ask-selected-paper", 2).valid).toBe(false);
    expect(validateModeSelection("ask-workspace", 0).valid).toBe(true);
  });
});
