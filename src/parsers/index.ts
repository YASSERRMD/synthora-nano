import type { Parser } from "./types";
import { TextParser } from "./text.parser";
import { MarkdownParser } from "./markdown.parser";
import { HTMLParser } from "./html.parser";
import { PDFParser } from "./pdf.parser";

const parsers = new Map<string, Parser>();

function registerParser(parser: Parser) {
  for (const type of parser.supportedTypes) {
    parsers.set(type, parser);
  }
}

registerParser(new TextParser());
registerParser(new MarkdownParser());
registerParser(new HTMLParser());
registerParser(new PDFParser());

export function getParser(fileType: string): Parser | undefined {
  return parsers.get(fileType.toLowerCase());
}

export function getSupportedTypes(): string[] {
  return Array.from(parsers.keys());
}

export function isFileTypeSupported(fileType: string): boolean {
  return parsers.has(fileType.toLowerCase());
}

export type { ParseResult, ParsedSection } from "./types";
export { TextParser } from "./text.parser";
export { MarkdownParser } from "./markdown.parser";
export { HTMLParser } from "./html.parser";
export { PDFParser } from "./pdf.parser";
