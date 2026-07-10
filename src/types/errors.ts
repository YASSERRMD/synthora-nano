export class AppError extends Error {
  readonly code: string;
  readonly userMessage: string;

  constructor(
    message: string,
    options?: ErrorOptions & { code: string; userMessage: string },
  ) {
    super(message, options);
    this.name = this.constructor.name;
    this.code = options?.code ?? "UNKNOWN_ERROR";
    this.userMessage = options?.userMessage ?? "An unexpected error occurred.";
  }

  toJSON(): SerializedError {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      name: this.name,
    };
  }
}

export interface SerializedError {
  code: string;
  message: string;
  userMessage: string;
  name: string;
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      code: "NOT_FOUND",
      userMessage: "The requested resource was not found.",
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "VALIDATION_ERROR",
      userMessage: "The provided data is invalid.",
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, {
      ...options,
      code: "DATABASE_ERROR",
      userMessage:
        "A storage error occurred. Your data may not have been saved.",
    });
  }
}

export class ParseError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, {
      ...options,
      code: "PARSE_ERROR",
      userMessage: "The document could not be parsed.",
    });
  }
}

export class AIError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, {
      ...options,
      code: "AI_ERROR",
      userMessage: "The AI service encountered an error.",
    });
  }
}

export class AIUnavailableError extends AIError {
  constructor(message = "AI API not available") {
    super(message);
    Object.defineProperty(this, "code", { value: "AI_UNAVAILABLE" });
    Object.defineProperty(this, "userMessage", {
      value: "AI features are not available in this browser.",
    });
  }
}

export class AISessionError extends AIError {
  constructor(message = "Session creation failed") {
    super(message);
    Object.defineProperty(this, "code", { value: "AI_SESSION_ERROR" });
    Object.defineProperty(this, "userMessage", {
      value: "Could not create an AI session.",
    });
  }
}

export class AIContextOverflowError extends AIError {
  constructor(message = "Context window exceeded") {
    super(message);
    Object.defineProperty(this, "code", { value: "AI_CONTEXT_OVERFLOW" });
    Object.defineProperty(this, "userMessage", {
      value:
        "The context window is full. Some conversation history will be compacted.",
    });
  }
}

export class ExportError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "EXPORT_ERROR",
      userMessage: "The export could not be completed.",
    });
  }
}

export class ImportError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "IMPORT_ERROR",
      userMessage: "The import file is invalid or corrupted.",
    });
  }
}

export class WorkerError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, {
      ...options,
      code: "WORKER_ERROR",
      userMessage: "A background task failed.",
    });
  }
}

export class StorageQuotaError extends DatabaseError {
  constructor(message = "Storage quota exceeded") {
    super(message);
    Object.defineProperty(this, "code", { value: "STORAGE_QUOTA" });
    Object.defineProperty(this, "userMessage", {
      value: "Storage is full. Please export and delete old data.",
    });
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage;
  }
  if (error instanceof Error) {
    return "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
