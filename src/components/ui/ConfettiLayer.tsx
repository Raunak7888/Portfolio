"use client";

import { motion } from "framer-motion";
import type { Burst } from "@/hooks/useConfetti";

export default function ConfettiLayer({ bursts }: { bursts: Burst[] }) {
    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
        >
            {bursts.map((burst) => (
                <div
                    key={burst.id}
                    className="absolute"
                    style={{ left: burst.x, top: burst.y }}
                >
                    {burst.particles.map((p) => (
                        <motion.span
                            key={p.id}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
                            animate={{
                                x: p.dx,
                                y: [0, p.dy, p.dy + 90],
                                opacity: [1, 1, 0],
                                scale: [0.4, 1, 0.8],
                                rotate: p.rot,
                            }}
                            transition={{ duration: 1.1, ease: "easeOut", times: [0, 0.55, 1] }}
                            className={`absolute block ${p.round ? "rounded-full" : "rounded-[3px]"}`}
                            style={{ width: p.size, height: p.size, background: p.color }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
