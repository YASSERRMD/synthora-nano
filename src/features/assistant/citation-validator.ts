import type { ChatMessage } from "../../db/schemas";

export interface CitationValidation {
  messageId: string;
  validCitations: string[];
  invalidCitations: string[];
  hasWarnings: boolean;
  isValid: boolean;
}

export function validateCitations(
  message: ChatMessage,
  availablePaperIds: Set<string>,
): CitationValidation {
  const validCitations: string[] = [];
  const invalidCitations: string[] = [];

  const citations = message.citations ?? [];
  for (const citation of citations) {
    if (availablePaperIds.has(citation)) {
      validCitations.push(citation);
    } else {
      invalidCitations.push(citation);
    }
  }

  const hasWarnings = (message.warnings ?? []).length > 0;

  return {
    messageId: message.id,
    validCitations,
    invalidCitations,
    hasWarnings,
    isValid: invalidCitations.length === 0 && !hasWarnings,
  };
}

export function validateConversationCitations(
  messages: ChatMessage[],
  availablePaperIds: Set<string>,
): CitationValidation[] {
  return messages.map((msg) => validateCitations(msg, availablePaperIds));
}

export function getOverallCitationHealth(validations: CitationValidation[]): {
  totalMessages: number;
  validMessages: number;
  invalidMessages: number;
  healthPercentage: number;
} {
  const validMessages = validations.filter((v) => v.isValid).length;
  return {
    totalMessages: validations.length,
    validMessages,
    invalidMessages: validations.length - validMessages,
    healthPercentage:
      validations.length > 0 ? (validMessages / validations.length) * 100 : 100,
  };
}
