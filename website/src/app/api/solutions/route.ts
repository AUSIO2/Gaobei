import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const assetDir = path.join(process.cwd(), "../asset");
    const solutionsPath = path.join(assetDir, "solutions/info.json");
    
    if (fs.existsSync(solutionsPath)) {
      const fileContent = fs.readFileSync(solutionsPath, "utf-8");
      const data = JSON.parse(fileContent);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: "Solutions info file not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error reading solutions info asset:", error);
    return NextResponse.json({ error: "Failed to read solutions info" }, { status: 500 });
  }
}
