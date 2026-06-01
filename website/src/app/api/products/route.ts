import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const productsDir = path.join(process.cwd(), "../asset/products");
    const categories: any[] = [];

    if (fs.existsSync(productsDir)) {
      const dirs = fs.readdirSync(productsDir);
      for (const dirName of dirs) {
        const itemDir = path.join(productsDir, dirName);
        if (fs.statSync(itemDir).isDirectory()) {
          const infoJsonPath = path.join(itemDir, "info.json");
          if (fs.existsSync(infoJsonPath)) {
            try {
              const content = fs.readFileSync(infoJsonPath, "utf-8");
              const categoryInfo = JSON.parse(content);
              if (categoryInfo && categoryInfo.id) {
                categories.push(categoryInfo);
              }
            } catch (err) {
              console.error(`Failed to parse category info in ${dirName}:`, err);
            }
          }
        }
      }
    }

    // Sort categories by id (ascending, e.g. "1", "2", "3", "4")
    categories.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error reading products categories asset:", error);
    return NextResponse.json({ error: "Failed to read products categories" }, { status: 500 });
  }
}
