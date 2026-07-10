export interface OfflineCapabilityReport {
  serviceWorkerSupported: boolean;
  cacheApiSupported: boolean;
  indexedDbSupported: boolean;
  registrationStatus: "registered" | "not-registered" | "error";
  cacheSize: number;
  recommendations: string[];
}

export async function getOfflineCapabilityReport(): Promise<OfflineCapabilityReport> {
  const recommendations: string[] = [];

  const serviceWorkerSupported = "serviceWorker" in navigator;
  if (!serviceWorkerSupported) {
    recommendations.push("Service workers not supported in this browser");
  }

  const cacheApiSupported = "caches" in window;
  if (!cacheApiSupported) {
    recommendations.push("Cache API not available");
  }

  const indexedDbSupported = "indexedDB" in window;
  if (!indexedDbSupported) {
    recommendations.push(
      "IndexedDB not supported - offline storage unavailable",
    );
  }

  let registrationStatus: "registered" | "not-registered" | "error" =
    "not-registered";
  if (serviceWorkerSupported) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      registrationStatus = registration ? "registered" : "not-registered";
      if (!registration) {
        recommendations.push("Service worker not yet registered");
      }
    } catch {
      registrationStatus = "error";
      recommendations.push("Error checking service worker registration");
    }
  }

  let cacheSize = 0;
  if (cacheApiSupported) {
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        cacheSize += keys.length;
      }
    } catch {
      // ignore
    }
  }

  if (!navigator.onLine) {
    recommendations.push("Currently offline - limited functionality available");
  }

  return {
    serviceWorkerSupported,
    cacheApiSupported,
    indexedDbSupported,
    registrationStatus,
    cacheSize,
    recommendations,
  };
}

export async function clearOfflineCache(): Promise<void> {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    await caches.delete(name);
  }
}
