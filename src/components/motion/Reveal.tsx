"use client";
// redesign.sh:v1

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeOutExpo, viewportOnce } from "@/lib/motion";

/** One reveal for the whole site: rise + fade once, when the block is 30% visible. */
export default function Reveal({
    children,
    delay = 0,
    y = 22,
    className = "",
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    const reduce = useReducedMotion();
    if (reduce) return <div className={className}>{children}</div>;
    return (
        <motion.div
            data-ed-hide
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, delay, ease: easeOutExpo }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
