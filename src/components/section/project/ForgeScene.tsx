"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { Readout, Slab, Stage, type SceneProps } from "@/components/section/project/ProjectScenes";
import { pop } from "@/lib/motion";

const NODES = [
    { glyph: "{ }", label: "source", note: "source code" },
    { glyph: "✦", label: "analysis", note: "analysing…" },
    { glyph: "[ ]", label: "JSON", note: "emitting JSON" },
    { glyph: "▦", label: "visual", note: "rendering" },
] as const;

const LAST = NODES.length - 1;

/**
 * AlgoForge: no screenshot. A packet of code travels the real pipeline
 * (source -> analysis -> visualiser JSON -> render). Each stage wakes up as
 * the packet arrives.
 */
export function ForgeScene({ project, play, reduce }: SceneProps) {
    const p = useMotionValue(0);
    const [step, setStep] = useState(-1);

    const packetLeft = useTransform(p, (v) => `${v * 100}%`);
    const progress = useTransform(p, (v) => v);

    useMotionValueEvent(p, "change", (v) => {
        let s = -1;
        for (let i = 0; i <= LAST; i++) if (v >= i / LAST - 0.02) s = i;
        setStep(s);
    });

    useEffect(() => {
        if (reduce) return;
        if (play) {
            const c = animate(p, [0, 1, 1], {
                duration: 3.6,
                times: [0, 0.78, 1],
                ease: "easeInOut",
                repeat: Infinity,
            });
            return () => c.stop();
        }
        const c = animate(p, 0, { duration: 0.4, ease: "easeOut" });
        return () => c.stop();
    }, [play, reduce, p]);

    const lit = reduce ? LAST : step;
    const note = play && lit >= 0 ? NODES[lit].note : project.readout;

    return (
        <>
            <Stage>
                <Slab ratio={1.6}>
                    <div
                        className="absolute inset-0"
                        style={
                            {
                                containerType: "inline-size",
                                backgroundImage:
                                    "linear-gradient(color-mix(in oklab, var(--tint) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--tint) 10%, transparent) 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            } as CSSProperties
                        }
                    >
                        {/* window chrome */}
                        <div className="absolute inset-x-0 top-0 flex h-[9cqw] items-center gap-[1.4cqw] border-b border-border bg-background/70 px-[3cqw]">
                            {[0, 1, 2].map((i) => (
                                <span key={i} className="size-[1.6cqw] rounded-full bg-[color-mix(in_oklab,var(--foreground)_28%,transparent)]" />
                            ))}
                            <span className="ml-[2cqw] font-mono text-[2.6cqw] text-muted-foreground">forge.ts</span>
                        </div>

                        {/* pipeline */}
                        <div className="absolute inset-x-[13%] top-[56%]">
                            <span className="absolute left-0 right-0 top-0 h-[0.7cqw] -translate-y-1/2 rounded-full bg-[color-mix(in_oklab,var(--foreground)_14%,transparent)]" />
                            <motion.span
                                style={{ scaleX: progress, background: project.tint }}
                                className="absolute left-0 right-0 top-0 h-[0.7cqw] origin-left -translate-y-1/2 rounded-full"
                            />
                            <motion.span
                                aria-hidden
                                style={{ left: packetLeft, background: project.tint }}
                                className="absolute top-0 size-[3.2cqw] -translate-x-1/2 -translate-y-1/2 rounded-[0.8cqw] shadow-[0_0_0_1.2cqw_color-mix(in_oklab,var(--tint)_28%,transparent)]"
                            />

                            {NODES.map((n, i) => {
                                const on = lit >= i && (play || reduce);
                                return (
                                    <div
                                        key={n.label}
                                        className="absolute top-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                                        style={{ left: `${(i / LAST) * 100}%` }}
                                    >
                                        <motion.div
                                            animate={{ scale: on ? 1.1 : 1, rotate: on ? [0, -6, 4, 0] : 0 }}
                                            transition={pop}
                                            style={{ background: on ? project.tint : undefined }}
                                            className="relative flex size-[13cqw] items-center justify-center rounded-[3cqw] border-2 border-foreground bg-background font-mono text-[4.4cqw] font-semibold text-foreground shadow-[0.7cqw_0.7cqw_0_0_var(--foreground)]"
                                        >
                                            <span className={on ? "text-[oklch(0.2_0_0)]" : ""}>{n.glyph}</span>
                                            {play && lit === i && !reduce && (
                                                <motion.span
                                                    key={`ring-${i}-${lit}`}
                                                    aria-hidden
                                                    initial={{ scale: 1, opacity: 0.7 }}
                                                    animate={{ scale: 1.9, opacity: 0 }}
                                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                                    className="absolute inset-0 rounded-[3cqw] border-2"
                                                    style={{ borderColor: project.tint }}
                                                />
                                            )}
                                        </motion.div>
                                        <span className="mt-[2.4cqw] whitespace-nowrap font-mono text-[2.5cqw] text-muted-foreground">
                                            {n.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* tiny code lines that shimmer while it runs */}
                        <div className="absolute inset-x-[13%] bottom-[7%] flex flex-col gap-[1.2cqw]">
                            {[62, 84, 48].map((w, i) => (
                                <motion.span
                                    key={i}
                                    animate={play && !reduce ? { opacity: [0.25, 0.8, 0.25] } : { opacity: 0.25 }}
                                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
                                    style={{ width: `${w}%`, background: project.tint }}
                                    className="h-[1.1cqw] rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </Slab>
            </Stage>
            <Readout text={note} tint={project.tint} />
        </>
    );
}
