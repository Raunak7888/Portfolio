"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { CAT_BY_ID, LEVELS, type Skill } from "@/content/skills";
import { bouncy, softSpring } from "@/lib/motion";

const tiltSpring = { stiffness: 220, damping: 16 } as const;

type TileCustom = { i: number; tilt: number };

const tileVariants: Variants = {
    hidden: { opacity: 0, scale: 0.55, y: 26, rotate: -8 },
    show: ({ i, tilt }: TileCustom) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: tilt,
        transition: { type: "spring", stiffness: 260, damping: 17, delay: 0.25 + i * 0.045 },
    }),
    exit: { opacity: 0, scale: 0.6, transition: { duration: 0.18 } },
};

const WAVE = "color-mix(in oklab, var(--tint) 40%, transparent)";

/** Four pips = four levels. Filled pips are the skill level. */
function Pips({ level }: { level: number }) {
    return (
        <span aria-hidden className="flex gap-[3px]">
            {Array.from({ length: 4 }, (_, i) => (
                <span
                    key={i}
                    className={`size-1 rounded-full sm:size-1.5 ${
                        i < level ? "bg-[color:var(--tint)]" : "bg-[color-mix(in_oklab,var(--foreground)_18%,transparent)]"
                    }`}
                />
            ))}
        </span>
    );
}

/** A liquid that rises to the skill level on hover or selection. */
function Liquid({ level, open }: { level: number; open: boolean }) {
    return (
        <span
            aria-hidden
            style={{ "--fill": `${level * 24}%` } as CSSProperties}
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-b-2xl transition-[height] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${
                open
                    ? "h-[var(--fill)]"
                    : "h-[8%] group-hover:h-[var(--fill)] group-focus-visible:h-[var(--fill)]"
            }`}
        >
            <svg
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                className="rd-wave -mb-px block h-2 w-[200%] shrink-0"
                style={{ color: WAVE }}
                fill="currentColor"
            >
                <path d="M0 4 Q12.5 0 25 4 T50 4 T75 4 T100 4 T125 4 T150 4 T175 4 T200 4 V8 H0Z" />
            </svg>
            <span className="block flex-1" style={{ background: WAVE }} />
        </span>
    );
}

export default function SkillTile({
    skill,
    index,
    selected,
    dimmed,
    related,
    scanning,
    explored,
    ready,
    reduce,
    fine,
    onSelect,
}: {
    skill: Skill;
    index: number;
    selected: boolean;
    dimmed: boolean;
    related: boolean;
    scanning: boolean;
    explored: boolean;
    ready: boolean;
    reduce: boolean;
    fine: boolean;
    onSelect: (id: string) => void;
}) {
    const tint = CAT_BY_ID[skill.cat].tint;
    const tilt = [-1.6, 1.2, -0.8, 1.6][index % 4];
    const canDrag = fine && !reduce;

    const [dragging, setDragging] = useState(false);
    const moved = useRef(false);

    const gx = useMotionValue(50);
    const gy = useMotionValue(50);
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const rotX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), tiltSpring);
    const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-9, 9]), tiltSpring);
    const glow = useMotionTemplate`radial-gradient(110px circle at ${gx}px ${gy}px, color-mix(in oklab, var(--tint) 34%, transparent), transparent 72%)`;

    function onMove(e: ReactPointerEvent<HTMLButtonElement>) {
        if (!fine || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        gx.set(e.clientX - r.left);
        gy.set(e.clientY - r.top);
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
    }

    function onLeave() {
        px.set(0);
        py.set(0);
    }

    const vars = { "--tint": tint, zIndex: dragging ? 30 : selected ? 5 : 1 } as CSSProperties;

    return (
        <motion.li
            layout={!reduce}
            custom={{ i: index, tilt } satisfies TileCustom}
            variants={tileVariants}
            initial={reduce ? false : "hidden"}
            animate={ready || reduce ? "show" : "hidden"}
            exit="exit"
            transition={reduce ? { duration: 0 } : { layout: softSpring }}
            style={vars}
            className="relative aspect-square min-h-0 lg:aspect-auto"
        >
            <motion.button
                type="button"
                data-tile
                data-skill={skill.id}
                aria-pressed={selected}
                aria-label={`${skill.name}, ${LEVELS[skill.level - 1]}`}
                onClick={() => {
                    if (moved.current) {
                        moved.current = false;
                        return;
                    }
                    onSelect(skill.id);
                }}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                drag={canDrag}
                dragSnapToOrigin
                dragElastic={0.4}
                dragMomentum={false}
                onDragStart={() => {
                    moved.current = true;
                    setDragging(true);
                }}
                onDragEnd={() => setDragging(false)}
                whileHover={reduce ? undefined : { y: -4, scale: 1.04 }}
                whileTap={reduce ? undefined : { scale: 0.95 }}
                whileDrag={{ scale: 1.1, rotate: 4 }}
                style={canDrag ? { rotateX: rotX, rotateY: rotY, transformPerspective: 600 } : undefined}
                transition={bouncy}
                className="group relative block h-full w-full touch-manipulation rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tint)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <span
                    className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-[color-mix(in_oklab,var(--tint)_8%,var(--background))] p-2 text-left shadow-[2px_2px_0_0_color-mix(in_oklab,var(--tint)_55%,transparent)] transition-[opacity,filter,border-color,box-shadow] duration-300 group-hover:shadow-[4px_4px_0_0_var(--tint)] sm:p-3 ${
                        selected
                            ? "border-[color:var(--tint)] shadow-[4px_4px_0_0_var(--tint)]"
                            : "border-[color-mix(in_oklab,var(--tint)_34%,transparent)] group-hover:border-[color:var(--tint)]"
                    } ${dimmed ? "opacity-35 saturate-50" : ""}`}
                >
                    <Liquid level={skill.level} open={selected} />

                    <motion.span
                        aria-hidden
                        style={{ background: glow }}
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />

                    <span className="relative flex items-center gap-1.5">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--tint)_24%,transparent)] text-xs font-bold tracking-tight text-[color:var(--tint)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:size-10 sm:rounded-xl sm:text-sm">
                            {skill.mark}
                        </span>
                        {skill.level === 4 && (
                            <span aria-hidden className="rd-twinkle text-xs text-[color:var(--tint)] sm:text-xs">
                                ✦
                            </span>
                        )}
                    </span>

                    <span className="relative flex flex-col gap-1">
                        <span className="block truncate text-xs font-semibold leading-tight sm:text-sm">
                            {skill.name}
                        </span>
                        <Pips level={skill.level} />
                    </span>

                    <motion.span
                        aria-hidden
                        initial={false}
                        animate={{ scale: explored ? 1 : 0, opacity: explored ? 1 : 0 }}
                        transition={reduce ? { duration: 0 } : bouncy}
                        className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-(--tint) sm:right-2 sm:top-2 sm:size-5"
                    >
                        <svg viewBox="0 0 16 16" className="size-2.5 text-background">
                            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.span>

                    {related && !selected && (
                        <span aria-hidden className="absolute bottom-2 right-2 flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--tint)] opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-[color:var(--tint)]" />
                        </span>
                    )}
                </span>

                {selected && (
                    <motion.span
                        aria-hidden
                        layoutId="skill-ring"
                        transition={reduce ? { duration: 0 } : softSpring}
                        className="pointer-events-none absolute -inset-1.5 rounded-[1.25rem] border-2 border-dashed border-[color:var(--tint)]"
                    />
                )}

                {scanning && (
                    <span aria-hidden className="pointer-events-none absolute -inset-1.5 rounded-[1.25rem] border-2 border-dashed border-[color:var(--tint)]" />
                )}
            </motion.button>
        </motion.li>
    );
}
