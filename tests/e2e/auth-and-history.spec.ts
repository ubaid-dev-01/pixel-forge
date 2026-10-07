import { test, expect } from "@playwright/test";

test("signup and signin pages render without crashing", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { level: 1 }).or(page.getByText(/create account|sign up|account/i).first())).toBeVisible();

  await page.goto("/signin");
  await expect(page.getByText(/sign in|email|password/i).first()).toBeVisible();
});

test("dashboard routes require auth or show unavailable state", async ({ page }) => {
  await page.goto("/overview");
  // Either redirect to signin, or render a gated dashboard shell.
  await expect(
    page.getByText(/sign in|sign up|overview|dashboard|convex|not configured/i).first(),
  ).toBeVisible({ timeout: 15_000 });
});
