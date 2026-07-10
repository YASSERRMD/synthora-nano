let registration: ServiceWorkerRegistration | null = null;
let updateAvailableCallback: (() => void) | null = null;

const SW_MIGRATION_KEY = "synthora-sw-migration";

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

export function getMigrationVersion(): number {
  try {
    return parseInt(localStorage.getItem(SW_MIGRATION_KEY) ?? "0", 10);
  } catch {
    return 0;
  }
}

export function setMigrationVersion(version: number): void {
  try {
    localStorage.setItem(SW_MIGRATION_KEY, String(version));
  } catch {
    // ignore
  }
}

export async function safeMigrate(
  newVersion: number,
  migrationFn: (oldVersion: number) => Promise<void>,
): Promise<boolean> {
  const currentVersion = getMigrationVersion();
  if (currentVersion >= newVersion) return false;

  try {
    await migrationFn(currentVersion);
    setMigrationVersion(newVersion);
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
}
