export type EntryKind = "dir" | "json" | "image" | "file";

export interface TreeNode {
  name: string;
  path: string;
  kind: EntryKind;
  children?: TreeNode[];
}

export interface EntryMeta {
  path: string;
  kind: EntryKind;
  size: number;
  mtime: string;
}

export interface DirEntry extends EntryMeta {
  kind: "dir";
  children: { name: string; path: string; kind: EntryKind }[];
}

export interface JsonEntry extends EntryMeta {
  kind: "json";
  data: unknown;
}

export interface ImageEntry extends EntryMeta {
  kind: "image";
  mime: string;
  previewUrl: string;
}

export interface FileEntry extends EntryMeta {
  kind: "file";
}

export type FsEntry = DirEntry | JsonEntry | ImageEntry | FileEntry;

export type EntityType = "news" | "honor" | "product-category" | "product-item";

export interface CreateEntityInput {
  type: EntityType;
  parentPath?: string;
}

export interface InquiryItem {
  id: string;
  fileName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  interest: string;
  description: string;
  products: string[];
  createdAt: string;
}
