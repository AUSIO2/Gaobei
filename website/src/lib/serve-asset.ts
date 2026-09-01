import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { toImageBasename } from "@/lib/asset-urls";

export { toImageBasename };

export const IMAGE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
]);

export function getAssetRoot(): string {
  return path.join(process.cwd(), "../asset");
}

/** Only allow a basename; reject path traversal. */
export function safeBasename(filename: string): string {
  const base = path.basename(filename);
  if (!base || base === "." || base === ".." || base.includes("\0")) {
    throw new Error("Invalid filename");
  }
  return base;
}

export function contentTypeForExt(ext: string): string {
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
    case ".png":
    default:
      return "image/png";
  }
}

/** Resolve absolute path under asset root; all segments sanitized. */
export function resolveUnderAsset(...segments: string[]): string {
  const safe = segments.map((s) => {
    const cleaned = path.basename(s);
    if (!cleaned || cleaned === "." || cleaned === "..") {
      throw new Error(`Invalid path segment: ${s}`);
    }
    return cleaned;
  });
  const resolved = path.resolve(getAssetRoot(), ...safe);
  const root = path.resolve(getAssetRoot());
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error("Path escapes asset root");
  }
  return resolved;
}

/** List image basenames in a directory (sorted). */
export function listImageFiles(absDir: string): string[] {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) {
    return [];
  }
  return fs
    .readdirSync(absDir)
    .filter((f) => {
      const full = path.join(absDir, f);
      if (!fs.statSync(full).isFile()) return false;
      return IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase());
    })
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Normalize images field: empty → scan dir; strip /api prefixes to basename;
 * map each to URL via toUrl.
 */
export function resolveImageList(
  images: unknown,
  absDir: string,
  toUrl: (filename: string) => string
): string[] {
  const raw = Array.isArray(images) ? images.filter((x): x is string => typeof x === "string") : [];
  const names =
    raw.length === 0
      ? listImageFiles(absDir)
      : raw.map(toImageBasename).filter(Boolean);
  return names.map(toUrl);
}

export function serveAssetFile(request: NextRequest, absFilePath: string): NextResponse {
  try {
    if (!fs.existsSync(absFilePath) || !fs.statSync(absFilePath).isFile()) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const root = path.resolve(getAssetRoot());
    const resolved = path.resolve(absFilePath);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const stat = fs.statSync(resolved);
    const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=60, must-revalidate",
        },
      });
    }

    const fileBuffer = fs.readFileSync(resolved);
    const ext = path.extname(resolved).toLowerCase();

    const headers: Record<string, string> = {
        "Content-Type": contentTypeForExt(ext),
        ETag: etag,
        "Last-Modified": stat.mtime.toUTCString(),
        "Cache-Control": "public, max-age=60, must-revalidate",
        "X-Content-Type-Options": "nosniff",
    };
    if (ext === ".svg") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }
    return new NextResponse(fileBuffer, {
      headers,
    });
  } catch (error) {
    console.error("Error serving asset file:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}

export function serveAssetFileFirstExisting(
  request: NextRequest,
  candidates: string[]
): NextResponse {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return serveAssetFile(request, candidate);
    }
  }
  return new NextResponse("File not found", { status: 404 });
}
