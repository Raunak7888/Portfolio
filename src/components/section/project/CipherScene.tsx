"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageSlab, Readout, Stage, type SceneProps } from "@/components/section/project/ProjectScenes";
import { pop } from "@/lib/motion";

const COLS = 16;
const ROWS = 10;

/* Deterministic hex so server and client markup always match. */
const CELLS = Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    return {
        hex: ((i * 53 + 17) % 256).toString(16).padStart(2, "0"),
        delay: c * 34 + (r % 3) * 16,
    };
});

/**
 * Hermes: the screenshot is sealed by a wave of hex cells sweeping left to
 * right, a lock snaps shut, then the wave runs back and it decrypts again.
 */
export function CipherScene({ project, play, reduce }: SceneProps) {
    const [phase, setPhase] = useState(false);

    useEffect(() => {
        if (!play || reduce) return;
        const first = window.setTimeout(() => setPhase(true), 150);
        const loop = window.setInterval(() => setPhase((p) => !p), 2600);
        return () => {
            window.clearTimeout(first);
            window.clearInterval(loop);
            setPhase(false);
        };
    }, [play, reduce]);

    const sealed = play && !reduce && phase;

    return (
        <>
            <Stage>
                <ImageSlab project={project}>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 grid"
                        style={{
                            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                        }}
                    >
                        {CELLS.map((cell, i) => (
                            <span
                                key={i}
                                style={{
                                    transitionDelay: `${sealed ? cell.delay : (COLS * 34 - cell.delay) * 0.6}ms`,
                                    transform: sealed ? "scaleY(1)" : "scaleY(0.15)",
                                    opacity: sealed ? 1 : 0,
                                }}
                                className="flex items-center justify-center border border-[color-mix(in_oklab,var(--tint)_26%,transparent)] bg-[color-mix(in_oklab,var(--tint)_30%,var(--background))] font-mono text-[8px] leading-none text-[color:var(--tint)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:text-xs"
                            >
                                {cell.hex}
                            </span>
                        ))}
                    </div>

                    <motion.span
                        aria-hidden
                        initial={false}
                        animate={{ scale: sealed ? 1 : 0, rotate: sealed ? 0 : -40, opacity: sealed ? 1 : 0 }}
                        transition={pop}
                        className="pointer-events-none absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-foreground bg-[color:var(--tint)] text-2xl shadow-[3px_3px_0_0_var(--foreground)] sm:size-16"
                    >
                        🔒
                    </motion.span>
                </ImageSlab>
            </Stage>
            <Readout text={sealed ? "ciphertext · AES-GCM" : project.readout} tint={project.tint} />
        </>
    );
}
