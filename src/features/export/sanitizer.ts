export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/<iframe\b[^>]*>/gi, "<!-- iframe removed -->")
    .replace(/<object\b[^>]*>/gi, "<!-- object removed -->")
    .replace(/<embed\b[^>]*>/gi, "<!-- embed removed -->")
    .replace(/<form\b[^>]*>/gi, "<!-- form removed -->");
}

export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/!\[.*?\]\(javascript:.*?\)/gi, "")
    .replace(/\[.*?\]\(javascript:.*?\)/gi, "");
}

export function validateFileSize(
  sizeBytes: number,
  maxSizeMB: number = 50,
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${(sizeBytes / 1024 / 1024).toFixed(1)}MB exceeds maximum ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

export function validateSnapshotIntegrity(
  checksum: string,
  data: string,
): Promise<{ valid: boolean; error?: string }> {
  return crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(data))
    .then((buffer) => {
      const computed = Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (computed !== checksum) {
        return {
          valid: false,
          error: "Checksum mismatch - data may be corrupted",
        };
      }
      return { valid: true };
    });
}
