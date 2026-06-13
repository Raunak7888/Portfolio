"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface ProjectMeta {
  projectName: string;
  codename: string;
  version: string;
  status: string;
  lastUpdated: string;
  maintainers: string[];
  repository: string;
  license: string;
  post: string;
}

interface ExecutiveSummary {
  oneLiner: string;
  problemStatement: string;
  solutionOverview: string;
  primaryUsers: string[];
  keyCapabilities: string[];
  knownLimitations: string[];
}

interface ArchitectureComponent {
  name: string;
  type: string;
  responsibilities: string[];
  tech: string[];
}

interface DataFlow {
  flowName: string;
  steps: string[];
}

interface Architecture {
  overview: string;
  diagram: { type: string; content: string };
  components: ArchitectureComponent[];
  dataFlow: DataFlow[];
  architectureRationale: string;
}

interface TechEntry {
  name: string;
  version: string;
  purpose: string;
  tradeOffs: string;
}

interface TechStack {
  backend: TechEntry[];
  frontend: TechEntry[];
  infrastructure: string[];
  rejectedAlternatives: { option: string; reasonRejected: string }[];
}

interface Roadmap {
  shortTerm: string[];
  midTerm: string[];
  longTerm: string[];
}

interface ProjectFull {
  meta: ProjectMeta;
  images: string[];
  executiveSummary: ExecutiveSummary;
  architecture: Architecture;
  technologyStack?: TechStack;
  roadmap: Roadmap;
}

interface Props {
  projectKey: string;
  initialData: ProjectFull;
  isNew?: boolean;
}

/* ── Helper components ─────────────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  rows?: number;
}) {
  const cls =
    "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all";
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          className={`${cls} resize-none`} placeholder={placeholder} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className={cls} placeholder={placeholder} />
      )}
    </div>
  );
}

function StringArrayEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  function update(idx: number, val: string) {
    const arr = [...items];
    arr[idx] = val;
    onChange(arr);
  }
  function add() { onChange([...items, ""]); }
  function remove(idx: number) { onChange(items.filter((_, i) => i !== idx)); }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
        <button onClick={add} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Add</button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input value={item} onChange={(e) => update(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
            <button onClick={() => remove(idx)} className="text-white/20 hover:text-red-400 transition-colors text-sm px-1">✕</button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-white/20 italic">Empty. Click + Add.</p>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/6 bg-white/2 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</h2>
      {children}
    </section>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export function ProjectDetailEditor({ projectKey, initialData, isNew = false }: Props) {
  const router = useRouter();
  const [proj, setProj] = useState<ProjectFull>(initialData);
  const [key, setKey] = useState(projectKey);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  function setMeta<K extends keyof ProjectMeta>(k: K, v: ProjectMeta[K]) {
    setProj((p) => ({ ...p, meta: { ...p.meta, [k]: v } }));
  }

  function setSummary<K extends keyof ExecutiveSummary>(k: K, v: ExecutiveSummary[K]) {
    setProj((p) => ({ ...p, executiveSummary: { ...p.executiveSummary, [k]: v } }));
  }

  function setRoadmap<K extends keyof Roadmap>(k: K, v: string[]) {
    setProj((p) => ({ ...p, roadmap: { ...p.roadmap, [k]: v } }));
  }

  function setArchOverview(v: string) {
    setProj((p) => ({ ...p, architecture: { ...p.architecture, overview: v } }));
  }

  function setArchDiagram(v: string) {
    setProj((p) => ({
      ...p,
      architecture: {
        ...p.architecture,
        diagram: { ...p.architecture.diagram, content: v },
      },
    }));
  }

  function setArchRationale(v: string) {
    setProj((p) => ({ ...p, architecture: { ...p.architecture, architectureRationale: v } }));
  }

  async function handleSave() {
    if (!key.trim()) { showToast("err", "Project key is required"); return; }
    setSaving(true);
    try {
      const payload = { [key.trim()]: proj };
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      showToast("ok", `Saved. Backup: ${json.backupPath}`);
      if (isNew) {
        router.push(`/admin/projects/${key.trim()}`);
      }
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/projects" className="text-white/30 hover:text-white/60 text-sm transition-colors">
              ← Projects
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-white">
            {isNew ? "New Project" : `Edit: ${proj.meta.projectName}`}
          </h1>
          <p className="text-sm text-white/40 mt-1">Project key: <span className="font-mono text-indigo-400">{key || "—"}</span></p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {toast && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          toast.type === "ok"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Project key (for new only) */}
      {isNew && (
        <Section title="Project Key">
          <Field
            label="Key (used as JSON object key, no spaces)"
            value={key}
            onChange={setKey}
            placeholder="e.g. myproject"
          />
          <p className="text-xs text-white/30">This is the key in Project.json. Use lowercase, no spaces.</p>
        </Section>
      )}

      {/* Meta */}
      <Section title="Meta">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Project Name" value={proj.meta.projectName} onChange={(v) => setMeta("projectName", v)} />
          <Field label="Codename" value={proj.meta.codename} onChange={(v) => setMeta("codename", v)} />
          <Field label="Version" value={proj.meta.version} onChange={(v) => setMeta("version", v)} />
          <Field label="Status" value={proj.meta.status} onChange={(v) => setMeta("status", v)} placeholder="active / inactive" />
          <Field label="Last Updated" value={proj.meta.lastUpdated} onChange={(v) => setMeta("lastUpdated", v)} placeholder="YYYY-MM-DD" />
          <Field label="License" value={proj.meta.license} onChange={(v) => setMeta("license", v)} placeholder="MIT" />
        </div>
        <Field label="Repository URL" value={proj.meta.repository} onChange={(v) => setMeta("repository", v)} placeholder="https://github.com/..." />
        <Field label="Post / Article URL" value={proj.meta.post} onChange={(v) => setMeta("post", v)} placeholder="https://medium.com/..." />
        <StringArrayEditor
          label="Maintainers"
          items={proj.meta.maintainers}
          onChange={(v) => setMeta("maintainers", v)}
          placeholder="Name"
        />
      </Section>

      {/* Images */}
      <Section title="Images">
        <StringArrayEditor
          label="Image URLs"
          items={proj.images}
          onChange={(v) => setProj((p) => ({ ...p, images: v }))}
          placeholder="https://... or /uploads/..."
        />
      </Section>

      {/* Executive Summary */}
      <Section title="Executive Summary">
        <Field label="One Liner" value={proj.executiveSummary.oneLiner} onChange={(v) => setSummary("oneLiner", v)} />
        <Field label="Problem Statement" value={proj.executiveSummary.problemStatement} onChange={(v) => setSummary("problemStatement", v)} rows={2} />
        <Field label="Solution Overview" value={proj.executiveSummary.solutionOverview} onChange={(v) => setSummary("solutionOverview", v)} rows={3} />
        <StringArrayEditor label="Primary Users" items={proj.executiveSummary.primaryUsers} onChange={(v) => setSummary("primaryUsers", v)} placeholder="User type" />
        <StringArrayEditor label="Key Capabilities" items={proj.executiveSummary.keyCapabilities} onChange={(v) => setSummary("keyCapabilities", v)} placeholder="Capability" />
        <StringArrayEditor label="Known Limitations" items={proj.executiveSummary.knownLimitations} onChange={(v) => setSummary("knownLimitations", v)} placeholder="Limitation" />
      </Section>

      {/* Architecture */}
      <Section title="Architecture">
        <Field label="Overview" value={proj.architecture.overview} onChange={setArchOverview} rows={2} />
        <Field
          label="Mermaid Diagram (content)"
          value={proj.architecture.diagram.content}
          onChange={setArchDiagram}
          rows={8}
          placeholder="graph LR\n  A --> B"
        />
        <Field label="Architecture Rationale" value={proj.architecture.architectureRationale} onChange={setArchRationale} rows={2} />
      </Section>

      {/* Roadmap */}
      <Section title="Roadmap">
        <StringArrayEditor label="Short Term" items={proj.roadmap.shortTerm} onChange={(v) => setRoadmap("shortTerm", v)} placeholder="Goal" />
        <StringArrayEditor label="Mid Term" items={proj.roadmap.midTerm} onChange={(v) => setRoadmap("midTerm", v)} placeholder="Goal" />
        <StringArrayEditor label="Long Term" items={proj.roadmap.longTerm} onChange={(v) => setRoadmap("longTerm", v)} placeholder="Goal" />
      </Section>

      {/* Save button at bottom too */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}