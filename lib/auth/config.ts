import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";

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
      ...(env.AUTH_RESEND_KEY
        ? {}
        : {
            // Dev fallback: no email provider configured → print the link.
            async sendVerificationRequest({ identifier, url }) {
              console.log(`\n[perk] Magic link for ${identifier}:\n${url}\n`);
            },
          }),
    }),
  ],
});
