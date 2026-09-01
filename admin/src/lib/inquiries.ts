import fs from "fs";
import path from "path";
import { getAssetDir, remove, resolveAssetPath } from "./asset";
import type { InquiryItem } from "./types";

function inquiriesDir(): string {
  return path.join(getAssetDir(), "inquiries");
}

export function listInquiries(): InquiryItem[] {
  const dir = inquiriesDir();
  if (!fs.existsSync(dir)) return [];
  const items: InquiryItem[] = [];
  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith(".json")) continue;
    try {
      items.push(getInquiry(fileName));
    } catch {
      // skip bad files
    }
  }
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

export function getInquiry(fileName: string): InquiryItem {
  const base = path.basename(fileName);
  if (!base.endsWith(".json") || base.includes("..")) {
    throw new Error("Invalid inquiry file");
  }
  const abs = resolveAssetPath(`inquiries/${base}`);
  if (!fs.existsSync(abs)) throw new Error("Not found");
  const raw = JSON.parse(fs.readFileSync(abs, "utf-8"));
  return {
    id: raw.id || base,
    fileName: base,
    companyName: raw.companyName || "",
    contactPerson: raw.contactPerson || "",
    phone: raw.phone || "",
    email: raw.email || "",
    interest: raw.interest || "",
    description: raw.description || "",
    products: Array.isArray(raw.products)
      ? raw.products.filter((item: unknown): item is string => typeof item === "string")
      : [],
    createdAt: raw.createdAt || "",
  };
}

export function deleteInquiry(fileName: string): void {
  const base = path.basename(fileName);
  remove(`inquiries/${base}`);
}
