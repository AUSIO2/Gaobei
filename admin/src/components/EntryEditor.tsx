"use client";

import { useEffect, useState } from "react";
import type { EntityType, FsEntry } from "@/lib/types";
import {
  createEntity,
  removeEntry,
  saveJson,
  uploadFile,
} from "@/lib/client-api";
import { JsonForm } from "./JsonForm";
import { ImageEditor } from "./ImageEditor";
import { DirPanel } from "./DirPanel";
import { useToast } from "./Toast";
import { validateContent } from "@/lib/content-validation";

export function EntryEditor(props: {
  entry: FsEntry | null;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const entry = props.entry;
  const dirty = entry?.kind === "json" && JSON.stringify(draft) !== JSON.stringify(entry.data);

  useEffect(() => {
    if (entry?.kind === "json") {
      setDraft(entry.data);
    }
  }, [entry]);

  useEffect(() => {
    function warnOnUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [dirty]);

  if (!entry) {
    return <div className="p-6 text-sm text-neutral-500">选择左侧文件或目录开始编辑</div>;
  }

  if (entry.kind === "json") {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-sm font-semibold">{entry.path}</div>
            <div className="text-xs text-neutral-500">JSON · {entry.size} bytes</div>
          </div>
          <div className="flex items-center gap-3">
            {dirty && <span className="text-xs text-amber-700">有未保存修改</span>}
            <button
            type="button"
            disabled={saving || !dirty}
            className="rounded-lg bg-sky-700 px-4 py-1.5 text-sm text-white disabled:opacity-40"
            onClick={async () => {
              const errors = validateContent(entry.path, draft);
              if (errors.length) {
                toast.error(errors[0]);
                return;
              }
              setSaving(true);
              try {
                await saveJson(entry.path, draft);
                toast.success("已保存");
                props.onRefresh();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "保存失败");
              } finally {
                setSaving(false);
              }
            }}
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <JsonForm
            contentPath={entry.path}
            value={draft ?? entry.data}
            onChange={setDraft}
          />
        </div>
      </div>
    );
  }

  if (entry.kind === "image") {
    return (
      <div className="p-4">
        <ImageEditor
          path={entry.path}
          previewUrl={entry.previewUrl}
          onReplaced={props.onRefresh}
          onDeleted={() => {
            const parent = entry.path.includes("/")
              ? entry.path.slice(0, entry.path.lastIndexOf("/"))
              : "";
            props.onNavigate(parent);
            props.onRefresh();
          }}
        />
      </div>
    );
  }

  if (entry.kind === "dir") {
    return (
      <div className="p-4">
        <div className="mb-3 font-mono text-sm font-semibold">{entry.path || "asset"}</div>
        <DirPanel
          path={entry.path}
          entries={entry.children}
          onOpen={props.onNavigate}
          onUpload={async (file) => {
            try {
              const p = entry.path ? `${entry.path}/${file.name}` : file.name;
              await uploadFile(p, file);
              toast.success("上传成功");
              props.onRefresh();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "上传失败");
            }
          }}
          onCreateEntity={async (type: EntityType) => {
            try {
              const result = await createEntity({
                type,
                parentPath: type === "product-item" ? entry.path : undefined,
              });
              toast.success(`已创建 ${result.path}`);
              props.onNavigate(`${result.path}/info.json`);
              props.onRefresh();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "创建失败");
            }
          }}
          onDelete={async () => {
            try {
              await removeEntry(entry.path);
              toast.success("已删除");
              const parent = entry.path.includes("/")
                ? entry.path.slice(0, entry.path.lastIndexOf("/"))
                : "";
              props.onNavigate(parent);
              props.onRefresh();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "删除失败");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 text-sm text-neutral-600">
      不支持直接编辑此文件类型（{entry.kind}）：{entry.path}
    </div>
  );
}
