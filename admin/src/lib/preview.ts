export function previewPathForAsset(assetPath: string | undefined): string {
  const parts = (assetPath || "").split("/").filter(Boolean);
  const root = parts[0] || "homepage";

  if (root === "about") {
    if (parts[1] === "culture") return "/about/culture";
    return "/about";
  }
  if (root === "honors") return "/about/honors";
  if (root === "news") return /^\d+$/.test(parts[1] || "") ? `/news/${parts[1]}` : "/news";
  if (root === "products") {
    if (/^\d+-\d+$/.test(parts[2] || "")) return `/products/${parts[1]}/${parts[2]}`;
    if (/^\d+$/.test(parts[1] || "")) return `/products/${parts[1]}`;
    return "/products";
  }
  if (["solutions", "technology", "service", "contact"].includes(root)) return `/${root}`;
  if (root === "front-contact") return "/contact";
  return "/";
}

export function previewUrl(siteUrl: string, locale: "zh" | "en", assetPath?: string): string {
  return new URL(`/${locale}${previewPathForAsset(assetPath)}`, siteUrl).toString();
}
