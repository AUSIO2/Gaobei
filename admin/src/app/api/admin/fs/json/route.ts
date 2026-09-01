import { JsonError, PathError, writeJson } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { validateContent } from "@/lib/content-validation";
import { jsonError, jsonOk, requireAuth, requirePathParam } from "@/lib/http";

export async function PUT(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const path = requirePathParam(request);
    const data = await request.json();
    const errors = validateContent(path, data);
    if (errors.length) return jsonError(errors[0], 400);
    writeJson(path, data);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to write JSON";
    return jsonError(msg, e instanceof PathError || e instanceof JsonError ? 400 : 500);
  }
}
