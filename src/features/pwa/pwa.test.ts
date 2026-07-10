import { describe, it, expect } from "vitest";
import { getOfflineCapabilityReport } from "./offline-diagnostics";

describe("offline-diagnostics", () => {
  it("generates offline capability report", async () => {
    const report = await getOfflineCapabilityReport();
    expect(report).toHaveProperty("serviceWorkerSupported");
    expect(report).toHaveProperty("cacheApiSupported");
    expect(report).toHaveProperty("indexedDbSupported");
    expect(report).toHaveProperty("registrationStatus");
    expect(report).toHaveProperty("cacheSize");
    expect(report).toHaveProperty("recommendations");
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it("reports correct environment capabilities", async () => {
    const report = await getOfflineCapabilityReport();
    expect(typeof report.serviceWorkerSupported).toBe("boolean");
    expect(typeof report.indexedDbSupported).toBe("boolean");
  });
});
