"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HonorItem {
  id: string;
  title: string;
  tag: string;
  desc: string;
  images?: string[];
}

interface LandingData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
}

export default function HonorsPage() {
  const [honorsList, setHonorsList] = useState<HonorItem[]>([]);
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/honors").then((res) => res.json()),
      fetch("/api/honors/landing").then((res) => res.json())
    ])
      .then(([honorsData, landingVal]) => {
        if (Array.isArray(honorsData)) {
          setHonorsList(honorsData);
        }
        setLandingData(landingVal);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch honors data:", err);
        setLoading(false);
      });
  }, []);

  const landing = landingData || {
    hero: {
      title: "产学研深度融合与核心科技资产",
      subtitle: "资质荣誉 · HONORS & CERTIFICATES",
      description: "坚持科学技术是第一生产力，我们通过自主创新与严谨验证，铸就扎实的行业声誉。"
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Breadcrumb and Back Action */}
      <div className="max-w-4xl mx-auto mb-6 md:mb-8 flex items-center justify-between text-sm">
        <Link href="/about" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
          <span className="text-base">←</span> 返回关于我们
        </Link>
        <div className="hidden md:flex text-neutral-400 font-light gap-2">
          <Link href="/" className="hover:text-neutral-600">首页</Link>
          <span>/</span>
          <Link href="/about" className="hover:text-neutral-600">关于我们</Link>
          <span>/</span>
          <span className="text-neutral-600 font-medium">资质荣誉</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="max-w-4xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#2f55d4] text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {landing.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#0d102c] tracking-tight mb-6">
            {landing.hero.title}
          </h1>
          <p className="text-neutral-500 text-lg font-light leading-relaxed">
            {landing.hero.description}
          </p>
        </motion.div>
      </section>

      {/* Honors List Grid */}
      <section className="max-w-4xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-white border border-neutral-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {honorsList.map((honor, idx) => (
              <motion.div
                key={honor.id || idx}
                className="bg-white border border-neutral-200/60 rounded-3xl p-8 shadow-sm hover:shadow-md hover:border-[#2f55d4]/40 transition-all duration-300 flex flex-col justify-between group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <div>
                  <span className="bg-[#2f55d4]/5 text-[#2f55d4] text-[9px] font-bold tracking-wider px-3 py-1 rounded uppercase mb-4 inline-block">
                    {honor.tag}
                  </span>
                  <h3 className="text-xl font-bold text-neutral-900 mb-4 leading-snug">
                    {honor.title}
                  </h3>
                  <p className="text-neutral-500 font-light text-sm md:text-base leading-relaxed">
                    {honor.desc}
                  </p>

                  {/* Certificate Image Box */}
                  {honor.images && honor.images.length > 0 && !failedImages[honor.id] && (
                    <div className="mt-6 aspect-[4/3] w-full rounded-2xl bg-white border border-dashed border-neutral-300 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:border-[#2f55d4]/50 transition-colors duration-300">
                      <img
                        src={honor.images[0]}
                        alt={`${honor.title} 证书`}
                        className="w-full h-full object-contain p-2"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [honor.id]: true }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
