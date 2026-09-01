import { getEntry, PathError, remove } from "@/lib/asset";
import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth, requirePathParam } from "@/lib/http";

export async function GET(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const path = requirePathParam(request);
    return jsonOk(getEntry(path));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to read entry";
    const status = msg === "Not found" ? 404 : e instanceof PathError ? 400 : 500;
    return jsonError(msg, status);
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const path = requirePathParam(request);
    remove(path);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to delete";
    return jsonError(msg, e instanceof PathError ? 400 : 500);
  }
}
