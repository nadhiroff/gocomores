import type { NextAuthConfig } from "next-auth";

/** Configuration compatible Edge (sans bcrypt ni base de données) : utilisée par le middleware. */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [],
  callbacks: {
    // Par défaut, Auth.js v5 n'expose pas l'id dans la session : requireAdmin() en a besoin.
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
