import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[420px] px-24 py-64">
        <h1 className="font-display text-[40px]">Sign in</h1>
        <AuthForm mode="signIn" />
        <p className="mt-8 text-text-muted">
          <Link href="/reset">Reset password</Link>
        </p>
      </main>
    </>
  );
}
