"use client";

import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clamp01 } from "@/lib/utils";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "depth": layers that move at different speeds under the cursor, with a
 * soft light that follows it. No tilt, no rotation. Touch gets a still image.
 */
export default function Depth({ project, shots, reduce }: InteractionProps) {
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, { stiffness: 120, damping: 20 });
    const sy = useSpring(py, { stiffness: 120, damping: 20 });
    const x = useTransform(sx, [-0.5, 0.5], [12, -12]);
    const y = useTransform(sy, [-0.5, 0.5], [8, -8]);
    const x2 = useTransform(sx, [-0.5, 0.5], [-22, 22]);
    const y2 = useTransform(sy, [-0.5, 0.5], [-14, 14]);
    const lx = useTransform(sx, [-0.5, 0.5], [0, 100]);
    const ly = useTransform(sy, [-0.5, 0.5], [0, 100]);
    const light = useMotionTemplate`radial-gradient(circle at ${lx}% ${ly}%, color-mix(in oklab, var(--tint) 30%, transparent), transparent 55%)`;
    const [hot, setHot] = useState(false);
    const inset = shots[1];

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && !reduce && setHot(true)}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || reduce) return;
                const r = e.currentTarget.getBoundingClientRect();
                px.set(clamp01((e.clientX - r.left) / r.width) - 0.5);
                py.set(clamp01((e.clientY - r.top) / r.height) - 0.5);
            }}
            onPointerLeave={() => {
                setHot(false);
                px.set(0);
                py.set(0);
            }}
        >
            <Frame ratio={ratioOf(shots[0])}>
                <motion.div
                    style={reduce ? undefined : { x, y }}
                    animate={{ scale: hot ? 1.07 : 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    className="absolute inset-0"
                >
                    <Shot shot={shots[0]} eager className="size-full object-cover" />
                </motion.div>

                {inset && (
                    <motion.div
                        aria-hidden
                        style={reduce ? undefined : { x: x2, y: y2 }}
                        className="absolute bottom-[6%] right-[5%] w-[38%] overflow-hidden rounded-[5px] border border-border shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
                    >
                        <Shot shot={inset} decorative className="block h-auto w-full" />
                    </motion.div>
                )}

                <motion.span
                    aria-hidden
                    style={{ background: light, opacity: hot ? 1 : 0 }}
                    className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-300"
                />
                <span className="pm-chip">{project.readout ?? "move over it"}</span>
            </Frame>
        </div>
    );
}
