import type { ParseResult, Parser } from "./types";
import { readFileAsText } from "./file-reader";

export class TextParser implements Parser {
  supportedTypes = ["txt", "text"];

  async parse(file: File): Promise<ParseResult> {
    const text = await readFileAsText(file);
    const sections = text
      .split(/\n\n+/)
      .filter((s) => s.trim().length > 0)
      .map((s) => ({ text: s.trim() }));

    return {
      text: text.trim(),
      metadata: {
        title: file.name.replace(/\.[^.]+$/, ""),
      },
      sections,
      warnings: [],
    };
  }
}
