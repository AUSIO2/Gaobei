"use client";

import { useRef, useState } from "react";
import { removeEntry, uploadFile } from "@/lib/client-api";
import { useToast } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

export function ImageEditor(props: {
  path: string;
  previewUrl: string;
  onReplaced: () => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.previewUrl}
          alt={props.path}
          className="mx-auto max-h-[420px] object-contain"
        />
      </div>
      <p className="font-mono text-xs text-neutral-500">{props.path}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-sky-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
        >
          替换图片
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700"
          onClick={() => setConfirmOpen(true)}
        >
          删除
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            try {
              await uploadFile(props.path, file);
              toast.success("图片已替换");
              props.onReplaced();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "上传失败");
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="删除图片"
        message={`确认删除 ${props.path}？`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setBusy(true);
          try {
            await removeEntry(props.path);
            toast.success("已删除");
            props.onDeleted();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "删除失败");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
