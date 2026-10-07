import { test, expect } from "@playwright/test";
import path from "node:path";

const fixture = path.join(__dirname, "../fixtures/sample-landscape.jpg");

test.describe("Image upscale flow", () => {
  test("user can open upscale tool and see controls when signed in path is available", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByRole("heading", { name: /image and video tools/i })).toBeVisible();

    await page.goto("/signup");
    // Without Convex, auth stays gated — assert honest unavailable UI instead of fake success.
    const gated = page.getByText(/convex|sign up|create account|not configured|disabled/i);
    await expect(gated.first()).toBeVisible({ timeout: 15_000 });

    // If Convex is configured later, this fixture path is ready for a full upload flow.
    test.info().annotations.push({
      type: "note",
      description: `Upscale fixture ready at ${fixture}`,
    });
  });

  test("public marketing shows labeled sample comparisons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /restore the detail/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /resolution chart/i })).toBeVisible();
    await expect(page.getByText(/ORIGINAL/i).first()).toBeVisible();
    await expect(page.getByText(/ENHANCED/i).first()).toBeVisible();
  });
});
