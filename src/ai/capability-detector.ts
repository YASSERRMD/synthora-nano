import type { AICapabilityReport, AIAvailabilityStatus } from "./types";

declare global {
  interface Window {
    LanguageModel?: {
      availability: () => Promise<AIAvailabilityStatus>;
      createSession: (config?: Record<string, unknown>) => Promise<unknown>;
    };
    Summarizer?: {
      availability: () => Promise<AIAvailabilityStatus>;
      create: (options?: Record<string, unknown>) => Promise<unknown>;
    };
    LanguageDetector?: {
      availability: () => Promise<AIAvailabilityStatus>;
      create: () => Promise<unknown>;
    };
    Translator?: {
      availability: () => Promise<AIAvailabilityStatus>;
      create: (options?: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

function isSupported(api: unknown): boolean {
  return typeof api !== "undefined" && api !== null;
}

async function getAvailability(
  api: { availability: () => Promise<string> } | undefined,
): Promise<AIAvailabilityStatus> {
  if (!isSupported(api)) return "unsupported";
  try {
    const status = await api!.availability();
    if (status === "unavailable") return "unavailable";
    if (status === "downloading") return "downloading";
    if (status === "downloadable") return "downloadable";
    if (status === "ready") return "ready";
    return "unavailable";
  } catch {
    return "error";
  }
}

export async function detectCapabilities(): Promise<AICapabilityReport> {
  const [langModelAvail] = await Promise.all([
    getAvailability(window.LanguageModel),
    getAvailability(window.Summarizer),
    getAvailability(window.LanguageDetector),
    getAvailability(window.Translator),
  ]);

  const availability =
    langModelAvail === "ready"
      ? "ready"
      : langModelAvail === "downloading"
        ? "downloading"
        : langModelAvail === "downloadable"
          ? "downloadable"
          : langModelAvail;

  return {
    languageModel: isSupported(window.LanguageModel),
    summarizer: isSupported(window.Summarizer),
    languageDetector: isSupported(window.LanguageDetector),
    translator: isSupported(window.Translator),
    availability,
  };
}

export function getAvailabilityMessage(status: AIAvailabilityStatus): string {
  switch (status) {
    case "ready":
      return "AI is supported and ready.";
    case "downloadable":
      return "AI is supported but the model needs to be downloaded. Check Chrome settings for on-device AI.";
    case "downloading":
      return "The AI model is currently downloading. This may take a few minutes.";
    case "unavailable":
      return "AI is temporarily unavailable. Try again later.";
    case "unsupported":
      return "AI features are not supported in this browser. Synthora Nano works as a research organizer without AI.";
    case "error":
      return "An error occurred while checking AI availability.";
    default:
      return "Unknown AI status.";
  }
}
