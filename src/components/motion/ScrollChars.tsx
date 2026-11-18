"use client";
// redesign.sh:v1

import { motion, useTransform, type MotionValue } from "framer-motion";

type CharProps = {
    ch: string;
    i: number;
    n: number;
    progress: MotionValue<number>;
    from: number;
    to: number;
    live: boolean;
    className?: string;
};

function Char({ ch, i, n, progress, from, to, live, className }: CharProps) {
    const span = to - from;
    const stride = (span * 0.55) / Math.max(1, n - 1);
    const start = from + i * stride;
    const end = start + span * 0.45;
    const y = useTransform(progress, [start, end], ["108%", "0%"]);
    const o = useTransform(progress, [start, end], [0, 1]);

    return (
        <span className="inline-block overflow-hidden align-top pb-[0.14em] -mb-[0.14em]">
            <motion.span
                data-ed-hide
                style={live ? { y, opacity: o } : undefined}
                className={`inline-block ${className ?? ""}`}
            >
                {ch}
            </motion.span>
        </span>
    );
}

/**
 * Character-by-character reveal driven by a scroll-progress MotionValue.
 * Every character always occupies its final space, so nothing shifts.
 * With live=false it renders the finished text.
 */
export default function ScrollChars({
    text,
    progress,
    from = 0,
    to = 1,
    live = true,
    className = "",
    charClassName,
}: {
    text: string;
    progress: MotionValue<number>;
    from?: number;
    to?: number;
    live?: boolean;
    className?: string;
    charClassName?: string;
}) {
    const chars = text.split("");
    return (
        <span aria-hidden className={`inline-flex ${className}`}>
            {chars.map((ch, i) => (
                <Char
                    key={i}
                    ch={ch === " " ? "\u00A0" : ch}
                    i={i}
                    n={chars.length}
                    progress={progress}
                    from={from}
                    to={to}
                    live={live}
                    className={charClassName}
                />
            ))}
        </span>
    );
}
