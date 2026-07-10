import { db } from "../../db/database";
import type { ChatThread, ChatMessage } from "../../db/schemas";

export interface CreateThreadData {
  workspaceId: string;
  title?: string;
  paperId?: string;
}

export interface SendMessageData {
  threadId: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  contextUsage?: number;
  warnings?: string[];
}

export const chatThreadService = {
  async createThread(data: CreateThreadData): Promise<ChatThread> {
    const now = new Date().toISOString();
    const thread: ChatThread = {
      id: crypto.randomUUID(),
      workspaceId: data.workspaceId,
      paperId: data.paperId,
      title: data.title,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    await db.chatThreads.add(thread);
    return thread;
  },

  async getThread(id: string): Promise<ChatThread | undefined> {
    return db.chatThreads.get(id);
  },

  async getThreadsByWorkspace(workspaceId: string): Promise<ChatThread[]> {
    return db.chatThreads.where("workspaceId").equals(workspaceId).toArray();
  },

  async updateThread(
    id: string,
    data: Partial<Pick<ChatThread, "title" | "paperId">>,
  ): Promise<void> {
    await db.chatThreads.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteThread(id: string): Promise<void> {
    await db.chatMessages.where("threadId").equals(id).delete();
    await db.chatThreads.delete(id);
  },

  async addMessage(data: SendMessageData): Promise<ChatMessage> {
    const now = new Date().toISOString();
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      threadId: data.threadId,
      role: data.role,
      content: data.content,
      citations: data.citations ?? [],
      contextUsage: data.contextUsage,
      warnings: data.warnings ?? [],
      createdAt: now,
    };

    await db.chatMessages.add(message);
    await db.chatThreads.update(data.threadId, { updatedAt: now });

    return message;
  },

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    return db.chatMessages
      .where("threadId")
      .equals(threadId)
      .sortBy("createdAt");
  },

  async getMessageCount(threadId: string): Promise<number> {
    return db.chatMessages.where("threadId").equals(threadId).count();
  },
};
