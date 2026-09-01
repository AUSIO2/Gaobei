import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { localizeData, getLocaleFromRequest } from "@/lib/localize";
import { honorsImageUrl } from "@/lib/asset-urls";
import { resolveImageList } from "@/lib/serve-asset";

export async function GET(request: Request) {
  try {
    const locale = getLocaleFromRequest(request);
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
                honorInfo.images = resolveImageList(
                  honorInfo.images,
                  itemDir,
                  (f) => honorsImageUrl(honorInfo.id, f)
                );
                honors.push(honorInfo);
              }
            } catch (err) {
              console.error(`Failed to parse honor info in ${dirName}:`, err);
            }
          }
        }
      }
    }

    honors.sort((a, b) => a.id.localeCompare(b.id));

    return NextResponse.json(localizeData(honors, locale));
  } catch (error) {
    console.error("Error reading honors asset:", error);
    return NextResponse.json({ error: "Failed to read honors" }, { status: 500 });
  }
}
