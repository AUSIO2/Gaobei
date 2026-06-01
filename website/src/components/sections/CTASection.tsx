"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InquiryForm from "../ui/InquiryForm";

export default function CTASection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("");

  const [ctaData, setCtaData] = useState({
    title: "为您的项目寻找最优复材解决方案",
    description: "无论您处于方案规划阶段还是在大批量采购阶段，云路复材的专业工程服务团队都将为您提供量身定制的支持。",
    cards: [
      {
        title: "获取产品手册",
        description: "全面了解云路复材三维编织装备、专用核心配件及成型平台的详细技术参数与产品谱系。",
        buttonText: "获取电子手册",
        purpose: "获取产品手册",
        tag: "低门槛 • 快速获取"
      },
      {
        title: "预约参观 / 索取样件",
        description: "亲临现代化数字化中试车间，直观感受数字孪生自动化产线运作，或申请符合规格的三维编织测试样件。",
        buttonText: "索取及预约",
        purpose: "预约产线参观",
        tag: "中门槛 • 深度对接"
      },
      {
        title: "联系顾问，获取方案",
        description: "资深复合材料研发与设备专家一对一评估您的工艺需求，提供最适宜的三维编织结构设计与成型装备报价方案。",
        buttonText: "获取定制方案",
        purpose: "定制方案咨询",
        tag: "专业级 • 高效定制"
      }
    ],
    trustTitle: "云路智造 • 值得信赖的合作伙伴",
    trustSub: "拥有从工艺研发、预制体打样到产线非标定制的闭环智造体系",
    badges: [
      "ISO 9001 质量管理体系",
      "国家高新技术企业",
      "高精细三维编织专利保护",
      "软硬件100%自主可控"
    ]
  });

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((val) => {
        if (val && val.cta) {
          setCtaData(val.cta);
        }
      })
      .catch((err) => console.error("Failed to load CTA data:", err));
  }, []);

  const getCardIcon = (purpose: string) => {
    switch (purpose) {
      case "获取产品手册":
        return (
          <svg className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "预约产线参观":
        return (
          <svg className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "定制方案咨询":
      default:
        return (
          <svg className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openForm = (purpose: string) => {
    setSelectedPurpose(purpose);
    setModalOpen(true);
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-[#0c1f38] via-[#0d2545] to-[#12365c] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {ctaData.title}
          </motion.h2>
          <motion.p 
            className="text-neutral-300 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {ctaData.description}
          </motion.p>
        </div>

        {/* CTA Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {ctaData.cards.map((card, idx) => {
            const isPopular = card.purpose === "预约产线参观";
            return (
              <motion.div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-start border group h-full transition-all duration-300 ${
                  isPopular
                    ? "bg-white/10 border-blue-400/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                {/* Popular tag */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-1 rounded-bl-xl">
                    推荐选择
                  </div>
                )}

                <div className="w-full">
                  {/* Header info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      {getCardIcon(card.purpose)}
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-blue-300/70 uppercase font-mono">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {card.title}
                  </h3>
                  
                  <p className="text-neutral-300 text-sm leading-relaxed mb-8 font-light">
                    {card.description}
                  </p>
                </div>

                <button
                  onClick={() => openForm(card.purpose)}
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 cursor-pointer ${
                    isPopular
                      ? "bg-[#2f55d4] hover:bg-[#1d3c9f] text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {card.buttonText}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Trust Badges */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold text-neutral-300 mb-1">
              {ctaData.trustTitle}
            </h4>
            <p className="text-xs text-neutral-400 font-light">
              {ctaData.trustSub}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2.5">
            {ctaData.badges.map((badge) => (
              <span
                key={badge}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-neutral-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-200 text-neutral-600 active:bg-neutral-300 transition-colors"
                  aria-label="关闭"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content (Scrollable if needed) */}
              <div className="p-6 overflow-y-auto flex-1 text-left" data-lenis-prevent>
                <InquiryForm
                  presetPurpose={selectedPurpose}
                  onClose={() => setModalOpen(false)}
                  onSuccess={() => setModalOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
