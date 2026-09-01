import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, requireAuth } from "@/lib/http";
import { deleteInquiry, getInquiry } from "@/lib/inquiries";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ fileName: string }> }
) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const { fileName } = await ctx.params;
    return jsonOk(getInquiry(decodeURIComponent(fileName)));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not found";
    return jsonError(msg, msg === "Not found" ? 404 : 400);
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ fileName: string }> }
) {
  const session = await getSession();
  const denied = requireAuth(request, session);
  if (denied) return denied;
  try {
    const { fileName } = await ctx.params;
    deleteInquiry(decodeURIComponent(fileName));
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed";
    return jsonError(msg, 400);
  }
}
