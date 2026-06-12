"use client";

import { useState } from "react";

type SkillLevel = "Low" | "Moderate" | "High" | "Very High";

interface SkillData {
  label: string;
  icon_id: string;
  category: string;
  scalability: SkillLevel;
  debuggability: SkillLevel;
  consistency: SkillLevel;
  description: string;
}

interface Skill {
  id: string;
  type: string;
  data: SkillData;
}

interface SkillsJSON {
  skills: {
    tech_types: string[];
    skills: Skill[];
  };
}

interface Props {
  initialData: SkillsJSON;
}

const LEVELS: SkillLevel[] = ["Low", "Moderate", "High", "Very High"];
const LEVEL_COLORS: Record<SkillLevel, string> = {
  "Low": "text-red-400",
  "Moderate": "text-amber-400",
  "High": "text-emerald-400",
  "Very High": "text-indigo-400",
};

const BLANK_SKILL: Skill = {
  id: "",
  type: "tech",
  data: {
    label: "",
    icon_id: "",
    category: "Language",
    scalability: "Moderate",
    debuggability: "Moderate",
    consistency: "Moderate",
    description: "",
  },
};

function LevelSelect({ value, onChange }: { value: SkillLevel; onChange: (v: SkillLevel) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SkillLevel)}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
    >
      {LEVELS.map((l) => (
        <option key={l} value={l} className="bg-[#0a0a0a]">{l}</option>
      ))}
    </select>
  );
}

export function SkillsEditor({ initialData }: Props) {
  const [skills, setSkills] = useState<Skill[]>(initialData.skills.skills);
  const [techTypes, setTechTypes] = useState<string[]>(initialData.skills.tech_types);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<Skill | null>(null);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditBuf({ ...skills[idx], data: { ...skills[idx].data } });
  }

  function startAdd() {
    setEditingIdx(-1);
    setEditBuf({ ...BLANK_SKILL });
  }

  function cancelEdit() {
    setEditingIdx(null);
    setEditBuf(null);
  }

  function commitEdit() {
    if (!editBuf) return;
    if (editingIdx === -1) {
      setSkills((s) => [...s, editBuf]);
    } else if (editingIdx !== null) {
      setSkills((s) => s.map((sk, i) => (i === editingIdx ? editBuf : sk)));
    }
    cancelEdit();
  }

  function deleteSkill(idx: number) {
    if (!confirm("Delete this skill?")) return;
    setSkills((s) => s.filter((_, i) => i !== idx));
  }

  function moveSkill(idx: number, dir: -1 | 1) {
    const arr = [...skills];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setSkills(arr);
  }

  function setBuf(key: keyof SkillData, val: string) {
    if (!editBuf) return;
    setEditBuf({ ...editBuf, data: { ...editBuf.data, [key]: val } });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: { tech_types: techTypes, skills } }),
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

  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.data.category)))];
  const filtered = filterCat === "All" ? skills : skills.filter((s) => s.data.category === filterCat);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Skills Editor</h1>
          <p className="text-sm text-white/40 mt-1">Add, edit, reorder, and remove skills.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startAdd}
            className="px-3 py-2 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:text-white/90 hover:border-white/[0.14] transition-all"
          >
            + Add Skill
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
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

      {/* Edit modal */}
      {editBuf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editingIdx === -1 ? "Add Skill" : "Edit Skill"}
              </h3>
              <button onClick={cancelEdit} className="text-white/30 hover:text-white/60 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">ID (unique key)</label>
                <input
                  value={editBuf.id}
                  onChange={(e) => setEditBuf({ ...editBuf, id: e.target.value })}
                  placeholder="e.g. typescript"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Label</label>
                <input value={editBuf.data.label} onChange={(e) => setBuf("label", e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Icon ID</label>
                <input value={editBuf.data.icon_id} onChange={(e) => setBuf("icon_id", e.target.value)}
                  placeholder="SiTypescript"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Category</label>
                <input value={editBuf.data.category} onChange={(e) => setBuf("category", e.target.value)}
                  placeholder="Language"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Scalability</label>
                <LevelSelect value={editBuf.data.scalability} onChange={(v) => setBuf("scalability", v)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Debuggability</label>
                <LevelSelect value={editBuf.data.debuggability} onChange={(v) => setBuf("debuggability", v)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Consistency</label>
                <LevelSelect value={editBuf.data.consistency} onChange={(v) => setBuf("consistency", v)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description</label>
                <textarea value={editBuf.data.description} onChange={(e) => setBuf("description", e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={cancelEdit} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white/80 transition-all">
                Cancel
              </button>
              <button onClick={commitEdit} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors">
                {editingIdx === -1 ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              filterCat === cat
                ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-300"
                : "border border-white/[0.06] text-white/40 hover:text-white/70"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-white/30 self-center">{skills.length} total</span>
      </div>

      {/* Skills list */}
      <div className="space-y-2">
        {filtered.map((skill, displayIdx) => {
          const realIdx = skills.findIndex((s) => s === skill);
          return (
            <div
              key={skill.id || displayIdx}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors group"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveSkill(realIdx, -1)}
                  className="text-white/20 hover:text-white/60 text-xs transition-colors leading-none">▲</button>
                <button onClick={() => moveSkill(realIdx, 1)}
                  className="text-white/20 hover:text-white/60 text-xs transition-colors leading-none">▼</button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white/80">{skill.data.label}</span>
                  <span className="text-xs border border-white/[0.08] rounded-full px-2 py-0.5 text-white/30">
                    {skill.data.category}
                  </span>
                </div>
                <p className="text-xs text-white/30 truncate">{skill.data.description}</p>
              </div>

              {/* Levels */}
              <div className="hidden md:flex items-center gap-4 text-xs">
                {(["scalability", "debuggability", "consistency"] as const).map((k) => (
                  <div key={k} className="text-center">
                    <p className="text-white/20 capitalize mb-0.5">{k.slice(0, 5)}</p>
                    <p className={LEVEL_COLORS[skill.data[k] as SkillLevel]}>{skill.data[k]}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(realIdx)}
                  className="text-xs text-white/50 hover:text-white/80 border border-white/[0.08] rounded-lg px-2.5 py-1 transition-all">
                  Edit
                </button>
                <button onClick={() => deleteSkill(realIdx)}
                  className="text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 rounded-lg px-2.5 py-1 transition-all">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech types editor */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Tech Type Categories</h2>
        <p className="text-xs text-white/30">Comma-separated list of skill categories used for filtering.</p>
        <input
          value={techTypes.join(", ")}
          onChange={(e) => setTechTypes(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </section>
    </div>
  );
}