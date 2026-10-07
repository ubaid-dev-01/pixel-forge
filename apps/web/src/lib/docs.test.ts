import { describe, expect, it } from "vitest";
import { DOC_PAGES, DOC_SECTIONS, adjacent, docBySlug, searchDocs } from "./docs";

describe("documentation catalog", () => {
  it("has unique slugs covering every section", () => {
    const slugs = DOC_PAGES.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const section of DOC_SECTIONS) {
      expect(DOC_PAGES.some((page) => page.section === section), section).toBe(true);
    }
  });

  it("resolves every slug and adjacent links", () => {
    for (const page of DOC_PAGES) {
      expect(docBySlug(page.slug)?.title).toBe(page.title);
    }
    expect(adjacent(DOC_PAGES[0].slug).prev).toBeUndefined();
    expect(adjacent(DOC_PAGES[0].slug).next?.slug).toBe(DOC_PAGES[1].slug);
    expect(adjacent("not-a-page").next).toBeUndefined();
  });

  it("search finds env, GFPGAN, and error codes", () => {
    expect(searchDocs("GFPGAN").some((page) => page.slug === "face")).toBe(true);
    expect(searchDocs("NEXT_PUBLIC_CONVEX_URL").some((page) => page.slug === "environment")).toBe(true);
    expect(searchDocs("NO_FACES").some((page) => page.slug === "error-codes")).toBe(true);
    expect(searchDocs("x")).toEqual([]);
  });
});
