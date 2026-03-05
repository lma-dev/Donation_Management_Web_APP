import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { authenticateUser } from "@/features/auth/domain";
import { AuthError } from "@/features/auth/error";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ipAddress =
          (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? null;

        if (!credentials?.email || !credentials?.password) {
          await prisma.activityLog.create({
            data: {
              userName: credentials?.email ?? "Unknown",
              userRole: "Unknown",
              actionType: "Login Failed",
              actionLabel: "Login Failed",
              details: `Failed login attempt: missing credentials`,
              ipAddress,
              status: "Alert",
            },
          });
          return null;
        }

        try {
          const user = await authenticateUser(
            credentials.email,
            credentials.password,
          );
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              userName: user.name ?? user.email,
              userRole: user.role,
              actionType: "Login",
              actionLabel: "User Logged In",
              details: `User logged in: ${user.email}`,
              ipAddress,
              status: "Success",
            },
          });
          return user;
        } catch (error) {
          const isLocked =
            error instanceof AuthError && error.code === "ACCOUNT_LOCKED";
          await prisma.activityLog.create({
            data: {
              userName: credentials.email,
              userRole: "Unknown",
              actionType: isLocked ? "Account Locked" : "Login Failed",
              actionLabel: isLocked ? "Account Locked" : "Login Failed",
              details: isLocked
                ? `Account locked for: ${credentials.email}`
                : `Failed login attempt for: ${credentials.email}`,
              ipAddress,
              status: "Alert",
            },
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: "ADMIN" | "USER" | "SYSTEM_ADMIN" }).role;
      }

      // Re-validate user is still active (not deleted or locked) every 5 minutes
      const now = Date.now();
      const lastChecked = (token.lastChecked as number) ?? 0;
      if (now - lastChecked > 5 * 60 * 1000) {
        const dbUser = await prisma.user.findFirst({
          where: { id: token.id as string, deletedAt: null, isLocked: false },
          select: { role: true },
        });
        if (!dbUser) {
          return { ...token, expired: true };
        }
        token.role = dbUser.role;
        token.lastChecked = now;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.expired) {
        return { ...session, expired: true };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER" | "SYSTEM_ADMIN";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export async function auth() {
  return getServerSession(authOptions);
}
