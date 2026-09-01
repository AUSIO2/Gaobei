import { PathError, rename } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth } from "@/lib/http";

export async function POST(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const body = await request.json();
    const from = body?.from;
    const to = body?.to;
    if (!from || !to) return jsonError("from and to required", 400);
    rename(from, to);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "rename failed";
    return jsonError(msg, e instanceof PathError ? 400 : 500);
  }
}
