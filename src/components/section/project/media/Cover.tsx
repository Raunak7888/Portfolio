"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "cover" (Study planner): the screenshot is a notebook cover that swings
 * open from a binding strip on its left edge, revealing ruled paper.
 */
const RULES =
    "repeating-linear-gradient(to bottom, transparent 0 25px, color-mix(in oklab, var(--tint) 40%, transparent) 25px 26px)";

export default function Cover({ project, shots, reduce }: InteractionProps) {
    const [hot, setHot] = useState(false);
    const shot = shots[0];
    const on = hot && !reduce;

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
            onPointerLeave={() => setHot(false)}
        >
            <Frame ratio={ratioOf(shot)}>
                <span
                    aria-hidden
                    className="absolute inset-0 bg-[color-mix(in_oklab,var(--tint)_8%,var(--background))]"
                    style={{ backgroundImage: RULES }}
                />

                <div className="absolute inset-0" style={{ perspective: 1200 }}>
                    <motion.div
                        className="absolute inset-0"
                        style={{ transformOrigin: "0% 50%" }}
                        initial={false}
                        animate={{ rotateY: on ? -32 : 0 }}
                        transition={{ type: "spring", stiffness: 90, damping: 16 }}
                    >
                        <Shot shot={shot} eager className="size-full object-cover" />
                    </motion.div>
                </div>

                <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[color:var(--tint)]" />

                <span className="pm-chip">{project.readout ?? "hover to open"}</span>
            </Frame>
        </div>
    );
}
