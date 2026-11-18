"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Scrambles through random glyphs and settles left to right, like a
 * split-flap board. `trigger` of 0 means idle; every change above 0 replays.
 */
export function useFlap(text: string, trigger: number, reduce: boolean) {
    const [out, setOut] = useState<string | null>(null);

    useEffect(() => {
        if (trigger <= 0 || reduce) return;
        let frame = 0;
        const settleAt = (i: number) => 6 + i * 1.6;
        const last = settleAt(text.length) + 2;
        const id = window.setInterval(() => {
            frame += 1;
            setOut(
                text
                    .split("")
                    .map((c, i) =>
                        c === " " || frame >= settleAt(i)
                            ? c
                            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
                    )
                    .join(""),
            );
            if (frame >= last) {
                window.clearInterval(id);
                setOut(null);
            }
        }, 42);
        return () => {
            window.clearInterval(id);
            setOut(null);
        };
    }, [text, trigger, reduce]);

    return out ?? text;
}

export default function FlapText({
    text,
    trigger,
    reduce,
    className = "",
}: {
    text: string;
    trigger: number;
    reduce: boolean;
    className?: string;
}) {
    const shown = useFlap(text, trigger, reduce);

    return (
        <span
            role="img"
            aria-label={text}
            className={`inline-flex flex-wrap gap-[0.12em] font-mono ${className}`}
        >
            {shown.split("").map((ch, i) =>
                ch === " " ? (
                    <span key={i} aria-hidden className="w-[0.5em]" />
                ) : (
                    <span
                        key={`${i}-${ch}`}
                        aria-hidden
                        className="rd-flap relative inline-flex h-[1.35em] w-[0.82em] items-center justify-center rounded-[0.18em] bg-[color-mix(in_oklab,var(--background)_14%,transparent)]"
                    >
                        {ch}
                        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-foreground/70" />
                    </span>
                ),
            )}
        </span>
    );
}
