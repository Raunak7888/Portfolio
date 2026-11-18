#!/usr/bin/env bash
# redesign.sh — run from the portfolio repository root.
# Backs up every file it touches to .redesign-backup/<timestamp>/ first.
set -Eeuo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
ROOT="$(pwd)"
BACKUP_DIR="$ROOT/.redesign-backup/$TS"
TOOLS="$(mktemp -d)"
FAIL_LOG="$TOOLS/failures.log"; : >"$FAIL_LOG"
CHANGED=(); SKIPPED=(); MANUAL=(); RESULTS=()
export BACKUP_DIR FAIL_LOG

log()  { printf '\033[1;34m[redesign]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[fatal]\033[0m %s\n' "$*" >&2; exit 1; }
trap 'printf "\033[1;31m[fatal]\033[0m failed at line %s\n" "$LINENO" >&2' ERR
trap 'rm -rf "$TOOLS"' EXIT

############################################################################
# 0. Preconditions
############################################################################
[ -f package.json ] || die "package.json not found. Run from the repository root."
[ -f src/app/layout.tsx ] || die "src/app/layout.tsx not found. Wrong directory?"
grep -q '"next"' package.json || die "Not a Next.js project."
grep -q '"firstName": "Raunak"' src/Data/Data.json 2>/dev/null || die "src/Data/Data.json does not look like the portfolio data."
command -v node >/dev/null || die "node is required."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node 20.9+ is required (found $(node -v))."

if command -v git >/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then warn "Working tree has uncommitted changes. Backups are still written to $BACKUP_DIR."; fi
fi

if [ -f pnpm-lock.yaml ]; then PM=pnpm
elif [ -f yarn.lock ]; then PM=yarn
elif [ -f bun.lockb ] || [ -f bun.lock ]; then PM=bun
else PM=npm; fi
command -v "$PM" >/dev/null || die "Detected package manager '$PM' is not installed."
log "Package manager: $PM | Node $(node -v) | backups: $BACKUP_DIR"

pm_install() { case $PM in npm) if [ -f package-lock.json ]; then npm ci; else npm install; fi;; pnpm) pnpm install;; yarn) yarn install;; bun) bun install;; esac; }
pm_add()     { case $PM in npm) npm install "$@";; pnpm) pnpm add "$@";; yarn) yarn add "$@";; bun) bun add "$@";; esac; }
pm_add_dev() { case $PM in npm) npm install -D "$@";; pnpm) pnpm add -D "$@";; yarn) yarn add -D "$@";; bun) bun add -d "$@";; esac; }
pm_rm()      { case $PM in npm) npm uninstall "$@";; pnpm) pnpm remove "$@";; yarn) yarn remove "$@";; bun) bun remove "$@";; esac; }
pm_run()     { case $PM in npm) npm run "$1";; pnpm) pnpm run "$1";; yarn) yarn "$1";; bun) bun run "$1";; esac; }

backup() {
  local f="$1"; [ -e "$f" ] || return 0
  local dest="$BACKUP_DIR/$f"; [ -e "$dest" ] && return 0
  mkdir -p "$(dirname "$dest")"; cp -p "$f" "$dest"
}
# put <path>: write stdin to path. Skips when identical. Backs up when replacing.
put() {
  local f="$1" tmp; tmp="$(mktemp)"; cat >"$tmp"
  mkdir -p "$(dirname "$f")"
  if [ -f "$f" ]; then
    if cmp -s "$tmp" "$f"; then rm -f "$tmp"; SKIPPED+=("unchanged: $f"); return 0; fi
    backup "$f"
  fi
  mv "$tmp" "$f"; CHANGED+=("wrote: $f")
}
retire() { # back up, then remove
  local f="$1"; [ -e "$f" ] || return 0
  backup "$f"; rm -f "$f"; CHANGED+=("removed (backed up): $f")
}

############################################################################
# 1. Helper tools (exact-match patcher, import pruner)
############################################################################
cat >"$TOOLS/patch.mjs" <<'__JS__'
import fs from "node:fs";
import path from "node:path";
const BACKUP = process.env.BACKUP_DIR, FAIL = process.env.FAIL_LOG;
const sub = (s) => s.replaceAll("%%EXP_ICON%%", process.env.EXP_ICON || "");
const lines = fs.readFileSync(0, "utf8").split("\n");
const jobs = []; let file = null, op = null, target = null;
for (const line of lines) {
  if (line.startsWith("@@FILE ")) { file = line.slice(7).trim(); continue; }
  if (line === "@@FIND" || line === "@@FINDALL") { op = { kind: line.slice(2), find: [], repl: [] }; target = op.find; continue; }
  if (line === "@@BETWEEN") { op = { kind: "BETWEEN", from: [], to: [], repl: [] }; target = op.from; continue; }
  if (line === "@@TO") { target = op.to; continue; }
  if (line === "@@WITH") { target = op.repl; continue; }
  if (line === "@@END") { op.file = file; jobs.push(op); op = null; target = null; continue; }
  if (target) target.push(line);
}
const byFile = new Map();
for (const j of jobs) { if (!byFile.has(j.file)) byFile.set(j.file, []); byFile.get(j.file).push(j); }
const fail = (m) => { console.error("  FAILED " + m); fs.appendFileSync(FAIL, m + "\n"); };
for (const [f, ops] of byFile) {
  if (!fs.existsSync(f)) { fail(`${f}: file missing`); continue; }
  let c = fs.readFileSync(f, "utf8"); const orig = c; let n = 0;
  for (const o of ops) {
    const repl = sub(o.repl.join("\n"));
    const applied = repl !== "" && c.includes(repl);
    if (o.kind === "BETWEEN") {
      const from = o.from.join("\n"), to = o.to.join("\n");
      const s = c.indexOf(from);
      if (s < 0) { if (applied) continue; fail(`${f}: BETWEEN start not found: ${from.slice(0, 50)}`); continue; }
      const e = c.indexOf(to, s + from.length);
      if (e < 0) { fail(`${f}: BETWEEN end not found: ${to.slice(0, 50)}`); continue; }
      c = c.slice(0, s) + repl + c.slice(e); n++; continue;
    }
    const find = o.find.join("\n");
    const found = c.includes(find);
    if (found && applied && repl.includes(find)) continue;
    if (!found) { if (applied || repl === "") continue; fail(`${f}: not found: ${find.slice(0, 60).replace(/\n/g, "⏎")}`); continue; }
    if (o.kind === "FIND") {
      if (c.indexOf(find) !== c.lastIndexOf(find)) { fail(`${f}: ambiguous (multiple matches): ${find.slice(0, 60)}`); continue; }
      c = c.replace(find, () => repl);
    } else c = c.replaceAll(find, () => repl);
    n++;
  }
  if (c !== orig) {
    const d = path.join(BACKUP, f);
    if (!fs.existsSync(d)) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(f, d); }
    fs.writeFileSync(f, c); console.log(`  patched ${f} (${n} change${n === 1 ? "" : "s"})`);
  }
}
__JS__

cat >"$TOOLS/prune.mjs" <<'__JS__'
import fs from "node:fs";
import path from "node:path";
const BACKUP = process.env.BACKUP_DIR;
const walk = (d, o = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, o); else if (/\.(ts|tsx)$/.test(e.name) && !e.name.endsWith(".d.ts")) o.push(p); } return o; };
const RE = /^import\s+((?:(?!\bimport\b)[^;])*?)\s+from\s+(["'][^"']+["']);?[ \t]*\n/gm;
let total = 0;
for (const f of walk("src")) {
  const src = fs.readFileSync(f, "utf8");
  const rest = src.replace(RE, "");
  let changed = false;
  const out = src.replace(RE, (whole, clauseRaw, source) => {
    let clause = clauseRaw.trim(), isType = false;
    if (/^type\s/.test(clause)) { isType = true; clause = clause.replace(/^type\s+/, ""); }
    let named = null, def = null;
    const nm = clause.match(/\{([\s\S]*)\}/);
    if (nm) { named = nm[1].split(",").map((s) => s.trim()).filter(Boolean); clause = clause.replace(nm[0], "").replace(/,\s*$/, "").trim(); }
    if (clause.startsWith("*")) return whole;
    if (clause) def = clause.replace(/,$/, "").trim();
    const used = (name) => new RegExp("\\b" + name.replace(/\$/g, "\\$") + "\\b").test(rest);
    const localOf = (s) => s.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
    const keepDef = def && used(def) ? def : null;
    const keepNamed = (named || []).filter((s) => used(localOf(s)));
    if (keepDef === def && keepNamed.length === (named || []).length) return whole;
    changed = true; total++;
    const parts = [];
    if (keepDef) parts.push(keepDef);
    if (keepNamed.length) parts.push(keepNamed.length > 3 ? "{\n    " + keepNamed.join(",\n    ") + ",\n}" : "{ " + keepNamed.join(", ") + " }");
    if (!parts.length) return "";
    return `import ${isType ? "type " : ""}${parts.join(", ")} from ${source};\n`;
  });
  if (changed) {
    const d = path.join(BACKUP, f);
    if (!fs.existsSync(d)) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(f, d); }
    fs.writeFileSync(f, out); console.log("  pruned imports: " + f);
  }
}
console.log(`  ${total} import statement(s) cleaned`);
__JS__
patch() { node "$TOOLS/patch.mjs"; }

if [ ! -d node_modules ]; then log "node_modules missing. Installing dependencies first."; pm_install; fi

EXP_ICON=""
for c in Briefcase01Icon Briefcase02Icon Award01Icon StarIcon; do
  if node --input-type=module -e "import('@hugeicons/core-free-icons').then(m=>process.exit(m['$c']?0:1)).catch(()=>process.exit(2))" 2>/dev/null; then EXP_ICON="$c"; break; fi
done
export EXP_ICON
[ -n "$EXP_ICON" ] && log "Experience nav icon: $EXP_ICON" || warn "No suitable Hugeicons icon found. Experience will be added to the page but not the navbar."

############################################################################
# 2. CRITICAL SECURITY
############################################################################
log "2/12 Security: session, filesystem, uploads, contact API, headers"

put src/lib/session.ts <<'__F__'
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
__F__

put src/lib/data-utils.ts <<'__F__'
import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const DATA_JSON_PATH = path.join(PROJECT_ROOT, "src", "Data", "Data.json");
const PROJECT_JSON_PATH = path.join(PROJECT_ROOT, "src", "Data", "Project.json");
const BACKUPS_DIR = path.join(PROJECT_ROOT, "backups");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");

const MAX_BACKUPS_PER_FILE = 20;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Extensions the media library may list, rename or delete. */
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);
/** Extensions that may be uploaded. SVG is excluded: it can carry scripts. */
const UPLOAD_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Resolve `rel` inside `root`. Rejects traversal, absolute escapes and
 * symlinks that point outside `root`. (A plain startsWith check is not safe:
 * "/app/public-evil" starts with "/app/public".)
 */
function resolveInside(root: string, rel: string): string {
  const cleaned = String(rel).replace(/^[/\\]+/, "");
  if (!cleaned || cleaned.includes("\0")) throw new Error("Invalid path");
  const full = path.resolve(root, cleaned);
  const relative = path.relative(root, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Invalid path");
  if (fs.existsSync(full)) {
    const real = fs.realpathSync(full);
    const realRoot = fs.realpathSync(root);
    const realRel = path.relative(realRoot, real);
    if (realRel.startsWith("..") || path.isAbsolute(realRel)) throw new Error("Invalid path");
  }
  return full;
}

function assertImageExt(p: string): string {
  const ext = path.extname(p).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) throw new Error("Invalid file type");
  return ext;
}

// ── Backup ───────────────────────────────────────────────────────────────────

function createBackup(filePath: string): string {
  ensureDir(BACKUPS_DIR);
  const filename = path.basename(filePath, ".json");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUPS_DIR, `${filename}.${timestamp}.json`);
  fs.copyFileSync(filePath, backupPath);

  const old = fs
    .readdirSync(BACKUPS_DIR)
    .filter((n) => n.startsWith(`${filename}.`) && n.endsWith(".json"))
    .sort();
  for (const name of old.slice(0, Math.max(0, old.length - MAX_BACKUPS_PER_FILE))) {
    fs.unlinkSync(path.join(BACKUPS_DIR, name));
  }
  return backupPath;
}

function writeJsonAtomically(filePath: string, data: Record<string, unknown>): void {
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new Error("JSON root must be an object");
  const text = JSON.stringify(data, null, 4); // throws on circular references
  JSON.parse(text);
  const tmp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text, "utf-8");
  fs.renameSync(tmp, filePath);
}

// ── Data.json ─────────────────────────────────────────────────────────────────

export function readDataJSON(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(DATA_JSON_PATH, "utf-8"));
}

export function writeDataJSON(data: Record<string, unknown>): { backupPath: string } {
  const backupPath = createBackup(DATA_JSON_PATH);
  writeJsonAtomically(DATA_JSON_PATH, data);
  return { backupPath };
}

// ── Project.json ──────────────────────────────────────────────────────────────

export function readProjectJSON(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(PROJECT_JSON_PATH, "utf-8"));
}

export function writeProjectJSON(data: Record<string, unknown>): { backupPath: string } {
  const backupPath = createBackup(PROJECT_JSON_PATH);
  writeJsonAtomically(PROJECT_JSON_PATH, data);
  return { backupPath };
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaFile {
  name: string;
  path: string; // absolute disk path
  url: string; // web-accessible URL from /public
  size: number; // bytes
  ext: string;
}

function scanDir(dir: string, base: string): MediaFile[] {
  const results: MediaFile[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, base));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        const relativePath = path.relative(base, fullPath);
        results.push({
          name: entry.name,
          path: fullPath,
          url: "/" + relativePath.replace(/\\/g, "/"),
          size: fs.statSync(fullPath).size,
          ext,
        });
      }
    }
  }
  return results;
}

export function listMediaFiles(): MediaFile[] {
  return scanDir(PUBLIC_DIR, PUBLIC_DIR);
}

export function deleteMediaFile(relativePath: string): void {
  const fullPath = resolveInside(PUBLIC_DIR, relativePath);
  assertImageExt(fullPath);
  if (!fs.existsSync(fullPath)) throw new Error("File not found");
  fs.unlinkSync(fullPath);
}

export function renameMediaFile(relativePath: string, newName: string): string {
  const fullPath = resolveInside(PUBLIC_DIR, relativePath);
  const ext = assertImageExt(fullPath);
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(newName) || path.basename(newName) !== newName || newName.startsWith(".")) {
    throw new Error("Invalid new name");
  }
  if (path.extname(newName).toLowerCase() !== ext) throw new Error("File extension must not change");
  const newPath = resolveInside(PUBLIC_DIR, path.relative(PUBLIC_DIR, path.join(path.dirname(fullPath), newName)));
  if (fs.existsSync(newPath)) throw new Error("A file with that name already exists");
  fs.renameSync(fullPath, newPath);
  return "/" + path.relative(PUBLIC_DIR, newPath).replace(/\\/g, "/");
}

/** Confirm the bytes match the claimed image type. */
function matchesMagicBytes(buf: Buffer, ext: string): boolean {
  if (ext === ".png") return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (ext === ".jpg" || ext === ".jpeg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === ".gif") return ["GIF87a", "GIF89a"].includes(buf.subarray(0, 6).toString("ascii"));
  if (ext === ".webp") return buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export function saveUploadedFile(buffer: Buffer, originalName: string): { url: string; name: string } {
  const ext = path.extname(originalName).toLowerCase();
  if (!UPLOAD_EXTS.has(ext)) throw new Error("Invalid file type");
  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) throw new Error("File is empty or too large (5 MB max)");
  if (!matchesMagicBytes(buffer, ext)) throw new Error("File content does not match its extension");

  ensureDir(UPLOADS_DIR);
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60) || "image";
  const filename = `${base}_${Date.now()}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer, { flag: "wx" });
  return { url: `/uploads/${filename}`, name: filename };
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProjects: number;
  totalSkills: number;
  totalExperiences: number;
  totalCertifications: number;
  totalImages: number;
  dataJsonModified: string;
  projectJsonModified: string;
}

export function getDashboardStats(): DashboardStats {
  const data = readDataJSON() as {
    skills?: { skills?: unknown[] };
    experience?: unknown[];
    certifications?: unknown[];
  };
  const projects = readProjectJSON();
  return {
    totalProjects: Object.keys(projects).length,
    totalSkills: data.skills?.skills?.length ?? 0,
    totalExperiences: data.experience?.length ?? 0,
    totalCertifications: data.certifications?.length ?? 0,
    totalImages: listMediaFiles().length,
    dataJsonModified: fs.statSync(DATA_JSON_PATH).mtime.toISOString(),
    projectJsonModified: fs.statSync(PROJECT_JSON_PATH).mtime.toISOString(),
  };
}
__F__

put src/app/api/contact/route.ts <<'__F__'
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { NextResponse } from "next/server";
import data from "@/Data/Data.json";

export const runtime = "nodejs";

const MOODS: Record<string, string> = {
    idea: "💡 Idea",
    job: "💼 Job",
    team: "🤝 Collab",
    hi: "👋 Hello",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 20_000;

/**
 * In-memory limiter. It is per server instance. On serverless platforms each
 * instance keeps its own counter, so treat this as a speed bump, not a wall.
 * A shared store (for example Redis) is needed for a hard limit.
 */
const hits = new Map<string, number[]>();

let cached: Transporter | null = null;
function getMailer() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) return null;
    cached ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    return { transporter: cached, user };
}

function escapeHtml(value: string) {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return value.replace(/[&<>"']/g, (c) => map[c]);
}

function clientIp(req: Request) {
    return (
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown"
    );
}

function limited(ip: string) {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= LIMIT) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 500) {
        for (const [key, list] of hits) {
            if (list.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
        }
    }
    return false;
}

export async function POST(req: Request) {
    try {
        if (limited(clientIp(req))) {
            return NextResponse.json(
                { error: "Too many messages. Try again later." },
                { status: 429, headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) } },
            );
        }

        if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }
        if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
        }
        const raw = await req.text().catch(() => "");
        if (raw.length > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
        }
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        const body = parsed as Record<string, unknown>;

        // Honeypot: real people never fill this field. Pretend it worked.
        if (typeof body.website === "string" && body.website.trim() !== "") {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const name = typeof body.name === "string" ? body.name.replace(/[\r\n]+/g, " ").trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const message = typeof body.message === "string" ? body.message.trim() : "";
        const mood = typeof body.mood === "string" ? (MOODS[body.mood] ?? MOODS.hi) : MOODS.hi;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (name.length > 100 || email.length > 200 || message.length > 5000) {
            return NextResponse.json({ error: "Message is too long" }, { status: 400 });
        }
        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        const mailer = getMailer();
        if (!mailer) {
            console.error("Contact form: EMAIL_USER / EMAIL_PASS are not set.");
            return NextResponse.json({ error: "Contact form is not configured" }, { status: 503 });
        }

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message);

        const html = `
        <div style="font-family: sans-serif; background-color: #f4f7f9; padding: 40px 10px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background: #a826ff; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Inquiry · ${escapeHtml(mood)}</h1>
                </div>
                <div style="padding: 40px; color: #1a1a1a; line-height: 1.6;">
                    <div style="margin-bottom: 25px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Sender</div>
                        <div style="font-size: 18px; font-weight: 500;">${safeName}</div>
                    </div>
                    <div style="margin-bottom: 25px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Reply To</div>
                        <div style="font-size: 16px;">${safeEmail}</div>
                    </div>
                    <div style="padding: 20px; background: #f8f0ff; border-radius: 12px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 8px;">Message</div>
                        <div style="font-size: 15px; color: #444; white-space: pre-wrap;">${safeMessage}</div>
                    </div>
                </div>
                <div style="background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    Received via Portfolio Contact Form • ${new Date().toISOString()}
                </div>
            </div>
        </div>`;

        await mailer.transporter.sendMail({
            from: `"Portfolio Notifications" <${mailer.user}>`,
            to: data.hero.email,
            replyTo: email,
            subject: `✨ ${mood} from ${name}`,
            text: `New message from ${name} (${email}) [${mood}]:\n\n${message}`,
            html,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Mail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
__F__

put next.config.ts <<'__F__'
import type { NextConfig } from "next";

/**
 * A strict Content-Security-Policy is not set here on purpose: the layout uses
 * a small inline script (accent colour before first paint) and JSON-LD, which
 * need a per-request nonce. Add one through the proxy if you want CSP.
 */
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
    reactCompiler: true,
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
};

export default nextConfig;
__F__

if [ ! -f .env.example ]; then
  put .env.example <<'__F__'
# Required in production. At least 32 random characters. Example: openssl rand -base64 48
SESSION_SECRET=

# Contact form (Gmail SMTP). EMAIL_PASS must be a Google "app password".
EMAIL_USER=
EMAIL_PASS=

# Public site URL, used for canonical links, sitemap and Open Graph.
# On Vercel, VERCEL_PROJECT_PRODUCTION_URL is used when this is empty.
NEXT_PUBLIC_SITE_URL=

# Admin login credentials: the admin auth route was not part of the reviewed
# source, so no variables are listed here. Check src/app/api/admin/auth/login.
__F__
else
  SKIPPED+=(".env.example already exists (not modified)")
fi

touch .gitignore
for entry in ".redesign-backup/" "backups/" "playwright-report/" "test-results/" ".env" ".env.local"; do
  grep -qxF "$entry" .gitignore || { backup .gitignore; printf '%s\n' "$entry" >>.gitignore; CHANGED+=(".gitignore += $entry"); }
done

if [ ! -d src/app/admin ] && [ ! -d src/app/api/admin ]; then
  warn "No admin pages or admin API routes found in src/app. Hardening was applied in src/lib only."
  MANUAL+=("Admin routes (src/app/admin, src/app/api/admin) were not in the repo I could see. Confirm they use getSession/sessionOptions and the hardened data-utils helpers.")
fi
MANUAL+=("Set SESSION_SECRET (32+ chars), EMAIL_USER, EMAIL_PASS in your host's environment. The app now refuses to start sessions in production without SESSION_SECRET.")
MANUAL+=("Contact rate limiting is still per instance. A hard limit on serverless needs a shared store (for example Upstash Redis). I did not add one: no credentials exist in this repo.")
MANUAL+=("Rotate SESSION_SECRET if the old hardcoded fallback was ever used in production.")

############################################################################
# 3. CONFIGURATION CONSISTENCY
############################################################################
log "3/12 Configuration: package.json scripts, ESLint, Tailwind v4"

backup package.json
node - <<'__JS__'
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
const before = JSON.stringify(p);
delete p.ignoreScripts; // not a valid package.json field
p.scripts = { ...p.scripts, typecheck: "tsc --noEmit", "test:e2e": "playwright test" };
if (JSON.stringify(p) !== before) fs.writeFileSync("package.json", JSON.stringify(p, null, 4) + "\n");
__JS__

if ! ls eslint.config.* .eslintrc* >/dev/null 2>&1; then
  put eslint.config.mjs <<'__F__'
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".redesign-backup/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
__F__
else
  SKIPPED+=("ESLint config exists. Add '.redesign-backup/**' to its ignores if lint picks up backups.")
fi

GLOBALS=src/app/globals.css
if [ -f "$GLOBALS" ]; then
  if ! grep -rqE '@custom-variant[[:space:]]+dark' src --include='*.css'; then
    backup "$GLOBALS"
    printf '\n/* Tailwind v4: make dark: variants follow the .dark class set by next-themes. */\n@custom-variant dark (&:where(.dark, .dark *));\n' >>"$GLOBALS"
    CHANGED+=("$GLOBALS += @custom-variant dark")
  fi
else
  warn "src/app/globals.css not found. Could not verify the Tailwind v4 dark variant."
fi

############################################################################
# 4. LAYOUT & RESPONSIVENESS
############################################################################
log "4/12 Layout and mobile fixes"

put src/components/ui/Screen.tsx <<'__F__'
import type { ReactNode } from "react";

/**
 * Full-height section. It is at least one viewport tall and grows with its
 * content, so nothing is clipped on short laptops, phones or landscape.
 */
export default function Screen({
    id,
    as: Tag = "section",
    children,
    className = "",
}: {
    id?: string;
    as?: "section" | "footer";
    children: ReactNode;
    className?: string;
}) {
    return (
        <Tag
            id={id}
            className={`relative box-border flex min-h-svh w-full max-w-[100vw] flex-col overflow-x-clip border-t border-border bg-background ${className}`}
        >
            {children}
        </Tag>
    );
}
__F__

patch <<'__P__'
@@FILE src/components/section/about/about.tsx
@@FIND
flex h-screen max-h-screen w-full max-w-[100vw] flex-col overflow-hidden
@@WITH
flex min-h-svh w-full max-w-[100vw] flex-col overflow-x-clip lg:h-svh lg:max-h-svh lg:overflow-hidden
@@END
@@FIND
className="text-base leading-7 text-muted-foreground max-lg:hidden [@media(max-height:680px)]:hidden"
@@WITH
className="text-base leading-7 text-muted-foreground"
@@END
@@FIND
className="mb-[clamp(0.5rem,2vh,1.25rem)] max-[400px]:hidden [@media(max-height:700px)]:max-lg:hidden"
@@WITH
className="mb-[clamp(0.5rem,2vh,1.25rem)]"
@@END
@@FIND
relative min-h-0 flex-1 rounded-[1.5rem]
@@WITH
relative min-h-[26rem] flex-1 rounded-[1.5rem] sm:min-h-[30rem] lg:min-h-0
@@END
@@FIND
grid-rows-[auto_minmax(0,1fr)]
@@WITH
grid-rows-[auto_auto]
@@END

@@FILE src/components/section/hero/Hero.tsx
@@FIND
 lg:h-screen lg:max-h-screen lg:h-screen lg:max-h-screen
@@WITH

@@END

@@FILE src/components/section/project/Projects.tsx
@@FIND
px-8 pb-20 pt-12 sm:px-20 lg:pb-28 lg:pt-16
@@WITH
px-4 pb-20 pt-12 sm:px-6 lg:pb-28 lg:pt-16
@@END
@@FIND
className="mt-8 grid lg:mt-12
@@WITH
className="mx-auto mt-8 grid max-w-6xl lg:mt-12
@@END

@@FILE src/components/section/navbar/Navbar.tsx
@@FIND
const EXPANDED_MAX = 720; // px
@@WITH
const EXPANDED_MAX = 880; // px
@@END
@@FIND
className="hidden items-center gap-0.5 md:flex"
@@WITH
className="hidden items-center gap-0.5 lg:flex"
@@END
@@FIND
focus-visible:ring-primary/60 md:hidden"
@@WITH
focus-visible:ring-primary/60 lg:hidden"
@@END
@@FIND
grid h-9 w-9 place-items-center rounded-full text-muted-foreground
@@WITH
grid h-11 w-11 place-items-center rounded-full text-muted-foreground
@@END

@@FILE src/app/not-found.tsx
@@FIND
bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)]
@@WITH
bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_70%)]
@@END
@@FIND
shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]
@@WITH
shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_30%,transparent)]
@@END
@@FIND
transition={{ repeat: Infinity, duration: 0.2 }}
@@WITH
transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.8 }}
@@END

@@FILE src/components/hero/NightSky.tsx
@@FIND
attributeFilter: ["class", "data-theme"],
@@WITH
attributeFilter: ["class", "data-theme", "style"],
@@END
@@FIND
document.addEventListener("pointerleave", onLeave);
@@WITH
document.documentElement.addEventListener("mouseleave", onLeave);
@@END
@@FIND
document.removeEventListener("pointerleave", onLeave);
@@WITH
document.documentElement.removeEventListener("mouseleave", onLeave);
@@END
__P__

# Touch targets and minimum text size.
for f in $(grep -rlE 'text-\[(10|11)px\]' src/components 2>/dev/null || true); do
  backup "$f"; sed -i.bak -E 's/text-\[(10|11)px\]/text-xs/g' "$f" && rm -f "$f.bak"; CHANGED+=("text-xs minimum size: $f")
done

############################################################################
# 5. HERO COPY, PROJECTS, SKILLS, EXPERIENCE CONTENT
############################################################################
log "5/12 Recruiter-focused content"

patch <<'__P__'
@@FILE src/components/section/hero/Hero.tsx
@@FIND
import Eyebrow from "@/components/ui/Eyebrow";
@@WITH
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
@@END
@@FIND
<Eyebrow>Open to work</Eyebrow>
@@WITH
<Eyebrow>Open to full-stack roles</Eyebrow>
@@END
@@FIND
<span className="text-primary">AI</span> Full Stack Developer
@@WITH
Full-Stack <span className="text-primary">Developer</span>
@@END
@@FIND
const WORDS = ["products", "agents", "interfaces", "systems"];
@@WITH
const WORDS = ["products", "APIs", "interfaces", "systems"];
@@END
@@FIND
const STICKERS = [
    { label: "Next.js", tilt: -4 },
    { label: "TypeScript", tilt: 3 },
    { label: "AI agents", tilt: -2 },
    { label: "Spring Boot", tilt: 4 },
];
@@WITH
const STICKERS = [
    { label: "Java", tilt: -4 },
    { label: "Spring Boot", tilt: 3 },
    { label: "React", tilt: -2 },
    { label: "TypeScript", tilt: 4 },
];
@@END
@@FIND
<Stickers reduce={reduce} />
@@WITH
<Stickers reduce={reduce} />

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <PlayButton href="#projects" variant="solid">
                        See Hermes, my main project
                    </PlayButton>
                    <PlayButton href="#contact">Get in touch</PlayButton>
                </div>
@@END
__P__

put src/content/projects.ts <<'__F__'
export const copy = {
    badge: "Projects",
    headingTop: "Things I've",
    headingBottom: "built.",
    hintFine: "Scroll",
    hintTouch: "Swipe down through the builds.",
    outroTitle: "There is more where this came from.",
    outroText: "Every repo, commit and experiment lives on my GitHub.",
    outroCta: "Open GitHub",
    githubProfile: "https://github.com/Raunak7888",
    comingSoon: "Public link coming soon",
    caseStudy: "Read case study",
};

export type StatusKind = "live" | "active" | "building";
export type LinkKind = "repo" | "live" | "post";
export type SceneId = "cipher" | "foil" | "loupe" | "forge";

export type Metric = { value: number | string; suffix?: string; label: string };
export type ProjectLink = { kind: LinkKind; label: string; href: string };

export type Project = {
    id: string;
    name: string;
    kind: string;
    tint: string;
    status: StatusKind;
    scene: SceneId;
    cardLine: string;
    summary: string;
    chips: string[];
    bullets: string[];
    metrics: Metric[];
    links: ProjectLink[];
    caseStudy: string;
    image?: string;
    imageAlt?: string;
    readout: string;
};

export const STATUS: Record<StatusKind, { label: string; color: string }> = {
    live: { label: "Live", color: "oklch(0.72 0.17 150)" },
    active: { label: "Active", color: "oklch(0.68 0.14 235)" },
    building: { label: "In development", color: "oklch(0.72 0.16 75)" },
};

export const PROJECTS: Project[] = [
    {
        id: "hermes",
        name: "Hermes",
        kind: "Featured · Full-stack app",
        tint: "oklch(0.68 0.14 235)",
        status: "live",
        scene: "cipher",
        cardLine: "Private chats the server cannot read.",
        summary:
            "A real-time chat platform with end-to-end encrypted private messages and group chat. It runs on a self-managed k3s cluster on GCP that I provisioned and configured myself. Group messages are not end-to-end encrypted.",
        chips: ["Java", "Spring Boot", "React", "TypeScript", "k3s"],
        bullets: [
            "Private chats: ECDH P-256 key exchange and AES-GCM per message, in the browser",
            "Real-time chat over WebSocket/STOMP with presence and typing indicators",
            "Redis sliding-window rate limiting per user",
            "Terraform and Ansible provision the GCP cluster. A GitHub Actions pipeline with Trivy scans is written and not yet switched on",
        ],
        metrics: [
            { value: 2, label: "GCP VMs" },
            { value: 24, suffix: "h", label: "message history" },
            { value: "AES-GCM", label: "private chat encryption" },
        ],
        links: [
            { kind: "live", label: "Live demo", href: "https://23.236.54.241.nip.io/" },
            { kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Hermes" },
        ],
        caseStudy: "/projects/hermes",
        image: "/uploads/hermes1.png",
        imageAlt: "Hermes chat interface showing a private conversation",
        readout: "hover · watch it seal",
    },
    {
        id: "pokeverse",
        name: "Pokeverse",
        kind: "Game platform",
        tint: "oklch(0.72 0.16 75)",
        status: "active",
        scene: "foil",
        cardLine: "One platform, many multiplayer games.",
        summary:
            "A real-time multiplayer platform that provides the shared parts (authentication, rooms, event routing, chat and state) so each new game only has to bring its own rules. One game module exists so far.",
        chips: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Redis"],
        bullets: [
            "Shared auth, rooms, chat and event routing for every game",
            "PostgreSQL 17 with Flyway for history, Redis for live scores",
            "Pokémon Quiz in single-player and room-based multiplayer",
            "Game modules plug in and bring only their own rules",
        ],
        metrics: [
            { value: 2, label: "data stores" },
            { value: 1, label: "game module" },
            { value: "STOMP", label: "room events" },
        ],
        links: [{ kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Pokeverse" }],
        caseStudy: "/projects/pokeverse",
        image: "/uploads/pokeverse1.png",
        imageAlt: "Pokeverse Pokémon Quiz game screen",
        readout: "hover · tilt the card",
    },
    {
        id: "calculate",
        name: "Calculate",
        kind: "Python library",
        tint: "oklch(0.68 0.17 10)",
        status: "active",
        scene: "loupe",
        cardLine: "A scientific calculator with no eval(), on purpose.",
        summary:
            "A scientific expression evaluator built from scratch with classic compiler techniques. It explores what really happens between typing an expression and seeing a number.",
        chips: ["Python 3.13", "Shunting-Yard", "RPN", "uv"],
        bullets: [
            "Tokenizer, implicit multiplication, Shunting-Yard, stack evaluator",
            "50+ functions and 70+ operators with domain checks",
            "100+ test cases and no external math dependencies",
            "Explained in a public Medium article",
        ],
        metrics: [
            { value: 50, suffix: "+", label: "functions" },
            { value: 70, suffix: "+", label: "operators" },
            { value: 100, suffix: "+", label: "test cases" },
        ],
        links: [
            { kind: "repo", label: "Source", href: "https://github.com/Raunak7888/Calculate" },
            {
                kind: "post",
                label: "Article",
                href: "https://medium.com/@raunakyadav7888/how-i-built-a-better-calculator-using-the-shunting-yard-algorithm-b359b8826045",
            },
        ],
        caseStudy: "/projects/calculate",
        image: "/uploads/calculate1.png",
        imageAlt: "Calculate expression evaluator test output",
        readout: "hover · loupe 2.2×",
    },
    {
        id: "algoforge",
        name: "AlgoForge",
        kind: "In development · AI dev tool",
        tint: "oklch(0.66 0.17 295)",
        status: "building",
        scene: "forge",
        cardLine: "Code in, explanation and visualization out.",
        summary:
            "Work in progress. An AI-assisted code understanding tool that aims to turn source code into structured explanations and algorithm visualizations. No public link yet.",
        chips: ["Next.js", "Express", "Prisma", "Gemini"],
        bullets: [
            "Separate stages: analysis, visualization JSON, rendering",
            "ForgeCode turns code and AI analysis into visualizer JSON",
            "Workspace drafts, explanation sessions and usage quotas",
            "SHA-256 deduplication, reported at about 60% less duplicate processing",
        ],
        metrics: [
            { value: 60, suffix: "%", label: "reported less duplicate work" },
            { value: 3, label: "pipeline stages" },
            { value: "JSON", label: "visualizer contract" },
        ],
        links: [],
        caseStudy: "/projects/algoforge",
        readout: "hover · pipeline sketch",
    },
];

export const TOTAL = PROJECTS.length;
__F__

put src/content/skills.ts <<'__F__'
export const copy = {
    badge: "Skills",
    headingTop: "The toolbox",
    headingBottom: "I build with.",
    hintFine: "Click a tile, or move with the arrow keys.",
    hintTouch: "Tap a tile to see how I use it.",
    emptyTitle: "Pick a tile",
    emptyText: "See how I use it and what it pairs with.",
    done: "Whole toolbox explored 🎉",
};

export type CatId = "languages" | "backend" | "frontend" | "tooling";
export type FilterId = CatId | "all";

export type Category = {
    id: FilterId;
    label: string;
    blurb: string;
    tint: string;
};

export const CATEGORIES: Category[] = [
    { id: "all", label: "All", blurb: "Everything in the box.", tint: "var(--primary)" },
    { id: "languages", label: "Languages", blurb: "What I write most of my code in.", tint: "oklch(0.72 0.16 75)" },
    { id: "backend", label: "Backend", blurb: "Where the data and the logic live.", tint: "oklch(0.68 0.17 10)" },
    { id: "frontend", label: "Frontend", blurb: "What people actually see and touch.", tint: "oklch(0.68 0.14 235)" },
    { id: "tooling", label: "Infra & delivery", blurb: "How Hermes gets built, shipped and run.", tint: "oklch(0.66 0.17 295)" },
];

export const LEVELS = ["Learning", "Comfortable", "Strong", "Daily driver"] as const;

export type Skill = {
    id: string;
    name: string;
    mark: string;
    cat: CatId;
    level: 1 | 2 | 3 | 4;
    note: string;
    usedIn?: string;
    related: string[];
};

/**
 * Levels are self-assessed. Review them before publishing.
 * Every note points at a real project in this portfolio.
 */
export const SKILLS: Skill[] = [
    {
        id: "java", name: "Java", mark: "Ja", cat: "languages", level: 3,
        note: "Where I started, and what I use for every backend. It taught me to think in types, objects and structure.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "sql"],
    },
    {
        id: "typescript", name: "TypeScript", mark: "TS", cat: "languages", level: 4,
        note: "Types catch my mistakes before users do. I reach for it on every frontend.",
        usedIn: "This portfolio, Hermes UI, AlgoForge",
        related: ["react", "next", "javascript"],
    },
    {
        id: "javascript", name: "JavaScript", mark: "JS", cat: "languages", level: 3,
        note: "The language underneath it all. I like knowing what the compiler is hiding.",
        related: ["typescript", "react", "next"],
    },
    {
        id: "python", name: "Python", mark: "Py", cat: "languages", level: 2,
        note: "For small, sharp tools. Calculate is a parser and evaluator with 100+ tests.",
        usedIn: "Calculate",
        related: ["java", "typescript", "docker"],
    },
    {
        id: "spring", name: "Spring Boot", mark: "Sb", cat: "backend", level: 3,
        note: "REST, WebSocket/STOMP, Security and JPA. My go-to backend, learned by building and breaking things.",
        usedIn: "Hermes, Pokeverse",
        related: ["java", "rest", "sql", "redis"],
    },
    {
        id: "rest", name: "REST APIs", mark: "API", cat: "backend", level: 3,
        note: "Clear routes, predictable responses, plus JWT and Google OAuth2 sign-in.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "next", "sql"],
    },
    {
        id: "sql", name: "SQL", mark: "SQL", cat: "backend", level: 2,
        note: "MySQL in Hermes. PostgreSQL with Flyway migrations in Pokeverse.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "java"],
    },
    {
        id: "redis", name: "Redis", mark: "Rd", cat: "backend", level: 2,
        note: "Rate limiting, caching and live game state.",
        usedIn: "Hermes, Pokeverse",
        related: ["spring", "rest", "docker"],
    },
    {
        id: "react", name: "React", mark: "Re", cat: "frontend", level: 4,
        note: "Where I fell for the frontend. Small components that compose into whole screens.",
        usedIn: "This portfolio, Hermes, Pokeverse",
        related: ["typescript", "next", "tailwind"],
    },
    {
        id: "next", name: "Next.js", mark: "Nx", cat: "frontend", level: 4,
        note: "Routing, rendering and deployment in one place, so I can focus on the product.",
        usedIn: "This portfolio, Pokeverse, AlgoForge",
        related: ["react", "typescript", "tailwind"],
    },
    {
        id: "tailwind", name: "Tailwind CSS", mark: "Tw", cat: "frontend", level: 4,
        note: "Utility classes keep spacing and colour consistent without leaving the markup.",
        usedIn: "This portfolio, Pokeverse",
        related: ["react", "next", "framer"],
    },
    {
        id: "framer", name: "Framer Motion", mark: "Fm", cat: "frontend", level: 3,
        note: "Springs and gestures that respond to the visitor instead of looping on their own.",
        usedIn: "This portfolio",
        related: ["react", "tailwind", "typescript"],
    },
    {
        id: "docker", name: "Docker", mark: "Dk", cat: "tooling", level: 3,
        note: "Multi-stage builds, non-root users and Compose for local development.",
        usedIn: "Hermes, Pokeverse",
        related: ["kubernetes", "ci", "spring"],
    },
    {
        id: "kubernetes", name: "Kubernetes (k3s)", mark: "K8", cat: "tooling", level: 2,
        note: "A two-VM k3s cluster on GCP: deployments, ingress and default-deny network policies.",
        usedIn: "Hermes",
        related: ["docker", "terraform", "ci"],
    },
    {
        id: "ci", name: "GitHub Actions", mark: "CI", cat: "tooling", level: 2,
        note: "A pipeline for Hermes: tests, Trivy scan, Docker build and rollout. Written, not yet switched on.",
        usedIn: "Hermes",
        related: ["docker", "kubernetes", "terraform"],
    },
    {
        id: "terraform", name: "Terraform & Ansible", mark: "Tf", cat: "tooling", level: 2,
        note: "Terraform builds the GCP network and VMs. Ansible sets up k3s, hardening and monitoring.",
        usedIn: "Hermes",
        related: ["kubernetes", "docker", "ci"],
    },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const CAT_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const COLS = 4;
__F__

put src/content/experience.ts <<'__F__'
/**
 * VERIFY BEFORE PUBLISHING: wording, dates and whether the employer allows the
 * product name to be shown. Nothing here is invented, but it is a summary.
 */
export const copy = {
    badge: "Experience",
    headingTop: "Where I've",
    headingBottom: "learned.",
};

export const education = {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "DAV Institute of Management, Faridabad",
    year: "2026",
};

export const experience = [
    {
        role: "Software Developer Intern",
        org: "ILN Global",
        period: "2026",
        summary: "Frontend and backend work on Tatito Health+, a healthcare platform with a Django backend and a JavaScript frontend.",
        points: [
            "Built a clinic version of an existing hospital dashboard.",
            "Reworked the doctor page: appointment booking, fee discounts and reviews. Booking now happens only after payment succeeds.",
            "Working on Doctor Management: automatic, unique doctor IDs.",
        ],
        stack: ["JavaScript", "Vite", "Django"],
    },
];

export const writing = [
    {
        title: "How I built a better calculator using the Shunting-Yard algorithm",
        source: "Medium",
        href: "https://medium.com/@raunakyadav7888/how-i-built-a-better-calculator-using-the-shunting-yard-algorithm-b359b8826045",
    },
];
__F__

patch <<'__P__'
@@FILE src/content/site.ts
@@FIND
        { label: "Projects", href: "#projects" },
@@WITH
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
@@END

@@FILE src/components/section/contact/contact.tsx
@@FIND
<Eyebrow index="04">Contact</Eyebrow>
@@WITH
<Eyebrow index="05">Contact</Eyebrow>
@@END
__P__

if [ -n "$EXP_ICON" ]; then
patch <<'__P__'
@@FILE src/components/section/navbar/Navbar.tsx
@@FIND
    Mail01Icon,
    Menu01Icon,
@@WITH
    Mail01Icon,
    Menu01Icon,
    %%EXP_ICON%%,
@@END
@@FIND
    { id: "projects", label: "Projects", icon: Folder01Icon },
@@WITH
    { id: "projects", label: "Projects", icon: Folder01Icon },
    { id: "experience", label: "Experience", icon: %%EXP_ICON%% },
@@END
__P__
fi

MANUAL+=("Review src/content/experience.ts (internship wording and dates), src/content/skills.ts (self-assessed levels) and src/content/projects.ts. Confirm you may show the Tatito Health+ name.")
MANUAL+=("Hermes: group chat is not end-to-end encrypted, and the CI pipeline is still in .github-example. The copy now says so. Activate the pipeline, then update the Hermes bullet and the GitHub Actions skill note.")

############################################################################
# 6. THEME SYSTEM
############################################################################
log "6/12 Theme: View Transitions, accent contrast, toggle"

put src/lib/accent.ts <<'__F__'
export const ACCENT_STORAGE_KEY = "theme-primary";

export type Accent = { name: string; value: string };

export const ACCENTS: Accent[] = [
    { name: "Deep Purple", value: "#7C3AED" },
    { name: "Sky Blue", value: "#0EA5E9" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Burnt Orange", value: "#EA580C" },
    { name: "Rose Red", value: "#EF4444" },
];

export const DEFAULT_ACCENT = ACCENTS[0].value;

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

function channel(v: number) {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function toRgb(hex: string): [number, number, number] {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

/** Pick white or near-black text, whichever has the higher contrast on `hex`. */
export function readableOn(hex: string): "#ffffff" | "#0a0a0a" {
    const [r, g, b] = toRgb(hex);
    const L = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    return 1.05 / (L + 0.05) >= (L + 0.05) / 0.05 ? "#ffffff" : "#0a0a0a";
}

/**
 * Sets --primary, --primary-rgb and a readable --primary-foreground.
 * The same maths runs in the inline script in app/layout.tsx (before first paint).
 */
export function applyAccent(hex: string) {
    if (!isHex(hex)) return;
    const [r, g, b] = toRgb(hex);
    const s = document.documentElement.style;
    s.setProperty("--primary", hex);
    s.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
    s.setProperty("--primary-foreground", readableOn(hex));
}

export function readStoredAccent(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const v = window.localStorage.getItem(ACCENT_STORAGE_KEY);
        return isHex(v) ? v : null;
    } catch {
        return null;
    }
}

export function storeAccent(hex: string) {
    try {
        window.localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } catch {
        /* storage blocked: the choice just won't persist */
    }
}
__F__

put src/lib/view-transition.ts <<'__F__'
import { flushSync } from "react-dom";

type ViewTransitionLike = { ready: Promise<void> };
export type Origin = { x: number; y: number };

/**
 * Runs `update` inside the View Transitions API with a circular reveal.
 * Falls back to a plain update when the API is missing or the visitor
 * prefers reduced motion.
 */
export function runViewTransition(update: () => void, origin?: Origin, duration = 550) {
    const doc = document as Document & {
        startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof doc.startViewTransition !== "function") {
        update();
        return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = doc.startViewTransition(() => {
        flushSync(update);
    });
    transition.ready
        .then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
            );
        })
        .catch(() => {});
}
__F__

# Compatibility shim: keeps the old import path working, with no GSAP.
put src/components/ThemeTransitionLayer.tsx <<'__F__'
import { runViewTransition, type Origin } from "@/lib/view-transition";

export type TransitionType = "theme" | "accent";

/** Kept for compatibility. The View Transitions API needs no overlay element. */
export function ThemeTransitionLayer() {
    return null;
}

export function runThemeTransition(_type: TransitionType, action: () => void, origin?: Origin) {
    runViewTransition(action, origin);
}
__F__

put src/components/ThemeToggle.tsx <<'__F__'
"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { runViewTransition } from "@/lib/view-transition";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useMounted();

    // Reserve the space so the navbar does not jump after mount.
    if (!mounted) return <span aria-hidden className="size-11" />;

    const dark = resolvedTheme !== "light";

    const toggle = (e: MouseEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        runViewTransition(() => setTheme(dark ? "light" : "dark"), {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-11 place-items-center rounded-full outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
        >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
__F__

put src/components/section/navbar/AccentChanger.tsx <<'__F__'
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ACCENTS, DEFAULT_ACCENT, applyAccent, readStoredAccent, storeAccent } from "@/lib/accent";
import { runViewTransition } from "@/lib/view-transition";

const panel: Variants = {
    hidden: { opacity: 0, y: -8, scale: 0.94, transition: { duration: 0.12 } },
    visible: {
        opacity: 1,
        y: 4,
        scale: 1,
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.035 },
    },
};

const bead: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

/**
 * Accent colour picker. The inline script in app/layout.tsx applies the saved
 * colour before first paint; this component only changes it.
 * This component mounts after hydration, so reading localStorage in the
 * initialiser is safe.
 */
export default function ThemeColorPicker() {
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState<string>(() => readStoredAccent() ?? DEFAULT_ACCENT);
    const wrapRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    useEffect(
        () => () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        },
        [],
    );

    const clearTimer = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const select = useCallback(
        (hex: string, el: HTMLElement) => {
            setOpen(false);
            if (hex === color) return;
            const r = el.getBoundingClientRect();
            runViewTransition(
                () => {
                    applyAccent(hex);
                    storeAccent(hex);
                    setColor(hex);
                },
                { x: r.left + r.width / 2, y: r.top + r.height / 2 },
                450,
            );
        },
        [color],
    );

    const current = ACCENTS.find((a) => a.value === color)?.name ?? "Custom";

    return (
        <div
            ref={wrapRef}
            className="relative flex flex-col items-center"
            onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
                setOpen(true);
            }}
            onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
                closeTimer.current = setTimeout(() => setOpen(false), 140);
            }}
        >
            <button
                type="button"
                aria-label={`Accent colour: ${current}. Change`}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="grid size-11 place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
            >
                <span className="size-5 rounded-full bg-primary ring-2 ring-background ring-offset-1 ring-offset-primary/30" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="accent-panel"
                        role="group"
                        aria-label="Accent colour options"
                        variants={panel}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute left-1/2 top-full z-[1001] mt-1 flex -translate-x-1/2 flex-col gap-0.5 rounded-full border border-border bg-background/85 p-1 shadow-xl backdrop-blur-xl"
                    >
                        {ACCENTS.map((c) => (
                            <motion.button
                                key={c.value}
                                type="button"
                                variants={bead}
                                aria-label={c.name}
                                aria-pressed={c.value === color}
                                title={c.name}
                                onClick={(e) => select(c.value, e.currentTarget)}
                                className="grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <span
                                    className={`size-5 rounded-full transition-transform hover:scale-125 ${
                                        c.value === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                />
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
__F__

put src/components/PageTransition.tsx <<'__F__'
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import data from "@/Data/Data.json";

/** Shutter wipe on route changes only. Skipped for reduced motion and first load. */
export default function PageTransition() {
    const pathname = usePathname();
    const reduce = useReducedMotion();
    const previous = useRef(pathname);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (previous.current === pathname) return;
        previous.current = pathname;
        if (reduce) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVisible(true);
        const timeout = window.setTimeout(() => setIsVisible(false), 400);
        return () => window.clearTimeout(timeout);
    }, [pathname, reduce]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="shutter"
                    aria-hidden
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
                    style={{ originY: 0 }}
                    className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-primary"
                >
                    <div className="text-[60vh] font-black italic tracking-tighter text-primary-foreground">
                        {data.hero.firstName[0]}.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
__F__

patch <<'__P__'
@@FILE src/components/Provider.tsx
@@FIND
import { ThemeTransitionLayer } from "@/components/ThemeTransitionLayer";
@@WITH

@@END
@@FIND
                <ThemeTransitionLayer />
@@WITH

@@END
__P__

put src/styles/polish.css <<'__F__'
/* Design tokens and cross-cutting polish. Loaded after design-system.css and redesign.css. */

:root {
    /* three radius levels */
    --ds-radius-sm: 0.75rem;
    --ds-radius-md: 1.25rem;
    --ds-radius-lg: 2rem;
    /* shared hard-shadow tokens (neo-brutalist) */
    --ds-shadow-sm: 3px 3px 0 0 var(--foreground);
    --ds-shadow-md: 6px 6px 0 0 var(--foreground);
    --ds-shadow-lg: 9px 9px 0 0 var(--foreground);
    --ds-border: 2px;
}

html {
    scroll-padding-top: 5rem;
}

/* View Transitions: the circular reveal is driven from JS (lib/view-transition.ts). */
::view-transition-old(root),
::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
}
::view-transition-old(root) {
    z-index: 1;
}
::view-transition-new(root) {
    z-index: 2;
}

@layer base {
    :focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }
}

/* Shared card primitive. */
.ds-card {
    border: var(--ds-border) solid var(--foreground);
    border-radius: var(--ds-radius-md);
    background: var(--background);
    box-shadow: var(--ds-shadow-md);
    transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.ds-card--lift:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--ds-shadow-lg);
}

/* Timeline spine used by the Experience section. */
.ds-spine {
    position: relative;
}
.ds-spine::before {
    content: "";
    position: absolute;
    left: 0.4rem;
    top: 0.5rem;
    bottom: 0.5rem;
    border-left: 2px dashed color-mix(in oklab, var(--foreground) 35%, transparent);
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .ds-card--lift:hover {
        transform: none;
    }
}
__F__

############################################################################
# 7. PERFORMANCE: fonts, images, lazy loading
############################################################################
log "7/12 Performance: fonts, layout, images"

# Keep only the fonts that are referenced somewhere besides layout.tsx.
FONT_IMPORT=""; FONT_DECLS=""; FONT_VARS=""; DROPPED=()
while IFS='|' read -r id name cssvar weights; do
  [ -z "$id" ] && continue
  if grep -rqF -- "$cssvar" src --exclude=layout.tsx 2>/dev/null; then
    FONT_IMPORT+=", $name"
    FONT_DECLS+="$(printf 'const %s = %s({ variable: "%s", subsets: ["latin"], weight: %s, display: "swap" });' "$id" "$name" "$cssvar" "$weights")"$'\n'
    FONT_VARS+="$(printf ' ${%s.variable}' "$id")"
  else
    DROPPED+=("$name")
  fi
done <<'__FONTS__'
bungee|Bungee|--font-bungee|["400"]
nunito|Nunito|--font-nunito|["400"]
mitr|Mitr|--font-mitr|["200","300","400","500","600","700"]
modak|Modak|--font-modak|["400"]
jersey|Jersey_25|--font-jersey|["400"]
luckiest|Luckiest_Guy|--font-luckiest|["400"]
madimi|Madimi_One|--font-madimi|["400"]
krona|Krona_One|--font-krona|["400"]
aclonica|Aclonica|--font-aclonica|["400"]
mogra|Mogra|--font-mogra|["400"]
lemon|Lemon|--font-lemon|["400"]
piedra|Piedra|--font-piedra|["400"]
poetsen|Poetsen_One|--font-poetsen|["400"]
__FONTS__
[ ${#DROPPED[@]} -gt 0 ] && log "Dropping unused fonts: ${DROPPED[*]}"

cat >"$TOOLS/layout.tmpl" <<'__F__'
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/redesign.css";
import "@/styles/polish.css";
import { Instrument_Serif, JetBrains_Mono, Outfit%%FONT_IMPORT%% } from "next/font/google";
import { Providers } from "@/components/Provider";
import data from "@/Data/Data.json";
import { SITE_URL } from "@/lib/seo";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    style: ["normal", "italic"],
    variable: "--font-serif",
    display: "swap",
});
%%FONT_DECLS%%
const title = "Raunak Yadav | Full-Stack Developer";
const description =
    "Raunak Yadav is a full-stack developer from Delhi NCR. Java, Spring Boot, React and TypeScript. Main project: Hermes, an end-to-end encrypted chat app.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | Raunak Yadav" },
    description,
    authors: [{ name: "Raunak Yadav" }],
    keywords: ["Raunak Yadav", "full-stack developer", "Java", "Spring Boot", "React", "TypeScript", "Next.js"],
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", siteName: "Raunak Yadav", type: "website", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    ],
};

/*
 * Apply the saved accent colour before first paint, so it never flashes.
 * Same contrast maths as readableOn() in lib/accent.ts.
 */
const accentScript =
    "(function(){try{var c=localStorage.getItem('theme-primary');if(c&&/^#[0-9a-fA-F]{6}$/.test(c)){var h=c.slice(1),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),f=function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)},L=0.2126*f(r)+0.7152*f(g)+0.0722*f(b),s=document.documentElement.style;s.setProperty('--primary',c);s.setProperty('--primary-rgb',r+', '+g+', '+b);s.setProperty('--primary-foreground',1.05/(L+0.05)>=(L+0.05)/0.05?'#ffffff':'#0a0a0a')}}catch(e){}})();";

const links = data.heroSection.socialLinks;
const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.hero.fullName,
    url: SITE_URL,
    jobTitle: "Full-Stack Developer",
    email: `mailto:${data.hero.email}`,
    sameAs: [links.githubUrl, links.linkedInUrl, links.instagramUrl],
    alumniOf: { "@type": "CollegeOrUniversity", name: "DAV Institute of Management, Faridabad" },
    knowsAbout: ["Java", "Spring Boot", "React", "TypeScript", "Next.js"],
};
const personJson = JSON.stringify(personLd).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${outfit.className} ${outfit.variable} ${mono.variable} ${serif.variable}%%FONT_VARS%% antialiased overflow-x-hidden`}
            >
                <script dangerouslySetInnerHTML={{ __html: accentScript }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJson }} />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
__F__
FONT_IMPORT="$FONT_IMPORT" FONT_DECLS="$FONT_DECLS" FONT_VARS="$FONT_VARS" node -e '
const fs=require("fs");let t=fs.readFileSync(process.argv[1],"utf8");
t=t.replace("%%FONT_IMPORT%%",()=>process.env.FONT_IMPORT).replace("%%FONT_DECLS%%",()=>process.env.FONT_DECLS).replace("%%FONT_VARS%%",()=>process.env.FONT_VARS);
process.stdout.write(t)' "$TOOLS/layout.tmpl" >"$TOOLS/layout.out"
put src/app/layout.tsx <"$TOOLS/layout.out"

# Image conversion: PNG -> WebP next to the original (originals are kept).
if [ "${CONVERT_IMAGES:-1}" = "1" ] && [ -d public/uploads ]; then
  cat >"$TOOLS/img.mjs" <<'__JS__'
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(path.join(process.cwd(), "package.json"));
let sharp; try { sharp = require("sharp"); } catch { console.log("sharp not available. Skipping."); process.exit(0); }
const dir = "public/uploads";
const converted = [];
for (const f of fs.readdirSync(dir)) {
  if (!/\.png$/i.test(f)) continue;
  const out = path.join(dir, f.replace(/\.png$/i, ".webp"));
  if (!fs.existsSync(out)) {
    try { await sharp(path.join(dir, f)).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out); }
    catch (e) { console.log("  failed " + f + ": " + e.message); continue; }
  }
  converted.push(f);
}
const targets = ["src/content/projects.ts", "src/Data/Data.json", "src/Data/Project.json"].filter((p) => fs.existsSync(p));
for (const t of targets) {
  let c = fs.readFileSync(t, "utf8"); const o = c;
  for (const f of converted) c = c.replaceAll("/uploads/" + f, "/uploads/" + f.replace(/\.png$/i, ".webp"));
  if (c !== o) {
    const d = path.join(process.env.BACKUP_DIR, t);
    if (!fs.existsSync(d)) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(t, d); }
    fs.writeFileSync(t, c); console.log("  updated image references in " + t);
  }
}
console.log(`  ${converted.length} PNG file(s) have WebP versions`);
__JS__
  log "Converting uploads to WebP (set CONVERT_IMAGES=0 to skip)"
  node "$TOOLS/img.mjs" || warn "Image conversion failed. Originals untouched."
  CHANGED+=("public/uploads: WebP versions added; references updated")
fi

patch <<'__P__'
@@FILE src/components/section/project/ProjectScenes.tsx
@@FIND
alt={`${project.name} screenshot`}
@@WITH
alt={project.imageAlt ?? `${project.name} screenshot`}
                    loading="lazy"
                    decoding="async"
@@END

@@FILE src/components/section/project/Projects.tsx
@@FIND
    useReducedMotion,
    useSpring,
@@WITH
    useInView,
    useReducedMotion,
    useSpring,
@@END
@@BETWEEN
function CountUp({ to, suffix, reduce }: { to: number; suffix?: string; reduce: boolean }) {
@@TO
   ICONS
@@WITH
function CountUp({ to, suffix, reduce }: { to: number; suffix?: string; reduce: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const mv = useMotionValue(reduce ? to : 0);
    const text = useTransform(mv, (v) => Math.round(v).toString());

    useEffect(() => {
        if (reduce) {
            mv.set(to);
            return;
        }
        if (!inView) return; // count only once the number is on screen
        const controls = animate(mv, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [to, reduce, inView, mv]);

    return (
        <span ref={ref} className="tabular-nums">
            <motion.span>{text}</motion.span>
            {suffix}
        </span>
    );
}

/* ==========================================================================
   ICONS
@@END
__P__

############################################################################
# 8. SEO
############################################################################
log "8/12 SEO: metadata helpers, sitemap, robots, Open Graph image"

put src/lib/seo.ts <<'__F__'
/**
 * Canonical site URL. Order: NEXT_PUBLIC_SITE_URL, then Vercel's production
 * URL, then localhost. Set NEXT_PUBLIC_SITE_URL for any other host.
 */
function resolveSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, "");
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`.replace(/\/+$/, "");
    return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
__F__

put src/app/robots.ts <<'__F__'
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
__F__

HAVE_CASE_STUDIES=false
if [ -d src/app/projects ]; then
  SKIPPED+=("src/app/projects already exists: case-study route left untouched")
  HAVE_CASE_STUDIES=true
else
  HAVE_CASE_STUDIES=true
fi

put src/app/sitemap.ts <<__F__
import type { MetadataRoute } from "next";
import projects from "@/Data/Project.json";
import { SITE_URL } from "@/lib/seo";

const INCLUDE_PROJECTS = $HAVE_CASE_STUDIES;

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const entries: MetadataRoute.Sitemap = [{ url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 }];
    if (INCLUDE_PROJECTS) {
        for (const slug of Object.keys(projects)) {
            entries.push({ url: \`\${SITE_URL}/projects/\${slug}\`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
        }
    }
    return entries;
}
__F__

put src/app/opengraph-image.tsx <<'__F__'
import { ImageResponse } from "next/og";

export const alt = "Raunak Yadav, Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 64,
                    background: "#0a0a0a",
                    color: "#fafafa",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#a1a1aa" }}>
                    Portfolio
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", fontSize: 120, fontWeight: 700, lineHeight: 1.05 }}>
                        Raunak Yadav<span style={{ color: "#7C3AED" }}>.</span>
                    </div>
                    <div style={{ display: "flex", fontSize: 48, marginTop: 16 }}>Full-Stack Developer</div>
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 32,
                        padding: "16px 28px",
                        border: "4px solid #fafafa",
                        boxShadow: "10px 10px 0 0 #7C3AED",
                        alignSelf: "flex-start",
                    }}
                >
                    Java · Spring Boot · React · TypeScript
                </div>
            </div>
        ),
        size,
    );
}
__F__
MANUAL+=("Set NEXT_PUBLIC_SITE_URL to your real domain. Until then canonical, sitemap and Open Graph URLs use VERCEL_PROJECT_PRODUCTION_URL or localhost.")

############################################################################
# 9. DESIGN SYSTEM & REUSABLE COMPONENTS
############################################################################
log "9/12 Design system, Experience section, shared primitives"

put src/lib/ds.ts <<'__F__'
/** Shared neo-brutalist class strings. One definition instead of copies in each section. */
export const chunky =
    "border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--foreground)] motion-reduce:transition-none";
__F__

patch <<'__P__'
@@FILE src/components/section/contact/contact.tsx
@@FIND
const chunky =
    "border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--foreground)] motion-reduce:transition-none";

@@WITH
@@END
@@FIND
import { site } from "@/content/site";
@@WITH
import { site } from "@/content/site";
import { chunky } from "@/lib/ds";
@@END

@@FILE src/components/section/footer/footer.tsx
@@FIND
const chunky =
    "border-2 border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--foreground)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--foreground)] motion-reduce:transition-none";

@@WITH
@@END
@@FIND
import { site } from "@/content/site";
@@WITH
import { site } from "@/content/site";
import { chunky } from "@/lib/ds";
@@END
@@FIND
<Screen id="footer">
@@WITH
<Screen id="footer" as="footer">
@@END

@@FILE src/components/ui/PlayButton.tsx
@@FIND
    solid: "bg-[color:var(--tint,var(--primary))] text-[oklch(0.2_0_0)]",
@@WITH
    solid: "bg-[color:var(--tint,var(--primary))] text-[color:var(--on-tint,var(--primary-foreground))]",
@@END

@@FILE src/components/section/project/Projects.tsx
@@FINDALL
const tintVars = { "--tint": project.tint } as CSSProperties;
@@WITH
const tintVars = { "--tint": project.tint, "--on-tint": "oklch(0.2 0 0)" } as CSSProperties;
@@END
__P__

# Skills: use the neo-brutalist SkillTile.tsx instead of the duplicate inline tile.
patch <<'__P__'
@@FILE src/components/section/skill/Skills.tsx
@@FIND
import Headline from "@/components/ui/Headline";
@@WITH
import Headline from "@/components/ui/Headline";
import SkillTile from "@/components/section/skill/SkillTile";
@@END
@@FIND
const tiltSpring = { stiffness: 220, damping: 16 } as const;

@@WITH
@@END
@@BETWEEN
type TileCustom = { i: number; tilt: number };
@@TO
   CONFETTI
@@WITH
/* ==========================================================================
   CONFETTI
@@END
@@BETWEEN
   SKILL TILE
@@TO
   INSPECTOR
@@WITH
   SKILL TILE
   Implemented in SkillTile.tsx.
   ========================================================================== */

/* ==========================================================================
   INSPECTOR
@@END
__P__

put src/components/section/experience/Experience.tsx <<'__F__'
"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { copy, education, experience, writing } from "@/content/experience";
import { fade, stackLoose, viewportOnce } from "@/lib/motion";

export default function Experience() {
    const reduce = !!useReducedMotion();

    return (
        <section id="experience" className="relative border-t border-border bg-background px-4 py-16 sm:px-6 lg:py-24">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-12">
                <SectionHeader index="04" label={copy.badge} top={copy.headingTop} bottom={copy.headingBottom} reduce={reduce} />

                <motion.div
                    initial={reduce ? "show" : "hidden"}
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={stackLoose}
                    className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:gap-8"
                >
                    <motion.div variants={fade} className="ds-spine flex flex-col gap-6 pl-7">
                        {experience.map((job) => (
                            <article key={job.role + job.org} className="ds-card ds-card--lift relative p-5 sm:p-6">
                                <span aria-hidden className="absolute -left-[1.85rem] top-6 flex size-3.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex size-3.5 rounded-full border-2 border-foreground bg-primary" />
                                </span>
                                <p className="ds-eyebrow text-primary">{job.period}</p>
                                <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                                    {job.role} <span className="ds-serif text-primary">at {job.org}</span>
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{job.summary}</p>
                                <ul className="mt-4 flex flex-col gap-2 text-sm leading-6 sm:text-base">
                                    {job.points.map((p) => (
                                        <li key={p} className="flex gap-3">
                                            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="mt-5 flex flex-wrap gap-2">
                                    {job.stack.map((s) => (
                                        <li key={s} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </motion.div>

                    <motion.div variants={fade} className="flex flex-col gap-6">
                        <article className="ds-card p-5 sm:p-6">
                            <p className="ds-eyebrow text-primary">Education · {education.year}</p>
                            <h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{education.degree}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{education.school}</p>
                        </article>

                        <article className="ds-card p-5 sm:p-6">
                            <p className="ds-eyebrow text-primary">Writing</p>
                            <ul className="mt-2 flex flex-col gap-3">
                                {writing.map((w) => (
                                    <li key={w.href}>
                                        <a
                                            href={w.href}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="group inline-flex flex-col gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            <span className="text-base font-semibold leading-snug underline-offset-4 group-hover:underline">
                                                {w.title}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{w.source} ↗</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
__F__

put src/app/page.tsx <<'__F__'
import About from "@/components/section/about/about";
import Contact from "@/components/section/contact/contact";
import Experience from "@/components/section/experience/Experience";
import Footer from "@/components/section/footer/footer";
import Hero from "@/components/section/hero/Hero";
import Projects from "@/components/section/project/Projects";
import Skills from "@/components/section/skill/Skills";
import Marquee from "@/components/ui/Marquee";
import { site } from "@/content/site";

/**
 * Server component. The page-wide cursor spotlight was removed: it duplicated
 * the About spotlight and the Hero night sky. Each section keeps one
 * distinctive effect instead.
 */
export default function Page() {
    return (
        <div className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
            <Hero />
            <Marquee items={site.stack} />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
            <Footer />
        </div>
    );
}
__F__

# Case-study route: only created when the repo has no /projects route.
if [ ! -d src/app/projects ]; then
put "src/app/projects/[slug]/page.tsx" <<'__F__'
/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import raw from "@/Data/Project.json";

type Study = {
    meta: { projectName: string; status?: string; live?: string; repository?: string; post?: string };
    images?: string[];
    executiveSummary: {
        oneLiner: string;
        problemStatement: string;
        solutionOverview: string;
        keyCapabilities: string[];
        knownLimitations: string[];
    };
    roadmap?: { shortTerm?: string[]; midTerm?: string[]; longTerm?: string[] };
};

const studies = raw as unknown as Record<string, Study>;

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(studies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const s = studies[slug];
    if (!s) return {};
    return {
        title: s.meta.projectName,
        description: s.executiveSummary.oneLiner,
        alternates: { canonical: `/projects/${slug}` },
    };
}

function List({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
                {items.map((i) => (
                    <li key={i} className="flex gap-3 text-base leading-7 text-foreground/85">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{i}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const s = studies[slug];
    if (!s) notFound();
    const { meta, executiveSummary: e, roadmap } = s;

    return (
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
            <a href="/#projects" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                ← Back to projects
            </a>

            <div className="mt-6">
                <Eyebrow>{meta.status ? `Status: ${meta.status}` : "Case study"}</Eyebrow>
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                <span className="ds-serif text-primary">{meta.projectName}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{e.oneLiner}</p>

            <div className="mt-6 flex flex-wrap gap-3">
                {meta.live ? (
                    <PlayButton href={meta.live} variant="solid" external>
                        Live demo
                    </PlayButton>
                ) : null}
                {meta.repository ? (
                    <PlayButton href={meta.repository} external>
                        Source
                    </PlayButton>
                ) : null}
                {meta.post ? (
                    <PlayButton href={meta.post} external>
                        Article
                    </PlayButton>
                ) : null}
            </div>

            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The problem</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.problemStatement}</p>
            </section>
            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The solution</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.solutionOverview}</p>
            </section>

            <List title="What it does" items={e.keyCapabilities} />
            <List title="Known limitations" items={e.knownLimitations} />

            {s.images && s.images.length > 0 ? (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {s.images.map((src, i) => (
                            <img
                                key={src}
                                src={src}
                                alt={`${meta.projectName} screenshot ${i + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full rounded-[var(--ds-radius-sm)] border-2 border-foreground"
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            <List title="Next up" items={roadmap?.shortTerm} />
            <List title="Later" items={[...(roadmap?.midTerm ?? []), ...(roadmap?.longTerm ?? [])]} />
        </article>
    );
}
__F__
  MANUAL+=("src/app/projects did not exist, so /projects/<slug> case-study pages were generated from src/Data/Project.json. Replace them if you have your own pages.")
fi

############################################################################
# 10. DEAD-CODE CLEANUP AND DEPENDENCIES
############################################################################
log "10/12 Cleanup: unused files, imports, dependencies"

file_used() { # file_used <basename-without-ext>
  grep -rqE --include='*.ts' --include='*.tsx' "from ['\"][^'\"]*/$1['\"]" src
}
for f in src/components/ui/GlassButton.tsx src/components/ui/Reveal.tsx src/components/ui/Backdrop.tsx; do
  base="$(basename "$f" .tsx)"
  if [ -f "$f" ]; then
    if file_used "$base"; then SKIPPED+=("kept $f (still imported)"); else retire "$f"; fi
  fi
done
if [ -f src/types/types.ts ] && [ ! -s src/types/types.ts ]; then retire src/types/types.ts; fi

# GSAP: delete the helper only when nothing imports it any more.
if [ -f src/lib/gsap.ts ]; then
  if grep -rqE "(@/lib/gsap|from ['\"]gsap)" src --include='*.ts' --include='*.tsx' --exclude=gsap.ts; then
    SKIPPED+=("kept src/lib/gsap.ts (still imported somewhere)")
  else retire src/lib/gsap.ts; fi
fi

# Tailwind v4 ignores tailwind.config.ts unless a CSS file loads it with @config.
if [ -f tailwind.config.ts ]; then
  if grep -rqE '@config' src --include='*.css'; then SKIPPED+=("kept tailwind.config.ts (loaded via @config)")
  elif grep -rqE 'animate-float' src; then SKIPPED+=("kept tailwind.config.ts (animate-float-* used, but v4 ignores this file. Port the keyframes into CSS)"); MANUAL+=("tailwind.config.ts is ignored by Tailwind v4 but animate-float-* classes exist. Move those keyframes into CSS @theme.")
  else retire tailwind.config.ts; fi
fi

log "Pruning unused imports"
node "$TOOLS/prune.mjs"

# Unused dependencies: removed only when no source or config file references them.
used_in() {
  grep -rsEq --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.mjs' --include='*.cjs' --include='*.css' --include='*.mdx' \
    "(from|import|require|@plugin|@import)[[:space:]]*\(?[\"']$1([/\"'])" src app pages ./*.ts ./*.mjs ./*.js ./*.cjs 2>/dev/null
}
REMOVE=()
while read -r pkg; do
  [ -z "$pkg" ] && continue
  if ! used_in "$pkg"; then REMOVE+=("$pkg"); else SKIPPED+=("kept dependency $pkg (referenced in source)"); fi
done < <(node -e '
const p=require("./package.json");const all=Object.keys(p.dependencies||{});
const cand=new Set(["motion","styled-components","cobe","uuid","react-icons","@xyflow/react","react-hook-form","@hookform/resolvers","zod","class-variance-authority","tailwindcss-animate","mermaid","gsap"]);
for(const d of all){ if(cand.has(d)||d.startsWith("@dnd-kit/")||d.startsWith("@radix-ui/")) console.log(d); }')

############################################################################
# 11. TESTS AND CI
############################################################################
log "11/12 Playwright smoke tests and CI"

put playwright.config.ts <<'__F__'
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "on-first-retry" },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
    ],
    // Run `build` first. This serves the production build.
    webServer: {
        command: `npx next start -H 127.0.0.1 -p ${PORT}`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
__F__

put e2e/smoke.spec.ts <<'__F__'
import { expect, test } from "@playwright/test";

test("home page renders the name and every section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Raunak Yadav/);
    await expect(page.getByRole("heading", { level: 1, name: "Raunak Yadav" })).toBeVisible();
    for (const id of ["about", "skills", "projects", "experience", "contact"]) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
});

test("no horizontal scrolling", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
});

test("contact form shows validation errors", async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /post it/i }).click();
    await expect(page.getByText("What should I call you?")).toBeVisible();
});

test("contact API rejects invalid input", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { name: "", email: "nope", message: "" } });
    expect(res.status()).toBe(400);
});

test("theme toggle switches the theme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /switch to light theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
});

test("robots.txt and sitemap.xml exist", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBeTruthy();
    expect((await request.get("/sitemap.xml")).ok()).toBeTruthy();
});
__F__

case "$PM" in
  npm)  CI_SETUP=""; CI_INSTALL="npm ci"; CI_RUN="npm run";;
  pnpm) CI_SETUP=$'      - uses: pnpm/action-setup@v4\n'; CI_INSTALL="pnpm install --frozen-lockfile"; CI_RUN="pnpm run";;
  yarn) CI_SETUP=""; CI_INSTALL="yarn install --frozen-lockfile"; CI_RUN="yarn";;
  bun)  CI_SETUP=$'      - uses: oven-sh/setup-bun@v2\n'; CI_INSTALL="bun install --frozen-lockfile"; CI_RUN="bun run";;
esac
CI_CACHE=""; case "$PM" in npm|pnpm|yarn) CI_CACHE="          cache: $PM";; esac

put .github/workflows/ci.yml <<__F__
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
$CI_SETUP      - uses: actions/setup-node@v4
        with:
          node-version: 22
$CI_CACHE
      - run: $CI_INSTALL
      - run: $CI_RUN lint
      - run: $CI_RUN typecheck
      - run: $CI_RUN build
      - name: Install Playwright browser
        run: npx playwright install --with-deps chromium
      - name: Smoke tests
        run: $CI_RUN test:e2e
__F__
# Remove the blank line left when no cache is configured.
if [ -z "$CI_CACHE" ]; then sed -i.bak '/^$/{N;/^\n      - run:/!b};' .github/workflows/ci.yml 2>/dev/null || true; rm -f .github/workflows/ci.yml.bak; fi

############################################################################
# Dependencies (after all source edits, so usage checks see the final state)
############################################################################
log "Dependencies: React 19 alignment, Playwright, unused removals"
backup package.json
for lock in package-lock.json pnpm-lock.yaml yarn.lock bun.lock bun.lockb; do [ -f "$lock" ] && backup "$lock"; done

REACT_RANGE="$(node -p 'require("./package.json").dependencies.react || ""')"
if [[ "$REACT_RANGE" =~ ^[^0-9]*18 ]]; then
  log "React is $REACT_RANGE but Next 16 and @types/react are v19. Upgrading to React 19."
  pm_add "react@^19.2.0" "react-dom@^19.2.0" || warn "React upgrade failed. Run it manually."
  CHANGED+=("react, react-dom -> ^19.2.0")
fi
if ! node -e 'process.exit(require("./package.json").devDependencies?.["@playwright/test"]?0:1)'; then
  pm_add_dev @playwright/test || warn "Could not add @playwright/test."
  CHANGED+=("added @playwright/test")
fi
if [ ${#REMOVE[@]} -gt 0 ]; then
  log "Removing unused dependencies: ${REMOVE[*]}"
  pm_rm "${REMOVE[@]}" || warn "Dependency removal failed. Remove manually: ${REMOVE[*]}"
  CHANGED+=("removed dependencies: ${REMOVE[*]}")
fi
MANUAL+=("If a removed dependency is needed by admin or project pages not in this repo snapshot, re-add it with $PM. Backups are in $BACKUP_DIR.")

############################################################################
# 12. VERIFY
############################################################################
log "12/12 Verification: lint, typecheck, production build"
FAILED_STEPS=0
run_step() {
  local name="$1"; shift
  log "running: $name"
  if "$@"; then RESULTS+=("PASS  $name"); else RESULTS+=("FAIL  $name"); FAILED_STEPS=1; fi
}
run_step "lint"      pm_run lint
run_step "typecheck" pm_run typecheck
run_step "build"     pm_run build

if [ "${RUN_E2E:-0}" = "1" ]; then
  run_step "playwright install" npx playwright install chromium
  run_step "e2e"                pm_run test:e2e
else
  RESULTS+=("SKIP  e2e (run: RUN_E2E=1 ./redesign.sh, or: npx playwright install chromium && $PM run test:e2e)")
fi

############################################################################
# Report
############################################################################
echo
log "================ REPORT ================"
echo "Backups: $BACKUP_DIR"
echo
echo "Changed (${#CHANGED[@]}):"; for x in "${CHANGED[@]}"; do echo "  + $x"; done
echo
echo "Skipped / kept (${#SKIPPED[@]}):"; for x in "${SKIPPED[@]}"; do echo "  - $x"; done
echo
if [ -s "$FAIL_LOG" ]; then
  echo "Patches that did NOT apply (the source differs from what I read):"
  sed 's/^/  ! /' "$FAIL_LOG"
  echo
fi
echo "Checks:"; for x in "${RESULTS[@]}"; do echo "  $x"; done
echo
echo "Manual follow-up:"; for x in "${MANUAL[@]}"; do echo "  * $x"; done
MANUAL_NOTES=(
  "Not changed (could not be verified): CSS files (design-system.css, redesign.css, globals.css), admin pages, any existing /projects pages, Vercel/host settings."
  "Not added: Content-Security-Policy (needs a nonce for the inline accent script), Upstash rate limiting (no credentials), a formatter (none configured)."
  "Check visually: About on phones (board now has a minimum height), Navbar with six links, and Hermes copy."
)
for x in "${MANUAL_NOTES[@]}"; do echo "  * $x"; done
echo

if [ -s "$FAIL_LOG" ] || [ "$FAILED_STEPS" -ne 0 ]; then
  warn "Finished with problems. See above. Restore any file from $BACKUP_DIR if needed."
  exit 2
fi
log "Done. All checks passed."