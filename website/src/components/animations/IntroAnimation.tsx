"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { logoViewBox, logoIconPathString, logoTextPathString } from "../ui/Logo";

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // 锁定背景滚动
    document.body.style.overflow = "hidden";

    // 我们不再在这里使用 onAnimationComplete 来 unmount，
    // 而是使用 setTimeout，让 framer-motion 的 AnimatePresence 和 layout 动画接管。
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5秒后通知 Manager 切换状态

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [onComplete]);

  // 动画变体：先绘制轮廓（激光蚀刻），再填充实心（高亮发光）
  const drawIcon: any = {
    hidden: { pathLength: 0, fillOpacity: 0, strokeOpacity: 0 },
    visible: {
      pathLength: 1,
      fillOpacity: 1,
      strokeOpacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        fillOpacity: { delay: 0.8, duration: 0.5, ease: "easeIn" as const },
        strokeOpacity: { duration: 0.1 }
      }
    }
  };

  const drawText: any = {
    hidden: { fillOpacity: 0, opacity: 0, filter: "blur(10px)", x: -20 },
    visible: {
      fillOpacity: 1,
      opacity: 1,
      filter: "blur(0px)",
      x: 0,
      transition: { delay: 1.2, duration: 0.8, ease: "easeOut" as const }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" as const } }}
    >
      <motion.div className="flex items-center w-[80vw] max-w-[500px]">
        {/* 完整的 SVG Logo 像素级绘制 */}
        <motion.svg
          width="100%"
          viewBox={logoViewBox}
          initial="hidden"
          animate="visible"
          className=""
        >
          {/* 左侧图标 */}
          <motion.path
            d={logoIconPathString}
            stroke="#0D102C"
            strokeWidth="0.8"
            fill="#0D102C"
            fillRule="evenodd"
            variants={drawIcon}
          />
          {/* 右侧文字 */}
          <motion.path
            d={logoTextPathString}
            fill="#0D102C"
            fillRule="evenodd"
            variants={drawText}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
