import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { profiles } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      profileCompleted?: boolean;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google") return false;
      return true; // Allow sign in
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        try {
          const profile = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, token.sub))
            .limit(1);

          if (profile[0]) {
            session.user.role = profile[0].role || "user";
            session.user.profileCompleted =
              profile[0].profileCompleted || false;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
});
