"use client";

import type { TreeNode } from "@/lib/types";

function kindIcon(kind: string) {
  if (kind === "dir") return "📁";
  if (kind === "json") return "{ }";
  if (kind === "image") return "🖼";
  return "📄";
}

function TreeItem(props: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  depth: number;
}) {
  const { node } = props;
  const isDir = node.kind === "dir";
  const expanded = props.expandedPaths.has(node.path);
  const selected = props.selectedPath === node.path;

  return (
    <div>
      <button
        type="button"
        className={`flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-xs ${
          selected ? "bg-sky-700 text-white" : "hover:bg-neutral-200/80 text-neutral-800"
        }`}
        style={{ paddingLeft: 4 + props.depth * 12 }}
        onClick={() => {
          if (isDir) props.onToggleExpand(node.path);
          props.onSelect(node.path);
        }}
      >
        {isDir && (
          <span className="w-3 shrink-0 text-[10px] opacity-70">{expanded ? "▾" : "▸"}</span>
        )}
        <span className="shrink-0 opacity-70">{kindIcon(node.kind)}</span>
        <span className="truncate">{node.name || "asset"}</span>
      </button>
      {isDir && expanded && node.children?.map((child) => (
        <TreeItem
          key={child.path}
          node={child}
          selectedPath={props.selectedPath}
          onSelect={props.onSelect}
          expandedPaths={props.expandedPaths}
          onToggleExpand={props.onToggleExpand}
          depth={props.depth + 1}
        />
      ))}
    </div>
  );
}

export function AssetTree(props: {
  tree: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
}) {
  return (
    <div className="h-full overflow-auto p-2 font-mono">
      <TreeItem {...props} node={props.tree} depth={0} />
    </div>
  );
}
