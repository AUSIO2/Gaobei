"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface IndustryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  highlights: string[];
}

export default function SolutionsPreview() {
  const [data, setData] = useState({
    title: "服务三大核心产业",
    subtitle: "业务版图 • 行业应用",
    industries: [
      {
        id: "aerospace",
        title: "航空航天",
        subtitle: "Aerospace & Defense",
        description: "针对极端工况要求，提供包括机身肋梁、发动机喷管保护层、整流罩、机翼前缘等高强度、零缺陷关键承力件的三维立体编织解决方案。",
        href: "/solutions#aerospace",
        highlights: ["无层间剥离结构", "极端耐温与防热", "近净尺寸一次成型"]
      },
      {
        id: "energy",
        title: "新能源与清洁能源",
        subtitle: "New Energy & Power",
        description: "面向储能与重载运输，开发高压气瓶（如70MPa氢气瓶）碳纤维编织外壳、大功率风电叶片根部预制体、储氢装备等高安全系数复材结构。",
        href: "/solutions#energy",
        highlights: ["碳纤维多维缠绕", "高压气密封层", "大尺寸预制体加工"]
      },
      {
        id: "automotive",
        title: "汽车轻量化",
        subtitle: "Automotive Lightweighting",
        description: "助力量产与高性能赛车，定制底盘传动轴管件、车身防撞横梁、新能源电池包壳体等结构件，实现高达30%-50%的以碳代钢轻量化减重。",
        href: "/solutions#automotive",
        highlights: ["批量化自动成型", "高吸能碰撞防御", "模块化快速装配"]
      }
    ] as IndustryItem[],
    footerNote: "我们拥有完善的非标制造开发能力，亦可为 国防科工、海洋工程、轨道交通及高端医疗器械 等特种行业提供定制化复合材料工艺装备。"
  });

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((val) => {
        if (val && val.solutionsPreview) {
          setData(val.solutionsPreview);
        }
      })
      .catch((err) => console.error("Failed to load solutions preview:", err));
  }, []);

  const industryMeta: Record<string, { colorClass: string; accentColor: string; icon: React.ReactNode }> = {
    aerospace: {
      colorClass: "bg-brand",
      accentColor: "var(--color-brand)",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    },
    energy: {
      colorClass: "bg-emerald-500",
      accentColor: "var(--color-success)",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    automotive: {
      colorClass: "bg-amber-500",
      accentColor: "var(--color-warning)",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 16.5L12 21L5 16.5V7.5L12 3L19 7.5V16.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3V21" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5L19 16.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5L5 16.5" />
        </svg>
      )
    }
  };

  return (
    <section className="w-full bg-surface-alt py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 border-y border-neutral-200/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div className="max-w-xl">
            <motion.span 
              className="text-xs md:text-sm font-bold tracking-widest text-brand uppercase block mb-3"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {data.subtitle}
            </motion.span>
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl font-black text-heading tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {data.title}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/solutions"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-hover transition-colors group"
            >
              查看所有解决方案 
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {data.industries.map((industry, idx) => {
            const meta = industryMeta[industry.id] || {
              colorClass: "bg-brand",
              accentColor: "var(--color-brand)",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )
            };

            return (
              <motion.div
                key={industry.id}
                className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200/60 shadow-md flex flex-col justify-between group h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ 
                  y: -6,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
                  borderColor: "rgba(47, 85, 212, 0.2)"
                }}
              >
                {/* Colored top bar / accent indicator */}
                <div className={`h-[5px] w-full ${meta.colorClass}`} />
                
                <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                  <div>
                    {/* Icon & Subtitle */}
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: meta.accentColor }}
                      >
                        {meta.icon}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold tracking-wider text-neutral-400 uppercase font-mono">
                        {industry.subtitle}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-heading mb-3">
                      {industry.title}
                    </h3>
                    
                    <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-6 font-light">
                      {industry.description}
                    </p>
                  </div>

                  <div>
                    {/* Highlights checklist */}
                    <div className="border-t border-neutral-100 pt-4 mb-6">
                      <ul className="space-y-2">
                        {industry.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-center text-xs text-neutral-600 font-medium">
                            <span className="text-emerald-500 mr-2">✓</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button link */}
                    <Link 
                      href={industry.href}
                      className="inline-flex items-center text-sm font-bold text-neutral-800 group-hover:text-brand transition-colors gap-1 cursor-pointer"
                    >
                      查看行业方案 
                      <span className="transform group-hover:translate-x-1 transition-transform text-brand">→</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div 
          className="text-center bg-white/40 border border-neutral-200/50 rounded-xl py-4 px-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xs sm:text-sm text-neutral-500 font-light">
            💡 <span className="font-semibold text-neutral-700">定制化服务：</span>
            {data.footerNote}
            <Link href="/contact" className="text-brand font-semibold hover:underline ml-1">联系我们咨询 →</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
