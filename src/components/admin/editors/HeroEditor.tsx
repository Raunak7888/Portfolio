"use client";

import { useState } from "react";

interface HeroData {
  hero: {
    firstName: string;
    secondName: string;
    fullName: string;
    email: string;
  };
  heroSection: {
    description: string;
    socialLinks: {
      githubUrl: string;
      linkedInUrl: string;
      instagramUrl: string;
      gmailUrl: string;
    };
    viewSourceGithubLinkUrl: string;
  };
  footer?: {
    note: string;
  };
}

interface Props {
  initialData: HeroData;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
      />
    </div>
  );
}

export function HeroEditor({ initialData }: Props) {
  const [data, setData] = useState<HeroData>(initialData);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function setHero(key: keyof HeroData["hero"], val: string) {
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: val } }));
  }

  function setHeroSection(key: keyof HeroData["heroSection"], val: string) {
    setData((d) => ({ ...d, heroSection: { ...d.heroSection, [key]: val } }));
  }

  function setSocialLink(key: keyof HeroData["heroSection"]["socialLinks"], val: string) {
    setData((d) => ({
      ...d,
      heroSection: {
        ...d.heroSection,
        socialLinks: { ...d.heroSection.socialLinks, [key]: val },
      },
    }));
  }

  function setFooter(val: string) {
    setData((d) => ({ ...d, footer: { note: val } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: data.hero,
          heroSection: data.heroSection,
          ...(data.footer ? { footer: data.footer } : {}),
        }),
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
          <h1 className="text-xl font-semibold text-white">Hero Editor</h1>
          <p className="text-sm text-white/40 mt-1">Edit personal info, bio, and social links.</p>
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

      {/* Personal Info */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Personal Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First Name"
            value={data.hero.firstName}
            onChange={(v) => setHero("firstName", v)}
          />
          <Field
            label="Last Name"
            value={data.hero.secondName}
            onChange={(v) => setHero("secondName", v)}
          />
        </div>
        <Field
          label="Full Name"
          value={data.hero.fullName}
          onChange={(v) => setHero("fullName", v)}
        />
        <Field
          label="Email"
          type="email"
          value={data.hero.email}
          onChange={(v) => setHero("email", v)}
        />
      </section>

      {/* Hero Section */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Hero Content</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Description / Bio</label>
          <textarea
            value={data.heroSection.description}
            onChange={(e) => setHeroSection("description", e.target.value)}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
          />
        </div>
        <Field
          label="View Source GitHub URL"
          value={data.heroSection.viewSourceGithubLinkUrl}
          onChange={(v) => setHeroSection("viewSourceGithubLinkUrl", v)}
          placeholder="https://github.com/..."
        />
      </section>

      {/* Social Links */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Social Links</h2>
        <Field
          label="GitHub URL"
          value={data.heroSection.socialLinks.githubUrl}
          onChange={(v) => setSocialLink("githubUrl", v)}
          placeholder="https://github.com/..."
        />
        <Field
          label="LinkedIn / X URL"
          value={data.heroSection.socialLinks.linkedInUrl}
          onChange={(v) => setSocialLink("linkedInUrl", v)}
          placeholder="https://x.com/..."
        />
        <Field
          label="Instagram URL"
          value={data.heroSection.socialLinks.instagramUrl}
          onChange={(v) => setSocialLink("instagramUrl", v)}
          placeholder="https://instagram.com/..."
        />
        <Field
          label="Gmail URL"
          value={data.heroSection.socialLinks.gmailUrl}
          onChange={(v) => setSocialLink("gmailUrl", v)}
          placeholder="https://mail.google.com/..."
        />
      </section>

      {/* Footer */}
      {data.footer !== undefined && (
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Footer</h2>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Footer Note</label>
            <textarea
              value={data.footer.note}
              onChange={(e) => setFooter(e.target.value)}
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>
        </section>
      )}

      {/* Live preview */}
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Preview</h2>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
          <p className="text-2xl font-bold text-white">{data.hero.fullName || "—"}</p>
          <p className="text-sm text-indigo-400 mt-0.5">{data.hero.email || "—"}</p>
          <p className="text-sm text-white/50 mt-3 leading-relaxed max-w-xl">{data.heroSection.description || "—"}</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            {data.heroSection.socialLinks.githubUrl && (
              <span className="text-xs border border-white/10 rounded-full px-3 py-1 text-white/40">GitHub ↗</span>
            )}
            {data.heroSection.socialLinks.linkedInUrl && (
              <span className="text-xs border border-white/10 rounded-full px-3 py-1 text-white/40">LinkedIn ↗</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}