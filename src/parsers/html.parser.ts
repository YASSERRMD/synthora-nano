import type { ParseResult, Parser, ParsedSection } from "./types";
import { readFileAsText } from "./file-reader";

export class HTMLParser implements Parser {
  supportedTypes = ["html", "htm"];

  async parse(file: File): Promise<ParseResult> {
    const html = await readFileAsText(file);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const warnings: string[] = [];

    const title =
      doc.querySelector("title")?.textContent?.trim() ??
      file.name.replace(/\.[^.]+$/, "");

    const scripts = doc.querySelectorAll("script, style, nav, footer, header");
    scripts.forEach((el) => el.remove());

    const body = doc.body;
    if (!body) {
      warnings.push("No body element found in HTML");
      return {
        text: "",
        metadata: { title },
        sections: [],
        warnings,
      };
    }

    const text = this.extractText(body);
    const sections = this.extractSections(body);

    return {
      text: text.trim(),
      metadata: { title },
      sections,
      warnings,
    };
  }

  private extractText(element: Element): string {
    let text = "";
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent ?? "";
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        if (el.tagName === "P" || el.tagName === "DIV" || el.tagName === "BR") {
          text += "\n";
        }
        text += this.extractText(el);
      }
    }
    return text;
  }

  private extractSections(body: Element): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const headings = body.querySelectorAll("h1, h2, h3, h4, h5, h6");

    if (headings.length === 0) {
      const text = this.extractText(body);
      if (text.trim()) {
        sections.push({ text: text.trim() });
      }
      return sections;
    }

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1] ?? "1", 10);
      let textContent = "";
      let sibling = heading.nextElementSibling;
      while (sibling && !/^H[1-6]$/.test(sibling.tagName)) {
        textContent += this.extractText(sibling) + "\n";
        sibling = sibling.nextElementSibling;
      }
      const trimmedText = textContent.trim();
      if (trimmedText) {
        sections.push({
          heading: heading.textContent?.trim(),
          text: trimmedText,
          level,
        });
      }
    });

    return sections;
  }
}
