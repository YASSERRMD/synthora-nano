import { db } from "../../db/database";
import type { Paper } from "../../db/schemas";

export type PaperSortField =
  "title" | "createdAt" | "updatedAt" | "publicationYear";
export type SortDirection = "asc" | "desc";

export interface LibraryFilters {
  query?: string;
  status?: Paper["status"];
  fileType?: Paper["fileType"];
  yearFrom?: number;
  yearTo?: number;
}

export interface LibrarySort {
  field: PaperSortField;
  direction: SortDirection;
}

export interface LibraryView {
  filters: LibraryFilters;
  sort: LibrarySort;
  page: number;
  pageSize: number;
}

export const libraryService = {
  async getPapers(
    workspaceId: string,
    view: LibraryView,
  ): Promise<{ papers: Paper[]; total: number }> {
    let papers = await db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();

    if (view.filters.query) {
      const q = view.filters.query.toLowerCase();
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.abstract?.toLowerCase().includes(q) ||
          p.authors.some((a) => a.name.toLowerCase().includes(q)),
      );
    }

    if (view.filters.status) {
      papers = papers.filter((p) => p.status === view.filters.status);
    }

    if (view.filters.fileType) {
      papers = papers.filter((p) => p.fileType === view.filters.fileType);
    }

    if (view.filters.yearFrom) {
      papers = papers.filter(
        (p) => (p.publicationYear ?? 0) >= view.filters.yearFrom!,
      );
    }

    if (view.filters.yearTo) {
      papers = papers.filter(
        (p) => (p.publicationYear ?? 9999) <= view.filters.yearTo!,
      );
    }

    const total = papers.length;

    papers.sort((a, b) => {
      const field = view.sort.field;
      const aVal = a[field] ?? "";
      const bVal = b[field] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return view.sort.direction === "asc" ? cmp : -cmp;
    });

    const start = view.page * view.pageSize;
    papers = papers.slice(start, start + view.pageSize);

    return { papers, total };
  },

  async getPaperStats(workspaceId: string) {
    const papers = await db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();

    return {
      total: papers.length,
      byStatus: {
        imported: papers.filter((p) => p.status === "imported").length,
        parsing: papers.filter((p) => p.status === "parsing").length,
        parsed: papers.filter((p) => p.status === "parsed").length,
        analyzing: papers.filter((p) => p.status === "analyzing").length,
        analyzed: papers.filter((p) => p.status === "analyzed").length,
        error: papers.filter((p) => p.status === "error").length,
      },
      byType: {
        pdf: papers.filter((p) => p.fileType === "pdf").length,
        txt: papers.filter((p) => p.fileType === "txt").length,
        md: papers.filter((p) => p.fileType === "md").length,
        html: papers.filter((p) => p.fileType === "html").length,
      },
    };
  },

  async checkDuplicate(
    workspaceId: string,
    fileHash: string,
  ): Promise<boolean> {
    const existing = await db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .and((p) => p.fileHash === fileHash)
      .first();
    return !!existing;
  },

  async batchDelete(paperIds: string[]): Promise<void> {
    await db.transaction(
      "rw",
      [db.papers, db.paperChunks, db.paperAnalyses],
      async () => {
        for (const id of paperIds) {
          await db.paperChunks.where("paperId").equals(id).delete();
          await db.paperAnalyses.where("paperId").equals(id).delete();
          await db.papers.delete(id);
        }
      },
    );
  },
};
