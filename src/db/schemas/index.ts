import { z } from "zod";

export const SCHEMA_VERSION = 1;

export const WorkspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const PaperChunkSchema = z.object({
  id: z.string().uuid(),
  paperId: z.string().uuid(),
  chunkIndex: z.number().int().min(0),
  pageStart: z.number().int().min(1).optional(),
  pageEnd: z.number().int().min(1).optional(),
  sectionHeading: z.string().max(500).optional(),
  text: z.string().min(1),
  charOffsetStart: z.number().int().min(0),
  charOffsetEnd: z.number().int().min(0),
  estimatedTokens: z.number().int().min(0),
  contentHash: z.string(),
  sequenceNumber: z.number().int().min(0),
  extractionConfidence: z.number().min(0).max(1).optional(),
  schemaVersion: z.number().int().positive(),
});

export type PaperChunk = z.infer<typeof PaperChunkSchema>;

export const AuthorSchema = z.object({
  name: z.string(),
  affiliation: z.string().optional(),
  email: z.string().optional(),
});

export type Author = z.infer<typeof AuthorSchema>;

export const PaperStatusSchema = z.enum([
  "imported",
  "parsing",
  "parsed",
  "analyzing",
  "analyzed",
  "error",
]);

export type PaperProcessingStatus = z.infer<typeof PaperStatusSchema>;

export const PaperSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(1000),
  subtitle: z.string().max(1000).optional(),
  authors: z.array(AuthorSchema),
  publicationYear: z.number().int().min(1900).max(2100).optional(),
  venue: z.string().max(500).optional(),
  doi: z.string().max(200).optional(),
  sourceUrl: z.string().url().optional(),
  fileName: z.string().min(1).max(500),
  fileType: z.enum(["pdf", "txt", "md", "html"]),
  fileHash: z.string(),
  pageCount: z.number().int().positive().optional(),
  language: z.string().max(10).optional(),
  abstract: z.string().max(10000).optional(),
  status: PaperStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type Paper = z.infer<typeof PaperSchema>;

export const PaperAnalysisSchema = z.object({
  id: z.string().uuid(),
  paperId: z.string().uuid(),
  oneSentenceContribution: z.string().max(1000).optional(),
  executiveSummary: z.string().max(10000).optional(),
  problemStatement: z.string().max(5000).optional(),
  researchQuestions: z.array(z.string()).optional(),
  hypotheses: z.array(z.string()).optional(),
  methodology: z.string().max(5000).optional(),
  studyDesign: z.string().max(5000).optional(),
  sampleOrPopulation: z.string().max(5000).optional(),
  dataCollectionMethod: z.string().max(5000).optional(),
  datasets: z.array(z.string()).optional(),
  modelsOrAlgorithms: z.array(z.string()).optional(),
  toolsAndFrameworks: z.array(z.string()).optional(),
  baselines: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  majorFindings: z.array(z.string()).optional(),
  claimedContributions: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
  threatsToValidity: z.array(z.string()).optional(),
  ethicalConsiderations: z.string().max(5000).optional(),
  futureWork: z.array(z.string()).optional(),
  reproducibilityInformation: z.string().max(5000).optional(),
  fundingDisclosures: z.string().max(2000).optional(),
  conflictsOfInterest: z.string().max(2000).optional(),
  extractionWarnings: z.array(z.string()).optional(),
  promptVersion: z.string().max(50).optional(),
  analysisVersion: z.string().max(50).optional(),
  generatedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type PaperAnalysis = z.infer<typeof PaperAnalysisSchema>;

export const ResearchNoteSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  paperId: z.string().uuid().optional(),
  chunkId: z.string().uuid().optional(),
  title: z.string().max(500).optional(),
  body: z.string().max(100000),
  origin: z.enum(["user", "ai-assisted"]),
  tags: z.array(z.string()).optional(),
  linkedPaperIds: z.array(z.string().uuid()).optional(),
  linkedChunkIds: z.array(z.string().uuid()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type ResearchNote = z.infer<typeof ResearchNoteSchema>;

export const ConceptSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  canonicalName: z.string().min(1).max(500),
  aliases: z.array(z.string()).optional(),
  description: z.string().max(5000).optional(),
  linkedPaperIds: z.array(z.string().uuid()).optional(),
  linkedNoteIds: z.array(z.string().uuid()).optional(),
  userConfirmed: z.boolean(),
  aiSuggested: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type Concept = z.infer<typeof ConceptSchema>;

export const ComparisonDimensionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export type ComparisonDimension = z.infer<typeof ComparisonDimensionSchema>;

export const ComparisonProjectSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(200),
  selectedPaperIds: z.array(z.string().uuid()),
  dimensions: z.array(ComparisonDimensionSchema),
  matrix: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  sourceReferences: z.array(z.string()).optional(),
  generationMetadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type ComparisonProject = z.infer<typeof ComparisonProjectSchema>;

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  citations: z.array(z.string()).optional(),
  contextUsage: z.number().min(0).max(1).optional(),
  warnings: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatThreadSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  paperId: z.string().uuid().optional(),
  title: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
});

export type ChatThread = z.infer<typeof ChatThreadSchema>;
