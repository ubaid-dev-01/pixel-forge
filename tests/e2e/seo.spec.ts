import { test, expect } from "@playwright/test";

test.describe("SEO and public metadata", () => {
  test("landing page has correct metadata and JSON-LD", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toContain("PixelForge");
    expect(title.length).toBeLessThan(70);

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(120);
    expect(description!.length).toBeLessThan(180);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const data = JSON.parse(jsonLd!);
    expect(data["@type"]).toBe("SoftwareApplication");
  });

  test("sitemap and robots are reachable", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("pixelforge");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const body = await robots.text();
    expect(body).toMatch(/Disallow:\s*\/dashboard/i);
  });

  test("docs and tools pages are indexable", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/tools");
    await expect(page.getByRole("heading", { name: /image and video tools/i })).toBeVisible();
  });
});
