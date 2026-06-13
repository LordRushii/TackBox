import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("skillhub_session")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/my-skills", "/skills/create", "/edit-skill"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-skills/:path*",
    "/skills/create/:path*",
    "/edit-skill/:path*",
  ],
};
