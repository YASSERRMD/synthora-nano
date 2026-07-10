import type { ParseResult, Parser, ParsedSection } from "./types";
import { readFileAsText } from "./file-reader";

export class MarkdownParser implements Parser {
  supportedTypes = ["md", "markdown"];

  async parse(file: File): Promise<ParseResult> {
    const text = await readFileAsText(file);
    const sections = this.extractSections(text);

    return {
      text: text.trim(),
      metadata: {
        title: this.extractTitle(text) ?? file.name.replace(/\.[^.]+$/, ""),
      },
      sections,
      warnings: [],
    };
  }

  private extractSections(text: string): ParsedSection[] {
    const lines = text.split("\n");
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          heading: headingMatch[2] ?? "",
          text: "",
          level: headingMatch[1]?.length ?? 1,
        };
      } else if (currentSection) {
        currentSection.text += line + "\n";
      } else {
        currentSection = { text: line + "\n" };
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections
      .map((s) => ({ ...s, text: s.text.trim() }))
      .filter((s) => s.text.length > 0);
  }

  private extractTitle(text: string): string | undefined {
    const h1Match = text.match(/^#\s+(.+)/m);
    return h1Match?.[1]?.trim();
  }
}
