"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

// 全局注册 GSAP 滚动插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        // Wait briefly for Next.js page layout and mounting, then scroll to the element
        const timer = setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "auto" });
          } else {
            window.scrollTo({ top: 0, behavior: "auto" });
          }
        }, 150);
        return () => clearTimeout(timer);
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [pathname]);

  return null;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useIsomorphicLayoutEffect(() => {
    // Sync GSAP's ticker with ScrollTrigger updates
    const tickerCallback = () => {
      ScrollTrigger.update();
    };
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, []);

  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}
