import { getSession, logoutSession } from "@/lib/auth";
import { jsonOk, requireAuth } from "@/lib/http";

export async function POST(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  await logoutSession(session);
  return jsonOk({ ok: true });
}
