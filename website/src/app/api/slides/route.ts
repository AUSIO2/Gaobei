import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), "../asset/front-slide");
    
    if (!fs.existsSync(dirPath)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(dirPath);
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".PNG", ".JPG", ".JPEG"];
    
    // Filter and sort files to keep order predictable
    const images = files
      .filter(file => {
        const ext = path.extname(file);
        return imageExtensions.includes(ext);
      })
      .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error reading slides directory:", error);
    return NextResponse.json({ error: "Failed to read directory" }, { status: 500 });
  }
}
