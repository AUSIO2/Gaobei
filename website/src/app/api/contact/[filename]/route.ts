import { NextRequest } from "next/server";
import {
  resolveUnderAsset,
  safeBasename,
  serveAssetFileFirstExisting,
} from "@/lib/serve-asset";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  const { filename } = await props.params;
  const name = safeBasename(decodeURIComponent(filename));
  return serveAssetFileFirstExisting(request, [
    resolveUnderAsset("front-contact", name),
    resolveUnderAsset("contact", name),
  ]);
}
