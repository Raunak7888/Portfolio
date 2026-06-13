"use client";

import { useState, useRef } from "react";

interface ResumeInfo {
  exists: boolean;
  filename: string | null;
  url: string | null;
  size: number | null;
  modified: string | null;
}

interface Props {
  initialInfo: ResumeInfo;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ResumeEditor({ initialInfo }: Props) {
  const [info, setInfo] = useState<ResumeInfo>(initialInfo);
  const [customName, setCustomName] = useState(
    initialInfo.filename ?? "Raunak_Yadav_Resume.pdf"
  );
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  async function uploadResume(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("err", "Only PDF files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast("err", "File too large. Max 20 MB.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (customName.trim()) fd.append("filename", customName.trim());

      const res = await fetch("/api/admin/resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");

      setInfo({
        exists: true,
        filename: json.filename,
        url: json.url,
        size: file.size,
        modified: new Date().toISOString(),
      });
      showToast(
        "ok",
        `Uploaded as "${json.filename}".${json.backupPath ? ` Old backup: ${json.backupPath}` : ""}`
      );
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadResume(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadResume(file);
  }

  async function handleDelete() {
    if (!confirm("Delete the current resume? A backup will be saved to /backups.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/resume", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setInfo({ exists: false, filename: null, url: null, size: null, modified: null });
      showToast("ok", `Deleted. Backup saved to ${json.backupPath}`);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Resume Manager</h1>
        <p className="text-sm text-white/40 mt-1">
          Upload a new PDF to replace the existing resume in <code className="text-indigo-400 text-xs">/public</code>.
          The old file is automatically backed up to <code className="text-indigo-400 text-xs">/backups</code>.
        </p>
      </div>

      {toast && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Current resume info */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Current Resume</h2>

        {info.exists ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-white/40">Filename</span>
                <span className="text-white/80 font-mono text-xs">{info.filename}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-white/40">Public URL</span>
                <a
                  href={info.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-mono text-xs transition-colors"
                >
                  {info.url} ↗
                </a>
              </div>
              {info.size !== null && (
                <div className="flex justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-white/40">Size</span>
                  <span className="text-white/80 text-xs">{formatBytes(info.size)}</span>
                </div>
              )}
              {info.modified && (
                <div className="flex justify-between py-2">
                  <span className="text-white/40">Last Modified</span>
                  <span className="text-white/80 text-xs">{formatDate(info.modified)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-xl px-4 py-2 transition-all disabled:opacity-40"
            >
              {deleting ? "Deleting…" : "Delete Resume"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-white/30 italic">
            No resume found in <code className="text-white/40">/public</code>. Upload one below.
          </p>
        )}
      </section>

      {/* Custom filename */}
      <section className="rounded-2xl border border-white/6 bg-white/[0.02] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Output Filename</h2>
        <p className="text-xs text-white/30">
          The uploaded PDF will be saved with this name in <code className="text-white/40">/public</code>.
          Leave blank to keep the original filename.
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Filename</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Raunak_Yadav_Resume.pdf"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
          />
        </div>
        <p className="text-xs text-white/20">
          The <code>.pdf</code> extension is added automatically if omitted. Special characters are replaced with underscores.
        </p>
      </section>

      {/* Upload area */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
          {info.exists ? "Replace Resume" : "Upload Resume"}
        </h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed transition-all p-10 text-center cursor-pointer select-none ${
            dragging
              ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
              : uploading
              ? "border-white/[0.08] bg-white/[0.02] text-white/30 cursor-not-allowed"
              : "border-white/[0.08] text-white/30 hover:border-white/[0.16] hover:text-white/50"
          }`}
        >
          {uploading ? (
            <p className="text-sm">Uploading…</p>
          ) : (
            <>
              <p className="text-sm">
                {info.exists
                  ? "Drag & drop a new PDF here, or click to select"
                  : "Drag & drop your resume PDF here, or click to select"}
              </p>
              <p className="text-xs mt-2 opacity-60">PDF only · Max 20 MB</p>
              {info.exists && (
                <p className="text-xs mt-2 text-amber-400/70">
                  The existing resume will be replaced. A backup is saved automatically.
                </p>
              )}
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </section>

      {/* How it works */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">How It Works</h2>
        <ol className="space-y-2 text-sm text-white/40 list-none">
          <li>1. The API scans <code className="text-white/50">/public</code> for any file matching <code className="text-white/50">*resume*.pdf</code> (case-insensitive).</li>
          <li>2. If found, the existing file is copied to <code className="text-white/50">/backups/filename.timestamp.pdf</code>.</li>
          <li>3. The old file is deleted from <code className="text-white/50">/public</code>.</li>
          <li>4. The new PDF is saved to <code className="text-white/50">/public/&lt;your-chosen-filename&gt;.pdf</code>.</li>
          <li>5. Your portfolio&apos;s resume download link will immediately serve the new file.</li>
        </ol>
        <p className="text-xs text-white/25 pt-1">
          No server restart required. Next.js serves static files from <code>/public</code> directly.
        </p>
      </section>
    </div>
  );
}