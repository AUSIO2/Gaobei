import { NextRequest } from "next/server";
import { resolveUnderAsset, safeBasename, serveAssetFile } from "@/lib/serve-asset";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await props.params;
  return serveAssetFile(
    request,
    resolveUnderAsset("honors", safeBasename(id), safeBasename(decodeURIComponent(filename)))
  );
}
