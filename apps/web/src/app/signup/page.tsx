import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[420px] px-24 py-64">
        <h1 className="font-display text-[40px]">Create account</h1>
        <AuthForm mode="signUp" />
      </main>
    </>
  );
}
