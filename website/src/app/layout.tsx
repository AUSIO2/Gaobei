import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import IntroManager from "@/components/animations/IntroManager";

import fs from "fs";
import path from "path";

function getCompanyInfo() {
  try {
    const filePath = path.join(process.cwd(), "../asset/company_info.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to load company info in layout:", e);
  }
  return { name: "云路复材", nameEn: "YUNLU COMPOSITES" };
}

export async function generateMetadata(): Promise<Metadata> {
  const info = getCompanyInfo();
  const shortName = info.shortName || info.name || "云路复材";
  const shortNameEn = info.shortNameEn || info.nameEn || "YUNLU COMPOSITES";
  return {
    title: `${shortName} ${shortNameEn}`.trim(),
    description: info.description || "极致视觉体验与前沿科技",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body style={{ fontFamily: "system-ui, sans-serif" }} suppressHydrationWarning>
        <SmoothScrollProvider>
          <IntroManager>
            {children}
          </IntroManager>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
