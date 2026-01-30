"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { runThemeTransition } from "./ThemeTransitionLayer";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();
    if (!mounted) return null;

    const handleThemeToggle = () => {
        runThemeTransition("theme", () => {
            setTheme(theme === "light" ? "dark" : "light");
        });
    };

    return (
        <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full hover:bg-muted active:scale-95"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
