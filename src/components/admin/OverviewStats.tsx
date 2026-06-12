"use client";

interface Stats {
  totalProjects: number;
  totalSkills: number;
  totalExperiences: number;
  totalCertifications: number;
  totalImages: number;
  dataJsonModified: string;
  projectJsonModified: string;
}

interface Props {
  stats: Stats;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const CARDS = [
  {
    key: "totalProjects",
    label: "Projects",
    icon: "⬜",
    color: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
    accent: "text-indigo-400",
  },
  {
    key: "totalSkills",
    label: "Skills",
    icon: "⬡",
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
    accent: "text-violet-400",
  },
  {
    key: "totalExperiences",
    label: "Experiences",
    icon: "◷",
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    accent: "text-emerald-400",
  },
  {
    key: "totalCertifications",
    label: "Certifications",
    icon: "✧",
    color: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    accent: "text-amber-400",
  },
  {
    key: "totalImages",
    label: "Images",
    icon: "⊞",
    color: "from-pink-500/20 to-pink-600/5 border-pink-500/20",
    accent: "text-pink-400",
  },
] as const;

export function OverviewStats({ stats }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-white/40 mt-1">Portfolio content at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map(({ key, label, icon, color, accent }) => (
          <div
            key={key}
            className={`rounded-2xl border bg-gradient-to-br ${color} p-4 space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
              <span className={`text-sm ${accent}`}>{icon}</span>
            </div>
            <p className={`text-3xl font-bold ${accent}`}>
              {stats[key]}
            </p>
          </div>
        ))}
      </div>

      {/* File modification */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Last Modified</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">D</span>
              <div>
                <p className="text-sm text-white/80">Data.json</p>
                <p className="text-xs text-white/30">Hero · About · Skills · Footer</p>
              </div>
            </div>
            <span className="text-xs text-white/40 font-mono">
              {formatDate(stats.dataJsonModified)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs">P</span>
              <div>
                <p className="text-sm text-white/80">Project.json</p>
                <p className="text-xs text-white/30">All project definitions</p>
              </div>
            </div>
            <span className="text-xs text-white/40 font-mono">
              {formatDate(stats.projectJsonModified)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Quick Access</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { href: "/admin/hero", label: "Edit Hero" },
            { href: "/admin/projects", label: "Edit Projects" },
            { href: "/admin/skills", label: "Edit Skills" },
            { href: "/admin/media", label: "Upload Media" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-center py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-150"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}