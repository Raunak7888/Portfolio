"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/hero", label: "Hero", icon: "✦" },
  { href: "/admin/about", label: "About", icon: "◉" },
  { href: "/admin/skills", label: "Skills", icon: "⬡" },
  { href: "/admin/projects", label: "Projects", icon: "⬜" },
  { href: "/admin/experience", label: "Experience", icon: "◷" },
  { href: "/admin/education", label: "Education", icon: "◎" },
  { href: "/admin/certifications", label: "Certifications", icon: "✧" },
  { href: "/admin/media", label: "Media Library", icon: "⊞" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-white/[0.06] bg-[#0a0a0a] flex flex-col z-30">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none">Portfolio</p>
            <p className="text-white/30 text-[10px] mt-0.5">CMS Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className="text-base w-4 flex items-center justify-center opacity-70">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 disabled:opacity-40"
        >
          <span className="text-base w-4 flex items-center justify-center">⎋</span>
          <span>{loggingOut ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}