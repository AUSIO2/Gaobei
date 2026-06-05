"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AboutData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  intro: {
    paragraphs: string[];
    position: {
      title: string;
      description: string;
    };
  };
  strengths: Array<{
    title: string;
    titleEn: string;
    desc: string;
  }>;
  milestones: Array<{
    year: string;
    title: string;
    desc: string;
  }>;
  culture?: {
    title: string;
    items: Array<{
      key: string;
      title: string;
      desc: string;
    }>;
  };
  honorsSummary?: {
    title: string;
    description: string;
    badges: string[];
  };
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load about data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
          <div className="h-12 w-full bg-neutral-200 animate-pulse rounded" />
          <div className="h-6 w-48 bg-neutral-200 animate-pulse rounded" />
          <hr className="border-neutral-200 my-8" />
          <div className="space-y-4">
            <div className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
            <div className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">未找到关于我们配置</h2>
        <Link href="/" className="text-brand hover:underline flex items-center gap-2">
          <span>←</span> 返回首页
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Breadcrumb and Back Action */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex items-center justify-between text-sm">
        <Link href="/" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
          <span className="text-base">←</span> 返回首页
        </Link>
        <div className="hidden md:flex text-neutral-400 font-light gap-2">
          <Link href="/" className="hover:text-neutral-600">首页</Link>
          <span>/</span>
          <span className="text-neutral-600 font-medium">关于我们</span>
        </div>
      </div>

      {/* 1. Hero 头部 */}
      <section className="max-w-7xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {data.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-heading tracking-tight mb-6 leading-tight">
            {data.hero.title}
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            {data.hero.description}
          </p>
        </motion.div>
      </section>

      {/* 2. 公司简介 */}
      <section id="intro" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center scroll-mt-28">
        <motion.div 
          className="lg:col-span-7 space-y-6 text-neutral-700 font-light leading-relaxed text-base"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {data.intro.paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </motion.div>
        
        <motion.div 
          className="lg:col-span-5 bg-gradient-to-br from-dark-from to-dark-to rounded-2xl p-8 text-white relative overflow-hidden shadow-xl"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-4 text-blue-300">{data.intro.position.title}</h3>
          <p className="text-neutral-300 font-light leading-relaxed text-sm mb-6">
            {data.intro.position.description}
          </p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        </motion.div>
      </section>

      {/* 3. 核心实力网格 */}
      <section className="max-w-7xl mx-auto mb-20">
        <h2 className="text-2xl md:text-3xl font-black text-heading mb-10 text-center tracking-tight">我们的核心优势</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.strengths.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-8 border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-brand/40 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
            >
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider block mb-2">{item.titleEn}</span>
              <h3 className="text-lg font-bold text-neutral-900 mb-4">{item.title}</h3>
              <p className="text-neutral-500 text-sm font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. 企业文化 */}
      <section id="culture" className="max-w-7xl mx-auto mb-20 scroll-mt-28">
        <h2 className="text-2xl md:text-3xl font-black text-heading mb-10 text-center tracking-tight">
          {data.culture?.title || "企业文化"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data.culture?.items || [
            {
              key: "VISION",
              title: "企业愿景",
              desc: "编织无限可能，成就轻量未来。做全球三维编织与先进复材成型数字化智能装备的领航者。"
            },
            {
              key: "MISSION",
              title: "企业使命",
              desc: "以数字化、自动化、智能化编织技术为引擎，提供国际先进的复材制造装备与成型解决方案，助力制造强国。"
            },
            {
              key: "VALUES",
              title: "核心价值观",
              desc: "求真、创新、坚韧、共赢。传承学术严谨基因，勇攀科技高峰，持续为客户与产业创造非凡价值。"
            }
          ]).map((item, idx) => (
            <motion.div
              key={item.key}
              className="bg-gradient-to-br from-dark-from to-dark-to rounded-2xl p-8 text-white relative overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
            >
              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider block mb-2">{item.key}</span>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-neutral-300 text-sm font-light leading-relaxed">
                {item.desc}
              </p>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/about/culture"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-neutral-200 text-sm font-medium text-brand hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 shadow-sm"
          >
            了解更多关于我们的企业文化 →
          </Link>
        </div>
      </section>

      {/* 4. 发展历程 */}
      <section id="history" className="max-w-7xl mx-auto mb-20 scroll-mt-28">
        <h2 className="text-2xl md:text-3xl font-black text-heading mb-12 text-center tracking-tight">发展历程</h2>
        <div className="relative pl-8 md:pl-0 border-l border-neutral-200 md:border-l-0 md:grid md:grid-cols-4 md:gap-6">
          {data.milestones.map((item, index) => (
            <motion.div
              key={index}
              className="relative mb-10 md:mb-0 md:text-center flex flex-col md:items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* 点或时间指示器 */}
              <div className="absolute -left-[41px] md:relative md:left-0 top-1 w-5 h-5 rounded-full border-4 border-surface bg-brand shadow-sm mb-4" />
              <span className="text-brand text-3xl font-black mb-2 tracking-tighter">{item.year}</span>
              <h3 className="text-base font-bold text-neutral-950 mb-2">{item.title}</h3>
              <p className="text-neutral-500 text-xs md:text-sm font-light max-w-xs leading-relaxed md:px-4">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. 资质荣誉 */}
      <section id="honors" className="max-w-7xl mx-auto text-center bg-white border border-neutral-200/50 rounded-2xl p-10 shadow-sm scroll-mt-28">
        <h2 className="text-2xl font-black text-neutral-900 mb-4">
          {data.honorsSummary?.title || "学术与资质荣誉"}
        </h2>
        <p className="text-neutral-500 font-light text-sm max-w-xl mx-auto mb-8">
          {data.honorsSummary?.description || "坚持学术底蕴与市场导向双重驱动，我们已获得多项国家级科研鉴定及行业体系认定。"}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {(data.honorsSummary?.badges || [
            "国家高新技术企业",
            "ISO 9001 质量认证",
            "复合材料学会理事单位",
            "多项自研软著与核心发明专利"
          ]).map((badge) => (
            <span key={badge} className="px-5 py-2.5 bg-surface rounded-lg text-xs font-semibold text-neutral-700 border border-neutral-100 hover:border-brand/20 transition-all duration-300 shadow-sm">
              {badge}
            </span>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/about/honors"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-all duration-300 shadow-sm"
          >
            查看资质荣誉详情 →
          </Link>
        </div>
      </section>
    </main>
  );
}
