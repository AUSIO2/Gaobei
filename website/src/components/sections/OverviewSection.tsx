"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
}

interface CompanyInfo {
  name: string;
  nameEn: string;
  description: string;
  buttons: string[];
  news: Array<{ id: string; title: string; date: string }>;
}

export default function OverviewSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch("/api/company-info").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json())
    ])
      .then(([infoData, productsData]) => {
        setCompanyInfo(infoData);
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load page data", err);
        setLoading(false);
      });
  }, []);

  const info = companyInfo || {
    name: "云路复材",
    nameEn: "YUNLU COMPOSITES",
    description: "掌握三维编织核心技术，打造数字孪生自动化产线。为航空航天、新能源与汽车轻量化提供国际先进的复合材料高端制造解决方案。",
    buttons: ["企业简介", "发展历程", "企业文化", "资质荣誉"],
    news: []
  };

  // Prevent SSR/CSR hydration mismatch by rendering static placeholder during hydration
  if (!mounted) {
    return (
      <section className="w-full bg-[#f8f9fa] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="lg:col-span-8 lg:border-r border-neutral-200/80 lg:pr-8 max-lg:border-b max-lg:pb-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-2">
                  产品与装备
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0d102c] tracking-tight">
                  四大核心产品矩阵
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#2f55d4] cursor-pointer">
                产品中心 →
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-32 bg-neutral-200/50 rounded-xl animate-pulse border border-neutral-200/20" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 lg:pl-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-2">
                    行业见解
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0d102c] tracking-tight">
                    最新技术洞察
                  </h2>
                </div>
              </div>
              <div className="h-40 bg-neutral-200/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#f8f9fa] py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Products */}
        <div className="lg:col-span-8 lg:border-r border-neutral-200/80 lg:pr-8 max-lg:border-b max-lg:pb-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-2">
                产品与装备
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0d102c] tracking-tight">
                四大核心产品矩阵
              </h2>
            </div>
            <Link 
              href="/products" 
              className="text-xs sm:text-sm font-bold text-[#2f55d4] hover:underline flex items-center gap-1 cursor-pointer"
            >
              产品中心 <span className="text-xs">→</span>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-32 bg-neutral-200/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="block h-full">
                  <motion.div
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1f38] via-[#0d2545] to-[#12365c] p-5 md:p-6 text-white border border-[#2f55d4]/10 shadow-lg flex items-center justify-between group cursor-pointer h-full"
                    whileHover={{
                      y: -5,
                      borderColor: "rgba(47, 85, 212, 0.4)",
                      boxShadow: "0 15px 30px rgba(13, 37, 69, 0.25)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Left text column */}
                    <div className="flex flex-col pr-4 z-10">
                      <span className="text-[10px] md:text-xs font-bold tracking-wider text-blue-300/60 mb-1 leading-tight uppercase font-mono">
                        {product.nameEn}
                      </span>
                      <h3 className="text-base md:text-lg font-bold tracking-wide leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    {/* Right Icon */}
                    <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 relative flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors duration-300 z-10">
                      <img
                        src={`/api/products/icon/${encodeURIComponent(product.icon)}`}
                        alt={product.name}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>

                    {/* Decorative radial background */}
                    <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-4 lg:pl-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs md:text-sm font-bold tracking-widest text-[#2f55d4] uppercase block mb-2">
                  行业见解
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0d102c] tracking-tight">
                  最新技术洞察
                </h2>
              </div>
              <Link 
                href="/technology#insights" 
                className="text-xs sm:text-sm font-bold text-[#2f55d4] hover:underline flex items-center gap-1 cursor-pointer"
              >
                查看更多 <span className="text-xs">→</span>
              </Link>
            </div>

            <ul className="space-y-4">
              {info.news.slice(0, 3).map((item, idx) => (
                <li key={item.id || idx} className="border-b border-neutral-100 pb-4 last:border-0 group">
                  <Link
                    href={`/news/${item.id}`}
                    className="flex flex-col gap-1.5 cursor-pointer w-full text-left"
                  >
                    <span className="text-neutral-400 text-xs font-light font-mono">{item.date}</span>
                    <span className="text-neutral-700 font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-[#2f55d4] transition-colors leading-snug">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
              {!loading && info.news.length === 0 && (
                <li className="text-neutral-400 text-sm py-4">暂无最新动态</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
