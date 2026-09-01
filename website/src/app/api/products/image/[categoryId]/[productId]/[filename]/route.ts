import { NextRequest } from "next/server";
import { resolveUnderAsset, safeBasename, serveAssetFile } from "@/lib/serve-asset";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ categoryId: string; productId: string; filename: string }> }
) {
  const { categoryId, productId, filename } = await props.params;
  return serveAssetFile(
    request,
    resolveUnderAsset(
      "products",
      safeBasename(categoryId),
      safeBasename(productId),
      safeBasename(decodeURIComponent(filename))
    )
  );
}
