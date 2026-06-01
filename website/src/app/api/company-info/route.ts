import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const assetDir = path.join(process.cwd(), "../asset");
    const companyInfoPath = path.join(assetDir, "company_info.json");
    
    let info: any = {
      name: "云路复材",
      nameEn: "YUNLU COMPOSITES",
      description: "掌握三维编织核心技术，打造数字孪生自动化产线。为航空航天、新能源与汽车轻量化提供国际先进的复合材料高端制造解决方案。",
      buttons: ["企业简介", "发展历程", "企业文化", "资质荣誉"],
      news: []
    };

    if (fs.existsSync(companyInfoPath)) {
      try {
        const fileContent = fs.readFileSync(companyInfoPath, "utf-8");
        info = JSON.parse(fileContent);
      } catch (e) {
        console.error("Failed to parse company_info.json, using default fallback company info", e);
      }
    }

    // Dynamically load news from asset/news/*
    const newsDir = path.join(assetDir, "news");
    const newsItems: any[] = [];

    if (fs.existsSync(newsDir)) {
      const dirs = fs.readdirSync(newsDir);
      for (const dirName of dirs) {
        const itemDir = path.join(newsDir, dirName);
        if (fs.statSync(itemDir).isDirectory()) {
          const infoJsonPath = path.join(itemDir, "info.json");
          if (fs.existsSync(infoJsonPath)) {
            try {
              const newsContent = fs.readFileSync(infoJsonPath, "utf-8");
              const newsItem = JSON.parse(newsContent);
              if (newsItem && newsItem.id) {
                newsItems.push(newsItem);
              }
            } catch (err) {
              console.error(`Failed to parse news item in ${dirName}:`, err);
            }
          }
        }
      }
    }

    // Sort news items by date (descending, newest first)
    newsItems.sort((a, b) => b.date.localeCompare(a.date));

    info.news = newsItems;

    return NextResponse.json(info);
  } catch (error) {
    console.error("Error reading company info asset:", error);
    return NextResponse.json({ error: "Failed to read company info" }, { status: 500 });
  }
}
