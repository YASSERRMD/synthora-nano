import { describe, it, expect, beforeEach } from "vitest";
import { generateCSPHeader } from "./csp";
import {
  validateContent,
  validateFileSize,
  validateNoteContent,
  validateConceptName,
  validateDescription,
  sanitizeContentForImport,
} from "./content-validator";
import {
  logDiagnostic,
  getDiagnostics,
  clearDiagnostics,
  getDiagnosticsByCategory,
  getErrorSummary,
} from "./diagnostics";
import {
  reportError,
  getErrors,
  clearErrors,
  getRecoverableErrors,
  getErrorsByType,
} from "./error-center";
import {
  getThreatsBySeverity,
  getThreatsByStatus,
  getThreatSummary,
} from "./threat-model";

describe("csp", () => {
  it("generates CSP header", () => {
    const header = generateCSPHeader();
    expect(header).toContain("default-src 'self'");
    expect(header).toContain("script-src 'self'");
    expect(header).toContain("object-src 'none'");
  });

  it("customizes CSP directives", () => {
    const header = generateCSPHeader({ imgSrc: ["'self'", "https:"] });
    expect(header).toContain("img-src 'self' https:");
  });
});

describe("content-validator", () => {
  it("validates safe content", () => {
    const result = validateContent("Hello world, this is safe text.");
    expect(result.valid).toBe(true);
  });

  it("detects script injection", () => {
    const result = validateContent('Hello <script>alert("xss")</script>');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("detects javascript protocol", () => {
    const result = validateContent("javascript:alert(1)");
    expect(result.valid).toBe(false);
  });

  it("validates file size", () => {
    expect(validateFileSize(1000).valid).toBe(true);
    expect(validateFileSize(200 * 1024 * 1024).valid).toBe(false);
  });

  it("validates note content length", () => {
    expect(validateNoteContent("Short note").valid).toBe(true);
    expect(validateNoteContent("x".repeat(200_000)).valid).toBe(false);
  });

  it("sanitizes content for import", () => {
    const input = 'Hello <script>alert("xss")</script> World';
    const result = sanitizeContentForImport(input);
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
    expect(result).toContain("World");
  });
});

describe("diagnostics", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("logs and retrieves diagnostics", () => {
    logDiagnostic("info", "test", "Test message");
    const entries = getDiagnostics();
    expect(entries.length).toBe(1);
    expect(entries[0]?.message).toBe("Test message");
  });

  it("summarizes errors", () => {
    logDiagnostic("error", "auth", "Login failed");
    logDiagnostic("warning", "parser", "Parse slow");
    const summary = getErrorSummary();
    expect(summary.totalErrors).toBe(1);
    expect(summary.totalWarnings).toBe(1);
    expect(summary.categories["auth"]).toBe(1);
  });

  it("clears diagnostics", () => {
    logDiagnostic("info", "test", "msg");
    clearDiagnostics();
    expect(getDiagnostics()).toHaveLength(0);
  });
});

describe("error-center", () => {
  beforeEach(() => {
    clearErrors();
  });

  it("reports and retrieves errors", () => {
    reportError("parse", "Failed to parse", { recoverable: true });
    const errors = getErrors();
    expect(errors.length).toBe(1);
    expect(errors[0]?.recoverable).toBe(true);
  });

  it("filters recoverable errors", () => {
    reportError("parse", "Error 1", { recoverable: true });
    reportError("db", "Error 2", { recoverable: false });
    const recoverable = getRecoverableErrors();
    expect(recoverable.length).toBe(1);
  });

  it("clears errors", () => {
    reportError("test", "msg");
    clearErrors();
    expect(getErrors()).toHaveLength(0);
  });

  it("filters errors by type", () => {
    reportError("parse", "Error 1");
    reportError("db", "Error 2");
    const parseErrors = getErrorsByType("parse");
    expect(parseErrors.length).toBe(1);
  });
});

describe("threat-model", () => {
  it("has defined threats", () => {
    const summary = getThreatSummary();
    expect(summary.total).toBeGreaterThan(0);
  });

  it("groups threats by severity", () => {
    const critical = getThreatsBySeverity("critical");
    expect(critical.length).toBeGreaterThan(0);
    critical.forEach((t) => {
      expect(t.severity).toBe("critical");
    });
  });

  it("groups threats by status", () => {
    const mitigated = getThreatsByStatus("mitigated");
    expect(mitigated.length).toBeGreaterThan(0);
  });
});

describe("content-validator additional", () => {
  it("validates concept name length", () => {
    expect(validateConceptName("Short name").valid).toBe(true);
    expect(validateConceptName("x".repeat(600)).valid).toBe(false);
  });

  it("validates description length", () => {
    expect(validateDescription("Short desc").valid).toBe(true);
    expect(validateDescription("x".repeat(20_000)).valid).toBe(false);
  });

  it("detects event handler injection", () => {
    const result = validateContent('<div onclick="evil()">test</div>');
    expect(result.valid).toBe(false);
  });
});

describe("diagnostics additional", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("filters diagnostics by category", () => {
    logDiagnostic("info", "auth", "Login");
    logDiagnostic("info", "parser", "Parse");
    const authEntries = getDiagnosticsByCategory("auth");
    expect(authEntries.length).toBe(1);
  });
});
