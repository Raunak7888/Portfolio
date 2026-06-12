"use client";

import { useState } from "react";
import Link from "next/link";

interface ProjectMeta {
  projectName: string;
  version: string;
  status: string;
  repository: string;
  license: string;
  post: string;
}

interface ProjectEntry {
  key: string;
  meta: ProjectMeta;
  tagline?: string;
  description?: string;
}

interface Props {
  initialProjects: ProjectEntry[];
}

export function ProjectsEditor({ initialProjects }: Props) {
  const [projects, setProjects] = useState<ProjectEntry[]>(initialProjects);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleDelete(key: string) {
    if (!confirm(`Delete project "${key}"? This cannot be undone.`)) return;
    setDeleting(key);
    try {
      const res = await fetch(`/api/admin/projects?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      setProjects((p) => p.filter((x) => x.key !== key));
      showToast("ok", `Project "${key}" deleted. Backup: ${json.backupPath}`);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleting(null);
    }
  }

  const STATUS_COLOR: Record<string, string> = {
    active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    inactive: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Projects Editor</h1>
          <p className="text-sm text-white/40 mt-1">
            Click a project to edit its full details.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
        >
          + New Project
        </Link>
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

      <div className="space-y-3">
        {projects.map((proj) => (
          <div
            key={proj.key}
            className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors"
          >
            {/* Icon placeholder */}
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-base flex-shrink-0">
              {proj.meta.projectName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white/90">{proj.meta.projectName}</span>
                <span className="text-xs font-mono text-white/20">v{proj.meta.version}</span>
                <span
                  className={`text-xs border rounded-full px-2 py-0.5 ${
                    STATUS_COLOR[proj.meta.status] ?? "text-white/30 bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  {proj.meta.status}
                </span>
              </div>
              <p className="text-xs text-white/40 truncate">
                {proj.description ?? proj.tagline ?? "—"}
              </p>
              {proj.meta.repository && (
                <a
                  href={proj.meta.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400/60 hover:text-indigo-400 transition-colors mt-0.5 inline-block"
                >
                  {proj.meta.repository}
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/admin/projects/${proj.key}`}
                className="text-xs text-white/50 hover:text-white/80 border border-white/[0.08] rounded-lg px-3 py-1.5 transition-all"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(proj.key)}
                disabled={deleting === proj.key}
                className="text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 rounded-lg px-3 py-1.5 transition-all disabled:opacity-40"
              >
                {deleting === proj.key ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">⬜</p>
            <p className="text-sm">No projects yet. Add your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}