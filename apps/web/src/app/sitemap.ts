import type { MetadataRoute } from "next";
import { DOC_PAGES } from "@/lib/docs";
import { TOOL_CATALOG } from "@pixelforge/shared";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pixelforge.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/tools",
    "/docs",
    "/signin",
    "/signup",
    "/legal/privacy",
    "/legal/terms",
    "/legal/acceptable-use",
    "/legal/licenses",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const docs = DOC_PAGES.map((page) => ({
    url: `${SITE_URL}/docs/${page.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const tools = TOOL_CATALOG.filter((tool) => !tool.comingSoon).map((tool) => ({
    url: `${SITE_URL}${tool.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...docs, ...tools];
}
