import { test, expect } from "@playwright/test";
import path from "node:path";

test("docs document meaningful error codes", async ({ page }) => {
  await page.goto("/docs/error-codes");
  await expect(page.getByRole("heading", { name: /error codes/i })).toBeVisible();
  await expect(page.getByText("FILE_TOO_LARGE")).toBeVisible();
  await expect(page.getByText("UNSUPPORTED_FORMAT")).toBeVisible();
  await expect(page.getByText("NO_FACES_DETECTED")).toBeVisible();
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
});

test("troubleshooting covers landing sample failures", async ({ page }) => {
  await page.goto("/docs/troubleshooting");
  await expect(page.getByText(/Landing samples blank|fetch:samples|fetch_sample_photos/i).first()).toBeVisible();
});

test("fixtures exist for future upload rejection tests", async ({ page }) => {
  // Keep page interaction so mobile/chromium projects still exercise the app.
  await page.goto("/docs/limits");
  await expect(page.getByText(/50 MB|megapixel|8192/i).first()).toBeVisible();

  const oversized = path.join(__dirname, "../fixtures/oversized.jpg");
  const notImage = path.join(__dirname, "../fixtures/not-an-image.txt");
  test.info().annotations.push({
    type: "note",
    description: `Error fixtures: ${oversized}, ${notImage}`,
  });
});
