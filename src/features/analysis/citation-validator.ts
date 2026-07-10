import type { PaperAnalysis } from "../../db/schemas";
import type { EvidenceReference } from "./types";

export interface CitationValidationResult {
  valid: boolean;
  issues: string[];
}

export function validateCitations(
  analysis: PaperAnalysis,
  evidenceMap: Map<string, EvidenceReference[]>,
): CitationValidationResult {
  const issues: string[] = [];

  validateFieldCitation(
    "executiveSummary",
    analysis.executiveSummary,
    evidenceMap,
    issues,
  );
  validateFieldCitation(
    "methodology",
    analysis.methodology,
    evidenceMap,
    issues,
  );
  validateFieldCitation(
    "oneSentenceContribution",
    analysis.oneSentenceContribution,
    evidenceMap,
    issues,
  );

  if (analysis.majorFindings) {
    for (let i = 0; i < analysis.majorFindings.length; i++) {
      const finding = analysis.majorFindings[i];
      if (finding && !hasSupportingEvidence(finding, evidenceMap)) {
        issues.push(`Finding[${i}] lacks supporting evidence`);
      }
    }
  }

  if (analysis.limitations) {
    for (let i = 0; i < analysis.limitations.length; i++) {
      const limitation = analysis.limitations[i];
      if (limitation && !hasSupportingEvidence(limitation, evidenceMap)) {
        issues.push(`Limitation[${i}] lacks supporting evidence`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateFieldCitation(
  fieldName: string,
  value: string | undefined | null,
  evidenceMap: Map<string, EvidenceReference[]>,
  issues: string[],
): void {
  if (value && value.length > 50) {
    if (!hasSupportingEvidence(value, evidenceMap)) {
      issues.push(`${fieldName} lacks supporting evidence`);
    }
  }
}

function hasSupportingEvidence(
  text: string,
  evidenceMap: Map<string, EvidenceReference[]>,
): boolean {
  const lowerText = text.toLowerCase();
  for (const [, references] of evidenceMap) {
    for (const ref of references) {
      const words = ref.text.toLowerCase().split(/\s+/);
      const matchCount = words.filter((w) => lowerText.includes(w)).length;
      if (matchCount >= 3) return true;
    }
  }
  return false;
}

export function buildEvidenceMap(
  chunks: Array<{
    id: string;
    text: string;
    pageStart?: number;
    pageEnd?: number;
  }>,
): Map<string, EvidenceReference[]> {
  const map = new Map<string, EvidenceReference[]>();

  for (const chunk of chunks) {
    const refs: EvidenceReference[] = [
      {
        chunkId: chunk.id,
        pageStart: chunk.pageStart,
        pageEnd: chunk.pageEnd,
        text: chunk.text,
      },
    ];
    map.set(chunk.id, refs);
  }

  return map;
}
