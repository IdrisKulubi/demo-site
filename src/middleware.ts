import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/actions/profile.actions";

export async function middleware(request: Request & { nextUrl: URL }) {
  const session = await auth();
  const isAuth = !!session?.user;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isProfileSetup = request.nextUrl.pathname.startsWith("/profile/setup");
  const isLandingPage = request.nextUrl.pathname === "/";

  if (isLandingPage) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/profile/setup", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Check profile completion and redirect if needed
  if (!isProfileSetup && session?.user) {
    try {
      const profile = await getProfile();
      if (!profile?.profileCompleted) {
        return NextResponse.redirect(
          new URL("/profile/setup", request.nextUrl)
        );
      }
    } catch (error) {
      console.error("Middleware profile check failed:", error);
      // Allow proceeding to avoid infinite loop
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|landing).*)"],
};
