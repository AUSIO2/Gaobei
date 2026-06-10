"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  specs?: string[];
}

interface LandingData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  customService: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ shortName?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/products/landing").then((res) => res.json()),
      fetch("/api/company-info").then((res) => res.json()).catch(() => null)
    ])
      .then(([productsData, landingVal, infoData]) => {
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
        setLandingData(landingVal);
        if (infoData) {
          setCompanyInfo(infoData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products page data", err);
        setLoading(false);
      });
  }, []);

  const landing = landingData || {
    hero: {
      title: "先进三维编织装备与成型平台",
      subtitle: "产品与解决方案 · PRODUCTS",
      description: "为科研院所及企业客户提供从纤维编织到树脂成型的全流程闭环软硬件产品体系。"
    },
    customService: {
      title: "非标自动化装备定制服务",
      description: "我们的研发实力不仅限于标准规格三维编织设备，还可以为您的异形三维编织件（如高压氢气储罐、飞机机翼骨架等）定制专属的自动生产线和控制轨迹。",
      buttonText: "与技术专家探讨定制需求"
    }
  };

  if (!mounted) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900">产品介绍</h1>
          <p className="text-neutral-400 mt-2">正在载入数据...</p>
        </div>
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
          <span className="text-neutral-600 font-medium">产品与解决方案</span>
        </div>
      </div>

      {/* 1. Page Header */}
      <section className="max-w-7xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {landing.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-heading tracking-tight mb-6">
            {landing.hero.title}
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            {landing.hero.description}
          </p>
        </motion.div>
      </section>

      {/* 2. Products Grid */}
      <section className="max-w-7xl mx-auto mb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-neutral-100 rounded-2xl animate-pulse border border-neutral-200/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product, idx) => (
              <Link href={`/products/${product.id}`} key={product.id || idx} className="block h-full">
                <motion.div
                  className="bg-gradient-to-br from-dark-from via-dark-via to-dark-to rounded-2xl p-8 text-white border border-brand/10 shadow-xl flex flex-col justify-between group cursor-pointer relative overflow-hidden h-full"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  whileHover={{
                    y: -5,
                    borderColor: "rgba(47, 85, 212, 0.4)",
                    boxShadow: "0 25px 50px rgba(13, 37, 69, 0.3)",
                  }}
                >
                  {/* 顶部标题与图标 */}
                  <div className="flex items-start justify-between mb-6 z-10">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-blue-300/60 uppercase tracking-widest mb-1">
                        {product.nameEn}
                      </span>
                      <h3 className="text-2xl font-bold tracking-wide">
                        {product.name}
                      </h3>
                    </div>
                    <div className="w-16 h-16 shrink-0 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      <img
                        src={`/api/products/icon/${encodeURIComponent(product.icon)}`}
                        alt={product.name}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>

                  <div className="z-10 mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3 border-b border-blue-900/30 pb-2">
                      技术指标与特性
                    </h4>
                    <ul className="space-y-2.5">
                      {(product.specs || []).map((spec, i) => (
                        <li key={i} className="text-neutral-300 font-light text-sm flex items-start leading-relaxed">
                          <span className="text-brand mr-2">▪</span>
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>


                  {/* 卡片底层按钮 */}
                  <div className="z-10 mt-auto flex items-center justify-between text-sm">
                    <span className="text-neutral-400 font-light">{(companyInfo?.shortName || "江苏高倍")}原厂技术支持</span>
                    <span className="px-5 py-2.5 rounded-full bg-white text-neutral-950 font-bold hover:bg-neutral-100 transition-colors shadow-md group-hover:scale-105 transition-transform duration-300">
                      查看产品列表 →
                    </span>
                  </div>

                  {/* 装饰性背景斑点 */}
                  <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Custom Equipment Contact Section */}
      <section className="max-w-7xl mx-auto bg-white border border-neutral-200/50 rounded-2xl p-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-heading mb-4">{landing.customService.title}</h2>
          <p className="text-neutral-500 font-light text-base leading-relaxed mb-8">
            {landing.customService.description}
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 rounded-full bg-neutral-950 text-white font-bold tracking-wider hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl"
          >
            {landing.customService.buttonText}
          </a>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-10 w-64 h-64 bg-brand/5 rounded-full blur-xl pointer-events-none hidden md:block" />
      </section>
    </main>
  );
}
