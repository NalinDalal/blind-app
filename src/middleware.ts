import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Enforces simple authentication routing by redirecting based on the request path and auth cookie.
 *
 * Redirects unauthenticated requests targeting protected routes (paths starting with `/dashboard` or `/profile`) to `/auth`, redirects authenticated requests visiting auth-related pages (`/auth`, `/login`, `/register`) to `/`, and otherwise allows the request to proceed.
 *
 * @returns A NextResponse that redirects to `/auth` for unauthenticated access to protected pages, redirects to `/` for authenticated access to auth pages, or `NextResponse.next()` to continue the request flow.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("token")?.value;

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
