import type { PaperChunk } from "../../db/schemas";

export interface ClassifiedSection {
  heading: string;
  category:
    | "introduction"
    | "background"
    | "methodology"
    | "results"
    | "discussion"
    | "conclusion"
    | "references"
    | "other";
  chunks: PaperChunk[];
}

const HEADING_PATTERNS: Record<string, RegExp[]> = {
  introduction: [/^introduction/i, /^1[.\s]/i],
  background: [/^background/i, /^related\s+work/i, /^literature/i],
  methodology: [
    /^method/i,
    /^approach/i,
    /^experiment/i,
    /^implementation/i,
    /^system\s+design/i,
  ],
  results: [/^result/i, /^evaluation/i, /^finding/i, /^analysis/i],
  discussion: [/^discussion/i, /^interpretation/i],
  conclusion: [/^conclusion/i, /^summary/i, /^future\s+work/i],
  references: [/^references/i, /^bibliography/i, /^citations/i],
};

export function classifySections(chunks: PaperChunk[]): ClassifiedSection[] {
  const sectionMap = new Map<string, ClassifiedSection>();

  for (const chunk of chunks) {
    const heading = chunk.sectionHeading ?? "Untitled";
    const category = classifyHeading(heading);

    const existing = sectionMap.get(heading);
    if (existing) {
      existing.chunks.push(chunk);
    } else {
      sectionMap.set(heading, {
        heading,
        category,
        chunks: [chunk],
      });
    }
  }

  return Array.from(sectionMap.values());
}

function classifyHeading(heading: string): ClassifiedSection["category"] {
  for (const [category, patterns] of Object.entries(HEADING_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(heading)) {
        return category as ClassifiedSection["category"];
      }
    }
  }
  return "other";
}

export function getChunksByCategory(
  sections: ClassifiedSection[],
  category: ClassifiedSection["category"],
): PaperChunk[] {
  return sections
    .filter((s) => s.category === category)
    .flatMap((s) => s.chunks);
}

export function concatenateChunks(chunks: PaperChunk[]): string {
  return chunks
    .sort((a, b) => a.chunkIndex - b.chunkIndex)
    .map((c) => c.text)
    .join("\n\n");
}
