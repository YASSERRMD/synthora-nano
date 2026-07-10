import type { Paper, PaperChunk } from "../../db/schemas";
import {
  paperRepository,
  paperChunkRepository,
} from "../../db/repositories/paper.repository";
import { getParser, type ParseResult } from "../../parsers";
import { chunkText } from "../../parsers/chunker";
import { simpleHash } from "../../parsers/chunker";
import { DatabaseError } from "../../types/errors";

export type IngestionStatus =
  | "idle"
  | "reading"
  | "parsing"
  | "chunking"
  | "persisting"
  | "completed"
  | "error";

export interface IngestionProgress {
  status: IngestionStatus;
  fileName: string;
  percentComplete: number;
  error?: string;
}

export interface IngestionResult {
  paper: Paper;
  chunks: PaperChunk[];
  parseResult: ParseResult;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts[parts.length - 1] ?? "").toLowerCase() : "";
}

function mapFileType(ext: string): Paper["fileType"] {
  switch (ext) {
    case "pdf":
      return "pdf";
    case "md":
    case "markdown":
      return "md";
    case "html":
    case "htm":
      return "html";
    default:
      return "txt";
  }
}

export async function ingestDocument(
  workspaceId: string,
  file: File,
  onProgress?: (progress: IngestionProgress) => void,
): Promise<IngestionResult> {
  onProgress?.({
    status: "reading",
    fileName: file.name,
    percentComplete: 10,
  });

  const ext = getFileExtension(file.name);
  const fileType = mapFileType(ext);
  const parser = getParser(ext);

  if (!parser) {
    throw new DatabaseError(`Unsupported file type: ${ext}`);
  }

  onProgress?.({
    status: "parsing",
    fileName: file.name,
    percentComplete: 30,
  });

  let parseResult: ParseResult;
  try {
    parseResult = await parser.parse(file);
  } catch (err) {
    throw new DatabaseError(
      `Failed to parse ${file.name}: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }

  onProgress?.({
    status: "chunking",
    fileName: file.name,
    percentComplete: 60,
  });

  const textChunks = chunkText(parseResult.text, 2000);
  const fileBuffer = await file.arrayBuffer();
  const fileHash = simpleHash(new TextDecoder().decode(fileBuffer));

  const duplicate = await paperRepository.getByFileHash(workspaceId, fileHash);
  if (duplicate) {
    throw new DatabaseError(
      `Duplicate file detected: ${file.name} already exists in this workspace.`,
    );
  }

  onProgress?.({
    status: "persisting",
    fileName: file.name,
    percentComplete: 80,
  });

  const paper = await paperRepository.create({
    workspaceId,
    title: parseResult.metadata.title ?? file.name,
    authors: [],
    fileName: file.name,
    fileType,
    fileHash,
    pageCount: parseResult.metadata.pageCount,
    language: parseResult.metadata.language,
    abstract: parseResult.metadata.title,
    status: "parsed",
  });

  const chunks = await paperChunkRepository.createMany(
    textChunks.map((chunk, i) => ({
      paperId: paper.id,
      chunkIndex: i,
      text: chunk.text,
      charOffsetStart: chunk.charOffsetStart,
      charOffsetEnd: chunk.charOffsetEnd,
      estimatedTokens: chunk.estimatedTokens,
      contentHash: simpleHash(chunk.text),
      sequenceNumber: i,
      extractionConfidence: 1,
      schemaVersion: 1,
    })),
  );

  onProgress?.({
    status: "completed",
    fileName: file.name,
    percentComplete: 100,
  });

  return { paper, chunks, parseResult };
}
