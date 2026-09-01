import path from "path";
import { NextResponse } from "next/server";
import { PathError, readFileBuffer, resolveAssetPath } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { jsonError, requireAuth, requirePathParam } from "@/lib/http";

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export async function GET(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const rel = requirePathParam(request);
    const abs = resolveAssetPath(rel);
    const buf = readFileBuffer(rel);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentTypeForExt(path.extname(abs)),
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to read file";
    return jsonError(msg, e instanceof PathError ? 400 : 500);
  }
}
