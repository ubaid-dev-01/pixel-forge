import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className="mx-auto max-w-[560px] px-24 py-64">
        <h1 className="font-display text-[36px]">Workspace unavailable</h1>
        <p className="mt-12 text-text-muted">
          Set NEXT_PUBLIC_CONVEX_URL to enable the authenticated workspace. The marketing site and documentation remain available.
        </p>
      </main>
    );
  }
  return <AppShell>{children}</AppShell>;
}
