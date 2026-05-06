import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public pages that signed-in users should NOT see.
 * They get redirected to /dashboard instead.
 */
const PUBLIC_ROUTES = ["/", "/about", "/features", "/contact"];

/**
 * Next.js Edge Middleware — Route Protection
 *
 * Runs server-side BEFORE any page JS executes.
 * Uses a lightweight `simulix-auth-active` cookie (set by auth-store.ts
 * on login, cleared on logout) to decide routing:
 *
 *  - /dashboard/* without cookie  → redirect to /auth/login
 *  - /auth/* with cookie          → redirect to /dashboard
 *  - Public pages with cookie     → redirect to /dashboard
 *
 * This gives instant server-side redirects instead of waiting for
 * React hydration + client-side useEffect checks.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("simulix-auth-active");
  const isAuthenticated = authCookie?.value === "true";

  // Protected dashboard routes — require auth cookie
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages — redirect to dashboard if already authenticated
  // Exceptions: /auth/success (post-signup) and /auth/verify (email verification)
  if (
    pathname.startsWith("/auth") &&
    isAuthenticated &&
    pathname !== "/auth/success" &&
    pathname !== "/auth/verify"
  ) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Public pages — redirect to dashboard if signed in
  if (PUBLIC_ROUTES.includes(pathname) && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

/**
 * Run middleware on dashboard, auth, and public routes.
 * Static assets (_next/*), API routes, and favicon are excluded.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/",
    "/about",
    "/features",
    "/pricing",
    "/contact",
  ],
};
