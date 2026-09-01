import { PathError, UploadError, uploadFile } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth, requirePathParam } from "@/lib/http";

export async function POST(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const destPath = requirePathParam(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Missing file", 400);
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    uploadFile(destPath, buf, mime);
    return jsonOk({ ok: true, path: destPath });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    const status =
      e instanceof PathError || e instanceof UploadError ? 400 : 500;
    return jsonError(msg, status);
  }
}
