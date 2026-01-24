"use client";

import { useMounted } from "@/hooks/useMounted";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();
    if (!mounted) return null;
    const handleThemeToggle = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button
            onClick={handleThemeToggle}
            aria-label="Toggle Theme"
            className="p-2 rounded-full hover:bg-muted transition-all active:scale-95 text-foreground"
        >
            {theme === "dark" ? (
                <Sun size={20} className="transition-all" />
            ) : (
                <Moon size={20} className="transition-all" />
            )}
        </button>
    );
}

