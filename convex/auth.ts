import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params) => ({
        email: params.email as string,
        name: (params.name as string | undefined) ?? undefined,
      }),
      validatePasswordRequirements: (password: string) => {
        if (password.length < 10) {
          throw new Error("Password must be at least 10 characters.");
        }
      },
    }),
  ],
});
