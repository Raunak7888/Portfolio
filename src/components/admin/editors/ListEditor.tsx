"use client";

import { useState } from "react";

export interface ListItem {
  id: string;
  [key: string]: string | string[];
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "date" | "stringArray";
  placeholder?: string;
  rows?: number;
}

interface Props {
  sectionKey: string;         // key in Data.json, e.g. "experience"
  title: string;
  description: string;
  fields: FieldDef[];
  initialItems: ListItem[];
  emptyLabel?: string;
}

function makeBlank(fields: FieldDef[]): ListItem {
  const obj: ListItem = { id: crypto.randomUUID() };
  for (const f of fields) {
    obj[f.key] = f.type === "stringArray" ? [] : "";
  }
  return obj;
}

export function ListEditor({ sectionKey, title, description, fields, initialItems, emptyLabel }: Props) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<ListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditBuf({ ...items[idx] });
  }

  function startAdd() {
    setEditingIdx(-1);
    setEditBuf(makeBlank(fields));
  }

  function cancelEdit() {
    setEditingIdx(null);
    setEditBuf(null);
  }

  function commitEdit() {
    if (!editBuf) return;
    if (editingIdx === -1) {
      setItems((s) => [...s, editBuf]);
    } else if (editingIdx !== null) {
      setItems((s) => s.map((it, i) => (i === editingIdx ? editBuf : it)));
    }
    cancelEdit();
  }

  function removeItem(idx: number) {
    if (!confirm("Remove this entry?")) return;
    setItems((s) => s.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, dir: -1 | 1) {
    const arr = [...items];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setItems(arr);
  }

  function setBufField(key: string, val: string | string[]) {
    if (!editBuf) return;
    setEditBuf({ ...editBuf, [key]: val });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [sectionKey]: items }),
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

  // Primary display field (first non-id field)
  const primaryField = fields[0];
  const secondaryField = fields[1];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-sm text-white/40 mt-1">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startAdd}
            className="px-3 py-2 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:text-white/90 hover:border-white/[0.14] transition-all"
          >
            + Add
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
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          toast.type === "ok"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-red-500/10 border-red-500/30 text-red-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Edit/Add modal */}
      {editBuf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editingIdx === -1 ? "Add Entry" : "Edit Entry"}
              </h3>
              <button onClick={cancelEdit} className="text-white/30 hover:text-white/60 transition-colors">✕</button>
            </div>

            {fields.map((f) => {
              const val = editBuf[f.key];
              if (f.type === "stringArray") {
                const arr = Array.isArray(val) ? val : [];
                return (
                  <div key={f.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{f.label}</label>
                      <button
                        onClick={() => setBufField(f.key, [...arr, ""])}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >+ Add</button>
                    </div>
                    {arr.map((item, ai) => (
                      <div key={ai} className="flex gap-2">
                        <input
                          value={item}
                          onChange={(e) => {
                            const copy = [...arr];
                            copy[ai] = e.target.value;
                            setBufField(f.key, copy);
                          }}
                          placeholder={f.placeholder}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <button
                          onClick={() => setBufField(f.key, arr.filter((_, i) => i !== ai))}
                          className="text-white/20 hover:text-red-400 transition-colors text-sm px-1"
                        >✕</button>
                      </div>
                    ))}
                    {arr.length === 0 && <p className="text-xs text-white/20 italic">Empty. Click + Add.</p>}
                  </div>
                );
              }

              return (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={typeof val === "string" ? val : ""}
                      onChange={(e) => setBufField(f.key, e.target.value)}
                      rows={f.rows ?? 3}
                      placeholder={f.placeholder}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                  ) : (
                    <input
                      type={f.type === "url" ? "url" : f.type === "date" ? "date" : "text"}
                      value={typeof val === "string" ? val : ""}
                      onChange={(e) => setBufField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  )}
                </div>
              );
            })}

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

      {/* List */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id ?? idx} className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
            {/* Reorder */}
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveItem(idx, -1)} className="text-white/20 hover:text-white/60 text-xs transition-colors leading-none">▲</button>
              <button onClick={() => moveItem(idx, 1)} className="text-white/20 hover:text-white/60 text-xs transition-colors leading-none">▼</button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">
                {primaryField ? String(item[primaryField.key] ?? "—") : "—"}
              </p>
              {secondaryField && (
                <p className="text-xs text-white/40 truncate mt-0.5">
                  {String(item[secondaryField.key] ?? "")}
                </p>
              )}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(idx)}
                className="text-xs text-white/50 hover:text-white/80 border border-white/[0.08] rounded-lg px-2.5 py-1 transition-all">
                Edit
              </button>
              <button onClick={() => removeItem(idx)}
                className="text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 rounded-lg px-2.5 py-1 transition-all">
                Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">○</p>
            <p className="text-sm">{emptyLabel ?? "No entries yet. Click + Add."}</p>
          </div>
        )}
      </div>
    </div>
  );
}