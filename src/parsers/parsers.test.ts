import { describe, it, expect } from "vitest";
import { TextParser } from "./text.parser";
import { MarkdownParser } from "./markdown.parser";
import { HTMLParser } from "./html.parser";
import { chunkText, estimateTokens, simpleHash } from "./chunker";

function createMockFile(name: string, content: string): File {
  const blob = new Blob([content]);
  return new File([blob], name, { type: "text/plain" });
}

describe("TextParser", () => {
  const parser = new TextParser();

  it("parses plain text files", async () => {
    const file = createMockFile(
      "test.txt",
      "Hello world.\n\nSecond paragraph.",
    );
    const result = await parser.parse(file);

    expect(result.text).toBe("Hello world.\n\nSecond paragraph.");
    expect(result.sections).toHaveLength(2);
    expect(result.metadata.title).toBe("test");
  });

  it("handles empty files", async () => {
    const file = createMockFile("empty.txt", "");
    const result = await parser.parse(file);

    expect(result.text).toBe("");
    expect(result.sections).toHaveLength(0);
  });
});

describe("MarkdownParser", () => {
  const parser = new MarkdownParser();

  it("parses markdown with headings", async () => {
    const content = `# Title\n\nSome intro text.\n\n## Methods\n\nMethod description.\n\n## Results\n\nResults here.`;
    const file = createMockFile("paper.md", content);
    const result = await parser.parse(file);

    expect(result.metadata.title).toBe("Title");
    expect(result.sections).toHaveLength(3);
    expect(result.sections[0]?.heading).toBe("Title");
    expect(result.sections[1]?.heading).toBe("Methods");
    expect(result.sections[2]?.heading).toBe("Results");
  });

  it("extracts h1 as title", async () => {
    const content = `# Research Paper\n\nContent here.`;
    const file = createMockFile("doc.md", content);
    const result = await parser.parse(file);

    expect(result.metadata.title).toBe("Research Paper");
  });
});

describe("HTMLParser", () => {
  const parser = new HTMLParser();

  it("parses HTML documents", async () => {
    const content = `<html><head><title>Test Title</title></head><body><h1>Heading</h1><p>Paragraph text.</p></body></html>`;
    const file = createMockFile("test.html", content);
    const result = await parser.parse(file);

    expect(result.metadata.title).toBe("Test Title");
    expect(result.text).toContain("Heading");
    expect(result.text).toContain("Paragraph text.");
  });

  it("removes script and style elements", async () => {
    const content = `<html><body><script>evil()</script><p>Clean text</p><style>.x{color:red}</style></body></html>`;
    const file = createMockFile("test.html", content);
    const result = await parser.parse(file);

    expect(result.text).not.toContain("evil");
    expect(result.text).toContain("Clean text");
  });
});

describe("chunkText", () => {
  it("returns single chunk for short text", () => {
    const chunks = chunkText("Hello world", 0);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.text).toBe("Hello world");
    expect(chunks[0]?.charOffsetStart).toBe(0);
    expect(chunks[0]?.charOffsetEnd).toBe(11);
  });

  it("splits long text into multiple chunks", () => {
    const longText = "a".repeat(5000);
    const chunks = chunkText(longText, 100);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.charOffsetStart).toBe(100);
  });
});

describe("estimateTokens", () => {
  it("estimates tokens based on character count", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcdefgh")).toBe(2);
  });
});

describe("simpleHash", () => {
  it("generates consistent hashes", () => {
    expect(simpleHash("hello")).toBe(simpleHash("hello"));
    expect(simpleHash("hello")).not.toBe(simpleHash("world"));
  });
});
