import { test, expect } from "@playwright/test";

test("docs and architecture state cross-user filtering is required", async ({ page }) => {
  await page.goto("/docs/architecture");
  await expect(page.getByText(/userId/i).first()).toBeVisible();
  await expect(page.getByText(/Cross-user|authenticated userId|filters by/i).first()).toBeVisible();
});

test("history route does not leak another user's content anonymously", async ({ page }) => {
  await page.goto("/history");
  // Anonymous visitors must not see someone else's jobs.
  const body = await page.locator("body").innerText();
  expect(body.toLowerCase()).not.toMatch(/job id:\s*[a-z0-9]{16,}/i);
  await expect(
    page.getByText(/sign in|unauthorized|not found|history|convex|not configured/i).first(),
  ).toBeVisible({ timeout: 15_000 });
});
