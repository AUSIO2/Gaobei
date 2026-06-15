"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category?: string;
  summary: string;
  content: string;
  coverImage?: string;
  images?: string[];
}

export default function NewsDetailPage(props: { params: Promise<{ id: string }> }) {
  const locale = useLocale();
  const t = useTranslations("news");
  const tc = useTranslations("common");
  const params = use(props.params);
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherNews, setOtherNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`/api/company-info?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.news && Array.isArray(data.news)) {
          const item = data.news.find((n: any) => n.id === params.id);
          if (item) {
            setNewsItem(item);
            const other = data.news.filter((n: any) => n.id !== params.id).slice(0, 3);
            setOtherNews(other);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load news detail:", err);
        setLoading(false);
      });
  }, [params.id, locale]);

  if (loading) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
          <div className="h-12 w-full bg-neutral-200 animate-pulse rounded" />
          <div className="h-6 w-48 bg-neutral-200 animate-pulse rounded" />
          <hr className="border-neutral-200 my-8" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
            <div className="h-4 w-full bg-neutral-200 animate-pulse rounded" />
            <div className="h-4 w-[90%] bg-neutral-200 animate-pulse rounded" />
            <div className="h-4 w-[95%] bg-neutral-200 animate-pulse rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!newsItem) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">{t("notFound")}</h2>
        <Link href="/technology#insights" className="text-brand hover:underline flex items-center gap-2">
          <span>←</span> {t("backToInsights")}
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb and Back Action */}
        <div className="mb-6 md:mb-8 flex items-center justify-between text-sm">
          <Link href="/technology#insights" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
            <span className="text-base">←</span> {t("backToList")}
          </Link>
          <div className="hidden md:flex text-neutral-400 font-light gap-2">
            <Link href="/" className="hover:text-neutral-600">{tc("home")}</Link>
            <span>/</span>
            <Link href="/technology" className="hover:text-neutral-600">{t("breadcrumbTech")}</Link>
            <span>/</span>
            <Link href="/technology#insights" className="hover:text-neutral-600">{t("breadcrumbInsights")}</Link>
            <span>/</span>
            <span className="text-neutral-600 truncate max-w-[200px]">{t("breadcrumbArticle")}</span>
          </div>
        </div>

        {/* Article Layout */}
        <motion.article 
          className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-12 shadow-sm mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Category Badge & Date */}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brand/5 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
              {newsItem.category || t("defaultCategory")}
            </span>
            <span className="text-neutral-400 text-xs font-light">{newsItem.date}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-heading leading-tight mb-8">
            {newsItem.title}
          </h1>

          <hr className="border-neutral-100 mb-8" />

          {/* Paragraph Content */}
          <div className="text-neutral-700 text-base md:text-lg font-light leading-relaxed tracking-wide space-y-6">
            {newsItem.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="indent-0">
                {para.split("\n").map((line, lIdx) => (
                  <span key={lIdx} className="block mb-1 last:mb-0">
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {/* News Images Section */}
          {newsItem.images && newsItem.images.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-100">
              <h3 className="text-lg font-bold text-heading mb-6">
                {t("relatedImages")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {newsItem.images.map((image, idx) => (
                  <div key={idx} className="border border-neutral-200/50 rounded-2xl overflow-hidden shadow-sm bg-neutral-50 flex items-center justify-center">
                    <img
                      src={image.startsWith('/') ? image : `/api/news/image/${newsItem.id}/${encodeURIComponent(image)}`}
                      alt={`${newsItem.title} - ${idx + 1}`}
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.article>

        {/* Suggestion list */}
        {otherNews.length > 0 && (
          <section className="border-t border-neutral-200/80 pt-10">
            <h3 className="text-lg md:text-xl font-bold text-heading mb-6">{t("moreNews")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherNews.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`}>
                  <div className="bg-white border border-neutral-200/50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-neutral-400 text-[10px] mb-2">{n.date}</div>
                      <h4 className="text-sm font-bold text-neutral-800 line-clamp-2 hover:text-brand transition-colors leading-snug">
                        {n.title}
                      </h4>
                    </div>
                    <span className="text-brand text-[11px] font-semibold mt-4 block">
                      {t("readDetails")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
