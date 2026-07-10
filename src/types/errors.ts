export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
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
  readonly code = "NOT_FOUND";
  readonly userMessage = "The requested resource was not found.";

  constructor(resource: string) {
    super(`${resource} not found`);
  }
}

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly userMessage = "The provided data is invalid.";

  constructor(message: string) {
    super(message);
  }
}

export class DatabaseError extends AppError {
  readonly code = "DATABASE_ERROR";
  readonly userMessage =
    "A storage error occurred. Your data may not have been saved.";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class ParseError extends AppError {
  readonly code = "PARSE_ERROR";
  readonly userMessage = "The document could not be parsed.";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class AIError extends AppError {
  readonly code = "AI_ERROR";
  readonly userMessage = "The AI service encountered an error.";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class AIUnavailableError extends AIError {
  readonly code = "AI_UNAVAILABLE";
  readonly userMessage = "AI features are not available in this browser.";

  constructor(message = "AI API not available") {
    super(message);
  }
}

export class AISessionError extends AIError {
  readonly code = "AI_SESSION_ERROR";
  readonly userMessage = "Could not create an AI session.";

  constructor(message = "Session creation failed") {
    super(message);
  }
}

export class AIContextOverflowError extends AIError {
  readonly code = "AI_CONTEXT_OVERFLOW";
  readonly userMessage =
    "The context window is full. Some conversation history will be compacted.";

  constructor(message = "Context window exceeded") {
    super(message);
  }
}

export class ExportError extends AppError {
  readonly code = "EXPORT_ERROR";
  readonly userMessage = "The export could not be completed.";

  constructor(message: string) {
    super(message);
  }
}

export class ImportError extends AppError {
  readonly code = "IMPORT_ERROR";
  readonly userMessage = "The import file is invalid or corrupted.";

  constructor(message: string) {
    super(message);
  }
}

export class WorkerError extends AppError {
  readonly code = "WORKER_ERROR";
  readonly userMessage = "A background task failed.";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class StorageQuotaError extends DatabaseError {
  readonly code = "STORAGE_QUOTA";
  readonly userMessage = "Storage is full. Please export and delete old data.";

  constructor(message = "Storage quota exceeded") {
    super(message);
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
