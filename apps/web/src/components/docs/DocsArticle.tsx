import Link from "next/link";
import { adjacent, DOC_PAGES, headings, type DocBlock, type DocPage } from "@/lib/docs";

export function DocsArticle({ page }: { page: DocPage }) {
  const toc = headings(page);
  const { prev, next } = adjacent(page.slug);
  const related = DOC_PAGES.filter((item) => item.section === page.section && item.slug !== page.slug);

  return (
    <div className="grid gap-32 px-24 py-32 xl:grid-cols-[minmax(0,1fr)_220px] xl:px-48">
      <article className="min-w-0 max-w-[760px]">
        <nav aria-label="Breadcrumb" className="text-[13px] text-text-subtle">
          <ol className="flex flex-wrap items-center gap-8">
            <li>
              <Link href="/docs" className="hover:text-text">
                Docs
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>{page.section}</li>
            <li aria-hidden>/</li>
            <li className="text-text" aria-current="page">
              {page.title}
            </li>
          </ol>
        </nav>
        <h1 className="font-display mt-16 text-[40px] leading-[1.15]">{page.title}</h1>
        <p className="mt-16 text-[18px] text-text-muted">{page.summary}</p>
        <div className="mt-32 space-y-20">
          {page.blocks.map((block, index) => (
            <Block key={`${page.slug}-${index}`} block={block} />
          ))}
        </div>
        {related.length > 0 ? (
          <section className="mt-40">
            <h2 className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">See also</h2>
            <ul className="mt-12 space-y-8">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/docs/${item.slug}`} className="text-[16px] text-accent hover:text-accent-hover">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <nav className="mt-48 grid gap-16 border-t border-border pt-24 sm:grid-cols-2" aria-label="Nearby pages">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="border border-border p-16 hover:border-border-strong">
              <p className="text-[12px] uppercase tracking-[0.14em] text-text-subtle">Previous</p>
              <p className="mt-8 text-[16px]">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="border border-border p-16 text-right hover:border-border-strong">
              <p className="text-[12px] uppercase tracking-[0.14em] text-text-subtle">Next</p>
              <p className="mt-8 text-[16px]">{next.title}</p>
            </Link>
          ) : null}
        </nav>
      </article>
      {toc.length > 0 ? (
        <aside className="hidden xl:block">
          <div className="sticky top-88">
            <p className="text-[12px] uppercase tracking-[0.16em] text-text-subtle">In this article</p>
            <ul className="mt-12 space-y-8 border-l border-border pl-12">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-[14px] text-text-muted hover:text-text">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

function Block({ block }: { block: DocBlock }) {
  if (block.type === "p") {
    return <p className="text-[16px] leading-[1.75] text-text-muted">{block.text}</p>;
  }
  if (block.type === "h2") {
    return (
      <h2 id={block.id} className="scroll-mt-88 text-[24px] text-text">
        <a href={`#${block.id}`} className="hover:text-accent">
          {block.text}
        </a>
      </h2>
    );
  }
  if (block.type === "h3") {
    return (
      <h3 id={block.id} className="scroll-mt-88 text-[18px] text-text">
        <a href={`#${block.id}`} className="hover:text-accent">
          {block.text}
        </a>
      </h3>
    );
  }
  if (block.type === "code") {
    return (
      <figure className="border border-border bg-surface">
        <figcaption className="border-b border-border px-16 py-8 font-mono text-[11px] uppercase tracking-[0.14em] text-text-subtle">
          {block.lang}
        </figcaption>
        <pre className="overflow-x-auto p-16 font-mono text-[13px] leading-[1.6] text-text">
          <code>{block.text}</code>
        </pre>
      </figure>
    );
  }
  if (block.type === "note" || block.type === "warn") {
    return (
      <aside className={`border p-16 ${block.type === "warn" ? "border-danger" : "border-accent"}`}>
        <p className={`text-[12px] uppercase tracking-[0.16em] ${block.type === "warn" ? "text-danger" : "text-accent"}`}>
          {block.title ?? (block.type === "warn" ? "Warning" : "Note")}
        </p>
        <p className="mt-8 text-[15px] text-text-muted">{block.text}</p>
      </aside>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-8 pl-24 text-[16px] text-text-muted">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "ol") {
    return (
      <ol className="list-decimal space-y-8 pl-24 text-[16px] text-text-muted">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-border bg-surface">
            {block.headers.map((header) => (
              <th key={header} className="px-12 py-12 font-medium text-text">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row[0]}`} className="border-b border-border">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className={`px-12 py-12 align-top text-[13px] text-text-muted ${cellIndex === 0 ? "font-mono text-text" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
