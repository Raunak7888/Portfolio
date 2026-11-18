"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "strata" (Atmosphere): the image is cut into horizontal bands that drift
 * sideways by different amounts on hover, like layers of wind.
 */
const BANDS = 5;
const DRIFT = [-3.5, 2.5, -1.5, 3.5, -2.5];

export default function Strata({ project, shots, reduce }: InteractionProps) {
    const [hot, setHot] = useState(false);
    const shot = shots[0];
    const on = hot && !reduce;

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
            onPointerLeave={() => setHot(false)}
        >
            <Frame ratio={ratioOf(shot)}>
                {Array.from({ length: BANDS }, (_, k) => {
                    const top = (k / BANDS) * 100;
                    const bottom = 100 - ((k + 1) / BANDS) * 100;
                    return (
                        <span
                            key={k}
                            aria-hidden={k !== 0 || undefined}
                            className="absolute inset-0"
                            style={{ clipPath: `inset(${top}% 0% ${bottom}% 0%)` }}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{ scale: 1.1 }}
                                initial={false}
                                animate={{ x: on ? `${DRIFT[k]}%` : "0%" }}
                                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: on ? k * 0.05 : 0 }}
                            >
                                <Shot shot={shot} eager={k === 0} decorative={k !== 0} className="size-full object-cover" />
                            </motion.div>
                        </span>
                    );
                })}

                <span className="pm-chip">{project.readout ?? "hover to drift"}</span>
            </Frame>
        </div>
    );
}
