"use client";

import { useRef, useState } from "react";
import type { DirEntry, EntityType } from "@/lib/types";
import { directoryPolicy } from "@/lib/directory-policy";
import { ConfirmDialog } from "./ConfirmDialog";

export function DirPanel(props: {
  path: string;
  entries: DirEntry["children"];
  onOpen: (path: string) => void;
  onUpload: (file: File) => void;
  onCreateEntity?: (type: EntityType) => void;
  onDelete: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const policy = directoryPolicy(props.path);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
        <div className="font-semibold">此目录允许的内容</div>
        <p className="mt-1 text-sky-800">{policy.description}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-sky-800">
          {policy.allowed.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-2 text-xs text-sky-700">不支持手动创建自定义子目录。</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {policy.allowUpload && <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-sm"
          onClick={() => inputRef.current?.click()}
        >
          上传图片
        </button>}
        {(policy.entities || []).map((b) => (
          <button
            key={b.type}
            type="button"
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white"
            onClick={() => props.onCreateEntity?.(b.type)}
          >
            {b.label}
          </button>
        ))}
        {policy.allowDelete && (
          <button
            type="button"
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700"
            onClick={() => setConfirmOpen(true)}
          >
            删除此目录
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) props.onUpload(file);
          }}
        />
      </div>

      <div className="divide-y rounded-xl border border-neutral-200">
        {props.entries.length === 0 && (
          <div className="p-4 text-sm text-neutral-500">空目录</div>
        )}
        {props.entries.map((c) => (
          <button
            key={c.path}
            type="button"
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-neutral-50"
            onClick={() => props.onOpen(c.path)}
          >
            <span className="font-mono">{c.name}</span>
            <span className="text-xs text-neutral-400">{c.kind}</span>
          </button>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="删除目录"
        message={`确认递归删除 ${props.path}？此操作会先备份。`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          props.onDelete();
        }}
      />
    </div>
  );
}
