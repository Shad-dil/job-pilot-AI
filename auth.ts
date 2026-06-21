import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google,

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        return valid ? user : null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative URLs like /dashboard?claim=xxx
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows full URLs on same origin
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;

      // For Google — look up DB user to get real ID
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) token.id = dbUser.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
