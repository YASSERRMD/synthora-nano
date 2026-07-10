export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const MAX_FILE_SIZE_MB = 100;
const MAX_NOTE_SIZE_CHARS = 100_000;
const MAX_CONCEPT_NAME_CHARS = 500;
const MAX_DESCRIPTION_CHARS = 10_000;
const DANGEROUS_PATTERNS = [
  /<script\b/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i,
  /eval\s*\(/i,
  /document\.cookie/i,
  /document\.write/i,
  /window\.location/i,
];

export function validateContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`Potentially dangerous pattern detected: ${pattern.source}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateFileSize(bytes: number): ValidationResult {
  const errors: string[] = [];
  if (bytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
    errors.push(`File size ${bytes} exceeds maximum ${MAX_FILE_SIZE_MB}MB`);
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateNoteContent(body: string): ValidationResult {
  const errors: string[] = [];
  if (body.length > MAX_NOTE_SIZE_CHARS) {
    errors.push(
      `Note content exceeds maximum ${MAX_NOTE_SIZE_CHARS} characters`,
    );
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateConceptName(name: string): ValidationResult {
  const errors: string[] = [];
  if (name.length > MAX_CONCEPT_NAME_CHARS) {
    errors.push(
      `Concept name exceeds maximum ${MAX_CONCEPT_NAME_CHARS} characters`,
    );
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function validateDescription(desc: string): ValidationResult {
  const errors: string[] = [];
  if (desc.length > MAX_DESCRIPTION_CHARS) {
    errors.push(
      `Description exceeds maximum ${MAX_DESCRIPTION_CHARS} characters`,
    );
  }
  return { valid: errors.length === 0, errors, warnings: [] };
}

export function sanitizeContentForImport(content: string): string {
  let sanitized = content;

  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");

  return sanitized;
}
