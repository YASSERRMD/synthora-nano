export interface ParseResult {
  text: string;
  metadata: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    language?: string;
  };
  sections: ParsedSection[];
  warnings: string[];
}

export interface ParsedSection {
  heading?: string;
  text: string;
  level?: number;
}

export interface Parser {
  parse(file: File): Promise<ParseResult>;
  supportedTypes: string[];
}
