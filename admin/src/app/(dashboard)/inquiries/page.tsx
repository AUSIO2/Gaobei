"use client";

import { useEffect, useState } from "react";
import { deleteInquiry, fetchInquiries } from "@/lib/client-api";
import type { InquiryItem } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function InquiriesPage() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [selected, setSelected] = useState<InquiryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const toast = useToast();

  async function reload() {
    try {
      setItems(await fetchInquiries());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatTime(value: string): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
  }

  return (
    <div className="p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">前端表单数据</h1>
          <p className="mt-1 text-sm text-neutral-500">查看官网咨询表单提交的全部内容；数据只读，可删除已处理记录。</p>
        </div>
        <div className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600">共 {items.length} 条</div>
      </div>

      <div className="mt-6 overflow-auto rounded-xl border border-neutral-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-3 py-2">时间</th>
              <th className="px-3 py-2">公司</th>
              <th className="px-3 py-2">联系人</th>
              <th className="px-3 py-2">电话</th>
              <th className="px-3 py-2">咨询目的</th>
              <th className="px-3 py-2">关注产品</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.fileName} className="border-t border-neutral-100">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-500">{formatTime(q.createdAt)}</td>
                <td className="px-3 py-2">{q.companyName}</td>
                <td className="px-3 py-2">{q.contactPerson}</td>
                <td className="px-3 py-2"><a className="text-sky-700 hover:underline" href={`tel:${q.phone}`}>{q.phone}</a></td>
                <td className="px-3 py-2">{q.interest}</td>
                <td className="max-w-52 px-3 py-2 text-xs text-neutral-600">{q.products.length ? q.products.join("、") : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="mr-2 text-sky-700 hover:underline"
                    onClick={() => setSelected(q)}
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => setPendingDelete(q.fileName)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-neutral-500">
                  暂无表单数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">表单详情</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              {(
                [
                  ["公司", selected.companyName],
                  ["联系人", selected.contactPerson],
                  ["电话", selected.phone],
                  ["邮箱", selected.email],
                  ["咨询目的", selected.interest],
                  ["关注产品", selected.products.join("、")],
                  ["提交时间", formatTime(selected.createdAt)],
                  ["需求描述", selected.description],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className={k === "需求描述" || k === "关注产品" ? "sm:col-span-2" : ""}>
                  <dt className="text-xs text-neutral-500">{k}</dt>
                  <dd className="whitespace-pre-wrap">{v || "—"}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className="mt-5 rounded-lg border px-3 py-1.5 text-sm"
              onClick={() => setSelected(null)}
            >
              关闭
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="删除表单记录"
        message={`确认删除 ${pendingDelete}？删除前会自动备份。`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteInquiry(pendingDelete);
            toast.success("已删除");
            setPendingDelete(null);
            if (selected?.fileName === pendingDelete) setSelected(null);
            await reload();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "删除失败");
          }
        }}
      />
    </div>
  );
}
