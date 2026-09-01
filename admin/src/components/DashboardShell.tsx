"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { logout } from "@/lib/client-api";
import { previewUrl } from "@/lib/preview";
import { useToast } from "@/components/Toast";

function Shell({ children, siteUrl }: { children: React.ReactNode; siteUrl: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const currentPath = searchParams.get("path") || undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentPath={currentPath} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-neutral-200 bg-white px-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">官网预览</span>
            <a target="_blank" rel="noreferrer" href={previewUrl(siteUrl, "zh", currentPath)} className="rounded-lg border border-neutral-200 px-2.5 py-1 hover:bg-neutral-50">中文</a>
            <a target="_blank" rel="noreferrer" href={previewUrl(siteUrl, "en", currentPath)} className="rounded-lg border border-neutral-200 px-2.5 py-1 hover:bg-neutral-50">English</a>
          </div>
          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-3 py-1 text-sm hover:bg-neutral-50"
            onClick={async () => {
              try {
                await logout();
                router.replace("/login");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "退出失败");
              }
            }}
          >
            退出
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell(props: { children: React.ReactNode; siteUrl: string }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm">加载中…</div>}>
      <Shell siteUrl={props.siteUrl}>{props.children}</Shell>
    </Suspense>
  );
}
