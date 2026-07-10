import { db } from "../../db/database";

export interface SnapshotMeta {
  version: string;
  schemaVersion: number;
  exportedAt: string;
  checksum: string;
  includesSourceFiles: boolean;
}

export interface WorkspaceSnapshot {
  meta: SnapshotMeta;
  workspace: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  papers: Array<{
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    createdAt: string;
  }>;
  notes: Array<{
    id: string;
    title?: string;
    body: string;
    tags?: string[];
    createdAt: string;
  }>;
  analyses: Array<{
    paperId: string;
    methodology?: string;
    majorFindings?: string[];
    limitations?: string[];
  }>;
  concepts: Array<{
    id: string;
    canonicalName: string;
    aliases?: string[];
    linkedPaperIds?: string[];
  }>;
  comparisons: Array<{
    id: string;
    name: string;
    dimensions: Array<{ name: string }>;
  }>;
}

async function computeChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function exportWorkspaceSnapshot(
  workspaceId: string,
): Promise<WorkspaceSnapshot> {
  const workspace = await db.workspaces.get(workspaceId);
  if (!workspace) throw new Error("Workspace not found");

  const papers = await db.papers
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  const notes = await db.researchNotes
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  const concepts = await db.concepts
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();
  const comparisonProjects = await db.comparisonProjects
    .where("workspaceId")
    .equals(workspaceId)
    .toArray();

  const analyses = [];
  for (const paper of papers) {
    const analysis = await db.paperAnalyses
      .where("paperId")
      .equals(paper.id)
      .first();
    if (analysis) {
      analyses.push({
        paperId: analysis.paperId,
        methodology: analysis.methodology,
        majorFindings: analysis.majorFindings,
        limitations: analysis.limitations,
      });
    }
  }

  const snapshot: WorkspaceSnapshot = {
    meta: {
      version: "0.1.0",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      checksum: "",
      includesSourceFiles: false,
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    },
    papers: papers.map((p) => ({
      id: p.id,
      title: p.title,
      fileName: p.fileName,
      fileType: p.fileType,
      createdAt: p.createdAt,
    })),
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      tags: n.tags,
      createdAt: n.createdAt,
    })),
    analyses,
    concepts: concepts.map((c) => ({
      id: c.id,
      canonicalName: c.canonicalName,
      aliases: c.aliases,
      linkedPaperIds: c.linkedPaperIds,
    })),
    comparisons: comparisonProjects.map((cp) => ({
      id: cp.id,
      name: cp.name,
      dimensions: cp.dimensions,
    })),
  };

  const jsonStr = JSON.stringify(snapshot, null, 2);
  snapshot.meta.checksum = await computeChecksum(jsonStr);

  return snapshot;
}

export function downloadSnapshot(
  snapshot: WorkspaceSnapshot,
  filename?: string,
): void {
  const json = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `synthora-export-${snapshot.workspace.name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAsMarkdown(workspaceId: string): Promise<string> {
  const snapshot = await exportWorkspaceSnapshot(workspaceId);

  let md = `# ${snapshot.workspace.name}\n\n`;
  md += `Exported: ${snapshot.meta.exportedAt}\n\n`;

  md += `## Papers (${snapshot.papers.length})\n\n`;
  for (const paper of snapshot.papers) {
    md += `### ${paper.title}\n`;
    md += `File: ${paper.fileName}\n\n`;
  }

  md += `## Notes (${snapshot.notes.length})\n\n`;
  for (const note of snapshot.notes) {
    md += `### ${note.title ?? "Untitled"}\n`;
    md += `${note.body}\n\n`;
  }

  md += `## Analyses (${snapshot.analyses.length})\n\n`;
  for (const analysis of snapshot.analyses) {
    md += `### Paper ${analysis.paperId}\n`;
    if (analysis.methodology) md += `Methodology: ${analysis.methodology}\n`;
    if (analysis.majorFindings?.length) {
      md += `Findings: ${analysis.majorFindings.join("; ")}\n`;
    }
    md += "\n";
  }

  md += `## Concepts (${snapshot.concepts.length})\n\n`;
  for (const concept of snapshot.concepts) {
    md += `- ${concept.canonicalName}`;
    if (concept.aliases?.length) md += ` (${concept.aliases.join(", ")})`;
    md += "\n";
  }

  return md;
}
