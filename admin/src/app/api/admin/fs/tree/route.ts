import { listTree, PathError } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth } from "@/lib/http";

export async function GET(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    return jsonOk(listTree());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list tree";
    return jsonError(msg, e instanceof PathError ? 400 : 500);
  }
}
