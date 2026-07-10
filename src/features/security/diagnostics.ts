export interface DiagnosticEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  category: string;
  message: string;
  details?: string;
}

const MAX_ENTRIES = 500;
const STORAGE_KEY = "synthora-diagnostics";

export function logDiagnostic(
  level: DiagnosticEntry["level"],
  category: string,
  message: string,
  details?: string,
): void {
  const entry: DiagnosticEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const entries: DiagnosticEntry[] = stored ? JSON.parse(stored) : [];
    entries.push(entry);

    if (entries.length > MAX_ENTRIES) {
      entries.splice(0, entries.length - MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full
  }
}

export function getDiagnostics(): DiagnosticEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearDiagnostics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getDiagnosticsByCategory(category: string): DiagnosticEntry[] {
  return getDiagnostics().filter((e) => e.category === category);
}

export function getDiagnosticsByLevel(
  level: DiagnosticEntry["level"],
): DiagnosticEntry[] {
  return getDiagnostics().filter((e) => e.level === level);
}

export function getRecentDiagnostics(count: number = 50): DiagnosticEntry[] {
  return getDiagnostics().slice(-count);
}

export function getErrorSummary(): {
  totalErrors: number;
  totalWarnings: number;
  categories: Record<string, number>;
} {
  const entries = getDiagnostics();
  const totalErrors = entries.filter((e) => e.level === "error").length;
  const totalWarnings = entries.filter((e) => e.level === "warning").length;

  const categories: Record<string, number> = {};
  for (const entry of entries) {
    categories[entry.category] = (categories[entry.category] ?? 0) + 1;
  }

  return { totalErrors, totalWarnings, categories };
}
