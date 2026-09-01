import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  getSessionOptions,
  isSessionFresh,
  verifyAccessKey,
  type SessionData,
} from "./auth-shared";

export type { SessionData };
export {
  getSessionOptions,
  verifyAccessKey,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
} from "./auth-shared";

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export function isAuthorized(
  _request: Request,
  session: IronSession<SessionData>
): boolean {
  return isSessionFresh(session);
}

export async function loginSession(session: IronSession<SessionData>): Promise<void> {
  session.authenticated = true;
  session.loginAt = new Date().toISOString();
  await session.save();
}

export async function logoutSession(session: IronSession<SessionData>): Promise<void> {
  session.destroy();
}
