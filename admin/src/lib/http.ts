import { NextResponse } from "next/server";
import type { IronSession } from "iron-session";
import { isAuthorized, type SessionData } from "./auth";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function requireAuth(
  request: Request,
  session: IronSession<SessionData>
): NextResponse | null {
  if (!isAuthorized(request, session)) {
    return jsonError("Unauthorized", 401);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const fetchSite = request.headers.get("sec-fetch-site");
    let crossOrigin = false;
    try {
      crossOrigin = !!origin && new URL(origin).host !== host;
    } catch {
      crossOrigin = true;
    }
    if (crossOrigin || (fetchSite && fetchSite !== "same-origin")) {
      return jsonError("Cross-origin request rejected", 403);
    }
  }
  return null;
}

export function requirePathParam(request: Request): string {
  const { searchParams } = new URL(request.url);
  const p = searchParams.get("path");
  if (!p) throw new Error("Missing path parameter");
  return p;
}
