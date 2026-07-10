import { AppError } from "../types/errors";

export class AIUnsupportedError extends AppError {
  constructor(message = "Browser does not support built-in AI") {
    super(message, {
      code: "AI_UNSUPPORTED",
      userMessage:
        "Your browser does not support built-in AI. Synthora Nano works as a research organizer without AI analysis.",
    });
  }
}

export class AIModelNotReadyError extends AppError {
  constructor(message = "AI model is not ready") {
    super(message, {
      code: "AI_MODEL_NOT_READY",
      userMessage:
        "The AI model is not ready yet. It may need to be downloaded or is temporarily unavailable.",
    });
  }
}

export class AISessionCreationError extends AppError {
  constructor(message = "Failed to create AI session") {
    super(message, {
      code: "AI_SESSION_CREATION",
      userMessage: "Could not create an AI session. Please try again.",
    });
  }
}

export class AIPromptError extends AppError {
  constructor(message: string) {
    super(message, {
      code: "AI_PROMPT_ERROR",
      userMessage: "The AI prompt failed. Please try again.",
    });
  }
}

export class AIAbortError extends AppError {
  constructor(message = "AI operation was cancelled") {
    super(message, {
      code: "AI_ABORTED",
      userMessage: "The AI operation was cancelled.",
    });
  }
}

export class AITimeoutError extends AppError {
  constructor(message = "AI operation timed out") {
    super(message, {
      code: "AI_TIMEOUT",
      userMessage:
        "The AI operation timed out. Please try again with a shorter prompt.",
    });
  }
}

export class AIContextOverflowError extends AppError {
  constructor(
    message = "Context window exceeded",
    public readonly overflowAmount?: number,
  ) {
    super(message, {
      code: "AI_CONTEXT_OVERFLOW",
      userMessage:
        "The context window is full. Older messages will be compacted to continue.",
    });
  }
}

export class AIOutputValidationError extends AppError {
  constructor(
    message: string,
    public readonly validationErrors: string[] = [],
  ) {
    super(message, {
      code: "AI_OUTPUT_VALIDATION",
      userMessage:
        "The AI output did not match the expected format. Retrying...",
    });
  }
}

export class AINetworkError extends AppError {
  constructor(message = "Network error during AI operation") {
    super(message, {
      code: "AI_NETWORK_ERROR",
      userMessage: "A network error occurred. Check your connection.",
    });
  }
}
