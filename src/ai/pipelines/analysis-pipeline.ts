import type { AISessionManager } from "../types";
import type { PromptTemplate } from "../prompts/prompt-templates";
import type { z } from "zod";
import { validateStructuredOutput } from "../adapters/structured-output";
import { ContextMonitor } from "../adapters/context-monitor";

export interface AnalysisPipelineConfig {
  sessionManager: AISessionManager;
  sessionId: string;
  chunkSize?: number;
  maxRetries?: number;
}

export class AnalysisPipeline {
  private sessionManager: AISessionManager;
  private sessionId: string;
  private chunkSize: number;
  private maxRetries: number;
  private contextMonitor: ContextMonitor;

  constructor(config: AnalysisPipelineConfig) {
    this.sessionManager = config.sessionManager;
    this.sessionId = config.sessionId;
    this.chunkSize = config.chunkSize ?? 3000;
    this.maxRetries = config.maxRetries ?? 2;
    this.contextMonitor = new ContextMonitor();
  }

  async extractWithPrompt<T>(
    promptTemplate: PromptTemplate,
    content: string,
    schema: z.ZodSchema<T>,
    options?: { additionalInstructions?: string },
  ): Promise<T> {
    const systemPrompt = this.buildSystemPrompt(promptTemplate);
    const userPrompt = this.buildUserPrompt(
      promptTemplate,
      content,
      options?.additionalInstructions,
    );

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const truncatedContent = this.truncateToFit(fullPrompt);
    const result = await this.sessionManager.sendPrompt(
      this.sessionId,
      truncatedContent,
    );

    return validateStructuredOutput(result.text, schema, {
      retries: this.maxRetries,
      correctionPrompt: `Previous output had validation errors. Please fix and return valid JSON.`,
    });
  }

  async extractIncremental<T>(
    chunks: string[],
    promptTemplate: PromptTemplate,
    schema: z.ZodSchema<T>,
    options?: { additionalInstructions?: string },
  ): Promise<T[]> {
    const results: T[] = [];

    for (const chunk of chunks) {
      try {
        const result = await this.extractWithPrompt(
          promptTemplate,
          chunk,
          schema,
          options,
        );
        results.push(result);
      } catch {
        results.push({} as T);
      }
    }

    return results;
  }

  private buildSystemPrompt(template: PromptTemplate): string {
    return [
      `Role: ${template.role}`,
      `Task: ${template.task}`,
      `Allowed evidence: ${template.allowedEvidence}`,
      `Output format: ${template.outputSchema}`,
      `Citation format: ${template.citationFormat}`,
      `Uncertainty handling: ${template.uncertaintyHandling}`,
      `Prohibited: ${template.prohibitedBehavior}`,
      `Max output: ${template.maxOutputSize}`,
      `Prompt version: ${template.version}`,
    ].join("\n");
  }

  private buildUserPrompt(
    template: PromptTemplate,
    content: string,
    additionalInstructions?: string,
  ): string {
    const parts = [template.task, "", "Paper content:", "", content];
    if (additionalInstructions) {
      parts.push("", "Additional instructions:", additionalInstructions);
    }
    parts.push(
      "",
      "Return your response as valid JSON matching the required schema.",
    );
    return parts.join("\n");
  }

  private truncateToFit(prompt: string): string {
    if (prompt.length <= this.chunkSize) return prompt;
    return prompt.slice(0, this.chunkSize) + "\n\n[Content truncated...]";
  }

  getContextMonitor(): ContextMonitor {
    return this.contextMonitor;
  }
}
