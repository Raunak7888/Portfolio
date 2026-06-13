import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = process.cwd() + "/public";
const BACKUPS_DIR = process.cwd() + "/backups";

function findExistingResume(): string | null {
  const entries = fs.readdirSync(PUBLIC_DIR);
  const found = entries.find(
    (f) => f.toLowerCase().endsWith(".pdf") && f.toLowerCase().includes("resume")
  );
  return found ? path.join(PUBLIC_DIR, found) : null;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = findExistingResume();
    if (!existing) {
      return NextResponse.json({ exists: false, filename: null });
    }

    const stat = fs.statSync(existing);
    return NextResponse.json({
      exists: true,
      filename: path.basename(existing),
      url: "/" + path.basename(existing),
      size: stat.size,
      modified: stat.mtime.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customName = formData.get("filename") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 413 });
    }

    // Backup existing resume before replacing
    const existing = findExistingResume();
    let backupPath: string | null = null;
    if (existing) {
      if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupName = `${path.basename(existing, ".pdf")}.${timestamp}.pdf`;
      backupPath = path.join(BACKUPS_DIR, backupName);
      fs.copyFileSync(existing, backupPath);
      // Remove old resume
      fs.unlinkSync(existing);
    }

    // Determine output filename
    const outputName = customName?.trim()
      ? customName.trim().endsWith(".pdf")
        ? customName.trim()
        : customName.trim() + ".pdf"
      : file.name;

    // Sanitize filename
    const safeName = outputName.replace(/[^a-zA-Z0-9_\-. ]/g, "_");
    const outputPath = path.join(PUBLIC_DIR, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return NextResponse.json({
      ok: true,
      filename: safeName,
      url: "/" + safeName,
      backupPath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = findExistingResume();
    if (!existing) {
      return NextResponse.json({ error: "No resume found" }, { status: 404 });
    }

    // Backup before delete
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `${path.basename(existing, ".pdf")}.${timestamp}.pdf`;
    const backupPath = path.join(BACKUPS_DIR, backupName);
    fs.copyFileSync(existing, backupPath);
    fs.unlinkSync(existing);

    return NextResponse.json({ ok: true, backupPath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}