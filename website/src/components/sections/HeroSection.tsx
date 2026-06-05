"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MotionButton from "../ui/MotionButton";

export default function HeroSection() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile to conditionally apply GSAP pin
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGSAP(
    () => {
      // 1. 文字入场动画
      gsap.from(".hero-text", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2,
      });

      // 2. 滚动视差与屏幕固定 — only on desktop
      if (!isMobile) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "+=150% top",
            scrub: 1,
            pin: true,
          },
        });

        tl.to(textRef.current, { y: -150, opacity: 0 }, 0);
      }

      return () => {
        // cleanup
      };
    },
    { scope: container, dependencies: [isMobile] }
  );

  return (
    <section 
      ref={container} 
      className="relative min-h-[80vh] md:h-screen w-full overflow-hidden bg-surface text-neutral-900 flex items-center justify-between px-5 sm:px-8 md:px-10 lg:px-24 perspective-1000"
    >

      
      {/* 文字内容层 */}
      <div ref={textRef} className="relative z-10 w-full flex flex-col items-start text-left mt-10 md:mt-20">
        <div className="overflow-hidden mb-4">
          <p className="hero-text text-xs sm:text-sm md:text-lg tracking-[0.2em] md:tracking-[0.3em] text-brand font-bold uppercase">
            云路装备 · 大国重器
          </p>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-text text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tighter leading-tight">
            三维编织领军者<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-500">
              先进制造新引擎
            </span>
          </h1>
        </div>
        <div className="overflow-hidden">
          <p className="hero-text text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 mb-6 md:mb-10 max-w-xl font-light leading-relaxed">
            掌握三维编织核心技术，打造数字孪生自动化产线。为航空航天、新能源与汽车轻量化提供国际先进的复合材料高端制造解决方案。
          </p>
        </div>
        
        <div className="hero-text flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
           <MotionButton>获取设备方案</MotionButton>
           <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-sm font-bold tracking-widest text-neutral-800 uppercase">
             了解我们
           </button>
        </div>
      </div>
    </section>
  );
}
