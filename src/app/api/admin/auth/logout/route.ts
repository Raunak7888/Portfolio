import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const session = await getSessionFromRequest(req, res);
  session.destroy();
  await session.save();
  return res;
}