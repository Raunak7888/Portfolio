"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "blueprint" (AlgoForge): a fine grid wipes in from the left over the
 * screenshot and corner brackets appear on the frame corners. No bars,
 * no charts, nothing that looks like a visualizer.
 */
const GRID =
    "linear-gradient(to right, color-mix(in oklab, var(--tint) 45%, transparent) 1px, transparent 1px)," +
    "linear-gradient(to bottom, color-mix(in oklab, var(--tint) 45%, transparent) 1px, transparent 1px)";

const CORNERS = [
    "left-2 top-2 border-l border-t",
    "right-2 top-2 border-r border-t",
    "bottom-2 left-2 border-b border-l",
    "bottom-2 right-2 border-b border-r",
];

export default function Blueprint({ project, shots, reduce }: InteractionProps) {
    const [hot, setHot] = useState(false);
    const shot = shots[0];
    const on = hot && !reduce;

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
            onPointerLeave={() => setHot(false)}
        >
            <Frame ratio={ratioOf(shot)}>
                <Shot
                    shot={shot}
                    eager
                    className={`absolute inset-0 size-full object-cover transition-[filter] duration-500 ${
                        on ? "contrast-110 saturate-75" : ""
                    }`}
                />

                <motion.span
                    aria-hidden
                    className="absolute inset-0 bg-[color-mix(in_oklab,var(--tint)_10%,transparent)]"
                    style={{ backgroundImage: GRID, backgroundSize: "24px 24px" }}
                    initial={false}
                    animate={{ clipPath: on ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />

                {CORNERS.map((c, k) => (
                    <motion.span
                        key={k}
                        aria-hidden
                        className={`absolute size-4 border-[color:var(--tint)] ${c}`}
                        initial={false}
                        animate={{ opacity: on ? 1 : 0 }}
                        transition={{ duration: 0.3, delay: on ? 0.25 + k * 0.06 : 0 }}
                    />
                ))}

                <span className="pm-chip">{project.readout ?? "hover to inspect"}</span>
            </Frame>
        </div>
    );
}
