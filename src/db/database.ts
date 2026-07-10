import Dexie, { type EntityTable } from "dexie";
import type {
  Workspace,
  Paper,
  PaperChunk,
  PaperAnalysis,
  ResearchNote,
  Concept,
  ComparisonProject,
  ChatThread,
  ChatMessage,
} from "./schemas";

export class SynthoraDatabase extends Dexie {
  workspaces!: EntityTable<Workspace, "id">;
  papers!: EntityTable<Paper, "id">;
  paperChunks!: EntityTable<PaperChunk, "id">;
  paperAnalyses!: EntityTable<PaperAnalysis, "id">;
  researchNotes!: EntityTable<ResearchNote, "id">;
  concepts!: EntityTable<Concept, "id">;
  comparisonProjects!: EntityTable<ComparisonProject, "id">;
  chatThreads!: EntityTable<ChatThread, "id">;
  chatMessages!: EntityTable<ChatMessage, "id">;

  constructor() {
    super("synthora-nano");

    this.version(1).stores({
      workspaces: "id, name, createdAt, updatedAt",
      papers: "id, workspaceId, title, status, fileHash, createdAt",
      paperChunks: "id, paperId, chunkIndex, contentHash",
      paperAnalyses: "id, paperId",
      researchNotes: "id, workspaceId, paperId, origin, createdAt",
      concepts: "id, workspaceId, canonicalName, userConfirmed",
      comparisonProjects: "id, workspaceId, name",
      chatThreads: "id, workspaceId, paperId, createdAt",
      chatMessages: "id, threadId, role, createdAt",
    });
  }
}

export const db = new SynthoraDatabase();
