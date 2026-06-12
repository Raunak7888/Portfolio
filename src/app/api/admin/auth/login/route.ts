import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body as { username: string; password: string };

    const validUsername = process.env.ADMIN_USERNAME ?? "admin";
    const validPassword = process.env.ADMIN_PASSWORD ?? "strongpassword";
    console.log("========================================================================");
    console.log("validUsername: ", validUsername, "validPassword: ", validPassword);
    console.log("username: ", username, "password: ", password);
    console.log("========================================================================");
    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    const session = await getSessionFromRequest(req, res);
    session.isLoggedIn = true;
    session.username = username;
    await session.save();

    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}