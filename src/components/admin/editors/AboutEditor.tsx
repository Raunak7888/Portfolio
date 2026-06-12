"use client";

import { useState } from "react";

interface AboutSegment {
  id: string;
  title: string;
  label: string;
  text: string;
}

interface AboutData {
  about: {
    endingLine: string;
    segments: AboutSegment[];
  };
}

interface Props {
  initialData: AboutData;
}

export function AboutEditor({ initialData }: Props) {
  const [data, setData] = useState<AboutData>(initialData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function updateSegment(idx: number, key: keyof AboutSegment, val: string) {
    setData((d) => {
      const segs = [...d.about.segments];
      segs[idx] = { ...segs[idx], [key]: val };
      return { ...d, about: { ...d.about, segments: segs } };
    });
  }

  function addSegment() {
    const newId = String(data.about.segments.length + 1).padStart(2, "0");
    setData((d) => ({
      ...d,
      about: {
        ...d.about,
        segments: [
          ...d.about.segments,
          { id: newId, title: "", label: "", text: "" },
        ],
      },
    }));
  }

  function removeSegment(idx: number) {
    setData((d) => {
      const segs = d.about.segments.filter((_, i) => i !== idx);
      return { ...d, about: { ...d.about, segments: segs } };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about: data.about }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      showToast("ok", `Saved. Backup: ${json.backupPath}`);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">About Editor</h1>
          <p className="text-sm text-white/40 mt-1">Edit your about section segments and ending line.</p>
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

      {/* Ending line */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Ending Line</h2>
        <textarea
          value={data.about.endingLine}
          onChange={(e) =>
            setData((d) => ({ ...d, about: { ...d.about, endingLine: e.target.value } }))
          }
          rows={2}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
        />
      </section>

      {/* Segments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Segments ({data.about.segments.length})
          </h2>
          <button
            onClick={addSegment}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] text-sm text-white/50 hover:text-white/80 hover:border-white/[0.12] transition-all"
          >
            <span>+</span> Add Segment
          </button>
        </div>

        <div className="space-y-4">
          {data.about.segments.map((seg, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/30 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md">
                  #{seg.id || String(idx + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => removeSegment(idx)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">ID</label>
                  <input
                    value={seg.id}
                    onChange={(e) => updateSegment(idx, "id", e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Label</label>
                  <input
                    value={seg.label}
                    onChange={(e) => updateSegment(idx, "label", e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Title</label>
                <input
                  value={seg.title}
                  onChange={(e) => updateSegment(idx, "title", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Text</label>
                <textarea
                  value={seg.text}
                  onChange={(e) => updateSegment(idx, "text", e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Preview</h2>
        <div className="space-y-4">
          {data.about.segments.map((seg, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-white/20 font-mono pt-0.5">{seg.id}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white/80">{seg.title || "—"}</span>
                  <span className="text-xs text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 rounded-full px-2 py-0.5">
                    {seg.label || "—"}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{seg.text || "—"}</p>
              </div>
            </div>
          ))}
          <p className="text-sm italic text-white/50">{data.about.endingLine || "—"}</p>
        </div>
      </section>
    </div>
  );
}