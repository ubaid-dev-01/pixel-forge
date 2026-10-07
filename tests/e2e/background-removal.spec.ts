import { test, expect } from "@playwright/test";
import path from "node:path";

const fixture = path.join(__dirname, "../fixtures/portrait.jpg");

test("background removal tool is listed and docs explain BiRefNet", async ({ page }) => {
  await page.goto("/tools");
  await expect(page.getByRole("link", { name: /background/i }).first()).toBeVisible();

  await page.goto("/docs/background");
  await expect(page.getByRole("heading", { name: /background removal/i })).toBeVisible();
  await expect(page.getByText(/BiRefNet/i).first()).toBeVisible();
  await expect(page.getByText(/BRIA/i).first()).toBeVisible();

  test.info().annotations.push({
    type: "note",
    description: `Portrait fixture ready at ${fixture}`,
  });
});

test("landing product cutout sample shows transparency note", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /product cutout/i }).click();
  await expect(page.getByText(/checkerboard indicates/i)).toBeVisible();
});
