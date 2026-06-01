import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const assetDir = path.join(process.cwd(), "../asset");
    const homepagePath = path.join(assetDir, "homepage/info.json");
    
    if (fs.existsSync(homepagePath)) {
      const fileContent = fs.readFileSync(homepagePath, "utf-8");
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: "Homepage info file not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error reading homepage info asset:", error);
    return NextResponse.json({ error: "Failed to read homepage info" }, { status: 500 });
  }
}
