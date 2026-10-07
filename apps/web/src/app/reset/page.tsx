import { Navbar } from "@/components/layout/Navbar";

export default function ResetPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[520px] px-24 py-64">
        <h1 className="font-display text-[40px]">Password reset</h1>
        <p className="mt-16 text-text-muted">
          Email-based reset is architected in Convex Auth (reset flow) and requires an email provider in convex/auth.ts. Until that provider is configured, ask an operator to rotate the account or enable Resend/SMTP verification.
        </p>
      </main>
    </>
  );
}
