"use client";

import { useEffect, useRef, useState } from "react";
import {
    AnimatePresence,
    LayoutGroup,
    MotionConfig,
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    type Transition,
    type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Download04Icon,
    GithubIcon,
    InstagramIcon,
    Linkedin01Icon,
    Mail01Icon,
    Message01Icon,
    Tick02Icon,
} from "@hugeicons/core-free-icons";
import data from "@/Data/Data.json";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const RESUME_URL = "/resume.pdf"; // put your file in /public/resume.pdf
const RESUME_FILENAME = "Raunak-Yadav-Resume.pdf";

const links = data.heroSection.socialLinks;
const isExternal = (href: string) => href.startsWith("http");

// Cell is 44px → 22px = fully round side. Order: TL TR BR BL
const R_FIRST = "22px 12px 12px 22px"; // rounded-l-full, rounded-r-xl
const R_MID = "12px 12px 12px 12px"; //  rounded-xl
const R_LAST = "12px 22px 22px 12px"; //  rounded-r-full, rounded-l-xl

const SOFT: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };
const GLIDE: Transition = { type: "spring", stiffness: 520, damping: 38, mass: 0.6 };
const POP: Transition = { type: "spring", stiffness: 600, damping: 18, mass: 0.6 };
const MAGNET = { stiffness: 300, damping: 20, mass: 0.5 };

// ─────────────────────────────────────────────────────────────────────────────
// Entrance — segments rise, cells pop with a twist, one shimmer sweeps across
// ─────────────────────────────────────────────────────────────────────────────

const trayV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const segmentV: Variants = {
    hidden: { opacity: 0, y: 22, scale: 0.9, filter: "blur(6px)" },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { ...SOFT, staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const cellV: Variants = {
    hidden: { opacity: 0, scale: 0.3, rotate: -40, y: 10 },
    show: { opacity: 1, scale: 1, rotate: 0, y: 0, transition: POP },
};

const sweepV: Variants = {
    hidden: { x: "-120%", opacity: 0 },
    show: {
        x: "260%",
        opacity: [0, 1, 0],
        transition: { duration: 1.1, delay: 0.5, ease: "easeInOut" },
    },
};

// Per-icon personality (rest → hover). Plays while the cell is active.
const ICON_FX: Record<string, Variants> = {
    github: {
        rest: { rotate: 0, scale: 1, y: 0 },
        hover: { rotate: [0, -14, 12, -6, 0], scale: 1.18, y: -1.5, transition: { duration: 0.6 } },
    },
    linkedin: {
        rest: { scale: 1, y: 0 },
        hover: { scale: [1, 1.3, 1.15], y: -2, transition: { duration: 0.45, ease: "easeOut" } },
    },
    instagram: {
        rest: { rotate: 0, scale: 1 },
        hover: { rotate: [0, -12, 90, 0], scale: [1, 1.2, 1.15], transition: { duration: 0.7 } },
    },
    email: {
        rest: { y: 0, scale: 1 },
        hover: { y: [0, -5, 0, -2.5, -1.5], scale: 1.15, transition: { duration: 0.6 } },
    },
    resume: {
        rest: { y: 0 },
        hover: { y: [0, 2.5, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } },
    },
    contact: {
        rest: { rotate: 0, scale: 1, y: 0 },
        hover: { rotate: [0, -14, 10, -5, 0], scale: 1.18, y: -2, transition: { duration: 0.6 } },
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Segment — dark pill: cursor spotlight, orbiting border light, entrance sweep
// ─────────────────────────────────────────────────────────────────────────────

function Segment({
    className = "",
    children,
    label,
    reduce,
}: {
    className?: string;
    children: React.ReactNode;
    label?: string;
    reduce: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(-200);
    const y = useMotionValue(-200);
    const glow = useSpring(0, { stiffness: 200, damping: 26 });
    const bg = useMotionTemplate`radial-gradient(120px circle at ${x}px ${y}px, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)`;

    return (
        <motion.div
            ref={ref}
            role={label ? "group" : undefined}
            aria-label={label}
            variants={segmentV}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || !ref.current) return;
                const r = ref.current.getBoundingClientRect();
                x.set(e.clientX - r.left);
                y.set(e.clientY - r.top);
                glow.set(1);
            }}
            onPointerLeave={() => glow.set(0)}
            className={`relative flex items-center gap-1 border border-border/70 bg-muted/40 p-1 backdrop-blur-md ${className}`}
        >
            {/* effects layer — clipped to the pill so the tooltip above isn't */}
            <span
                aria-hidden
                className="pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit]"
            >
                <motion.span
                    style={{ background: bg, opacity: glow }}
                    className="absolute inset-0"
                />

                {/* orbiting light on the border, only while hovered */}
                <motion.span
                    style={{
                        opacity: glow,
                        padding: 1,
                        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }}
                    className="absolute inset-0 overflow-hidden rounded-[inherit]"
                >
                    <motion.span
                        style={{
                            x: "-50%",
                            y: "-50%",
                            background:
                                "conic-gradient(from 0deg, transparent 0 60%, var(--primary) 88%, transparent 100%)",
                        }}
                        animate={reduce ? undefined : { rotate: 360 }}
                        transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
                        className="absolute left-1/2 top-1/2 aspect-square w-[260%] will-change-transform"
                    />
                </motion.span>

                {/* one-shot entrance shimmer */}
                <motion.span
                    variants={sweepV}
                    className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
            </span>
            {children}
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Burst — particles + ring when a download completes
// ─────────────────────────────────────────────────────────────────────────────

function Burst() {
    const dots = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
    return (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <motion.span
                initial={{ scale: 0.5, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute size-9 rounded-full border border-primary"
            />
            {dots.map((a, i) => (
                <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{
                        x: Math.cos(a) * (i % 2 ? 30 : 22),
                        y: Math.sin(a) * (i % 2 ? 30 : 22),
                        scale: 0,
                        opacity: 0,
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="absolute size-1.5 rounded-full bg-primary"
                />
            ))}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cell — magnetic icon button: shared highlight, ripple, tooltip, icon motion
// ─────────────────────────────────────────────────────────────────────────────

interface CellProps {
    id: string;
    label: string;
    href: string;
    radius: string;
    active: boolean;
    onActive: (id: string | null) => void;
    children: React.ReactNode;
    reduce: boolean;
    tooltip?: string;
    pinTooltip?: boolean;
    overlay?: React.ReactNode;
    anchorProps?: React.ComponentProps<typeof motion.a>;
}

function Cell({
    id,
    label,
    href,
    radius,
    active,
    onActive,
    children,
    reduce,
    tooltip,
    pinTooltip,
    overlay,
    anchorProps,
}: CellProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const mx = useSpring(0, MAGNET);
    const my = useSpring(0, MAGNET);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const rippleId = useRef(0);
    const showTip = active || !!pinTooltip;

    const onMove = (e: React.PointerEvent) => {
        if (reduce || e.pointerType !== "mouse" || !wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mx.set(Math.max(-5, Math.min(5, dx * 0.25)));
        my.set(Math.max(-5, Math.min(5, dy * 0.25)));
    };
    const onLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const onDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
        navigator.vibrate?.(8);
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const rid = ++rippleId.current;
        setRipples((p) => [...p, { id: rid, x: e.clientX - r.left, y: e.clientY - r.top }]);
        setTimeout(() => setRipples((p) => p.filter((q) => q.id !== rid)), 650);
    };

    return (
        <motion.div
            ref={wrapRef}
            variants={cellV}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="relative size-11"
        >
            <motion.a
                href={href}
                target={isExternal(href) ? "_blank" : undefined}
                rel={isExternal(href) ? "noopener noreferrer" : undefined}
                aria-label={label}
                data-tray-item
                onPointerEnter={(e) => e.pointerType === "mouse" && onActive(id)}
                onPointerLeave={() => onActive(null)}
                onPointerDown={onDown}
                onFocus={(e) => e.currentTarget.matches(":focus-visible") && onActive(id)}
                onBlur={() => onActive(null)}
                whileTap={{ scale: 0.84 }}
                transition={POP}
                style={{ x: mx, y: my, borderRadius: radius }}
                className={`relative z-10 grid size-full place-items-center overflow-hidden outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary/70 ${
                    active ? "text-primary" : "text-foreground/70"
                }`}
                {...anchorProps}
            >
                {active && (
                    <motion.span
                        layoutId="tray-highlight"
                        transition={GLIDE}
                        aria-hidden
                        style={{ borderRadius: radius }}
                        className="absolute inset-0 bg-primary/15 shadow-[0_0_18px_-4px_var(--primary)] ring-1 ring-inset ring-primary/30"
                    />
                )}

                {/* click ripples */}
                {ripples.map((r) => (
                    <motion.span
                        key={r.id}
                        aria-hidden
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ left: r.x - 10, top: r.y - 10 }}
                        className="pointer-events-none absolute size-5 rounded-full bg-primary"
                    />
                ))}

                <motion.span
                    variants={ICON_FX[id] ?? ICON_FX.github}
                    initial={false}
                    animate={active ? "hover" : "rest"}
                    className="relative grid place-items-center"
                >
                    {children}
                </motion.span>
            </motion.a>

            {overlay}

            {/* tooltip */}
            <AnimatePresence>
                {showTip && (
                    <motion.span
                        aria-hidden
                        initial={{ opacity: 0, y: 8, scale: 0.8, rotate: -4 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92, transition: { duration: 0.1 } }}
                        transition={POP}
                        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 -translate-x-1/2"
                    >
                        <span className="relative block whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow-lg">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                    key={tooltip ?? label}
                                    initial={{ opacity: 0, y: 7, filter: "blur(3px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -7, filter: "blur(3px)" }}
                                    transition={{ duration: 0.16, ease: "easeOut" }}
                                    className="block"
                                >
                                    {tooltip ?? label}
                                </motion.span>
                            </AnimatePresence>
                            <span className="absolute left-1/2 top-full -mt-1 size-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-foreground" />
                        </span>
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume icon — download → progress ring → tick
// ─────────────────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "done";

function ResumeIcon({ status }: { status: Status }) {
    return (
        <span className="relative grid size-8 place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32" aria-hidden>
                <motion.rect
                    x="1"
                    y="1"
                    width="30"
                    height="30"
                    rx="10"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                        pathLength: status === "idle" ? 0 : status === "loading" ? 0.85 : 1,
                        opacity: status === "idle" ? 0 : 1,
                    }}
                    transition={{ duration: status === "loading" ? 1 : 0.3, ease: "easeOut" }}
                />
            </svg>
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={status === "done" ? "done" : "dl"}
                    initial={{ scale: 0.3, opacity: 0, rotate: -60 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotate: 60 }}
                    transition={POP}
                    className="grid place-items-center"
                >
                    <motion.span
                        animate={status === "loading" ? { y: [0, 3, 0] } : { y: 0 }}
                        transition={
                            status === "loading"
                                ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                                : { duration: 0.2 }
                        }
                        className="grid place-items-center"
                    >
                        <HugeiconsIcon
                            icon={status === "done" ? Tick02Icon : Download04Icon}
                            size={20}
                            strokeWidth={1.8}
                        />
                    </motion.span>
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tray — [ GitHub · LinkedIn · Instagram · Email ] [ Resume ] [ Contact ]
// ─────────────────────────────────────────────────────────────────────────────

const SOCIALS = [
    { id: "github", label: "GitHub", href: links.githubUrl, icon: GithubIcon },
    { id: "linkedin", label: "LinkedIn", href: links.linkedInUrl, icon: Linkedin01Icon },
    { id: "instagram", label: "Instagram", href: links.instagramUrl, icon: InstagramIcon },
    { id: "email", label: "Email", href: links.gmailUrl, icon: Mail01Icon },
];

export default function HeroTray({ delay = 1.2 }: { delay?: number }) {
    const reduce = !!useReducedMotion();
    const [ready, setReady] = useState(false);
    const [active, setActive] = useState<string | null>(null);
    const trayRef = useRef<HTMLDivElement>(null);

    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const [status, setStatus] = useState<Status>("idle");

    useEffect(() => {
        if (reduce) return;
        const t = setTimeout(() => setReady(true), delay * 1000);
        return () => clearTimeout(t);
    }, [delay, reduce]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    const onResumeClick = () => {
        if (status !== "idle") return;
        setStatus("loading");
        timers.current.push(
            setTimeout(() => setStatus("done"), 1100),
            setTimeout(() => setStatus("idle"), 3000),
        );
    };

    // ← / → move between every cell in the tray (Home / End jump to the ends)
    const onKeyDown = (e: React.KeyboardEvent) => {
        const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        if (!keys.includes(e.key) || !trayRef.current) return;
        const items = Array.from(trayRef.current.querySelectorAll<HTMLAnchorElement>("a[data-tray-item]"));
        const i = items.indexOf(document.activeElement as HTMLAnchorElement);
        if (i === -1) return;
        e.preventDefault();
        const next =
            e.key === "Home"
                ? 0
                : e.key === "End"
                  ? items.length - 1
                  : (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
        items[next].focus();
    };

    const resumeTip =
        status === "loading" ? "Downloading…" : status === "done" ? "Downloaded" : "Resume";

    return (
        <MotionConfig reducedMotion="user">
            <LayoutGroup id="hero-tray">
                <motion.div
                    ref={trayRef}
                    onKeyDown={onKeyDown}
                    variants={trayV}
                    initial={reduce ? false : "hidden"}
                    animate={reduce || ready ? "show" : "hidden"}
                    className="flex flex-wrap items-center justify-center gap-1.5 sm:flex-nowrap"
                >
                    {/* 1 · socials — rounded left */}
                    <Segment
                        label="Social links"
                        reduce={reduce}
                        className="rounded-l-full rounded-r-2xl"
                    >
                        {SOCIALS.map((s, i) => (
                            <Cell
                                key={s.id}
                                id={s.id}
                                label={s.label}
                                href={s.href}
                                radius={i === 0 ? R_FIRST : R_MID}
                                active={active === s.id}
                                onActive={setActive}
                                reduce={reduce}
                            >
                                <HugeiconsIcon icon={s.icon} size={20} strokeWidth={1.8} />
                            </Cell>
                        ))}
                    </Segment>

                    {/* 2 · resume */}
                    <Segment reduce={reduce} className="">
                        <Cell
                            id="resume"
                            label="Download resume"
                            tooltip={resumeTip}
                            pinTooltip={status !== "idle"}
                            href={RESUME_URL}
                            radius={R_MID}
                            active={active === "resume"}
                            onActive={setActive}
                            reduce={reduce}
                            overlay={status === "done" ? <Burst key="burst" /> : null}
                            anchorProps={{ download: RESUME_FILENAME, onClick: onResumeClick }}
                        >
                            <ResumeIcon status={status} />
                        </Cell>
                        <span className="sr-only" aria-live="polite">
                            {status === "loading"
                                ? "Downloading resume"
                                : status === "done"
                                  ? "Resume downloaded"
                                  : ""}
                        </span>
                    </Segment>

                    {/* 3 · contact — rounded right */}
                    <Segment reduce={reduce} className="rounded-l-2xl rounded-r-full">
                        <Cell
                            id="contact"
                            label="Contact"
                            href={"#contact"}
                            radius={R_LAST}
                            active={active === "contact"}
                            onActive={setActive}
                            reduce={reduce}
                        >
                            <HugeiconsIcon icon={Message01Icon} size={20} strokeWidth={1.8} />
                        </Cell>
                    </Segment>
                </motion.div>
            </LayoutGroup>
        </MotionConfig>
    );
}