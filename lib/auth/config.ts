import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { track } from "@/lib/analytics";

const env = getEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "database" },
  pages: { signIn: "/login", verifyRequest: "/login/check-email", error: "/login" },
  providers: [
    Resend({
      apiKey: env.AUTH_RESEND_KEY ?? "missing",
      from: env.AUTH_EMAIL_FROM,
      // Perk-branded email with a unique subject; logs the link instead when Resend isn't configured.
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLinkEmail(identifier, url);
      },
    }),
  ],
  events: {
    signIn({ user, isNewUser }) {
      if (user.email) track("owner_signed_in", { new_user: isNewUser ?? false }, { distinctId: user.email.toLowerCase() });
    },
  },
});
