import { db } from "../../db/database";

export interface ActivityItem {
  id: string;
  type: "import" | "parse" | "analyze" | "note" | "error";
  paperId?: string;
  paperTitle?: string;
  message: string;
  timestamp: string;
  status: "success" | "in-progress" | "error";
}

const activityLog: ActivityItem[] = [];
const MAX_ACTIVITY_ITEMS = 100;

export const activityService = {
  log(item: Omit<ActivityItem, "id" | "timestamp">): ActivityItem {
    const entry: ActivityItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    activityLog.unshift(entry);
    if (activityLog.length > MAX_ACTIVITY_ITEMS) {
      activityLog.pop();
    }
    return entry;
  },

  getAll(): ActivityItem[] {
    return [...activityLog];
  },

  getByPaperId(paperId: string): ActivityItem[] {
    return activityLog.filter((item) => item.paperId === paperId);
  },

  clear(): void {
    activityLog.length = 0;
  },

  async getProcessingSummary(workspaceId: string) {
    const papers = await db.papers
      .where("workspaceId")
      .equals(workspaceId)
      .toArray();

    return {
      total: papers.length,
      completed: papers.filter((p) => p.status === "analyzed").length,
      inProgress: papers.filter(
        (p) => p.status === "parsing" || p.status === "analyzing",
      ).length,
      failed: papers.filter((p) => p.status === "error").length,
      pending: papers.filter((p) => p.status === "imported").length,
    };
  },
};
