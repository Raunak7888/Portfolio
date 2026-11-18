import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export interface SessionData {
  isLoggedIn: boolean;
  username?: string;
}

/** Only ever used outside production. Never a valid production secret. */
const DEV_ONLY_SECRET = "dev-only-secret-never-use-in-production-0000";

function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return DEV_ONLY_SECRET;
}

/**
 * `password` is a getter, so a missing secret fails when a session is used,
 * not when the module is imported (which would break `next build`).
 */
export const sessionOptions: SessionOptions = {
  get password() {
    return resolveSecret();
  },
  cookieName: "portfolio-admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getSessionFromRequest(
  req: NextRequest,
  res: NextResponse,
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, sessionOptions);
}
