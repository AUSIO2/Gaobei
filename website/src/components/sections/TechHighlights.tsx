"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HighlightCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  pills: string[];
}

export default function TechHighlights() {
  const [data, setData] = useState({
    title: "以自主研发科技，定义复材制造未来",
    subtitle: "技术壁垒 • 核心优势",
    description: "云路复材攻克三维立体编织工艺瓶颈，结合数字孪生与自动化智造系统，提供高强度、定制化、高一致性的前沿复合材料方案。",
    cards: [
      {
        id: "braiding",
        title: "三维编织技术",
        subtitle: "3D Braiding Technology",
        description: "实现纤维多维立体交叉编织，从根本上解决层间剥离难题，为结构件提供极致的抗冲击与轻量化表现。",
        href: "/technology#braiding",
        pills: ["1.5m 最大外径", "6m 编织长度", "近净尺寸成形"]
      },
      {
        id: "digital-twin",
        title: "数字孪生自动化",
        subtitle: "Digital Twin Automation",
        description: "通过高精度传感器与三维可视化模型，建立产线物理实体的数字映射，提供全生产流程参数精确监控与追溯。",
        href: "/technology#digital-twin",
        pills: ["±1℃ 温控精度", "100% 在线监测", "全工艺数智追溯"]
      }
    ] as HighlightCard[]
  });

  useEffect(() => {
    fetch("/api/homepage")
      .then(res => res.json())
      .then(val => {
        if (val && val.techHighlights) {
          setData(val.techHighlights);
        }
      })
      .catch(err => console.error("Failed to load tech highlights:", err));
  }, []);

  const cardStyles: Record<string, { gradient: string; accentColor: string }> = {
    braiding: {
      gradient: "from-[#0c1f38] via-[#0d2545] to-[#12365c]",
      accentColor: "#2f55d4"
    },
    "digital-twin": {
      gradient: "from-[#091b30] via-[#0b223c] to-[#0f3057]",
      accentColor: "#38bdf8"
    }
  };

  const getCardSvg = (id: string) => {
    if (id === "braiding") {
      return (
        <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid Background */}
          <defs>
            <pattern id="braid-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(47, 85, 212, 0.07)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#braid-grid)" />
          
          {/* Animated Braiding Path 1 */}
          <motion.path
            d="M 20,100 Q 60,60 100,100 T 180,100"
            stroke="#2f55d4"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0.3 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              pathOffset: [0, 0, 0.5, 1],
              opacity: [0.3, 1, 1, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Animated Braiding Path 2 */}
          <motion.path
            d="M 20,100 Q 60,140 100,100 T 180,100"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              pathOffset: [0, 0, -0.5, -1],
              opacity: [0.2, 0.8, 0.8, 0.2]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          {/* Animated Braiding Path 3 (Vertical diagonal) */}
          <motion.path
            d="M 100,20 Q 60,60 100,100 T 100,180"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          {/* Nodes */}
          <motion.circle cx="100" cy="100" r="5" fill="#2f55d4" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <circle cx="60" cy="80" r="3" fill="#38bdf8" />
          <circle cx="140" cy="120" r="3" fill="#38bdf8" />
        </svg>
      );
    }

    return (
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Concentric circles */}
        <circle cx="100" cy="100" r="60" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="45" stroke="rgba(47, 85, 212, 0.15)" strokeWidth="1" />
        
        {/* Scanning Line */}
        <motion.circle
          cx="100"
          cy="100"
          r="45"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="20 120"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Data Bars / Graph in center */}
        <motion.path
          d="M 60,120 L 80,105 L 100,115 L 120,90 L 140,110"
          stroke="#2f55d4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        
        <motion.path
          d="M 60,120 L 80,105 L 100,115 L 120,90 L 140,110 L 140,140 L 60,140 Z"
          fill="url(#twin-gradient)"
          opacity="0.1"
        />

        <defs>
          <linearGradient id="twin-gradient" x1="100" y1="90" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2f55d4" />
            <stop offset="100%" stopColor="#2f55d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Floating Data Points */}
        <motion.g
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="65" y="65" width="24" height="12" rx="2" fill="rgba(56, 189, 248, 0.1)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="0.5" />
          <text x="77" y="73" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">RUN</text>
        </motion.g>

        <motion.g
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <rect x="110" y="130" width="30" height="12" rx="2" fill="rgba(47, 85, 212, 0.1)" stroke="rgba(47, 85, 212, 0.3)" strokeWidth="0.5" />
          <text x="125" y="138" fill="#a5b4fc" fontSize="6" fontFamily="monospace" textAnchor="middle">98.5%</text>
        </motion.g>
      </svg>
    );
  };

  return (
    <section className="w-full bg-[#f8f9fa] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span 
            className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {data.subtitle}
          </motion.span>
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0d102c] tracking-tight mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {data.title}
          </motion.h2>
          <motion.p 
            className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {data.description}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {data.cards.map((card, idx) => {
            const styles = cardStyles[card.id] || {
              gradient: "from-[#0c1f38] to-[#12365c]",
              accentColor: "#2f55d4"
            };

            return (
              <motion.div
                key={card.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${styles.gradient} p-6 sm:p-8 md:p-10 border border-[#2f55d4]/10 shadow-xl flex flex-col md:flex-row gap-6 md:gap-8 justify-between items-stretch group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  borderColor: "rgba(47, 85, 212, 0.3)",
                  boxShadow: "0 25px 50px -12px rgba(13, 37, 69, 0.4)"
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 22,
                  y: { duration: 0.3 }
                }}
              >
                {/* Left text column */}
                <div className="flex flex-col justify-between flex-1 z-10">
                  <div>
                    <span className="text-[10px] md:text-xs font-bold tracking-widest text-blue-300/60 uppercase block mb-2 font-mono">
                      {card.subtitle}
                    </span>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide mb-4">
                      {card.title}
                    </h3>
                    <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6 font-light">
                      {card.description}
                    </p>
                  </div>

                  {/* Technical parameters / pills */}
                  <div className="flex flex-wrap gap-2 mb-6 md:mb-0">
                    {card.pills.map((pill) => (
                      <span 
                        key={pill}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/95 backdrop-blur-sm"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right graphical / animation column */}
                <div className="w-full md:w-[160px] lg:w-[180px] h-[160px] md:h-auto shrink-0 relative flex items-center justify-center bg-white/2 rounded-xl border border-white/5 overflow-hidden z-10">
                  <div className="w-full h-full max-w-[140px] max-h-[140px]">
                    {getCardSvg(card.id)}
                  </div>
                </div>

                {/* Hover highlight line at bottom */}
                <div 
                  className="absolute bottom-0 left-0 h-[3px] bg-[#2f55d4] transition-all duration-300 w-0 group-hover:w-full"
                  style={{ backgroundColor: styles.accentColor }}
                />

                {/* Decorative radial gradients in background */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Overlay Link */}
                <Link href={card.href} className="absolute inset-0 z-20 cursor-pointer" aria-label={`了解更多关于${card.title}`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
