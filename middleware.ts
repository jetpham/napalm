import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // If user is authenticated but doesn't have a username, redirect to home
  // (which will show the username setup form)
  if (session?.user && !session.user.username) {
    // Allow access to home page and API routes
    if (
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/api/")
    ) {
      return NextResponse.next();
    }

    // Redirect all other routes to home for username setup
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
