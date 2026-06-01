import type { Metadata } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import IntroManager from "@/components/animations/IntroManager";

export const metadata: Metadata = {
  title: "云路复材 YUNLU COMPOSITES",
  description: "极致视觉体验与前沿科技",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <SmoothScrollProvider>
          <IntroManager>
            {children}
          </IntroManager>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
