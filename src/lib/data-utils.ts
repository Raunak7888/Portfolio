import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();
const DATA_JSON_PATH = path.join(PROJECT_ROOT, "src", "Data", "Data.json");
const PROJECT_JSON_PATH = path.join(PROJECT_ROOT, "src", "Data", "Project.json");
const BACKUPS_DIR = path.join(PROJECT_ROOT, "backups");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const UPLOADS_DIR = path.join(PROJECT_ROOT, "public", "uploads");

// ── Ensure directories exist ─────────────────────────────────────────────────

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ── Backup ───────────────────────────────────────────────────────────────────

function createBackup(filePath: string): string {
  ensureDir(BACKUPS_DIR);
  const filename = path.basename(filePath, ".json");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUPS_DIR, `${filename}.${timestamp}.json`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// ── Validate JSON ─────────────────────────────────────────────────────────────

function validateJSON(data: unknown): void {
  // Attempt round-trip to catch circular refs
  JSON.parse(JSON.stringify(data));
}

// ── Data.json ─────────────────────────────────────────────────────────────────

export function readDataJSON(): Record<string, unknown> {
  const raw = fs.readFileSync(DATA_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeDataJSON(data: Record<string, unknown>): { backupPath: string } {
  validateJSON(data);
  const backupPath = createBackup(DATA_JSON_PATH);
  fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(data, null, 4), "utf-8");
  return { backupPath };
}

// ── Project.json ──────────────────────────────────────────────────────────────

export function readProjectJSON(): Record<string, unknown> {
  const raw = fs.readFileSync(PROJECT_JSON_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeProjectJSON(data: Record<string, unknown>): { backupPath: string } {
  validateJSON(data);
  const backupPath = createBackup(PROJECT_JSON_PATH);
  fs.writeFileSync(PROJECT_JSON_PATH, JSON.stringify(data, null, 4), "utf-8");
  return { backupPath };
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaFile {
  name: string;
  path: string;      // absolute disk path
  url: string;       // web-accessible URL from /public
  size: number;      // bytes
  ext: string;
}

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);

function scanDir(dir: string, base: string): MediaFile[] {
  const results: MediaFile[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath, base));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        const relativePath = path.relative(base, fullPath);
        const stat = fs.statSync(fullPath);
        results.push({
          name: entry.name,
          path: fullPath,
          url: "/" + relativePath.replace(/\\/g, "/"),
          size: stat.size,
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
  // relativePath: e.g. /uploads/image.png  (starts with /)
  const safe = relativePath.replace(/^\/+/, "");
  const fullPath = path.join(PUBLIC_DIR, safe);
  // Ensure it stays inside public
  if (!fullPath.startsWith(PUBLIC_DIR)) {
    throw new Error("Invalid path");
  }
  if (!fs.existsSync(fullPath)) throw new Error("File not found");
  fs.unlinkSync(fullPath);
}

export function renameMediaFile(relativePath: string, newName: string): string {
  const safe = relativePath.replace(/^\/+/, "");
  const fullPath = path.join(PUBLIC_DIR, safe);
  if (!fullPath.startsWith(PUBLIC_DIR)) throw new Error("Invalid path");
  const dir = path.dirname(fullPath);
  const newPath = path.join(dir, newName);
  if (!newPath.startsWith(PUBLIC_DIR)) throw new Error("Invalid new name");
  fs.renameSync(fullPath, newPath);
  return "/" + path.relative(PUBLIC_DIR, newPath).replace(/\\/g, "/");
}

export function saveUploadedFile(
  buffer: Buffer,
  originalName: string
): { url: string; name: string } {
  ensureDir(UPLOADS_DIR);
  const ext = path.extname(originalName).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) throw new Error("Invalid file type");

  // Sanitize name and make unique with timestamp
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60);
  const timestamp = Date.now();
  const filename = `${base}_${timestamp}${ext}`;
  const fullPath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
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

  const dataStat = fs.statSync(DATA_JSON_PATH);
  const projStat = fs.statSync(PROJECT_JSON_PATH);
  const images = listMediaFiles();

  return {
    totalProjects: Object.keys(projects).length,
    totalSkills: data.skills?.skills?.length ?? 0,
    totalExperiences: data.experience?.length ?? 0,
    totalCertifications: data.certifications?.length ?? 0,
    totalImages: images.length,
    dataJsonModified: dataStat.mtime.toISOString(),
    projectJsonModified: projStat.mtime.toISOString(),
  };
}