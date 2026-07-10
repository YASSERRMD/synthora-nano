import { describe, it, expect, beforeEach } from "vitest";
import { MockSessionManager } from "./adapters/mock-runtime";
import { ContextMonitor } from "./adapters/context-monitor";
import { SessionCompactor } from "./pipelines/compaction";
import {
  AIUnsupportedError,
  AIOutputValidationError,
  AIContextOverflowError,
} from "./errors";
import { validateStructuredOutput } from "./adapters/structured-output";
import { z } from "zod";

describe("MockSessionManager", () => {
  let manager: MockSessionManager;

  beforeEach(() => {
    manager = new MockSessionManager();
  });

  it("creates a session", async () => {
    const session = await manager.createSession();
    expect(session.id).toBeDefined();
    expect(session.state).toBe("ready");
    expect(session.createdAt).toBeDefined();
  });

  it("sends a prompt and returns a response", async () => {
    const session = await manager.createSession();
    manager.setPromptHandler(() => "Test response");
    const result = await manager.sendPrompt(session.id, "Hello");
    expect(result.text).toBe("Test response");
  });

  it("streams prompt responses", async () => {
    const session = await manager.createSession();
    manager.setPromptHandler(() => "Word1 Word2 Word3");
    const chunks: string[] = [];
    for await (const chunk of manager.streamPrompt(session.id, "Test")) {
      if (!chunk.done) {
        chunks.push(chunk.text);
      }
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join("")).toContain("Word1");
  });

  it("destroys a session", async () => {
    const session = await manager.createSession();
    manager.destroySession(session.id);
    expect(manager.getSession(session.id)).toBeUndefined();
  });

  it("returns default handler response", async () => {
    const session = await manager.createSession();
    const result = await manager.sendPrompt(session.id, "Hello world");
    expect(result.text).toContain("Mock response to:");
  });
});

describe("ContextMonitor", () => {
  let monitor: ContextMonitor;

  beforeEach(() => {
    monitor = new ContextMonitor();
  });

  it("tracks usage", () => {
    monitor.trackUsage({
      tokensUsed: 100,
      tokensRemaining: 900,
      maxTokens: 1000,
      usageRatio: 0.1,
    });
    expect(monitor.getCurrentUsage()).not.toBeNull();
    expect(monitor.getCurrentUsage()?.tokensUsed).toBe(100);
  });

  it("detects near overflow", () => {
    monitor.trackUsage({
      tokensUsed: 950,
      tokensRemaining: 50,
      maxTokens: 1000,
      usageRatio: 0.95,
    });
    expect(monitor.isNearOverflow()).toBe(true);
  });

  it("returns false for low usage", () => {
    monitor.trackUsage({
      tokensUsed: 100,
      tokensRemaining: 900,
      maxTokens: 1000,
      usageRatio: 0.1,
    });
    expect(monitor.isNearOverflow()).toBe(false);
  });

  it("detects would overflow", () => {
    monitor.trackUsage({
      tokensUsed: 950,
      tokensRemaining: 50,
      maxTokens: 1000,
      usageRatio: 0.95,
    });
    expect(monitor.wouldOverflow(100)).toBe(true);
    expect(monitor.wouldOverflow(10)).toBe(false);
  });

  it("throws on overflow check", () => {
    monitor.trackUsage({
      tokensUsed: 950,
      tokensRemaining: 50,
      maxTokens: 1000,
      usageRatio: 0.95,
    });
    expect(() => monitor.checkOverflow(100)).toThrow(AIContextOverflowError);
  });

  it("returns null when no usage", () => {
    expect(monitor.getCurrentUsage()).toBeNull();
  });

  it("resets usage history", () => {
    monitor.trackUsage({
      tokensUsed: 100,
      tokensRemaining: 900,
      maxTokens: 1000,
      usageRatio: 0.1,
    });
    monitor.reset();
    expect(monitor.getCurrentUsage()).toBeNull();
  });

  it("suggests compaction point", () => {
    for (let i = 0; i < 10; i++) {
      monitor.trackUsage({
        tokensUsed: (i + 1) * 100,
        tokensRemaining: 1000 - (i + 1) * 100,
        maxTokens: 1000,
        usageRatio: (i + 1) * 0.1,
      });
    }
    const point = monitor.suggestCompactionPoint();
    expect(point).toBeGreaterThanOrEqual(0);
  });
});

describe("SessionCompactor", () => {
  it("detects when compaction is needed", () => {
    const manager = new MockSessionManager();
    const monitor = new ContextMonitor();
    const compactor = new SessionCompactor(manager, monitor);

    expect(compactor.shouldCompact()).toBe(false);

    monitor.trackUsage({
      tokensUsed: 950,
      tokensRemaining: 50,
      maxTokens: 1000,
      usageRatio: 0.95,
    });

    expect(compactor.shouldCompact()).toBe(true);
  });

  it("compacts a session", async () => {
    const manager = new MockSessionManager();
    const monitor = new ContextMonitor();
    const compactor = new SessionCompactor(manager, monitor);

    const session = await manager.createSession();

    for (let i = 0; i < 10; i++) {
      monitor.trackUsage({
        tokensUsed: (i + 1) * 100,
        tokensRemaining: 1000 - (i + 1) * 100,
        maxTokens: 1000,
        usageRatio: (i + 1) * 0.1,
      });
    }

    const result = await compactor.compact(session.id);
    expect(result.messagesDropped).toBeGreaterThanOrEqual(0);
  });
});

describe("validateStructuredOutput", () => {
  const testSchema = z.object({
    name: z.string(),
    count: z.number(),
  });

  it("validates valid JSON from code block", async () => {
    const text = '```json\n{"name": "test", "count": 42}\n```';
    const result = await validateStructuredOutput(text, testSchema);
    expect(result.name).toBe("test");
    expect(result.count).toBe(42);
  });

  it("validates valid JSON from raw text", async () => {
    const text = 'Here is the result: {"name": "test", "count": 42}';
    const result = await validateStructuredOutput(text, testSchema);
    expect(result.name).toBe("test");
  });

  it("throws on invalid output after retries", async () => {
    const text = "No JSON here at all";
    await expect(
      validateStructuredOutput(text, testSchema, { retries: 0 }),
    ).rejects.toThrow(AIOutputValidationError);
  });

  it("validates nested schemas", async () => {
    const nestedSchema = z.object({
      items: z.array(z.object({ id: z.number(), label: z.string() })),
    });
    const text = '{"items": [{"id": 1, "label": "a"}]}';
    const result = await validateStructuredOutput(text, nestedSchema);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.label).toBe("a");
  });
});

describe("Error classes", () => {
  it("AIUnsupportedError has correct properties", () => {
    const error = new AIUnsupportedError();
    expect(error.code).toBe("AI_UNSUPPORTED");
    expect(error.userMessage).toContain("does not support");
  });

  it("AIContextOverflowError has correct properties", () => {
    const error = new AIContextOverflowError("test", 500);
    expect(error.code).toBe("AI_CONTEXT_OVERFLOW");
    expect(error.overflowAmount).toBe(500);
  });
});
