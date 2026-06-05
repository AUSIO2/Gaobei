"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductItem {
  id: string;
  name: string;
  summary: string;
  specs: string[];
  content: string;
  images?: string[];
}

interface CategoryData {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  products: ProductItem[];
}

export default function CategoryProductsPage(props: { params: Promise<{ categoryId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ shortName?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${params.categoryId}`).then((res) => {
        if (!res.ok) throw new Error("Failed to load category");
        return res.json();
      }),
      fetch("/api/company-info").then((res) => res.json()).catch(() => null)
    ])
      .then(([data, infoData]) => {
        setCategoryData(data);
        if (infoData) {
          setCompanyInfo(infoData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load category products:", err);
        setLoading(false);
      });
  }, [params.categoryId]);

  if (loading) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
          <div className="h-12 w-full bg-neutral-200 animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[1, 2].map((n) => (
              <div key={n} className="h-64 bg-neutral-100 rounded-2xl animate-pulse border border-neutral-200/50" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categoryData) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">未找到相关产品分类</h2>
        <Link href="/products" className="text-brand hover:underline flex items-center gap-2">
          <span>←</span> 返回产品体系
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Breadcrumb and Back Action */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex items-center justify-between text-sm">
        <Link href="/products" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
          <span className="text-base">←</span> 返回产品体系
        </Link>
        <div className="hidden md:flex text-neutral-400 font-light gap-2">
          <Link href="/" className="hover:text-neutral-600">首页</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-neutral-600">产品与解决方案</Link>
          <span>/</span>
          <span className="text-neutral-600 font-medium">{categoryData.name}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="max-w-7xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-brand text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {categoryData.nameEn}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-heading tracking-tight mb-6">
            {categoryData.name}
          </h1>
          <p className="text-neutral-500 text-lg font-light max-w-3xl leading-relaxed">
            为您展示我们在 {categoryData.name} 领域的自研智能高端软硬件设备与技术方案。
          </p>
        </motion.div>
      </section>

      {/* Product List Grid */}
      <section className="max-w-7xl mx-auto mb-20">
        {categoryData.products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200/60 shadow-sm">
            <p className="text-neutral-400 text-lg font-light">该分类下暂无产品详情。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categoryData.products.map((product, idx) => (
              <motion.div
                key={product.id}
                className="bg-gradient-to-br from-dark-from via-dark-via to-dark-to rounded-2xl p-8 text-white border border-brand/10 shadow-xl flex flex-col justify-between group cursor-pointer relative overflow-hidden"
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
                  <div className="flex flex-col pr-4">
                    <h3 className="text-2xl font-bold tracking-wide mb-2 group-hover:text-blue-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-neutral-300 font-light text-sm leading-relaxed line-clamp-2">
                      {product.summary}
                    </p>
                  </div>
                </div>

                {/* 产品指标介绍 */}
                <div className="z-10 mb-8 border-t border-blue-900/30 pt-4">
                  <ul className="space-y-2.5">
                    {product.specs.map((spec, i) => (
                      <li key={i} className="text-neutral-300 font-light text-sm flex items-start leading-relaxed">
                        <span className="text-blue-400 mr-2">▪</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>


                {/* 卡片底层按钮 */}
                <div className="z-10 mt-auto flex items-center justify-between text-sm">
                  <span className="text-neutral-400 font-light">{(companyInfo?.shortName || "云路复材")}原厂技术支持</span>
                  <Link
                    href={`/products/${categoryData.id}/${product.id}`}
                    className="px-5 py-2.5 rounded-full bg-white text-neutral-950 font-bold hover:bg-neutral-100 transition-colors shadow-md group-hover:scale-105 transition-transform duration-300"
                  >
                    获取产品详情 →
                  </Link>
                </div>

                {/* 装饰性背景斑点 */}
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
