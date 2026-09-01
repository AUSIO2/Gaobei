import { NextResponse } from "next/server";
import path from "path";
import { getAssetRoot, listImageFiles } from "@/lib/serve-asset";

export async function GET() {
  try {
    const dirPath = path.join(getAssetRoot(), "front-slide");
    const images = listImageFiles(dirPath);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error reading slides directory:", error);
    return NextResponse.json({ error: "Failed to read directory" }, { status: 500 });
  }
}
