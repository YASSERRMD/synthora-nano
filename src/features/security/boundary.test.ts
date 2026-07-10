import { describe, it, expect } from "vitest";
import {
  validateContent,
  sanitizeContentForImport,
  validateFileSize,
} from "./content-validator";
import { generateCSPHeader } from "./csp";
import { getThreatSummary, THREAT_MODEL } from "./threat-model";

describe("security boundary tests", () => {
  it("rejects oversized file imports", () => {
    const result = validateFileSize(150 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("exceeds maximum");
  });

  it("detects nested script injection", () => {
    const payloads = [
      '<img src=x onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '"><script>alert(1)</script>',
      "javascript:void(0)",
      "data:text/html,<script>alert(1)</script>",
    ];

    for (const payload of payloads) {
      const result = validateContent(payload);
      expect(result.valid).toBe(false);
    }
  });

  it("sanitizes all dangerous patterns", () => {
    const malicious =
      '<div onclick="steal()" onmouseover="hack()"><script>evil()</script>Safe content</div>';
    const clean = sanitizeContentForImport(malicious);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onmouseover");
    expect(clean).toContain("Safe content");
  });

  it("CSP prevents inline scripts", () => {
    const csp = generateCSPHeader();
    expect(csp).toContain("script-src 'self'");
    const scriptPart = csp
      .split(";")
      .find((s) => s.trim().startsWith("script-src"));
    expect(scriptPart).toBeDefined();
    expect(scriptPart).not.toContain("'unsafe-inline'");
  });

  it("all threats have mitigations", () => {
    for (const threat of THREAT_MODEL) {
      expect(threat.mitigation.length).toBeGreaterThan(10);
      expect(["low", "medium", "high", "critical"]).toContain(threat.severity);
      expect(["mitigated", "partial", "open"]).toContain(threat.status);
    }
  });

  it("threat summary is consistent", () => {
    const summary = getThreatSummary();
    expect(summary.total).toBe(THREAT_MODEL.length);
    const totalBySeverity = Object.values(summary.bySeverity).reduce(
      (a, b) => a + b,
      0,
    );
    expect(totalBySeverity).toBe(summary.total);
  });
});
