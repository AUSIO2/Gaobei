"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchInquiries } from "@/lib/client-api";
import type { InquiryItem } from "@/lib/types";
import { MODULE_SHORTCUTS } from "@/components/Sidebar";

export default function OverviewPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);

  useEffect(() => {
    fetchInquiries()
      .then((list) => setInquiries(list.slice(0, 5)))
      .catch(() => setInquiries([]));
  }, []);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">内容管理概览</h1>
        <p className="mt-1 text-sm text-neutral-500">
          直接读写服务器 asset 目录，保存后官网立即生效。
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">快捷入口</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MODULE_SHORTCUTS.filter((m) => m.label !== "概览").map((m) => (
            <Link
              key={m.label}
              href={m.href || `/browser?path=${encodeURIComponent(m.path!)}`}
              className="rounded-xl border border-neutral-200 px-4 py-3 text-sm hover:border-neutral-400"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">最近表单数据</h2>
          <Link href="/inquiries" className="text-xs text-sky-700 hover:underline">
            查看全部
          </Link>
        </div>
        <div className="divide-y rounded-xl border border-neutral-200">
          {inquiries.length === 0 && (
            <div className="p-4 text-sm text-neutral-500">暂无表单数据</div>
          )}
          {inquiries.map((q) => (
            <div key={q.fileName} className="px-4 py-3 text-sm">
              <div className="font-medium">
                {q.companyName} · {q.contactPerson}
              </div>
              <div className="text-xs text-neutral-500">
                {q.phone} · {q.createdAt}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
