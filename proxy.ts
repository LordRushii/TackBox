import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/my-skills(.*)',
  '/skills/create(.*)',
  '/edit-skill(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const sessionToken = req.cookies.get("skillhub_session")?.value;

  if (isProtectedRoute(req)) {
    // Check both: custom session cookie OR Clerk session
    const { userId: clerkUserId } = await auth();
    
    if (!sessionToken && !clerkUserId) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/(api|trpc)(.*)',
  ],
};

