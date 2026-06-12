"use client";

import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  hero: "Hero Editor",
  about: "About Editor",
  skills: "Skills Editor",
  projects: "Projects Editor",
  experience: "Experience Editor",
  education: "Education Editor",
  certifications: "Certifications Editor",
  media: "Media Library",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="sticky top-0 z-20 h-12 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center px-6">
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-white/20 text-xs">/</span>}
            <span
              className={
                crumb.isLast ? "text-white/80" : "text-white/30"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 border border-white/[0.06] rounded-md px-2.5 py-1"
        >
          <span>↗</span>
          <span>View Site</span>
        </a>
      </div>
    </header>
  );
}