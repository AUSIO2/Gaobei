import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await props.params;
    const decodedFilename = decodeURIComponent(filename);
    const baseFilename = path.basename(decodedFilename);
    let filePath = path.join(process.cwd(), "../asset/front-contact", baseFilename);

    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), "../asset/contact", baseFilename);
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;

    // Check If-None-Match header
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": etag,
          "Cache-Control": "public, max-age=3600, must-revalidate",
        },
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(decodedFilename).toLowerCase();
    
    let contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".svg") {
      contentType = "image/svg+xml";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "ETag": etag,
        "Last-Modified": stat.mtime.toUTCString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving contact QR code image:", error);
    return new NextResponse("Error serving image", { status: 500 });
  }
}
