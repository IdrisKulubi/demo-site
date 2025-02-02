import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isAllowedEmail } from "@/lib/utils/email-validator";
import { checkProfileCompletion } from "@/lib/checks";

const publicRoutes = ["/", "/login", "/no-access"];

export async function middleware(request: Request & { nextUrl: URL }) {
  const session = await auth();
  const isAuth = !!session?.user;
  const pathname = request.nextUrl.pathname;

  // Allow public routes and static assets
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Handle non-authenticated users
  if (!isAuth) {
    if (pathname === "/" || pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle authenticated users
  if (pathname.startsWith("/login")) {
    // Redirect to profile setup instead of home
    return NextResponse.redirect(new URL("/profile/setup", request.url));
  }

  // Get profile status once
  const { hasProfile } = await checkProfileCompletion();

  // Handle setup page access
  if (pathname.startsWith("/profile/setup")) {
    // Check email restriction
    const isAllowed = await isAllowedEmail(
      session.user.email || "",
      session.user.id
    );
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/no-access", request.url));
    }

    // If they have a profile, redirect away from setup
    if (hasProfile) {
      return NextResponse.redirect(new URL("/explore", request.url));
    }

    return NextResponse.next();
  }

  // For all other protected routes
  if (!hasProfile) {
    return NextResponse.redirect(new URL("/profile/setup", request.url));
  }

  // Allow access to all other routes if profile exists
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /static (public files)
     * 4. /*.* (files with extensions)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|static|.*\\.).*)",
  ],
};
