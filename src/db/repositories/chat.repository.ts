import { db } from "../database";
import type { ChatThread, ChatMessage } from "../schemas";
import { DatabaseError } from "../../types/errors";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const chatThreadRepository = {
  async create(
    data: Omit<ChatThread, "id" | "createdAt" | "updatedAt" | "schemaVersion">,
  ): Promise<ChatThread> {
    const thread: ChatThread = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: 1,
    };

    try {
      await db.chatThreads.add(thread);
      return thread;
    } catch (error) {
      throw new DatabaseError("Failed to create chat thread", { cause: error });
    }
  },

  async getById(id: string): Promise<ChatThread | undefined> {
    return db.chatThreads.get(id);
  },

  async getByWorkspaceId(workspaceId: string): Promise<ChatThread[]> {
    return db.chatThreads
      .where("workspaceId")
      .equals(workspaceId)
      .sortBy("updatedAt");
  },

  async update(
    id: string,
    data: Partial<Omit<ChatThread, "id" | "createdAt" | "schemaVersion">>,
  ): Promise<ChatThread> {
    const existing = await db.chatThreads.get(id);
    if (!existing) {
      throw new DatabaseError("Chat thread not found");
    }

    const updated: ChatThread = {
      ...existing,
      ...data,
      updatedAt: now(),
    };

    await db.chatThreads.update(id, updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.transaction("rw", [db.chatThreads, db.chatMessages], async () => {
      await db.chatMessages.where("threadId").equals(id).delete();
      await db.chatThreads.delete(id);
    });
  },
};

export const chatMessageRepository = {
  async create(
    data: Omit<ChatMessage, "id" | "createdAt">,
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...data,
      id: generateId(),
      createdAt: now(),
    };

    try {
      await db.chatMessages.add(message);
      await db.chatThreads.update(data.threadId, { updatedAt: now() });
      return message;
    } catch (error) {
      throw new DatabaseError("Failed to create chat message", {
        cause: error,
      });
    }
  },

  async getByThreadId(threadId: string): Promise<ChatMessage[]> {
    return db.chatMessages
      .where("threadId")
      .equals(threadId)
      .sortBy("createdAt");
  },

  async deleteByThreadId(threadId: string): Promise<void> {
    await db.chatMessages.where("threadId").equals(threadId).delete();
  },
};
