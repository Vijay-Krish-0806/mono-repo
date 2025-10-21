import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSession } from "../lib/auth-utils";

export async function middleware(request: NextRequest) {
  const session = await getSession();

  if (!session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip all static files, public assets, and auth routes:
     * - /_next/static, /_next/image, /favicon.ico, /images, /api/public
     * - /auth/*
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
