import { useState, useEffect, useCallback } from "react";

export interface OfflineOperation {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
  status: "pending" | "synced" | "failed";
}

const QUEUE_KEY = "synthora-offline-queue";

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineOperation[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) setQueue(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const enqueue = useCallback(
    (operation: Omit<OfflineOperation, "id" | "timestamp" | "status">) => {
      const newOp: OfflineOperation = {
        ...operation,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      setQueue((prev) => {
        const next = [...prev, newOp];
        try {
          localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
        } catch {
          // Storage full
        }
        return next;
      });

      return newOp.id;
    },
    [],
  );

  const markSynced = useCallback((id: string) => {
    setQueue((prev) => {
      const next = prev.map((op) =>
        op.id === id ? { ...op, status: "synced" as const } : op,
      );
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearSynced = useCallback(() => {
    setQueue((prev) => {
      const next = prev.filter((op) => op.status !== "synced");
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const getPendingCount = useCallback(() => {
    return queue.filter((op) => op.status === "pending").length;
  }, [queue]);

  return { queue, enqueue, markSynced, clearSynced, getPendingCount };
}

export function preventNetworkAssumptions(): void {
  const originalFetch = window.fetch;
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    if (!navigator.onLine) {
      throw new TypeError("Network request blocked: application is offline");
    }
    return originalFetch.apply(this, args);
  };
}
