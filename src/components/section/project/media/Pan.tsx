"use client";

import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clamp01 } from "@/lib/utils";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "pan" (Portfolio): the image zooms toward the cursor and follows it.
 * A rule along the bottom edge fills to show the horizontal position.
 */
export default function Pan({ project, shots, reduce }: InteractionProps) {
    const [hot, setHot] = useState(false);
    const shot = shots[0];
    const on = hot && !reduce;

    const px = useMotionValue(50);
    const py = useMotionValue(50);
    const sx = useSpring(px, { stiffness: 140, damping: 24 });
    const sy = useSpring(py, { stiffness: 140, damping: 24 });
    const origin = useMotionTemplate`${sx}% ${sy}%`;
    const fill = useTransform(sx, (v) => v / 100);

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && !reduce && setHot(true)}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || reduce) return;
                const b = e.currentTarget.getBoundingClientRect();
                px.set(clamp01((e.clientX - b.left) / b.width) * 100);
                py.set(clamp01((e.clientY - b.top) / b.height) * 100);
            }}
            onPointerLeave={() => {
                setHot(false);
                px.set(50);
                py.set(50);
            }}
        >
            <Frame ratio={ratioOf(shot)}>
                <motion.div
                    className="absolute inset-0"
                    style={{ transformOrigin: origin }}
                    initial={false}
                    animate={{ scale: on ? 1.7 : 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                >
                    <Shot shot={shot} eager className="size-full object-cover" />
                </motion.div>

                <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[color:var(--tint)]"
                    style={{ scaleX: fill, opacity: on ? 1 : 0 }}
                />

                <span className="pm-chip">{project.readout ?? "move over it"}</span>
            </Frame>
        </div>
    );
}
