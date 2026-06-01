import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "../asset/about/info.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "About configuration not found" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading about configuration:", error);
    return NextResponse.json({ error: "Failed to read about configuration" }, { status: 500 });
  }
}
