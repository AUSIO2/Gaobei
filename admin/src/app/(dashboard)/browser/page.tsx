"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssetTree } from "@/components/AssetTree";
import { EntryEditor } from "@/components/EntryEditor";
import { fetchEntry, fetchTree } from "@/lib/client-api";
import type { FsEntry, TreeNode } from "@/lib/types";
import { useToast } from "@/components/Toast";

function BrowserInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const selectedPath = searchParams.get("path") || "";

  const [tree, setTree] = useState<TreeNode | null>(null);
  const [entry, setEntry] = useState<FsEntry | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set([""]));
  const [loading, setLoading] = useState(true);

  const loadTree = useCallback(async () => {
    try {
      const t = await fetchTree();
      setTree(t);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载目录失败");
    }
  }, [toast]);

  const loadEntry = useCallback(async (path: string) => {
    try {
      // empty path = asset root
      if (!path) {
        const t = await fetchTree();
        setEntry({
          path: "",
          kind: "dir",
          size: 0,
          mtime: new Date().toISOString(),
          children: (t.children || []).map((c) => ({
            name: c.name,
            path: c.path,
            kind: c.kind,
          })),
        });
        return;
      }
      setEntry(await fetchEntry(path));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载失败");
      setEntry(null);
    }
  }, [toast]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadTree();
    await loadEntry(selectedPath);
    setLoading(false);
  }, [loadTree, loadEntry, selectedPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // expand ancestors of selected path
    if (!selectedPath) return;
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      next.add("");
      const parts = selectedPath.split("/");
      let cur = "";
      for (const part of parts) {
        cur = cur ? `${cur}/${part}` : part;
        next.add(cur);
        // also expand parent dirs
        const parent = cur.includes("/") ? cur.slice(0, cur.lastIndexOf("/")) : "";
        next.add(parent);
      }
      return next;
    });
  }, [selectedPath]);

  function navigate(path: string) {
    const href = path ? `/browser?path=${encodeURIComponent(path)}` : "/browser";
    router.push(href);
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-72 shrink-0 border-r border-neutral-200 bg-neutral-50">
        {tree ? (
          <AssetTree
            tree={tree}
            selectedPath={selectedPath}
            onSelect={navigate}
            expandedPaths={expandedPaths}
            onToggleExpand={(path) => {
              setExpandedPaths((prev) => {
                const next = new Set(prev);
                if (next.has(path)) next.delete(path);
                else next.add(path);
                return next;
              });
            }}
          />
        ) : (
          <div className="p-3 text-xs text-neutral-500">加载目录…</div>
        )}
      </div>
      <div className="min-w-0 flex-1 overflow-auto">
        {loading && !entry ? (
          <div className="p-6 text-sm text-neutral-500">加载中…</div>
        ) : (
          <EntryEditor entry={entry} onRefresh={refresh} onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}

export default function BrowserPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">加载中…</div>}>
      <BrowserInner />
    </Suspense>
  );
}
