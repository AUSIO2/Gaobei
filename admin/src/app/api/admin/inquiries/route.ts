import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth } from "@/lib/http";
import { listInquiries } from "@/lib/inquiries";

export async function GET(request: Request) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    return jsonOk(listInquiries());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to list inquiries";
    return jsonError(msg, 500);
  }
}
