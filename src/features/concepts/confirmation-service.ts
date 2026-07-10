import { conceptRepository } from "../../db/repositories/concept.repository";
import type { Concept } from "../../db/schemas";

export interface PendingConcept {
  id: string;
  name: string;
  source: string;
  linkedPaperIds: string[];
  suggestedAt: string;
}

export const conceptConfirmationService = {
  async getPending(workspaceId: string): Promise<PendingConcept[]> {
    const suggested = await conceptRepository.getSuggested(workspaceId);
    return suggested.map((c) => ({
      id: c.id,
      name: c.canonicalName,
      source: c.description ?? "ai-extracted",
      linkedPaperIds: c.linkedPaperIds ?? [],
      suggestedAt: c.createdAt,
    }));
  },

  async confirm(conceptId: string): Promise<Concept> {
    return conceptRepository.update(conceptId, {
      userConfirmed: true,
      aiSuggested: false,
    });
  },

  async reject(conceptId: string): Promise<void> {
    await conceptRepository.delete(conceptId);
  },

  async bulkConfirm(conceptIds: string[]): Promise<Concept[]> {
    const results: Concept[] = [];
    for (const id of conceptIds) {
      const concept = await this.confirm(id);
      results.push(concept);
    }
    return results;
  },

  async rename(conceptId: string, newName: string): Promise<Concept> {
    return conceptRepository.update(conceptId, {
      canonicalName: newName,
      userConfirmed: true,
    });
  },

  async addAlias(conceptId: string, alias: string): Promise<Concept> {
    const concept = await conceptRepository.getById(conceptId);
    const aliases = new Set(concept.aliases ?? []);
    aliases.add(alias);
    return conceptRepository.update(conceptId, {
      aliases: Array.from(aliases),
    });
  },

  async removeAlias(conceptId: string, alias: string): Promise<Concept> {
    const concept = await conceptRepository.getById(conceptId);
    const aliases = (concept.aliases ?? []).filter((a) => a !== alias);
    return conceptRepository.update(conceptId, { aliases });
  },
};
