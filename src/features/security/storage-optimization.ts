export interface StorageEstimate {
  quota: number;
  usage: number;
  percentage: number;
  status: "ok" | "warning" | "critical";
}

export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (!navigator.storage?.estimate) {
    return { quota: 0, usage: 0, percentage: 0, status: "ok" };
  }

  const { quota = 0, usage = 0 } = await navigator.storage.estimate();
  const percentage = quota > 0 ? (usage / quota) * 100 : 0;

  let status: StorageEstimate["status"] = "ok";
  if (percentage > 90) status = "critical";
  else if (percentage > 75) status = "warning";

  return { quota, usage, percentage, status };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}
