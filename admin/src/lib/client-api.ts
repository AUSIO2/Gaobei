import type { CreateEntityInput, FsEntry, InquiryItem, TreeNode } from "./types";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText);
  }
  return data as T;
}

export function fetchTree(): Promise<TreeNode> {
  return api("/api/admin/fs/tree");
}

export function fetchEntry(path: string): Promise<FsEntry> {
  return api(`/api/admin/fs/entry?path=${encodeURIComponent(path)}`);
}

export function saveJson(path: string, data: unknown): Promise<void> {
  return api(`/api/admin/fs/json?path=${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function uploadFile(path: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/admin/fs/upload?path=${encodeURIComponent(path)}`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Upload failed");
}

export function removeEntry(path: string): Promise<void> {
  return api(`/api/admin/fs/entry?path=${encodeURIComponent(path)}`, { method: "DELETE" });
}

export function renameEntry(from: string, to: string): Promise<void> {
  return api("/api/admin/fs/rename", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
  });
}

export function createEntity(
  input: CreateEntityInput
): Promise<{ path: string; id: string }> {
  return api("/api/admin/entities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function fetchInquiries(): Promise<InquiryItem[]> {
  return api("/api/admin/inquiries");
}

export function fetchInquiry(fileName: string): Promise<InquiryItem> {
  return api(`/api/admin/inquiries/${encodeURIComponent(fileName)}`);
}

export function deleteInquiry(fileName: string): Promise<void> {
  return api(`/api/admin/inquiries/${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  });
}

export function logout(): Promise<void> {
  return api("/api/admin/auth/logout", { method: "POST" });
}

export function rawUrl(path: string): string {
  return `/api/admin/fs/raw?path=${encodeURIComponent(path)}`;
}
