import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import {
  getSessionOptions,
  isSessionFresh,
  type SessionData,
} from "@/lib/auth-shared";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/api/admin/auth/login" ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(request, res, getSessionOptions());
  if (!isSessionFresh(session)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
