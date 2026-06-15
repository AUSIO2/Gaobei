"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface CultureData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  vision: {
    title: string;
    paragraphs: string[];
  };
  mission: {
    title: string;
    paragraphs: string[];
  };
  values: {
    title: string;
    items: Array<{
      name: string;
      desc: string;
    }>;
  };
}

export default function CulturePage() {
  const locale = useLocale();
  const t = useTranslations("about");
  const tc = useTranslations("common");
  const [data, setData] = useState<CultureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/about/culture?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load culture data:", err);
        setLoading(false);
      });
  }, [locale]);

  if (loading) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
          <div className="h-12 w-full bg-neutral-200 animate-pulse rounded" />
          <hr className="border-neutral-200 my-8" />
          <div className="space-y-4">
            <div className="h-28 bg-white border rounded-2xl animate-pulse" />
            <div className="h-28 bg-white border rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{t("cultureNotFound")}</h2>
        <Link href="/about" className="text-brand hover:underline flex items-center gap-2">
          <span>←</span> {t("backToAbout")}
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Breadcrumb and Back Action */}
      <div className="max-w-4xl mx-auto mb-6 md:mb-8 flex items-center justify-between text-sm">
        <Link href="/about" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
          <span className="text-base">←</span> {t("backToAbout")}
        </Link>
        <div className="hidden md:flex text-neutral-400 font-light gap-2">
          <Link href="/" className="hover:text-neutral-600">{tc("home")}</Link>
          <span>/</span>
          <Link href="/about" className="hover:text-neutral-600">{t("breadcrumb")}</Link>
          <span>/</span>
          <span className="text-neutral-600 font-medium">{t("cultureBreadcrumb")}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="max-w-4xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {data.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-heading tracking-tight mb-6">
            {data.hero.title}
          </h1>
          <p className="text-neutral-500 text-lg font-light leading-relaxed">
            {data.hero.description}
          </p>
        </motion.div>
      </section>

      {/* Culture Cards Details */}
      <section className="max-w-4xl mx-auto space-y-12">
        {/* 1. Vision */}
        <motion.div
          className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand/10 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
              Vision
            </span>
            <h2 className="text-2xl font-bold text-heading">{data.vision.title}</h2>
          </div>
          <div className="text-neutral-600 text-sm md:text-base font-light leading-relaxed space-y-4">
            {data.vision.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </motion.div>

        {/* 2. Mission */}
        <motion.div
          className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand/10 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
              Mission
            </span>
            <h2 className="text-2xl font-bold text-heading">{data.mission.title}</h2>
          </div>
          <div className="text-neutral-600 text-sm md:text-base font-light leading-relaxed space-y-4">
            {data.mission.paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </motion.div>

        {/* 3. Core Values */}
        <motion.div
          className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-brand/10 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
              Values
            </span>
            <h2 className="text-2xl font-bold text-heading">{data.values.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mt-4">
            {data.values.items.map((item, idx) => (
              <div key={idx} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                <h4 className="font-bold text-neutral-900 mb-2">{item.name}</h4>
                <p className="text-neutral-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
