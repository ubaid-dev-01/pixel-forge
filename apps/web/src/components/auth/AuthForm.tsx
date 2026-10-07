"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function AuthForm({ mode }: { mode: "signIn" | "signUp" }) {
  const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  if (!configured) {
    return (
      <p className="mt-24 text-text-muted">
        Set NEXT_PUBLIC_CONVEX_URL to enable accounts. The marketing site and labeled demos work without Convex.
      </p>
    );
  }
  return <AuthFormInner mode={mode} />;
}

function AuthFormInner({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-32 flex flex-col gap-16"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        try {
          const payload: Record<string, string> = {
            email: String(form.get("email")),
            password: String(form.get("password")),
            flow: mode,
          };
          if (mode === "signUp") {
            payload.name = String(form.get("name"));
          }
          await signIn("password", payload);
          router.push("/overview");
        } catch (err) {
          const detail = err instanceof Error ? err.message : String(err);
          const missingKeys =
            /JWT|JWKS|private key|SITE_URL|Missing environment/i.test(detail);
          setError(
            missingKeys
              ? "Convex Auth keys missing. Run node scripts/generate-auth-keys.mjs and set JWT_PRIVATE_KEY, JWKS, SITE_URL on the Convex dashboard, then restart npx convex dev."
              : mode === "signUp"
                ? `Could not create the account (${detail}). Use a unique email and a password of at least 10 characters.`
                : `Sign in failed (${detail}). Check email and password.`,
          );
        } finally {
          setPending(false);
        }
      }}
    >
      {mode === "signUp" ? (
        <Field label="Name">
          <Input name="name" required autoComplete="name" />
        </Field>
      ) : null}
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Password" hint={mode === "signUp" ? "Minimum 10 characters." : undefined}>
        <Input
          name="password"
          type="password"
          required
          minLength={mode === "signUp" ? 10 : undefined}
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
        />
      </Field>
      {error ? <p className="text-danger">{error}</p> : null}
      <Button type="submit" loading={pending}>
        {mode === "signUp" ? "Create account" : "Sign in"}
      </Button>
      {mode === "signIn" ? (
        <p className="text-text-muted">
          No account? <Link href="/signup">Create one</Link>
        </p>
      ) : (
        <p className="text-text-muted">
          Already registered? <Link href="/signin">Sign in</Link>
        </p>
      )}
    </form>
  );
}
