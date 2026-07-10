import { useState, useEffect } from "react";

export interface ConnectivityStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType: string | null;
}

export function useConnectivity(): ConnectivityStatus {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    effectiveType: null,
  });

  useEffect(() => {
    const updateStatus = () => {
      const connection = (
        navigator as unknown as { connection?: { effectiveType?: string } }
      ).connection;
      setStatus({
        isOnline: navigator.onLine,
        isSlowConnection:
          connection?.effectiveType === "slow-2g" ||
          connection?.effectiveType === "2g",
        effectiveType: connection?.effectiveType ?? null,
      });
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const connection = (
      navigator as unknown as {
        connection?: {
          addEventListener?: (type: string, handler: () => void) => void;
        };
      }
    ).connection;
    connection?.addEventListener?.("change", updateStatus);

    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return status;
}
