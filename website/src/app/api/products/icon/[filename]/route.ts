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
    const filePath = path.join(process.cwd(), "../asset/icons", decodedFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Icon not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving product icon:", error);
    return new NextResponse("Error serving icon", { status: 500 });
  }
}
