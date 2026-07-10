import { test, expect } from "@playwright/test";

test.describe("Application", () => {
  test("loads the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Synthora Nano")).toBeVisible();
  });

  test("displays the tagline", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Private research synthesis, directly in your browser."),
    ).toBeVisible();
  });
});
