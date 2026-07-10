let registration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    registration = await navigator.serviceWorker.register("/sw.js");
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export function getRegistration(): ServiceWorkerRegistration | null {
  return registration;
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!registration) return false;
  try {
    await registration.unregister();
    registration = null;
    return true;
  } catch {
    return false;
  }
}

let updateAvailableCallback: (() => void) | null = null;

export function onUpdateAvailable(callback: () => void): void {
  updateAvailableCallback = callback;
}

export function checkForUpdates(): void {
  if (!registration) return;

  registration.addEventListener("updatefound", () => {
    const newWorker = registration?.installing;
    if (!newWorker) return;

    newWorker.addEventListener("statechange", () => {
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        updateAvailableCallback?.();
      }
    });
  });
}

export async function applyUpdate(): Promise<void> {
  if (!registration?.waiting) return;
  registration.waiting.postMessage("skipWaiting");
  window.location.reload();
}
