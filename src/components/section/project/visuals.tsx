"use client";
// redesign.sh:v1
/* eslint-disable @next/next/no-img-element */

import { useRef, useState, type ComponentType, type ReactNode } from "react";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import type { Project } from "@/content/projects";
import { IMAGE_META } from "@/content/image-meta.generated";
import { clamp01 } from "@/lib/utils";

export type VisualProps = {
    project: Project;
    /** 0 -> 1 while this stage rises into place */
    enter: MotionValue<number>;
    /** 0 -> 1 while the next stage covers this one */
    exit: MotionValue<number>;
    /** desktop + motion allowed: scroll-driven transforms apply */
    live: boolean;
    reduce: boolean;
};

const ratioOf = (src?: string) => {
    const m = src ? IMAGE_META[src] : undefined;
    return m ? m.w / m.h : 1.6;
};

const SHADOW = "shadow-[0_30px_70px_-34px_rgba(0,0,0,0.6)]";
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

function Shot({ src, alt, eager, className = "" }: { src: string; alt: string; eager?: boolean; className?: string }) {
    const m = IMAGE_META[src];
    return (
        <img
            src={src}
            alt={alt}
            width={m?.w}
            height={m?.h}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={`block h-auto w-full ${className}`}
        />
    );
}

function Frame({ children, ratio, className = "" }: { children: ReactNode; ratio: number; className?: string }) {
    return (
        <span
            style={{ aspectRatio: ratio, containerType: "inline-size" }}
            className={`relative block w-full overflow-hidden rounded-[6px] border border-border bg-[color-mix(in_oklab,var(--tint)_12%,var(--background))] ${SHADOW} ${className}`}
        >
            {children}
        </span>
    );
}

function Missing({ project }: { project: Project }) {
    return (
        <span className="grid aspect-[16/10] w-full place-items-center rounded-[6px] border border-dashed border-border text-sm text-muted-foreground">
            {project.name}: screenshot unavailable
        </span>
    );
}

/* ---------------------------------------------------------------------------
   Hermes: the screenshot splits into five shutters. They slide apart and
   open onto an outlined wordmark that travels behind them. No lock/key motifs.
   --------------------------------------------------------------------------- */
export function HermesVisual({ project, enter, live, reduce }: VisualProps) {
    const [open, setOpen] = useState(false);
    const touched = useRef(false);
    const x = useTransform(enter, [0, 1], ["12%", "0%"]);
    const r = useTransform(enter, [0, 1], [-3, 0]);
    const src = project.image;
    const on = open && !reduce;
    const word = project.name.toUpperCase();
    const STRIPS = 5;

    if (!src) return <Missing project={project} />;

    return (
        <motion.div style={live ? { x, rotate: r } : undefined} className="relative">
            <button
                type="button"
                aria-pressed={open}
                aria-label={`${project.name} screenshot. Toggle the split view`}
                onPointerDown={(e) => {
                    touched.current = e.pointerType !== "mouse";
                }}
                onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
                onClick={(e) => {
                    if (touched.current || e.detail === 0) setOpen((o) => !o);
                }}
                className="group block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <Frame ratio={ratioOf(src)}>
                    <span aria-hidden className="absolute inset-0 flex flex-col justify-between py-[2%]">
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                style={{
                                    fontSize: "18cqw",
                                    transform: `translateX(${(i % 2 ? -1 : 1) * (on ? 9 : 0)}%)`,
                                    transitionDelay: `${i * 60}ms`,
                                }}
                                className={`ed-outline-text block whitespace-nowrap font-semibold leading-none tracking-tight transition-transform duration-700 ${EASE} motion-reduce:transition-none`}
                            >
                                {`${word} ${word} ${word}`}
                            </span>
                        ))}
                    </span>

                    <span className="absolute inset-0 grid grid-rows-5">
                        {Array.from({ length: STRIPS }, (_, i) => {
                            const dir = i % 2 ? 1 : -1;
                            return (
                                <span
                                    key={i}
                                    style={{
                                        transform: on ? `translateX(${dir * (5 + i * 1.5)}%) scaleY(0.72)` : "none",
                                        transitionDelay: `${i * 45}ms`,
                                    }}
                                    className={`relative block overflow-hidden transition-transform duration-700 ${EASE} motion-reduce:transition-none`}
                                >
                                    <img
                                        src={src}
                                        alt={i === 0 ? (project.imageAlt ?? `${project.name} screenshot`) : ""}
                                        aria-hidden={i === 0 ? undefined : true}
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                        className="absolute left-0 w-full max-w-none object-cover"
                                        style={{ height: `${STRIPS * 100}%`, top: `-${i * 100}%` }}
                                    />
                                </span>
                            );
                        })}
                    </span>

                    <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-foreground/80">
                        {open ? "tap or move away to close" : "hover or tap: open the frames"}
                    </span>
                </Frame>
            </button>
        </motion.div>
    );
}

/* ---------------------------------------------------------------------------
   Pokeverse: the card tips in from depth as you scroll, then follows the
   cursor in 3D with a soft glare.
   --------------------------------------------------------------------------- */
export function PokeverseVisual({ project, enter, live, reduce }: VisualProps) {
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const sx = useSpring(px, { stiffness: 170, damping: 20 });
    const sy = useSpring(py, { stiffness: 170, damping: 20 });
    const tiltX = useTransform(sy, [0, 1], [8, -8]);
    const tiltY = useTransform(sx, [0, 1], [-10, 10]);
    const lead = useTransform(enter, [0, 1], [24, 0]);
    const rotX = useTransform([tiltX, lead], (v: number[]) => v[0] + v[1]);
    const y = useTransform(enter, [0, 1], [80, 0]);
    const fx = useTransform(sx, (v) => v * 100);
    const fy = useTransform(sy, (v) => v * 100);
    const glare = useMotionTemplate`radial-gradient(circle at ${fx}% ${fy}%, rgba(255,255,255,0.26), transparent 55%)`;
    const src = project.image;

    if (!src) return <Missing project={project} />;

    return (
        <motion.div
            style={live ? { y } : undefined}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || reduce) return;
                const r = e.currentTarget.getBoundingClientRect();
                px.set(clamp01((e.clientX - r.left) / r.width));
                py.set(clamp01((e.clientY - r.top) / r.height));
            }}
            onPointerLeave={() => {
                px.set(0.5);
                py.set(0.5);
            }}
            className="[perspective:1100px]"
        >
            <motion.div
                style={{
                    rotateX: reduce ? 0 : live ? rotX : tiltX,
                    rotateY: reduce ? 0 : tiltY,
                    transformStyle: "preserve-3d",
                }}
                className="relative"
            >
                <Frame ratio={ratioOf(src)}>
                    <img
                        src={src}
                        alt={project.imageAlt ?? `${project.name} screenshot`}
                        width={IMAGE_META[src]?.w}
                        height={IMAGE_META[src]?.h}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 size-full object-cover"
                    />
                    <motion.span aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
                </Frame>
            </motion.div>
        </motion.div>
    );
}

/* ---------------------------------------------------------------------------
   Calculate: the screenshot wipes in from the top, then a lens of full colour
   follows the pointer over a muted copy of the same image.
   --------------------------------------------------------------------------- */
export function CalculateVisual({ project, enter, live, reduce }: VisualProps) {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rr = useSpring(0, { stiffness: 200, damping: 24 });
    const rad = useTransform(rr, (v) => Math.max(0, v));
    const mask = useMotionTemplate`radial-gradient(circle ${rad}px at ${mx}px ${my}px, #000 0, #000 72%, transparent 100%)`;
    const wipe = useTransform(enter, [0, 1], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
    const ref = useRef<HTMLDivElement>(null);
    const src = project.image;

    if (!src) return <Missing project={project} />;

    const track = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
    };

    return (
        <motion.div style={live ? { clipPath: wipe } : undefined}>
            <div
                ref={ref}
                style={{ touchAction: "pan-y" }}
                onPointerEnter={(e) => {
                    track(e);
                    if (!reduce) rr.set(150);
                }}
                onPointerMove={track}
                onPointerLeave={() => rr.set(0)}
                onPointerUp={(e) => {
                    if (e.pointerType !== "mouse") window.setTimeout(() => rr.set(0), 1200);
                }}
            >
                <Frame ratio={ratioOf(src)}>
                    <img
                        src={src}
                        alt={project.imageAlt ?? `${project.name} screenshot`}
                        width={IMAGE_META[src]?.w}
                        height={IMAGE_META[src]?.h}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 size-full object-cover saturate-[0.35] brightness-90"
                    />
                    <motion.img
                        src={src}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="absolute inset-0 size-full object-cover"
                        style={{ maskImage: mask, WebkitMaskImage: mask }}
                    />
                    <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-foreground/80">
                        move over it to bring it into focus
                    </span>
                </Frame>
            </div>
        </motion.div>
    );
}

/* ---------------------------------------------------------------------------
   AlgoForge: the real uploaded screenshots, at their own aspect ratios,
   layered like sheets. They slide in one after another and drift at different
   speeds while the next project covers this one. Hover, focus or click brings
   one to the front. Small screens get a snap-scrolling strip instead.
   --------------------------------------------------------------------------- */
const POS: Record<number, { l: number; t: number; w: number }[]> = {
    1: [{ l: 0, t: 0, w: 100 }],
    2: [
        { l: 0, t: 0, w: 78 },
        { l: 22, t: 34, w: 78 },
    ],
    3: [
        { l: 0, t: 0, w: 70 },
        { l: 30, t: 26, w: 68 },
        { l: 6, t: 54, w: 52 },
    ],
    4: [
        { l: 0, t: 0, w: 70 },
        { l: 30, t: 22, w: 66 },
        { l: 4, t: 50, w: 52 },
        { l: 50, t: 54, w: 46 },
    ],
};

type ShotCardProps = {
    src: string;
    k: number;
    total: number;
    pos: { l: number; t: number; w: number };
    front: number;
    onFront: (k: number) => void;
    enter: MotionValue<number>;
    exit: MotionValue<number>;
    live: boolean;
    name: string;
};

function ShotCard({ src, k, total, pos, front, onFront, enter, exit, live, name }: ShotCardProps) {
    const a = Math.min(0.5, k * 0.12);
    const x = useTransform(enter, [a, a + 0.5], ["26%", "0%"]);
    const o = useTransform(enter, [a, a + 0.4], [0, 1]);
    const lift = useTransform(exit, [0, 1], [0, -(k + 1) * 16]);
    const motionStyle = live ? { x, opacity: o, y: lift } : {};

    return (
        <motion.div
            style={{ left: `${pos.l}%`, top: `${pos.t}%`, width: `${pos.w}%`, zIndex: front === k ? 20 : 10 - k, ...motionStyle }}
            className="absolute"
        >
            <button
                type="button"
                aria-label={`Bring ${name} screenshot ${k + 1} of ${total} to the front`}
                aria-pressed={front === k}
                onClick={() => onFront(k)}
                onFocus={() => onFront(k)}
                onPointerEnter={(e) => e.pointerType === "mouse" && onFront(k)}
                className={`block w-full cursor-pointer outline-none transition-transform duration-500 ${EASE} hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none`}
            >
                <span className={`block overflow-hidden rounded-[6px] border border-border bg-background ${SHADOW}`}>
                    <Shot src={src} alt={`${name} screenshot ${k + 1}`} eager={k === 0} />
                </span>
            </button>
        </motion.div>
    );
}

export function AlgoForgeVisual({ project, enter, exit, live }: VisualProps) {
    const all = project.shots ?? [];
    const [front, setFront] = useState(0);
    const shots = all.slice(0, 4);
    const layout = POS[Math.min(4, shots.length)];

    if (shots.length === 0) return <Missing project={project} />;

    return (
        <div>
            <div className="relative hidden aspect-[5/4] w-full lg:block">
                {shots.map((src, k) => (
                  
                    <ShotCard
                        key={src}
                        src={src}
                        k={k}
                        total={all.length}
                        pos={layout[k]}
                        front={front}
                        onFront={setFront}
                        enter={enter}
                        exit={exit}
                        live={live}
                        name={project.name}
                    />
                ))}
            </div>

            <ul
                aria-label={`${project.name} screenshots`}
                className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
            >
                {all.map((src, k) => (
                    <li key={src} className="w-[84%] shrink-0 snap-center sm:w-[70%]">
                        <span className={`block overflow-hidden rounded-[6px] border border-border bg-background ${SHADOW}`}>
                            <Shot src={src} alt={`${project.name} screenshot ${k + 1}`} eager={k === 0} />
                        </span>
                    </li>
                ))}
            </ul>

            <p className="mt-3 font-mono text-xs text-muted-foreground" aria-live="polite">
                <span className="hidden lg:inline">
                    Screenshot {front + 1} of {all.length}
                    {all.length > shots.length ? ` (${shots.length} shown)` : ""}
                </span>
                <span className="lg:hidden">{all.length} screenshots, swipe sideways</span>
            </p>
        </div>
    );
}

function GenericVisual({ project }: VisualProps) {
    const src = project.image;
    if (!src) return <Missing project={project} />;
    return (
        <Frame ratio={ratioOf(src)}>
            <img src={src} alt={project.imageAlt ?? `${project.name} screenshot`} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        </Frame>
    );
}

export const VISUALS: Record<string, ComponentType<VisualProps>> = {
    hermes: HermesVisual,
    pokeverse: PokeverseVisual,
    calculate: CalculateVisual,
    algoforge: AlgoForgeVisual,
};

export const visualFor = (id: string): ComponentType<VisualProps> => VISUALS[id] ?? GenericVisual;
