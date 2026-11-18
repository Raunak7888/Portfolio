"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ACCENTS, DEFAULT_ACCENT, applyAccent, readStoredAccent, storeAccent } from "@/lib/accent";
import { runViewTransition } from "@/lib/view-transition";

const panel: Variants = {
    hidden: { opacity: 0, y: -8, scale: 0.94, transition: { duration: 0.12 } },
    visible: {
        opacity: 1,
        y: 4,
        scale: 1,
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.035 },
    },
};

const bead: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

/**
 * Accent colour picker. The inline script in app/layout.tsx applies the saved
 * colour before first paint; this component only changes it.
 * This component mounts after hydration, so reading localStorage in the
 * initialiser is safe.
 */
export default function ThemeColorPicker() {
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState<string>(() => readStoredAccent() ?? DEFAULT_ACCENT);
    const wrapRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    useEffect(
        () => () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        },
        [],
    );

    const clearTimer = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const select = useCallback(
        (hex: string, el: HTMLElement) => {
            setOpen(false);
            if (hex === color) return;
            const r = el.getBoundingClientRect();
            runViewTransition(
                () => {
                    applyAccent(hex);
                    storeAccent(hex);
                    setColor(hex);
                },
                { x: r.left + r.width / 2, y: r.top + r.height / 2 },
                450,
            );
        },
        [color],
    );

    const current = ACCENTS.find((a) => a.value === color)?.name ?? "Custom";

    return (
        <div
            ref={wrapRef}
            className="relative flex flex-col items-center"
            onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
                setOpen(true);
            }}
            onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                clearTimer();
                closeTimer.current = setTimeout(() => setOpen(false), 140);
            }}
        >
            <button
                type="button"
                aria-label={`Accent colour: ${current}. Change`}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="grid size-11 place-items-center rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
            >
                <span className="size-5 rounded-full bg-primary ring-2 ring-background ring-offset-1 ring-offset-primary/30" />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="accent-panel"
                        role="group"
                        aria-label="Accent colour options"
                        variants={panel}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute left-1/2 top-full z-[1001] mt-1 flex -translate-x-1/2 flex-col gap-0.5 rounded-full border border-border bg-background/85 p-1 shadow-xl backdrop-blur-xl"
                    >
                        {ACCENTS.map((c) => (
                            <motion.button
                                key={c.value}
                                type="button"
                                variants={bead}
                                aria-label={c.name}
                                aria-pressed={c.value === color}
                                title={c.name}
                                onClick={(e) => select(c.value, e.currentTarget)}
                                className="grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <span
                                    className={`size-5 rounded-full transition-transform hover:scale-125 ${
                                        c.value === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                />
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
