import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const honorsDir = path.join(process.cwd(), "../asset/honors");
    const honors: any[] = [];

    if (fs.existsSync(honorsDir)) {
      const dirs = fs.readdirSync(honorsDir);
      for (const dirName of dirs) {
        const itemDir = path.join(honorsDir, dirName);
        if (fs.statSync(itemDir).isDirectory()) {
          const infoJsonPath = path.join(itemDir, "info.json");
          if (fs.existsSync(infoJsonPath)) {
            try {
              const content = fs.readFileSync(infoJsonPath, "utf-8");
              const honorInfo = JSON.parse(content);
              if (honorInfo && honorInfo.id) {
                // Dynamically scan honors subdirectories for image files
                const files = fs.readdirSync(itemDir);
                const images: string[] = [];
                const imgExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
                for (const file of files) {
                  const ext = path.extname(file).toLowerCase();
                  if (imgExtensions.includes(ext)) {
                    images.push(`/api/honors/image/${honorInfo.id}/${encodeURIComponent(file)}`);
                  }
                }
                honorInfo.images = images;
                honors.push(honorInfo);
              }
            } catch (err) {
              console.error(`Failed to parse honor info in ${dirName}:`, err);
            }
          }
        }
      }
    }

    // Sort honors by id (ascending, e.g. "1", "2", "3", "4")
    honors.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json(honors);
  } catch (error) {
    console.error("Error reading honors asset:", error);
    return NextResponse.json({ error: "Failed to read honors" }, { status: 500 });
  }
}
