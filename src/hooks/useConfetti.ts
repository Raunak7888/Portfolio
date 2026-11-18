"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFETTI_COLORS } from "@/lib/tokens";
import { rand } from "@/lib/utils";

export type Particle = {
    id: number;
    dx: number;
    dy: number;
    rot: number;
    size: number;
    color: string;
    round: boolean;
};

export type Burst = { id: number; x: number; y: number; particles: Particle[] };

export function useConfetti(enabled: boolean) {
    const [bursts, setBursts] = useState<Burst[]>([]);
    const counter = useRef(0);
    const timers = useRef<number[]>([]);

    const fire = useCallback(
        (x: number, y: number, count = 24) => {
            if (!enabled) return;
            const id = ++counter.current;

            const particles: Particle[] = Array.from({ length: count }, (_, i) => {
                const angle = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
                const dist = rand(70, 160);
                return {
                    id: i,
                    dx: Math.cos(angle) * dist,
                    dy: Math.sin(angle) * dist - 40,
                    rot: rand(-320, 320),
                    size: rand(6, 11),
                    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                    round: Math.random() > 0.5,
                };
            });

            setBursts((b) => [...b, { id, x, y, particles }]);
            timers.current.push(
                window.setTimeout(
                    () => setBursts((b) => b.filter((burst) => burst.id !== id)),
                    1400,
                ),
            );
        },
        [enabled],
    );

    useEffect(() => {
        const list = timers.current;
        return () => list.forEach((t) => window.clearTimeout(t));
    }, []);

    return { bursts, fire };
}
