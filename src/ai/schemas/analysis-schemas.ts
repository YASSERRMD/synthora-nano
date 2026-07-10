import { z } from "zod";

export const PaperMetadataSchema = z.object({
  title: z.string().describe("The paper title"),
  authors: z.array(z.object({ name: z.string() })).describe("List of authors"),
  year: z.number().int().optional().describe("Publication year"),
  venue: z.string().optional().describe("Journal or conference venue"),
  doi: z.string().optional().describe("Digital Object Identifier"),
  abstract: z.string().optional().describe("Paper abstract"),
});

export const SectionClassificationSchema = z.object({
  sections: z.array(
    z.object({
      heading: z.string(),
      category: z.enum([
        "introduction",
        "background",
        "methodology",
        "results",
        "discussion",
        "conclusion",
        "references",
        "other",
      ]),
    }),
  ),
});

export const ExecutiveSummarySchema = z.object({
  summary: z.string().describe("Executive summary of the paper"),
  oneSentenceContribution: z
    .string()
    .describe("One-sentence statement of the paper's contribution"),
});

export const MethodologyExtractionSchema = z.object({
  methodology: z.string().describe("Description of the methodology"),
  studyDesign: z.string().describe("Study design description"),
  sampleOrPopulation: z.string().optional().describe("Sample or population"),
  dataCollectionMethod: z
    .string()
    .optional()
    .describe("Data collection method"),
  datasets: z.array(z.string()).optional().describe("Datasets used"),
  modelsOrAlgorithms: z
    .array(z.string())
    .optional()
    .describe("Models or algorithms"),
  toolsAndFrameworks: z
    .array(z.string())
    .optional()
    .describe("Tools and frameworks"),
  baselines: z.array(z.string()).optional().describe("Baselines compared"),
  metrics: z.array(z.string()).optional().describe("Evaluation metrics"),
});

export const FindingsExtractionSchema = z.object({
  majorFindings: z.array(z.string()).describe("Major findings"),
  claimedContributions: z
    .array(z.string())
    .optional()
    .describe("Claimed contributions"),
});

export const LimitationsExtractionSchema = z.object({
  limitations: z.array(z.string()).describe("Limitations"),
  threatsToValidity: z
    .array(z.string())
    .optional()
    .describe("Threats to validity"),
  ethicalConsiderations: z
    .string()
    .optional()
    .describe("Ethical considerations"),
});

export const FutureWorkExtractionSchema = z.object({
  futureWork: z.array(z.string()).describe("Future work directions"),
  reproducibilityInformation: z
    .string()
    .optional()
    .describe("Reproducibility information"),
});

export const ConceptExtractionSchema = z.object({
  concepts: z.array(
    z.object({
      name: z.string().describe("Canonical concept name"),
      aliases: z.array(z.string()).optional().describe("Alternative names"),
      description: z.string().describe("Brief description"),
    }),
  ),
});

export const ComparisonMatrixSchema = z.object({
  dimensions: z.array(
    z.object({
      name: z.string(),
      values: z.record(z.string(), z.string()),
    }),
  ),
});

export const GroundedAnswerSchema = z.object({
  answer: z.string().describe("The grounded answer"),
  citations: z
    .array(
      z.object({
        text: z.string().describe("Cited text"),
        paperId: z.string().optional().describe("Paper ID"),
        chunkId: z.string().optional().describe("Chunk ID"),
        page: z.number().optional().describe("Page number"),
      }),
    )
    .optional()
    .describe("Source citations"),
  confidence: z
    .enum(["high", "medium", "low", "not_found"])
    .describe("Confidence level"),
  evidenceLevel: z
    .enum(["stated", "inferred", "not_found"])
    .describe("Evidence level"),
});

export type PaperMetadata = z.infer<typeof PaperMetadataSchema>;
export type SectionClassification = z.infer<typeof SectionClassificationSchema>;
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;
export type MethodologyExtraction = z.infer<typeof MethodologyExtractionSchema>;
export type FindingsExtraction = z.infer<typeof FindingsExtractionSchema>;
export type LimitationsExtraction = z.infer<typeof LimitationsExtractionSchema>;
export type FutureWorkExtraction = z.infer<typeof FutureWorkExtractionSchema>;
export type ConceptExtraction = z.infer<typeof ConceptExtractionSchema>;
export type ComparisonMatrix = z.infer<typeof ComparisonMatrixSchema>;
export type GroundedAnswer = z.infer<typeof GroundedAnswerSchema>;
