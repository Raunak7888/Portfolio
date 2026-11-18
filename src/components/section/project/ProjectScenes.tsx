"use client";
/* eslint-disable @next/next/no-img-element */

import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type Ref,
} from "react";
import {
    animate,
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
    useTransform,
    type MotionStyle,
} from "framer-motion";
import { clamp01 } from "@/lib/utils";
import type { Project } from "@/content/projects";

const tiltSpring = { stiffness: 170, damping: 20 } as const;

/* ==========================================================================
   SLAB + STAGE
   The stage gives a container-query box. The slab inside it is exactly the
   screenshot's own aspect ratio, scaled to the biggest size that still fits,
   so the whole screenshot is always visible and never cropped.
   ========================================================================== */

export type SceneProps = {
    project: Project;
    play: boolean;
    fine: boolean;
    reduce: boolean;
};

export function Stage({
    children,
    onPointerMove,
    onPointerLeave,
}: {
    children: ReactNode;
    onPointerMove?: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerLeave?: () => void;
}) {
    return (
        <div
            className="absolute inset-x-[5%] bottom-[11%] top-[2%]"
            style={{ containerType: "size" } as CSSProperties}
        >
            <div
                className="absolute inset-0 flex items-center justify-center [perspective:1100px]"
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
            >
                {children}
            </div>
        </div>
    );
}

export function Slab({
    ratio,
    style,
    slabRef,
    children,
}: {
    ratio: number;
    style?: MotionStyle;
    slabRef?: Ref<HTMLDivElement>;
    children: ReactNode;
}) {
    return (
        <motion.div
            ref={slabRef}
            style={{
                width: `min(100cqw, calc(100cqh * ${ratio}))`,
                aspectRatio: ratio,
                ...style,
            }}
            className="relative shrink-0 overflow-hidden rounded-xl border border-[color-mix(in_oklab,var(--foreground)_16%,transparent)] bg-background shadow-[0_30px_70px_-30px_rgba(0,0,0,0.75)]"
        >
            {children}
        </motion.div>
    );
}

export function Placeholder({ project }: { project: Project }) {
    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{
                backgroundImage:
                    "linear-gradient(color-mix(in oklab, var(--tint) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--tint) 10%, transparent) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
            }}
        >
            <span className="flex size-16 items-center justify-center rounded-3xl bg-[color-mix(in_oklab,var(--tint)_22%,transparent)] text-2xl font-semibold text-[color:var(--tint)]">
                {project.name.slice(0, 2)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Screenshot unavailable</span>
        </div>
    );
}

export function ImageSlab({
    project,
    style,
    slabRef,
    children,
}: {
    project: Project;
    style?: MotionStyle;
    slabRef?: Ref<HTMLDivElement>;
    children?: ReactNode;
}) {
    const [ratio, setRatio] = useState(1.6);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const src = project.image;

    /* a cached image can finish loading before React attaches onLoad */
    useEffect(() => {
        const el = imgRef.current;
        if (!el || !el.complete) return;
        if (el.naturalWidth > 0 && el.naturalHeight > 0) {
            setRatio(el.naturalWidth / el.naturalHeight);
            setLoaded(true);
        } else {
            setFailed(true);
        }
    }, [src]);

    return (
        <Slab ratio={ratio} style={style} slabRef={slabRef}>
            {src && !failed ? (
                <img
                    ref={imgRef}
                    src={src}
                    alt={project.imageAlt ?? `${project.name} screenshot`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onLoad={(e) => {
                        const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                        if (w > 0 && h > 0) setRatio(w / h);
                        setLoaded(true);
                    }}
                    onError={() => setFailed(true)}
                    className={`absolute inset-0 size-full transition-opacity duration-500 ${
                        loaded ? "opacity-100" : "opacity-0"
                    }`}
                />
            ) : (
                <Placeholder project={project} />
            )}
            {children}
        </Slab>
    );
}

export function Readout({ text, tint }: { text: string; tint: string }) {
    return (
        <span className="absolute bottom-2 left-[5%] inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 font-mono text-xs text-foreground/80 backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: tint }} />
            {text}
        </span>
    );
}

/* ==========================================================================
   SCENE 2 · POKEVERSE · "foil"
   The screenshot tilts in 3D like a trading card, with a holographic foil
   and a glare that follow the cursor. On touch it sweeps by itself.
   ========================================================================== */

export const FOIL =
    "linear-gradient(115deg, transparent 12%, hsl(175 100% 68% / 0.55) 28%, hsl(290 100% 74% / 0.55) 44%, hsl(55 100% 68% / 0.55) 60%, hsl(150 100% 68% / 0.55) 76%, transparent 90%)";

export function FoilScene({ project, play, fine, reduce }: SceneProps) {
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const sx = useSpring(px, tiltSpring);
    const sy = useSpring(py, tiltSpring);
    const lift = useSpring(1, { stiffness: 220, damping: 20 });

    const rotX = useTransform(sy, [0, 1], [11, -11]);
    const rotY = useTransform(sx, [0, 1], [-14, 14]);
    const fx = useTransform(sx, (v) => v * 100);
    const fy = useTransform(sy, (v) => v * 100);
    const foilPos = useMotionTemplate`${fx}% ${fy}%`;
    const glare = useMotionTemplate`radial-gradient(circle at ${fx}% ${fy}%, rgba(255,255,255,0.4), transparent 55%)`;

    useEffect(() => {
        lift.set(play && !reduce ? 1.04 : 1);
    }, [play, reduce, lift]);

    /* touch devices have no cursor, so the light sweeps on its own */
    useEffect(() => {
        if (!play || fine || reduce) return;
        const a = animate(px, [0.12, 0.88], {
            duration: 2.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
        });
        const b = animate(py, [0.2, 0.8], {
            duration: 3.1,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
        });
        return () => {
            a.stop();
            b.stop();
            px.set(0.5);
            py.set(0.5);
        };
    }, [play, fine, reduce, px, py]);

    function onMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!fine || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(clamp01((e.clientX - r.left) / r.width));
        py.set(clamp01((e.clientY - r.top) / r.height));
    }

    function onLeave() {
        px.set(0.5);
        py.set(0.5);
    }

    return (
        <>
            <Stage onPointerMove={onMove} onPointerLeave={onLeave}>
                <ImageSlab project={project} style={{ rotateX: rotX, rotateY: rotY, scale: lift }}>
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 mix-blend-color-dodge"
                        style={{
                            backgroundImage: FOIL,
                            backgroundSize: "220% 220%",
                            backgroundPosition: foilPos,
                        }}
                        animate={{ opacity: play ? 0.42 : 0 }}
                        transition={{ duration: 0.35 }}
                    />
                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                        style={{ background: glare }}
                        animate={{ opacity: play ? 1 : 0 }}
                        transition={{ duration: 0.35 }}
                    />
                </ImageSlab>
            </Stage>
            <Readout text={project.readout} tint={project.tint} />
        </>
    );
}

/* ==========================================================================
   SCENE 3 · CALCULATE · "loupe"
   A magnifier follows the cursor and shows the screenshot at 2.2x.
   The full screenshot stays visible underneath. On touch it drifts by itself.
   ========================================================================== */

export const LENS = 88;
export const LENS_ZOOM = 2.2;

export function LoupeScene({ project, play, fine, reduce }: SceneProps) {
    const slabRef = useRef<HTMLDivElement>(null);

    const lx = useMotionValue(0);
    const ly = useMotionValue(0);
    const sx = useSpring(lx, { stiffness: 260, damping: 28 });
    const sy = useSpring(ly, { stiffness: 260, damping: 28 });
    const rad = useSpring(0, { stiffness: 220, damping: 20 });

    /* a spring can overshoot below zero, and a negative radius breaks clip-path */
    const r = useTransform(rad, (v) => Math.max(0, v));
    const clip = useMotionTemplate`circle(${r}px at ${sx}px ${sy}px)`;
    const origin = useMotionTemplate`${sx}px ${sy}px`;
    const ringX = useTransform(sx, (v) => v - LENS);
    const ringY = useTransform(sy, (v) => v - LENS);
    const ringScale = useTransform(r, (v) => v / LENS);
    const ringOpacity = useTransform(r, (v) => Math.min(1, v / 24));

    useEffect(() => {
        rad.set(play && !reduce ? LENS : 0);
    }, [play, reduce, rad]);

    /* touch devices: drift the lens across the screenshot */
    useEffect(() => {
        if (!play || fine || reduce) return;
        const el = slabRef.current;
        if (!el) return;
        const { width: w, height: h } = el.getBoundingClientRect();
        const a = animate(lx, [w * 0.22, w * 0.78], {
            duration: 2.6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
        });
        const b = animate(ly, [h * 0.3, h * 0.62], {
            duration: 3.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
        });
        return () => {
            a.stop();
            b.stop();
        };
    }, [play, fine, reduce, lx, ly]);

    function onMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!fine || reduce) return;
        const el = slabRef.current;
        if (!el) return;
        const rc = el.getBoundingClientRect();
        lx.set(Math.min(Math.max(e.clientX - rc.left, 0), rc.width));
        ly.set(Math.min(Math.max(e.clientY - rc.top, 0), rc.height));
    }

    return (
        <>
            <Stage onPointerMove={onMove}>
                <ImageSlab project={project} slabRef={slabRef}>
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 overflow-hidden"
                        style={{ clipPath: clip }}
                    >
                        <motion.img
                            src={project.image}
                            alt=""
                            draggable={false}
                            className="absolute inset-0 size-full max-w-none"
                            style={{ transformOrigin: origin, scale: LENS_ZOOM }}
                        />
                    </motion.div>

                    <motion.span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-[color:var(--tint)] shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_18px_40px_-10px_rgba(0,0,0,0.7)]"
                        style={{
                            x: ringX,
                            y: ringY,
                            width: LENS * 2,
                            height: LENS * 2,
                            scale: ringScale,
                            opacity: ringOpacity,
                        }}
                    />
                </ImageSlab>
            </Stage>
            <Readout text={project.readout} tint={project.tint} />
        </>
    );
}
