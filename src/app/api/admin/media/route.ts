import { NextRequest, NextResponse } from "next/server";
import { listMediaFiles, deleteMediaFile, renameMediaFile } from "@/lib/data-utils";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const files = listMediaFiles();
    return NextResponse.json(files);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { url } = body as { url: string };
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    deleteMediaFile(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { url, newName } = body as { url: string; newName: string };
    if (!url || !newName) {
      return NextResponse.json({ error: "Missing url or newName" }, { status: 400 });
    }
    const newUrl = renameMediaFile(url, newName);
    return NextResponse.json({ ok: true, url: newUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}