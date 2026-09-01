import type { SessionOptions } from "iron-session";

export interface SessionData {
  authenticated: boolean;
  loginAt?: string;
}

const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return {
    password,
    cookieName: "gaobei-admin",
    cookieOptions: {
      secure: process.env.ADMIN_COOKIE_SECURE === "1",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  };
}

export function isSessionFresh(session: SessionData): boolean {
  if (!session.authenticated || !session.loginAt) return false;
  const loginAt = Date.parse(session.loginAt);
  return Number.isFinite(loginAt) && Date.now() - loginAt < SESSION_MAX_AGE_SECONDS * 1000;
}

/** Constant-time string compare (Edge + Node safe). */
export function verifyAccessKey(key: string | null | undefined): boolean {
  const expected = process.env.ADMIN_ACCESS_KEY;
  if (!expected || !key) return false;
  if (expected.length !== key.length) {
    let diff = expected.length ^ key.length;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ (key.charCodeAt(i % Math.max(key.length, 1)) || 0);
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ key.charCodeAt(i);
  }
  return diff === 0;
}

export const verifyAccessKeyEdge = verifyAccessKey;

export function checkRateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const entry = failedAttempts.get(ip);
  if (!entry) return { ok: true };
  if (entry.lockedUntil > Date.now()) {
    return { ok: false, retryAfterSec: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
  }
  return { ok: true };
}

export function recordFailedAttempt(ip: string): void {
  const entry = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 10) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000;
    entry.count = 0;
  }
  failedAttempts.set(ip, entry);
}

export function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip);
}
