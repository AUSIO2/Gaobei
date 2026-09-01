"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const MODULE_SHORTCUTS: {
  label: string;
  path: string | null;
  href?: string;
}[] = [
  { label: "概览", path: null, href: "/" },
  { label: "资源浏览器", path: null, href: "/browser" },
  { label: "首页", path: "homepage" },
  { label: "公司信息", path: "company_info.json" },
  { label: "关于", path: "about" },
  { label: "文化", path: "about/culture" },
  { label: "新闻", path: "news" },
  { label: "产品", path: "products" },
  { label: "荣誉", path: "honors" },
  { label: "解决方案", path: "solutions" },
  { label: "技术", path: "technology" },
  { label: "服务", path: "service" },
  { label: "联系", path: "contact" },
  { label: "轮播图", path: "front-slide" },
  { label: "二维码", path: "front-contact" },
  { label: "图标", path: "icons" },
  { label: "表单数据", path: null, href: "/inquiries" },
];

export function Sidebar(props: { currentPath?: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
      <div className="border-b border-neutral-200 px-4 py-4">
        <div className="text-sm font-semibold tracking-wide text-neutral-900">高倍管理端</div>
        <div className="text-xs text-neutral-500">Asset CMS</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {MODULE_SHORTCUTS.map((item) => {
          const href = item.href || `/browser?path=${encodeURIComponent(item.path!)}`;
          const active =
            item.href === pathname ||
            (item.path && props.currentPath === item.path) ||
            (item.path && props.currentPath?.startsWith(item.path + "/"));
          return (
            <Link
              key={item.label}
              href={href}
              className={`block px-4 py-2 text-sm ${
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-200/70"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
