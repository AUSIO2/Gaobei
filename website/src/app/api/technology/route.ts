import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const assetDir = path.join(process.cwd(), "../asset");
    const techInfoPath = path.join(assetDir, "technology/info.json");
    
    if (fs.existsSync(techInfoPath)) {
      const fileContent = fs.readFileSync(techInfoPath, "utf-8");
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: "Technology info file not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error reading technology info asset:", error);
    return NextResponse.json({ error: "Failed to read technology info" }, { status: 500 });
  }
}
