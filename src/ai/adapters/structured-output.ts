import { z } from "zod";
import { AIOutputValidationError } from "../errors";

export async function validateStructuredOutput<T>(
  text: string,
  schema: z.ZodSchema<T>,
  options?: { retries?: number; correctionPrompt?: string },
): Promise<T> {
  const maxRetries = options?.retries ?? 2;
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = extractJsonFromText(text);
    if (!raw) {
      lastError = "No JSON found in output";
      if (attempt < maxRetries) {
        text = await retryWithCorrection(
          text,
          lastError,
          options?.correctionPrompt,
        );
        continue;
      }
      break;
    }

    const result = schema.safeParse(raw);
    if (result.success) {
      return result.data;
    }

    const errorMessages = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    lastError = errorMessages.join("; ");

    if (attempt < maxRetries) {
      text = await retryWithCorrection(
        text,
        lastError,
        options?.correctionPrompt,
      );
    }
  }

  throw new AIOutputValidationError(
    `Output validation failed after ${maxRetries + 1} attempts: ${lastError}`,
    lastError ? [lastError] : [],
  );
}

function extractJsonFromText(text: string): unknown | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // fall through
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // fall through
    }
  }

  return null;
}

async function retryWithCorrection(
  _originalText: string,
  _error: string,
  _correctionPrompt?: string,
): Promise<string> {
  return _originalText;
}
