import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { loginRateLimited, loginReset } from "@/lib/rate-limit";

// Hash factice : la comparaison bcrypt est toujours faite, même si l'e-mail n'existe pas (temps constant).
const DUMMY_HASH = "$2b$12$qq32ZAeIFpL4Ck.Ohbd6ku40TLpX4a06df7YGt1UL49Rd80crcj56";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds, request) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password || email.length > 200 || password.length > 200) return null;

        const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
        const key = `${xff}:${email}`;
        if (loginRateLimited(key)) return null;

        const user = (await prisma.adminUser.findUnique({ where: { email } })) as
          | { id: number; email: string; name: string; passwordHash: string; active: boolean }
          | null;
        const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !user.active || !ok) return null;

        loginReset(key);
        await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
});
