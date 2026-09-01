import {
  checkRateLimit,
  clearFailedAttempts,
  getSession,
  loginSession,
  recordFailedAttempt,
  verifyAccessKey,
} from "@/lib/auth";
import { getClientIp, jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return jsonError(`Too many attempts; retry in ${limit.retryAfterSec}s`, 429);
  }

  const body = await request.json().catch(() => null);
  if (!verifyAccessKey(body?.key)) {
    recordFailedAttempt(ip);
    return jsonError("密钥错误", 401);
  }

  clearFailedAttempts(ip);
  const session = await getSession();
  await loginSession(session);
  return jsonOk({ ok: true });
}
