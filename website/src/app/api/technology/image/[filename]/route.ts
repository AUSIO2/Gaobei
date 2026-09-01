import { NextRequest } from "next/server";
import { resolveUnderAsset, safeBasename, serveAssetFile } from "@/lib/serve-asset";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  const { filename } = await props.params;
  return serveAssetFile(
    request,
    resolveUnderAsset("technology", safeBasename(decodeURIComponent(filename)))
  );
}
