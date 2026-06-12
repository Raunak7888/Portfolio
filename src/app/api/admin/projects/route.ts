import { NextRequest, NextResponse } from "next/server";
import { readProjectJSON, writeProjectJSON } from "@/lib/data-utils";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = readProjectJSON();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const existing = readProjectJSON();
    const merged = { ...existing, ...body };

    const { backupPath } = writeProjectJSON(merged);
    return NextResponse.json({ ok: true, backupPath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE a single project by key
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const existing = readProjectJSON() as Record<string, unknown>;
    if (!existing[key]) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    delete existing[key];
    const { backupPath } = writeProjectJSON(existing);
    return NextResponse.json({ ok: true, backupPath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}