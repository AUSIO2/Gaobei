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

export default function ProductDetailPage(props: { params: Promise<{ categoryId: string; productId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [productItem, setProductItem] = useState<ProductItem | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{ shortName?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [otherProducts, setOtherProducts] = useState<ProductItem[]>([]);

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
        if (data.products && Array.isArray(data.products)) {
          const item = data.products.find((p: any) => p.id === params.productId);
          if (item) {
            setProductItem(item);
            // Related products in the same category
            const other = data.products.filter((p: any) => p.id !== params.productId).slice(0, 3);
            setOtherProducts(other);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product detail:", err);
        setLoading(false);
      });
  }, [params.categoryId, params.productId]);

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
          </div>
        </div>
      </section>
    );
  }

  if (!categoryData || !productItem) {
    return (
      <section className="w-full bg-surface py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">未找到相关产品详情</h2>
        <Link href="/products" className="text-brand hover:underline flex items-center gap-2">
          <span>←</span> 返回产品体系
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb and Back Action */}
        <div className="mb-6 md:mb-8 flex items-center justify-between text-sm">
          <Link href={`/products/${categoryData.id}`} className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
            <span className="text-base">←</span> 返回产品列表
          </Link>
          <div className="hidden md:flex text-neutral-400 font-light gap-2">
            <Link href="/" className="hover:text-neutral-600">首页</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-neutral-600">产品体系</Link>
            <span>/</span>
            <Link href={`/products/${categoryData.id}`} className="hover:text-neutral-600 truncate max-w-[120px]">{categoryData.name}</Link>
            <span>/</span>
            <span className="text-neutral-600 truncate max-w-[150px] font-medium">{productItem.name}</span>
          </div>
        </div>

        {/* Article Layout */}
        <motion.article 
          className="bg-white border border-neutral-200/60 rounded-3xl p-8 md:p-12 shadow-sm mb-16"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Category Badge */}
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-brand/5 text-brand text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
              {categoryData.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-heading leading-tight mb-8">
            {productItem.name}
          </h1>

          <hr className="border-neutral-100 mb-8" />

          {/* Tech Specs Block */}
          <div className="mb-10 bg-neutral-50 border border-neutral-200/50 rounded-2xl p-6 md:p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-heading mb-4 border-b border-neutral-200 pb-2">
              关键技术规格
            </h3>
            <ul className="space-y-3">
              {productItem.specs.map((spec, idx) => (
                <li key={idx} className="text-neutral-700 text-sm md:text-base font-light flex items-start">
                  <span className="text-brand mr-2.5">▪</span>
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Paragraph Content */}
          <div className="text-neutral-700 text-base md:text-lg font-light leading-relaxed tracking-wide space-y-6">
            {productItem.content.split("\n\n").map((para, idx) => (
              <p key={idx} className="indent-0">
                {para.split("\n").map((line, lIdx) => (
                  <span key={lIdx} className="block mb-1 last:mb-0">
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {/* Product Images Section */}
          {productItem.images && productItem.images.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-100">
              <h3 className="text-lg font-bold text-heading mb-6">
                产品图片
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {productItem.images.map((image, idx) => (
                  <div key={idx} className="border border-neutral-200/50 rounded-2xl overflow-hidden shadow-sm bg-neutral-50 flex items-center justify-center">
                    <img
                      src={image}
                      alt={`${productItem.name} - 图${idx + 1}`}
                      className="w-full h-auto object-cover max-h-[400px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-bold text-neutral-900 mb-1">对该型号装备有技术咨询需求？</h4>
              <p className="text-neutral-500 text-xs font-light">{(companyInfo?.shortName || "江苏高倍")}专业技术支持团队将为您量身定制成型工艺解决方案</p>
            </div>
            <Link
              href="/#contact"
              className="inline-block px-6 py-3 bg-brand text-white font-bold text-sm rounded-full hover:bg-brand-hover transition-colors shadow-md text-center shrink-0"
            >
              获取定制方案
            </Link>
          </div>

        </motion.article>

        {/* Suggestion list */}
        {otherProducts.length > 0 && (
          <section className="border-t border-neutral-200/80 pt-10">
            <h3 className="text-lg md:text-xl font-bold text-heading mb-6">同类其他自研装备</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherProducts.map((p) => (
                <Link key={p.id} href={`/products/${categoryData.id}/${p.id}`}>
                  <div className="bg-white border border-neutral-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-neutral-800 hover:text-brand transition-colors leading-snug mb-2">
                        {p.name}
                      </h4>
                      <p className="text-neutral-500 font-light text-xs line-clamp-2 leading-relaxed">
                        {p.summary}
                      </p>
                    </div>
                    <span className="text-brand text-xs font-semibold mt-4 block">
                      查看详情 →
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
