import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdmin && !req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("from", pathname);
    return Response.redirect(url);
  }
});

export const config = { matcher: ["/admin/:path*"] };
