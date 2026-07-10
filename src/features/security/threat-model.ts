export interface Threat {
  id: string;
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  mitigation: string;
  status: "mitigated" | "partial" | "open";
}

export const THREAT_MODEL: Threat[] = [
  {
    id: "T001",
    category: "Malicious Content",
    description:
      "Malicious PDF or HTML content with embedded scripts or exploits",
    severity: "high",
    mitigation:
      "Content validation strips script tags, dangerous patterns, and event handlers before processing. PDFs processed via sandboxed pdfjs-dist.",
    status: "mitigated",
  },
  {
    id: "T002",
    category: "Prompt Injection",
    description:
      "Prompt injection via paper content attempting to manipulate AI outputs",
    severity: "medium",
    mitigation:
      "AI prompts treat paper content as untrusted data. Structured output with Zod validation. Model outputs validated before display.",
    status: "partial",
  },
  {
    id: "T003",
    category: "Oversized Files",
    description: "Extremely large files causing memory exhaustion or DoS",
    severity: "medium",
    mitigation:
      "File size validation (100MB max). Chunked processing. Storage quota monitoring.",
    status: "mitigated",
  },
  {
    id: "T004",
    category: "XSS via Import",
    description:
      "Cross-site scripting through imported content containing HTML",
    severity: "high",
    mitigation:
      "HTML sanitization removes all script-related content. CSP header prevents inline script execution.",
    status: "mitigated",
  },
  {
    id: "T005",
    category: "Data Leakage",
    description: "Private research data exposed through cache or network",
    severity: "critical",
    mitigation:
      "Research content stored in IndexedDB only. Service worker cache contains only static assets, never paper content. No analytics or telemetry.",
    status: "mitigated",
  },
  {
    id: "T006",
    category: "Storage Exhaustion",
    description: "Browser storage quota exhaustion preventing data saves",
    severity: "medium",
    mitigation:
      "Storage estimate monitoring. User warnings at 80% capacity. Cleanup utilities for old data.",
    status: "partial",
  },
  {
    id: "T007",
    category: "Snapshot Tampering",
    description: "Modified export snapshot causing data corruption on import",
    severity: "medium",
    mitigation:
      "SHA-256 checksum validation. Schema validation before import. Merge/replace strategies with rollback.",
    status: "mitigated",
  },
  {
    id: "T008",
    category: "Accidental Network",
    description: "Accidental network transmission of private research data",
    severity: "critical",
    mitigation:
      "No backend. No API calls. No analytics. All processing on-device. Network guard in offline mode.",
    status: "mitigated",
  },
  {
    id: "T009",
    category: "Citation Spoofing",
    description:
      "Fabricated citations in AI responses not grounded in actual papers",
    severity: "medium",
    mitigation:
      "Citation validation checks paper existence in database. Grounded response mode requires source references.",
    status: "partial",
  },
  {
    id: "T010",
    category: "Model Output Safety",
    description: "AI model output containing unsafe or misleading HTML/content",
    severity: "medium",
    mitigation:
      "Model outputs sanitized before rendering. Structured output schemas enforce safe content patterns.",
    status: "partial",
  },
];

export function getThreatsBySeverity(severity: Threat["severity"]): Threat[] {
  return THREAT_MODEL.filter((t) => t.severity === severity);
}

export function getThreatsByStatus(status: Threat["status"]): Threat[] {
  return THREAT_MODEL.filter((t) => t.status === status);
}

export function getThreatSummary(): {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const threat of THREAT_MODEL) {
    bySeverity[threat.severity] = (bySeverity[threat.severity] ?? 0) + 1;
    byStatus[threat.status] = (byStatus[threat.status] ?? 0) + 1;
  }

  return {
    total: THREAT_MODEL.length,
    bySeverity,
    byStatus,
  };
}
