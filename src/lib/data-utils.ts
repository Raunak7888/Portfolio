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
