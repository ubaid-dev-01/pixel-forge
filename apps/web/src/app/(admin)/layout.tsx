export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className="mx-auto max-w-[560px] px-24 py-64">
        <p className="text-text-muted">Admin requires Convex.</p>
      </main>
    );
  }
  return children;
}
