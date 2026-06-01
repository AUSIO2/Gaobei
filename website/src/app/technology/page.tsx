"use client";

import React, { useEffect, useState } from "react";
import { motion as motionClient, AnimatePresence } from "framer-motion";
import Link from "next/link";
import InquiryForm from "@/components/ui/InquiryForm";

interface SpecItem {
  name: string;
  value: string;
  desc: string;
}

interface AdvantageItem {
  title: string;
  desc: string;
}

interface FeatureItem {
  name: string;
  desc: string;
}

interface ComparisonRow {
  dimension: string;
  lamination: string;
  winding: string;
  braiding: string;
}

interface TechData {
  title: string;
  subtitle: string;
  intro: string;
  braiding: {
    title: string;
    description: string;
    specs: SpecItem[];
    advantages: AdvantageItem[];
  };
  digitalTwin: {
    title: string;
    description: string;
    features: FeatureItem[];
  };
  comparison: {
    title: string;
    subtitle: string;
    columns: string[];
    rows: ComparisonRow[];
  };
}

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  type: "news" | "case" | "blog";
  summary: string;
  content: string;
  coverImage?: string;
}

export default function TechnologyPage() {
  const [techData, setTechData] = useState<TechData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "blog" | "case" | "news">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    Promise.all([
      fetch("/api/technology").then(res => res.json()),
      fetch("/api/company-info").then(res => res.json())
    ])
      .then(([techVal, infoVal]) => {
        setTechData(techVal);
        if (infoVal && Array.isArray(infoVal.news)) {
          setNews(infoVal.news);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load technology page data:", err);
        setLoading(false);
      });
  }, []);

  // Sync tab hash anchor on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#insights") {
        setActiveTab("all");
        setTimeout(() => {
          document.getElementById("insights")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (hash === "#braiding") {
        setTimeout(() => {
          document.getElementById("braiding")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (hash === "#digital-twin") {
        setTimeout(() => {
          document.getElementById("digital-twin")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [loading]);

  const filteredNews = news.filter(item => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTabChange = (tab: "all" | "blog" | "case" | "news") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "blog": return "技术博客";
      case "case": return "应用案例";
      case "news": return "企业动态";
      default: return "技术文章";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blog": return "bg-blue-500/10 text-blue-600 border-blue-500/25";
      case "case": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/25";
      case "news": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/25";
      default: return "bg-neutral-500/10 text-neutral-600 border-neutral-500/25";
    }
  };

  if (loading || !techData) {
    return (
      <section className="w-full bg-[#f8f9fa] py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
          <div className="h-40 bg-neutral-200 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-neutral-200 rounded-3xl" />
            <div className="h-80 bg-neutral-200 rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-16 md:pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#0c1f38] via-[#0d2545] to-[#12365c] text-white pt-28 pb-16 md:py-32 px-4 sm:px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#2f55d4]/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:25px_25px]" />
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Breadcrumbs */}
          <div className="flex justify-center text-xs md:text-sm text-neutral-400 font-light gap-2 mb-6">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>/</span>
            <span className="text-neutral-200">核心技术</span>
          </div>

          <motionClient.h1 
            className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {techData.title}
          </motionClient.h1>
          
          <motionClient.p 
            className="text-[#38bdf8] text-sm sm:text-base md:text-xl font-bold tracking-widest uppercase mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {techData.subtitle}
          </motionClient.p>

          <motionClient.p 
            className="text-neutral-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto font-light leading-relaxed mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {techData.intro}
          </motionClient.p>
        </div>
      </section>

      {/* Part A: Technology Deep-Dive */}
      
      {/* 3D Braiding Technology */}
      <section id="braiding" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: SVG Fiber Weaving Loop */}
          <div className="lg:col-span-5 w-full aspect-square max-w-[450px] mx-auto bg-gradient-to-br from-[#0c1f38] to-[#12365c] rounded-3xl p-8 border border-[#2f55d4]/10 shadow-xl overflow-hidden relative group">
            <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="weaving-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#weaving-grid)" />
              
              {/* Dynamic Braiding threads */}
              {[0, 1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  {/* Diagonal Line Left-To-Right */}
                  <motionClient.path
                    d={`M -20,${20 + i * 40} L 220,${60 + i * 40}`}
                    stroke="#2f55d4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    animate={{ 
                      pathLength: [0, 1, 1, 0],
                      pathOffset: [0, 0, 0.5, 1],
                      opacity: [0.3, 1, 1, 0.3]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4
                    }}
                  />
                  {/* Diagonal Line Right-To-Left */}
                  <motionClient.path
                    d={`M 220,${20 + i * 40} L -20,${60 + i * 40}`}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{ 
                      pathLength: [0, 1, 1, 0],
                      pathOffset: [0, 0, -0.5, -1],
                      opacity: [0.2, 0.9, 0.9, 0.2]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4 + 1
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Interlocking Central Circle to simulate braiding core */}
              <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <motionClient.circle 
                cx="100" 
                cy="100" 
                r="50" 
                stroke="#2f55d4" 
                strokeWidth="2" 
                strokeDasharray="30 150" 
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motionClient.circle 
                cx="100" 
                cy="100" 
                r="44" 
                stroke="#38bdf8" 
                strokeWidth="1.5" 
                strokeDasharray="20 100" 
                fill="none"
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              <circle cx="100" cy="100" r="8" fill="#ffffff" opacity="0.1" />
              <circle cx="100" cy="100" r="4" fill="#38bdf8" />
            </svg>
            <div className="absolute bottom-4 left-4 text-[10px] text-neutral-400 font-mono">WEAVING CORE ENGINE v3.1</div>
          </div>

          {/* Right Column: Descriptions & Advantages */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-3">
                01. 核心织造工艺
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0d102c] tracking-tight mb-6">
                {techData.braiding.title}
              </h2>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-8 font-light">
                {techData.braiding.description}
              </p>
            </div>

            <div className="space-y-4">
              {techData.braiding.advantages.map((adv) => (
                <div key={adv.title} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#2f55d4]/10 flex items-center justify-center text-[#2f55d4] shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-[#0d102c]">{adv.title}</h4>
                    <p className="text-neutral-500 text-xs md:text-sm font-light mt-1">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="mt-12 md:mt-16 bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-[#0d102c] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#2f55d4] rounded-full" />
            三维编织核心技术参数指标
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                  <th className="py-3.5 pr-4 w-[250px]">技术参数项</th>
                  <th className="py-3.5 px-4 w-[200px]">性能指标</th>
                  <th className="py-3.5 pl-4">应用与说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {techData.braiding.specs.map((spec) => (
                  <tr key={spec.name} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[#0d102c]">{spec.name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#2f55d4]">{spec.value}</td>
                    <td className="py-4 pl-4 font-light text-neutral-500">{spec.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Digital Twin Technology */}
      <section id="digital-twin" className="py-16 md:py-24 bg-white border-y border-neutral-200/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Column: Text */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-3">
                02. 智能控制闭环
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0d102c] tracking-tight mb-6">
                {techData.digitalTwin.title}
              </h2>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-8 font-light">
                {techData.digitalTwin.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {techData.digitalTwin.features.map((feat) => (
                  <div key={feat.name} className="p-5 bg-[#f8f9fa] border border-neutral-200/50 rounded-2xl">
                    <h4 className="text-sm sm:text-base font-bold text-[#0d102c] mb-2">{feat.name}</h4>
                    <p className="text-neutral-500 text-xs sm:text-sm font-light leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: SVG Digital Twin Dashboard */}
            <div className="lg:col-span-5 order-1 lg:order-2 w-full aspect-square max-w-[450px] mx-auto bg-gradient-to-br from-[#07172b] to-[#0d2545] rounded-3xl p-8 border border-sky-500/10 shadow-xl overflow-hidden relative">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dashboard Grid */}
                <path d="M 0,20 L 200,20 M 0,180 L 200,180 M 20,0 L 20,200 M 180,0 L 180,200" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="0.5" />
                
                {/* Circular Radar Scan */}
                <circle cx="100" cy="90" r="55" stroke="rgba(56,189,248,0.1)" strokeWidth="1" />
                <motionClient.circle 
                  cx="100" 
                  cy="90" 
                  r="55" 
                  stroke="#38bdf8" 
                  strokeWidth="1.5" 
                  strokeDasharray="25 320" 
                  fill="none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Oscilloscope Data wave */}
                <motionClient.path
                  d="M 25,145 Q 45,120 65,145 T 105,145 T 145,145 T 175,145"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Center Node Target */}
                <circle cx="100" cy="90" r="3" fill="#ef4444" />
                <motionClient.circle 
                  cx="100" 
                  cy="90" 
                  r="10" 
                  stroke="#ef4444" 
                  strokeWidth="1" 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Floating data values (animated numbers simulate) */}
                <text x="30" y="40" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">TEMP: 180.2℃</text>
                <text x="30" y="55" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">TENSION: 12.5 N</text>
                
                <text x="130" y="40" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">SPEED: 42rpm</text>
                <text x="130" y="55" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">STATUS: OK</text>
                
                {/* Bar Graph meters at bottom */}
                <rect x="30" y="165" width="40" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
                <motionClient.rect x="30" y="165" height="6" rx="2" fill="#38bdf8" animate={{ width: [10, 32, 22, 38, 10] }} transition={{ duration: 5, repeat: Infinity }} />
                
                <rect x="80" y="165" width="40" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
                <motionClient.rect x="80" y="165" height="6" rx="2" fill="#10b981" animate={{ width: [35, 12, 38, 25, 35] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />

                <rect x="130" y="165" width="40" height="6" rx="2" fill="rgba(255,255,255,0.05)" />
                <motionClient.rect x="130" y="165" height="6" rx="2" fill="#f59e0b" animate={{ width: [20, 38, 10, 30, 20] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1 }} />
              </svg>
              <div className="absolute bottom-4 right-4 text-[10px] text-sky-400 font-mono">ONLINE SIMULATION ENG v1.0.8</div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-3">
            工艺实力对比
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0d102c] tracking-tight mb-4">
            {techData.comparison.title}
          </h2>
          <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto font-light">
            {techData.comparison.subtitle}
          </p>
        </div>

        <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-800 font-extrabold text-base">
                  {techData.comparison.columns.map((col, idx) => (
                    <th 
                      key={col} 
                      className={`py-4 ${idx === 0 ? "pr-4 w-[120px]" : "px-4"} ${
                        idx === 3 ? "text-[#2f55d4] bg-[#2f55d4]/5 rounded-t-xl" : ""
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-600 font-light">
                {techData.comparison.rows.map((row) => (
                  <tr key={row.dimension} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[#0d102c]">{row.dimension}</td>
                    <td className="py-4 px-4">{row.lamination}</td>
                    <td className="py-4 px-4">{row.winding}</td>
                    <td className="py-4 px-4 text-neutral-800 font-semibold bg-[#2f55d4]/5">{row.braiding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Part B: Technical Insights & Cases list */}
      <section id="insights" className="py-16 md:py-24 bg-[#f1f3f6] border-t border-neutral-200/50 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-3">
              KNOWLEDGE & CASE STUDIES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#0d102c] tracking-tight mb-4">
              技术洞察与行业案例
            </h2>
            <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto font-light">
              分享关于三维立体编织、数字孪生产线以及复合材料轻量化结构制造的前沿应用和研发报告。
            </p>
          </div>

          {/* Tab Filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-12 border-b border-neutral-200 pb-6">
            {[
              { id: "all", label: "全部资讯" },
              { id: "blog", label: "技术博客" },
              { id: "case", label: "应用案例" },
              { id: "news", label: "企业动态" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`px-5 py-2 rounded-full text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#2f55d4] text-white border-[#2f55d4] shadow-md shadow-blue-500/15 scale-105"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Articles list */}
          <div className="space-y-6 min-h-[300px]">
            {paginatedNews.map((item, idx) => (
              <motionClient.div
                key={item.id}
                className="bg-white border border-neutral-200/60 hover:border-[#2f55d4]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                {/* If there is a cover image container (optional placeholder for premium visual layout) */}
                <div className="w-full sm:w-[150px] aspect-[4/3] rounded-xl bg-gradient-to-br from-[#0c1f38] to-[#12365c] shrink-0 overflow-hidden flex items-center justify-center text-white border border-neutral-100">
                  <svg className="w-8 h-8 opacity-40 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                <div className="flex-1 flex flex-col justify-between h-full text-left">
                  <div>
                    {/* Tags & Date */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeColor(item.type)}`}>
                        {getTypeName(item.type)}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200/50">
                        {item.category}
                      </span>
                      <span className="text-neutral-400 text-xs font-light font-mono ml-auto">{item.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-[#0d102c] mb-2 leading-snug hover:text-[#2f55d4] transition-colors">
                      <Link href={`/news/${item.id}`}>{item.title}</Link>
                    </h3>

                    {/* Summary */}
                    <p className="text-neutral-500 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link 
                      href={`/news/${item.id}`}
                      className="text-xs sm:text-sm font-bold text-[#2f55d4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      阅读正文 <span className="text-xs">→</span>
                    </Link>
                  </div>
                </div>
              </motionClient.div>
            ))}

            {filteredNews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/50">
                <p className="text-neutral-400 text-sm">暂无该分类的文章内容</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-sm hover:border-[#2f55d4] hover:text-[#2f55d4] disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-400 cursor-pointer"
              >
                ←
              </button>
              
              <span className="text-xs text-neutral-500 font-bold font-mono px-4">
                第 {currentPage} 页 / 共 {totalPages} 页
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-sm hover:border-[#2f55d4] hover:text-[#2f55d4] disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:text-neutral-400 cursor-pointer"
              >
                →
              </button>
            </div>
          )}

          {/* Bottom Conversion CTA */}
          <div className="mt-16 text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-[#2f55d4] hover:bg-[#1d3c9f] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              与技术专家深入探讨您的复合材料需求
            </button>
          </div>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motionClient.div
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Body */}
            <motionClient.div
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#f8f9fa] shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-[#0d102c]">
                    预约与咨询需求表单
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    我们将根据您的诉求，为您匹配最合适的资深业务与技术顾问。
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-200 text-neutral-600 active:bg-neutral-300 transition-colors"
                  aria-label="关闭"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto flex-1 text-left" data-lenis-prevent>
                <InquiryForm
                  presetPurpose="定制方案咨询"
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={() => setIsModalOpen(false)}
                />
              </div>
            </motionClient.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
