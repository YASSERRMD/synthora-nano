export const PAPER_METADATA_PROMPT_VERSION = "1.0.0";
export const EXECUTIVE_SUMMARY_PROMPT_VERSION = "1.0.0";
export const METHODOLOGY_PROMPT_VERSION = "1.0.0";
export const FINDINGS_PROMPT_VERSION = "1.0.0";
export const LIMITATIONS_PROMPT_VERSION = "1.0.0";
export const FUTURE_WORK_PROMPT_VERSION = "1.0.0";
export const CONCEPT_PROMPT_VERSION = "1.0.0";
export const COMPARISON_PROMPT_VERSION = "1.0.0";
export const GROUNDED_QA_PROMPT_VERSION = "1.0.0";

export interface PromptTemplate {
  role: string;
  task: string;
  allowedEvidence: string;
  outputSchema: string;
  citationFormat: string;
  uncertaintyHandling: string;
  prohibitedBehavior: string;
  maxOutputSize: string;
  version: string;
}

export const paperMetadataPrompt: PromptTemplate = {
  role: "You are a research paper metadata extraction assistant.",
  task: "Extract structured metadata from the provided paper text.",
  allowedEvidence: "Only extract information explicitly stated in the text.",
  outputSchema: "JSON with title, authors, year, venue, doi, abstract fields.",
  citationFormat: "Include page numbers when available.",
  uncertaintyHandling:
    "If a field cannot be determined, use null. Never guess.",
  prohibitedBehavior:
    "Do not fabricate metadata not present in the source text.",
  maxOutputSize: "2000 tokens",
  version: PAPER_METADATA_PROMPT_VERSION,
};

export const executiveSummaryPrompt: PromptTemplate = {
  role: "You are a research paper summarization assistant.",
  task: "Provide an executive summary and one-sentence contribution statement.",
  allowedEvidence: "Use only the provided paper text.",
  outputSchema: "JSON with summary and oneSentenceContribution fields.",
  citationFormat: "Reference sections when applicable.",
  uncertaintyHandling:
    "If unsure about the contribution, state uncertainty explicitly.",
  prohibitedBehavior: "Do not add information not present in the paper.",
  maxOutputSize: "1500 tokens",
  version: EXECUTIVE_SUMMARY_PROMPT_VERSION,
};

export const methodologyExtractionPrompt: PromptTemplate = {
  role: "You are a research methodology extraction assistant.",
  task: "Extract methodology, study design, datasets, models, tools, baselines, and metrics.",
  allowedEvidence: "Use only the provided paper text.",
  outputSchema:
    "JSON with methodology, studyDesign, sampleOrPopulation, dataCollectionMethod, datasets, modelsOrAlgorithms, toolsAndFrameworks, baselines, metrics.",
  citationFormat: "Reference specific sections when available.",
  uncertaintyHandling:
    "Use 'Not identified in the extracted text' for missing information.",
  prohibitedBehavior: "Do not infer methodology not described in the paper.",
  maxOutputSize: "3000 tokens",
  version: METHODOLOGY_PROMPT_VERSION,
};

export const groundedQAPrompt: PromptTemplate = {
  role: "You are a grounded research question answering assistant.",
  task: "Answer the user's question using only the provided research context.",
  allowedEvidence: "Only use the provided paper excerpts and notes.",
  outputSchema:
    "JSON with answer, citations, confidence, and evidenceLevel fields.",
  citationFormat:
    "Each citation must reference specific text, paper ID, chunk ID, and page number.",
  uncertaintyHandling:
    "Use 'Not identified in the extracted text' instead of guessing. Set evidenceLevel to 'not_found' when information is absent.",
  prohibitedBehavior:
    "Never fabricate citations. Never cite a paper because its title seems relevant. Never claim statistical significance unless the source says so.",
  maxOutputSize: "2000 tokens",
  version: GROUNDED_QA_PROMPT_VERSION,
};
