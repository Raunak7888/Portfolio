"use client";

import { motion, type Variants } from "framer-motion";

const wordStack: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const wordIn: Variants = {
    hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 200, damping: 20 },
    },
};

const SIZES = {
    md: "text-[clamp(2rem,min(8.5vw,6.2vh),3.5rem)] leading-[1.12] lg:text-[clamp(2.25rem,min(4.2vw,8vh),3.75rem)]",
    xl: "text-[clamp(2.5rem,min(7vw,11vh),5.5rem)] leading-[1.02]",
} as const;

function Word({
    children,
    tilt,
    reduce,
    className = "",
}: {
    children: string;
    tilt: number;
    reduce: boolean;
    className?: string;
}) {
    return (
        <motion.span
            variants={wordIn}
            whileHover={reduce ? undefined : { y: -6, rotate: tilt }}
            whileTap={reduce ? undefined : { scale: 0.92, rotate: -tilt }}
            className={`inline-block cursor-default ${className}`}
        >
            {children}
        </motion.span>
    );
}

function Squiggle({ reduce }: { reduce: boolean }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 300 14"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full text-primary"
        >
            <motion.path
                d="M2 9 C 30 1, 55 1, 80 8 S 130 15, 155 8 S 205 1, 230 8 S 275 14, 298 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                variants={{
                    hidden: { pathLength: reduce ? 1 : 0 },
                    show: {
                        pathLength: 1,
                        transition: { duration: 0.9, delay: 0.6, ease: [0.65, 0, 0.35, 1] },
                    },
                }}
            />
        </svg>
    );
}

/**
 * Two-line headline. The top line is sans. The bottom line is serif italic in
 * the accent colour, underlined by a hand-drawn squiggle.
 * Needs a parent motion element with "hidden" / "show" variants.
 */
export default function Headline({
    reduce,
    toptext,
    bottomtext,
    size = "md",
}: {
    reduce: boolean;
    toptext: string;
    bottomtext: string;
    size?: keyof typeof SIZES;
}) {
    const top = toptext.split(" ");
    const bottom = bottomtext.split(" ");

    return (
        <motion.h2
            variants={wordStack}
            className={`${SIZES[size]} font-semibold tracking-tight`}
        >
            {top.map((w, i) => (
                <span key={`${w}-${i}`}>
                    <Word tilt={i % 2 ? 3 : -3} reduce={reduce}>
                        {w}
                    </Word>{" "}
                </span>
            ))}
            <span className="relative inline-block">
                {bottom.map((w, i) => (
                    <span key={`${w}-${i}`}>
                        <Word
                            tilt={i % 2 ? -3 : 3}
                            reduce={reduce}
                            className="ds-serif text-[1.08em] text-primary"
                        >
                            {w}
                        </Word>
                        {i < bottom.length - 1 ? " " : ""}
                    </span>
                ))}
                <Squiggle reduce={reduce} />
            </span>
        </motion.h2>
    );
}
