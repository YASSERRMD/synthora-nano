import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  DatabaseError,
  ParseError,
  AIError,
  AIUnavailableError,
  AISessionError,
  AIContextOverflowError,
  ExportError,
  ImportError,
  WorkerError,
  StorageQuotaError,
  isAppError,
  getUserMessage,
} from "../types/errors";

class ConcreteTestError extends AppError {
  readonly code = "TEST_ERROR";
  readonly userMessage = "Test error message.";
}

describe("AppError", () => {
  it("creates an error with correct properties", () => {
    const error = new ConcreteTestError("test detail");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.message).toBe("test detail");
    expect(error.userMessage).toBe("Test error message.");
    expect(error.name).toBe("ConcreteTestError");
  });

  it("serializes to JSON", () => {
    const error = new ConcreteTestError("test detail");
    const json = error.toJSON();
    expect(json).toEqual({
      code: "TEST_ERROR",
      message: "test detail",
      userMessage: "Test error message.",
      name: "ConcreteTestError",
    });
  });
});

describe("NotFoundError", () => {
  it("formats message with resource name", () => {
    const error = new NotFoundError("Paper");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Paper not found");
    expect(error.userMessage).toBe("The requested resource was not found.");
  });
});

describe("ValidationError", () => {
  it("creates validation error", () => {
    const error = new ValidationError("Invalid title");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid title");
  });
});

describe("DatabaseError", () => {
  it("creates database error with cause", () => {
    const cause = new Error("original");
    const error = new DatabaseError("DB failed", { cause });
    expect(error.code).toBe("DATABASE_ERROR");
    expect(error.cause).toBe(cause);
  });
});

describe("ParseError", () => {
  it("creates parse error", () => {
    const error = new ParseError("Corrupted PDF");
    expect(error.code).toBe("PARSE_ERROR");
  });
});

describe("AI errors", () => {
  it("creates AI unavailable error", () => {
    const error = new AIUnavailableError();
    expect(error.code).toBe("AI_UNAVAILABLE");
    expect(error.userMessage).toContain("not available");
  });

  it("creates AI session error", () => {
    const error = new AISessionError();
    expect(error.code).toBe("AI_SESSION_ERROR");
  });

  it("creates AI context overflow error", () => {
    const error = new AIContextOverflowError();
    expect(error.code).toBe("AI_CONTEXT_OVERFLOW");
  });

  it("creates generic AI error", () => {
    const error = new AIError("Rate limited");
    expect(error.code).toBe("AI_ERROR");
  });
});

describe("ExportError", () => {
  it("creates export error", () => {
    const error = new ExportError("File too large");
    expect(error.code).toBe("EXPORT_ERROR");
  });
});

describe("ImportError", () => {
  it("creates import error", () => {
    const error = new ImportError("Invalid format");
    expect(error.code).toBe("IMPORT_ERROR");
  });
});

describe("WorkerError", () => {
  it("creates worker error", () => {
    const error = new WorkerError("Crashed");
    expect(error.code).toBe("WORKER_ERROR");
  });
});

describe("StorageQuotaError", () => {
  it("extends DatabaseError", () => {
    const error = new StorageQuotaError();
    expect(error).toBeInstanceOf(DatabaseError);
    expect(error.code).toBe("STORAGE_QUOTA");
  });
});

describe("isAppError", () => {
  it("returns true for AppError instances", () => {
    expect(isAppError(new NotFoundError("test"))).toBe(true);
  });

  it("returns false for regular errors", () => {
    expect(isAppError(new Error("test"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError("string")).toBe(false);
  });
});

describe("getUserMessage", () => {
  it("returns user message for AppError", () => {
    const error = new NotFoundError("Paper");
    expect(getUserMessage(error)).toBe("The requested resource was not found.");
  });

  it("returns generic message for regular Error", () => {
    const error = new Error("something");
    expect(getUserMessage(error)).toBe("An unexpected error occurred.");
  });

  it("returns generic message for non-Error values", () => {
    expect(getUserMessage(null)).toBe("An unexpected error occurred.");
  });
});
