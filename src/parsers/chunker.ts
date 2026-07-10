import type { ParsedSection } from "./types";

export interface Chunk {
  text: string;
  sectionHeading?: string;
  charOffsetStart: number;
  charOffsetEnd: number;
  estimatedTokens: number;
  contentHash: string;
}

const CHARS_PER_TOKEN = 4;
const MAX_CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

export function chunkSections(
  sections: ParsedSection[],
  fullText: string,
): Chunk[] {
  if (sections.length === 0) {
    return chunkText(fullText, 0);
  }

  const chunks: Chunk[] = [];
  let currentOffset = 0;

  for (const section of sections) {
    const sectionStart = fullText.indexOf(
      section.text.substring(0, 50),
      currentOffset,
    );
    const offset = sectionStart >= 0 ? sectionStart : currentOffset;

    const sectionChunks = chunkText(section.text, offset);
    for (const chunk of sectionChunks) {
      chunks.push({
        ...chunk,
        sectionHeading: section.heading,
      });
    }

    currentOffset = offset + section.text.length;
  }

  return chunks;
}

export function chunkText(text: string, baseOffset: number): Chunk[] {
  if (text.length <= MAX_CHUNK_SIZE) {
    return [
      {
        text,
        charOffsetStart: baseOffset,
        charOffsetEnd: baseOffset + text.length,
        estimatedTokens: estimateTokens(text),
        contentHash: simpleHash(text),
      },
    ];
  }

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + MAX_CHUNK_SIZE, text.length);
    const chunkText = text.substring(start, end);

    chunks.push({
      text: chunkText,
      charOffsetStart: baseOffset + start,
      charOffsetEnd: baseOffset + end,
      estimatedTokens: estimateTokens(chunkText),
      contentHash: simpleHash(chunkText),
    });

    start += MAX_CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}
