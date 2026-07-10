import { logDiagnostic } from "./diagnostics";

export interface RecoverableError {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  recoverable: boolean;
  recoveryAction?: string;
  context?: string;
}

const ERRORS_KEY = "synthora-errors";
const MAX_ERRORS = 100;

export function reportError(
  type: string,
  message: string,
  options: {
    recoverable?: boolean;
    recoveryAction?: string;
    context?: string;
  } = {},
): RecoverableError {
  const error: RecoverableError = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    message,
    recoverable: options.recoverable ?? false,
    recoveryAction: options.recoveryAction,
    context: options.context,
  };

  try {
    const stored = localStorage.getItem(ERRORS_KEY);
    const errors: RecoverableError[] = stored ? JSON.parse(stored) : [];
    errors.push(error);

    if (errors.length > MAX_ERRORS) {
      errors.splice(0, errors.length - MAX_ERRORS);
    }

    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
  } catch {
    // Storage full
  }

  logDiagnostic("error", type, message, options.context);

  return error;
}

export function getErrors(): RecoverableError[] {
  try {
    const stored = localStorage.getItem(ERRORS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearErrors(): void {
  try {
    localStorage.removeItem(ERRORS_KEY);
  } catch {
    // ignore
  }
}

export function getRecoverableErrors(): RecoverableError[] {
  return getErrors().filter((e) => e.recoverable);
}

export function getUnrecoverableErrors(): RecoverableError[] {
  return getErrors().filter((e) => !e.recoverable);
}

export function getErrorsByType(type: string): RecoverableError[] {
  return getErrors().filter((e) => e.type === type);
}

export function getRecentErrors(count: number = 20): RecoverableError[] {
  return getErrors().slice(-count);
}
