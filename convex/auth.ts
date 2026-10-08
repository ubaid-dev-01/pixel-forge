import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { Value } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params): { email: string } & Record<string, Value> => ({
        email: String(params.email ?? ""),
        name: typeof params.name === "string" ? params.name : null,
      }),
      validatePasswordRequirements: (password: string) => {
        if (password.length < 10) {
          throw new Error("Password must be at least 10 characters.");
        }
      },
    }),
  ],
});
