import type { ParseResult, Parser, ParsedSection } from "./types";
import { ParseError } from "../types/errors";
import { readFileAsArrayBuffer } from "./file-reader";

export class PDFParser implements Parser {
  supportedTypes = ["pdf"];

  async parse(file: File): Promise<ParseResult> {
    const pdfjsLib = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc = "";

    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const warnings: string[] = [];
    const allTexts: string[] = [];
    const sections: ParsedSection[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");

        if (pageText.trim()) {
          allTexts.push(pageText);
          sections.push({
            text: pageText.trim(),
            heading: `Page ${i}`,
          });
        } else {
          warnings.push(
            `Page ${i} appears to have no extractable text (may be image-only)`,
          );
        }
      } catch {
        warnings.push(`Failed to extract text from page ${i}`);
      }
    }

    const text = allTexts.join("\n\n");

    if (text.trim().length === 0) {
      throw new ParseError(
        "PDF appears to be image-only or contains no extractable text. Consider using a text-import fallback.",
      );
    }

    return {
      text: text.trim(),
      metadata: {
        title: file.name.replace(/\.[^.]+$/, ""),
        pageCount: pdf.numPages,
      },
      sections,
      warnings,
    };
  }
}
