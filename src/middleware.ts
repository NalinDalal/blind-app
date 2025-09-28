import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


/**
 * Enforces authentication-based routing by redirecting users between auth pages, protected pages, and public pages.
 *
 * Redirects unauthenticated requests targeting protected routes to `/auth`, and redirects authenticated requests targeting auth routes to `/`. If no routing rule applies, allows the request to continue.
 *
 * @param request - The incoming Next.js request
 * @returns A NextResponse that performs a redirect when a routing rule matches, or a response that allows the request to continue otherwise
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth-token")?.value;

  // Define auth pages and protected pages
  const authPages = ["/auth", "/login", "/register"];
  const isAuthPage = authPages.includes(pathname);
  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  // Redirect unauthenticated users from protected pages to the main auth page
  if (isProtectedPage && !authToken) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Redirect authenticated users from auth pages to the home page
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
