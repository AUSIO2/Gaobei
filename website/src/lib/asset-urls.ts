/** Shared URL builders for asset images (browser + server). */

function enc(filename: string): string {
  return encodeURIComponent(filename);
}

/** Extract basename from "file.png" or "/api/.../file.png" (client-safe). */
export function toImageBasename(value: string): string {
  if (!value) return "";
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      value = new URL(value).pathname;
    }
  } catch {
    // fall through
  }
  const parts = value.replace(/\\/g, "/").split("/");
  const base = parts[parts.length - 1] || "";
  if (!base || base === "." || base === ".." || base.includes("\0")) return "";
  return base;
}

export function homepageImageUrl(filename: string): string {
  return `/api/homepage/image/${enc(filename)}`;
}

export function solutionsImageUrl(filename: string): string {
  return `/api/solutions/image/${enc(filename)}`;
}

export function technologyImageUrl(filename: string): string {
  return `/api/technology/image/${enc(filename)}`;
}

export function serviceImageUrl(filename: string): string {
  return `/api/service/image/${enc(filename)}`;
}

export function slidesImageUrl(filename: string): string {
  return `/api/slides/${enc(filename)}`;
}

export function contactImageUrl(filename: string): string {
  return `/api/contact/${enc(filename)}`;
}

export function productIconUrl(filename: string): string {
  return `/api/products/icon/${enc(filename)}`;
}

export function productImageUrl(
  categoryId: string,
  productId: string,
  filename: string
): string {
  return `/api/products/image/${enc(categoryId)}/${enc(productId)}/${enc(filename)}`;
}

export function newsImageUrl(id: string, filename: string): string {
  return `/api/news/image/${enc(id)}/${enc(filename)}`;
}

export function honorsImageUrl(id: string, filename: string): string {
  return `/api/honors/image/${enc(id)}/${enc(filename)}`;
}
