"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import InquiryForm from "@/components/ui/InquiryForm";

interface SolutionProduct {
  id: string;
  name: string;
}

interface IndustrySolution {
  id: string;
  title: string;
  subtitle: string;
  painpoints: string[];
  solution: string;
  products: SolutionProduct[];
  bgGradient: string;
  image?: string;
}

interface SolutionsData {
  title: string;
  subtitle: string;
  industries: IndustrySolution[];
}

interface ServiceData {
  domestic: {
    title: string;
    description: string;
  };
  international: {
    title: string;
    description: string;
  };
  cases: {
    title: string;
    points: string[];
  };
}

export default function SolutionsPage() {
  const [solutionsData, setSolutionsData] = useState<SolutionsData | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("定制方案咨询");

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
      fetch("/api/solutions").then(res => res.json()),
      fetch("/api/service").then(res => res.json())
    ])
      .then(([solVal, serVal]) => {
        setSolutionsData(solVal);
        setServiceData(serVal);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load solutions page data:", err);
        setLoading(false);
      });
  }, []);

  // Handle hash navigation scroll on mount
  useEffect(() => {
    if (!loading) {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash) {
          const id = hash.replace("#", "");
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        }
      }
    }
  }, [loading]);

  const openForm = (purpose: string) => {
    setSelectedPurpose(purpose);
    setIsModalOpen(true);
  };

  if (loading || !solutionsData) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
          <div className="h-40 bg-neutral-200 rounded-3xl" />
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-neutral-200 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pb-16 md:pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-dark-from via-dark-via to-dark-to text-white pt-28 pb-16 md:py-32 px-4 sm:px-6 md:px-12 lg:px-24 overflow-hidden border-b border-brand/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:25px_25px]" />
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-40 -bottom-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {/* Breadcrumbs */}
          <div className="flex justify-center text-xs md:text-sm text-neutral-400 font-light gap-2 mb-6">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>/</span>
            <span className="text-neutral-200">解决方案</span>
          </div>

          <motion.h1 
            className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {solutionsData.title}
          </motion.h1>
          
          <motion.p 
            className="text-brand-light text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {solutionsData.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Part 1: Industry Solutions Blocks */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-20 md:space-y-32">
        {solutionsData.industries.map((ind, idx) => (
          <div 
            key={ind.id} 
            id={ind.id} 
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start scroll-mt-24 border-b border-neutral-200/50 pb-16 last:border-b-0 last:pb-0"
          >
            {/* Left text column */}
            <div className={`lg:col-span-7 ${idx % 2 === 1 ? "lg:order-2" : "lg:order-1"} text-left`}>
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-brand uppercase block mb-2 font-mono">
                {ind.subtitle}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-heading mb-6">
                {ind.title}
              </h2>

              {/* Industry Pain Points */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  产业技术痛点
                </h4>
                <ul className="space-y-2">
                  {ind.painpoints.map((pt, pIdx) => (
                    <li key={pIdx} className="text-neutral-600 text-xs sm:text-sm font-light leading-relaxed flex items-start gap-2">
                      <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* YUNLU Solution */}
              <div className="mb-8">
                <h4 className="text-xs font-extrabold text-brand uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  高倍三维编织解决方案
                </h4>
                <p className="text-neutral-700 text-sm sm:text-base font-light leading-relaxed">
                  {ind.solution}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openForm(`针对${ind.title}的方案咨询`)}
                className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm cursor-pointer"
              >
                针对该行业咨询专属方案
              </button>
            </div>

            {/* Right card column (Recommended products) */}
            <div className={`lg:col-span-5 ${idx % 2 === 1 ? "lg:order-1" : "lg:order-2"} w-full space-y-6`}>
              {ind.image && (
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden border border-neutral-200/40 shadow-lg group">
                  <img
                    src={`/api/solutions/image/${encodeURIComponent(ind.image)}`}
                    alt={ind.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div 
                className="rounded-3xl p-6 sm:p-8 text-white border border-brand/10 shadow-xl text-left"
                style={{ background: `linear-gradient(to bottom right, var(--color-dark-from), var(--color-dark-to))` }}
              >
                <h3 className="text-lg font-bold mb-4 text-brand-light flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  推荐核心产品/装备
                </h3>
                <p className="text-neutral-300 text-xs font-light mb-6">
                  以下高倍核心设备与服务是该解决方案的核心载体，支持高度非标定制。
                </p>
                <div className="space-y-3">
                  {ind.products.map((prod) => (
                    <Link 
                      key={prod.id} 
                      href={`/products/${prod.id}`}
                      className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-200 text-left group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-light transition-colors">
                          {prod.name}
                        </span>
                        <span className="text-xs text-neutral-400 group-hover:text-white transition-colors transform group-hover:translate-x-1 transition-transform">
                          详情 →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Part 2: Service Network (Merged from /service) */}
      {serviceData && (
        <section id="service-network" className="py-16 md:py-24 bg-white border-t border-neutral-200/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-xs md:text-sm font-bold tracking-widest text-brand uppercase block mb-3">
                SERVICE NETWORK & METRICS
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-heading tracking-tight mb-4">
                全球服务保障与市场声誉
              </h2>
              <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto font-light">
                我们建立了一体化的售后技术支持与协同研发网络，全生命周期保障设备稳定运行和新产品快速试产。
              </p>
            </div>

            {/* Network Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Domestic Network */}
              <div className="p-6 sm:p-8 bg-surface border border-neutral-200/60 rounded-3xl text-left">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2.5 2.5 0 012.5 2.5v.5A2.5 2.5 0 0016 13.5h.5a1.5 1.5 0 011.5 1.5v.5A1.5 1.5 0 0019.5 17h.5M3.055 11c-.029.328-.055.656-.055 1 0 5.522 4.478 10 10 10 .344 0 .685-.02 1.018-.055M3.055 11C4.017 4.902 9.324 1 15.5 1c3.081 0 5.867 1.393 7.747 3.6M21.03 12c.03-.328.055-.656.055-1 0-5.522-4.478-10-10-10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">{serviceData.domestic.title}</h3>
                <p className="text-neutral-500 text-sm sm:text-base font-light leading-relaxed mb-4">
                  {serviceData.domestic.description}
                </p>
                <div className="h-[2px] w-12 bg-brand rounded" />
              </div>

              {/* International Network */}
              <div className="p-6 sm:p-8 bg-surface border border-neutral-200/60 rounded-3xl text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">{serviceData.international.title}</h3>
                <p className="text-neutral-500 text-sm sm:text-base font-light leading-relaxed mb-4">
                  {serviceData.international.description}
                </p>
                <div className="h-[2px] w-12 bg-emerald-500 rounded" />
              </div>
            </div>

            {/* Customer Cases and Achievements */}
            <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-dark-from to-dark-to text-white rounded-3xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand rounded-full" />
                {serviceData.cases.title}
              </h3>
              
              <ul className="space-y-4">
                {serviceData.cases.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-brand-light flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">
                      {pIdx + 1}
                    </div>
                    <p className="text-neutral-200 text-sm sm:text-base font-light leading-relaxed pt-0.5">
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Body */}
            <motion.div
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-surface shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-heading">
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
                  presetPurpose={selectedPurpose}
                  onClose={() => setIsModalOpen(false)}
                  onSuccess={() => setIsModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
