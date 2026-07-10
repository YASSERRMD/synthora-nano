export type AssistantMode =
  | "ask-selected-paper"
  | "ask-selected-papers"
  | "ask-workspace"
  | "find-evidence"
  | "explain-methodology"
  | "compare-findings"
  | "identify-limitations"
  | "create-brief"
  | "generate-questions";

export interface AssistantModeConfig {
  mode: AssistantMode;
  label: string;
  description: string;
  requiresPapers: boolean;
  maxPapers?: number;
}

export const ASSISTANT_MODES: Record<AssistantMode, AssistantModeConfig> = {
  "ask-selected-paper": {
    mode: "ask-selected-paper",
    label: "Ask Selected Paper",
    description: "Ask a question about a single paper",
    requiresPapers: true,
    maxPapers: 1,
  },
  "ask-selected-papers": {
    mode: "ask-selected-papers",
    label: "Ask Selected Papers",
    description: "Ask a question across multiple papers",
    requiresPapers: true,
  },
  "ask-workspace": {
    mode: "ask-workspace",
    label: "Ask Workspace",
    description: "Search across all workspace papers",
    requiresPapers: false,
  },
  "find-evidence": {
    mode: "find-evidence",
    label: "Find Evidence",
    description: "Find papers that support or contradict a claim",
    requiresPapers: false,
  },
  "explain-methodology": {
    mode: "explain-methodology",
    label: "Explain Methodology",
    description: "Explain the methodology used in selected papers",
    requiresPapers: true,
  },
  "compare-findings": {
    mode: "compare-findings",
    label: "Compare Findings",
    description: "Compare findings across selected papers",
    requiresPapers: true,
    maxPapers: 5,
  },
  "identify-limitations": {
    mode: "identify-limitations",
    label: "Identify Limitations",
    description: "Identify limitations mentioned in papers",
    requiresPapers: false,
  },
  "create-brief": {
    mode: "create-brief",
    label: "Create Research Brief",
    description: "Generate a structured research brief",
    requiresPapers: true,
  },
  "generate-questions": {
    mode: "generate-questions",
    label: "Critical Reading Questions",
    description: "Generate questions for critical reading",
    requiresPapers: true,
  },
};

export function getModeConfig(mode: AssistantMode): AssistantModeConfig {
  return ASSISTANT_MODES[mode];
}

export function getAvailableModes(
  requirePapers: boolean = false,
): AssistantModeConfig[] {
  return Object.values(ASSISTANT_MODES).filter(
    (config) => !requirePapers || config.requiresPapers,
  );
}

export function validateModeSelection(
  mode: AssistantMode,
  selectedPaperCount: number,
): { valid: boolean; error?: string } {
  const config = getModeConfig(mode);

  if (config.requiresPapers && selectedPaperCount === 0) {
    return {
      valid: false,
      error: `${config.label} requires at least one paper`,
    };
  }

  if (config.maxPapers && selectedPaperCount > config.maxPapers) {
    return {
      valid: false,
      error: `${config.label} supports at most ${config.maxPapers} papers`,
    };
  }

  return { valid: true };
}
