import Link from "next/link";

export default function DocsNotFound() {
  return (
    <div className="px-24 py-64 md:px-48">
      <p className="text-[12px] uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="font-display mt-12 text-[40px]">This article does not exist.</h1>
      <p className="mt-12 max-w-[520px] text-[16px] text-text-muted">
        The slug is not in the documentation set. Open the docs index or search from the header.
      </p>
      <Link href="/docs" className="mt-24 inline-block text-[16px] text-accent hover:text-accent-hover">
        Back to documentation
      </Link>
    </div>
  );
}
