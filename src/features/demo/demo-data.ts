import type {
  Paper,
  PaperAnalysis,
  Concept,
  ResearchNote,
} from "../../db/schemas";

export const DEMO_PAPERS: Paper[] = [
  {
    id: "demo-paper-1",
    workspaceId: "demo-workspace",
    title: "Attention Is All You Need",
    authors: [
      { name: "Ashish Vaswani", affiliation: "Google Brain" },
      { name: "Noam Shazeer", affiliation: "Google Brain" },
    ],
    fileName: "attention.pdf",
    fileType: "pdf",
    fileHash: "demo-hash-1",
    status: "analyzed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  {
    id: "demo-paper-2",
    workspaceId: "demo-workspace",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: [{ name: "Jacob Devlin", affiliation: "Google AI Language" }],
    fileName: "bert.pdf",
    fileType: "pdf",
    fileHash: "demo-hash-2",
    status: "analyzed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  {
    id: "demo-paper-3",
    workspaceId: "demo-workspace",
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors: [{ name: "Tom Brown", affiliation: "OpenAI" }],
    fileName: "gpt3.pdf",
    fileType: "pdf",
    fileHash: "demo-hash-3",
    status: "analyzed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
];

export const DEMO_ANALYSES: PaperAnalysis[] = [
  {
    id: "demo-analysis-1",
    paperId: "demo-paper-1",
    methodology: "Transformer architecture with self-attention mechanism",
    datasets: ["WMT 2014 English-German", "WMT 2014 English-French"],
    metrics: ["BLEU", "Perplexity"],
    majorFindings: [
      "Transformer outperforms RNN-based models",
      "Self-attention captures long-range dependencies efficiently",
      "Training time reduced by 2x compared to baselines",
    ],
    limitations: [
      "Limited to sequence-to-sequence tasks",
      "Quadratic memory complexity with sequence length",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  {
    id: "demo-analysis-2",
    paperId: "demo-paper-2",
    methodology: "Bidirectional pre-training with masked language modeling",
    datasets: ["BookCorpus", "English Wikipedia"],
    metrics: ["Accuracy", "F1-Score"],
    majorFindings: [
      "State-of-the-art on 11 NLP benchmarks",
      "Bidirectional context improves representation learning",
    ],
    limitations: [
      "Pre-training requires large compute resources",
      "Fixed maximum sequence length of 512 tokens",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  {
    id: "demo-analysis-3",
    paperId: "demo-paper-3",
    methodology: "Autoregressive language modeling with scale",
    datasets: ["WebText2", "Books1", "Wikipedia"],
    metrics: ["Perplexity", "Few-shot accuracy"],
    majorFindings: [
      "Emergent abilities at scale",
      "Strong few-shot performance without fine-tuning",
    ],
    limitations: [
      "Massive compute requirements for training",
      "Potential for generating harmful content",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
];

export const DEMO_CONCEPTS: Concept[] = [
  {
    id: "demo-concept-1",
    workspaceId: "demo-workspace",
    canonicalName: "Self-Attention",
    aliases: ["Scaled Dot-Product Attention"],
    linkedPaperIds: ["demo-paper-1"],
    userConfirmed: true,
    aiSuggested: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
  {
    id: "demo-concept-2",
    workspaceId: "demo-workspace",
    canonicalName: "Transfer Learning",
    aliases: ["Pre-training"],
    linkedPaperIds: ["demo-paper-2", "demo-paper-3"],
    userConfirmed: true,
    aiSuggested: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
];

export const DEMO_NOTES: ResearchNote[] = [
  {
    id: "demo-note-1",
    workspaceId: "demo-workspace",
    paperId: "demo-paper-1",
    title: "Key Insight: Self-Attention",
    body: "The self-attention mechanism allows the model to weigh the importance of different parts of the input sequence when producing each part of the output. This is fundamentally different from RNNs which process sequences sequentially.",
    origin: "user",
    tags: ["attention", "transformer"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  },
];
