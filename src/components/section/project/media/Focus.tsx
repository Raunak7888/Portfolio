"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "focus" (AlgoForge): the screenshot rests slightly dimmed and muted.
 * On hover it brightens to full colour and one rule draws along the
 * bottom edge. Nothing else.
 */
export default function Focus({ project, shots, reduce }: InteractionProps) {
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
                    className={`absolute inset-0 size-full object-cover transition-[filter,transform] duration-500 ease-out ${
                        reduce ? "" : on ? "scale-[1.03]" : "brightness-[0.82] saturate-[0.7]"
                    }`}
                />

                <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[color:var(--tint)]"
                    initial={false}
                    animate={{ scaleX: on ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />

                <span className="pm-chip">{project.readout ?? "hover to focus"}</span>
            </Frame>
        </div>
    );
}
