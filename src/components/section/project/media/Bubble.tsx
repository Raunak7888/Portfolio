"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "bubble" (Hermes): the image sits blurred and dim. On hover a sharp,
 * rounded window grows from the bottom-left corner like a message bubble
 * opening, until it fills the frame.
 */
export default function Bubble({ project, shots, reduce }: InteractionProps) {
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
                        on ? "blur-[3px] brightness-50" : ""
                    }`}
                />
                <motion.div
                    aria-hidden
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                        clipPath: on
                            ? "inset(0% 0% 0% 0% round 0px)"
                            : "inset(100% 100% 0% 0% round 18px)",
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <Shot shot={shot} decorative className="size-full object-cover" />
                </motion.div>

                <span className="pm-chip">{project.readout ?? "hover to open"}</span>
            </Frame>
        </div>
    );
}
