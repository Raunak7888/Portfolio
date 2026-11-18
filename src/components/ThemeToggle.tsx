"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { runViewTransition } from "@/lib/view-transition";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useMounted();

    // Reserve the space so the navbar does not jump after mount.
    if (!mounted) return <span aria-hidden className="size-11" />;

    const dark = resolvedTheme !== "light";

    const toggle = (e: MouseEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        runViewTransition(() => setTheme(dark ? "light" : "dark"), {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-11 place-items-center rounded-full outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
        >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
