import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth } from "@/lib/http";
import { createEntity } from "@/lib/templates";
import type { CreateEntityInput } from "@/lib/types";

export async function POST(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const body = (await request.json()) as CreateEntityInput;
    if (!body?.type) return jsonError("type required", 400);
    const result = createEntity(body);
    return jsonOk(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "create failed";
    return jsonError(msg, 400);
  }
}
