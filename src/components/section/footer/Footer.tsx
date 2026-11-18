"use client";
/* redesign:v4 */

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence, useScroll, useTransform, Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mail01Icon,
    Copy01Icon,
    Tick02Icon,
    Location01Icon,
    Clock01Icon,
    ArrowUp02Icon,
    ArrowUpRight01Icon,
    SparklesIcon,
    GithubIcon,
    Linkedin01Icon,
    NewTwitterIcon,
    DribbbleIcon,
    Globe02Icon,
} from "@hugeicons/core-free-icons";
import AnimatedLink from "@/components/ui/AnimatedLink";
import { portfolio } from "@/content/data";
import { site } from "@/content/site";

const LABEL = "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground";
const f = portfolio.footer;

/** Maps social labels to corresponding Hugeicons icon definitions */
function getSocialIcon(label: string) {
    const key = label.toLowerCase();
    if (key.includes("github")) return GithubIcon;
    if (key.includes("linkedin")) return Linkedin01Icon;
    if (key.includes("twitter") || key.includes("x")) return NewTwitterIcon;
    if (key.includes("dribbble")) return DribbbleIcon;
    return Globe02Icon;
}

/** Local time with blinking colon & subtle icons */
function LocalClock() {
    const [time, setTime] = useState<{ hours: string; minutes: string } | null>(null);

    useEffect(() => {
        const update = () => {
            const parts = new Intl.DateTimeFormat("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: site.timezone,
            }).formatToParts(new Date());

            const hours = parts.find((p) => p.type === "hour")?.value ?? "--";
            const minutes = parts.find((p) => p.type === "minute")?.value ?? "--";
            setTime({ hours, minutes });
        };

        update();
        const id = window.setInterval(update, 15000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <div className="flex flex-col gap-2 pt-1 text-sm text-muted-foreground" suppressHydrationWarning>
            <div className="inline-flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} size={15} strokeWidth={1.75} className="shrink-0 text-primary/70" />
                <span>{site.location}</span>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs">
                <HugeiconsIcon icon={Clock01Icon} size={15} strokeWidth={1.75} className="shrink-0 text-primary/70" />
                <span className="tabular-nums tracking-wider">
                    {time ? (
                        <>
                            {time.hours}
                            <span className="mx-0.5 animate-pulse text-primary motion-reduce:animate-none">:</span>
                            {time.minutes}
                        </>
                    ) : (
                        "--:--"
                    )}
                </span>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground/80">
                    Local
                </span>
            </div>
        </div>
    );
}

/** Ambient background SVG graphics (dot grid + slow-rotating wireframe ring) */
function AmbientGraphics({ reduce }: { reduce: boolean }) {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
            {/* Top Glowing Hairline */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

            {/* Subtle Radial Glow */}
            <div className="absolute -bottom-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

            {/* Faint Architectural Dot Pattern */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]">
                <defs>
                    <pattern id="footer-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                        <circle cx="1.5" cy="1.5" r="1" className="fill-muted-foreground/40" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#footer-dots)" />
            </svg>

            {/* Slow-Rotating Geometric Emblem on Right */}
            <motion.svg
                viewBox="0 0 240 240"
                className="absolute -right-16 -bottom-20 size-72 text-border/40"
                fill="none"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
                <circle cx="120" cy="120" r="108" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="120" cy="120" r="76" stroke="currentColor" strokeWidth="0.75" />
                <path d="M120 4V236M4 120H236" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 8" />
            </motion.svg>
        </div>
    );
}

interface SignatureProps {
    reduce?: boolean;
}

export function Signature({ reduce = false }: SignatureProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Gentle global parallax instead of chaotic per-letter jumping
    const yRange = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [20, -20]);

    const nameString = site.fullName; // Keep original casing or lowercase for a cleaner look

    return (
        <div 
            ref={containerRef} 
            className="relative w-full py-12 text-center select-none overflow-hidden"
        >
            <motion.div 
                style={{ y: yRange }}
                className="inline-block"
            >
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xl sm:text-2xl md:text-3xl font-light tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500 cursor-default"
                >
                    {nameString}
                </motion.h2>

                {/* Optional minimalist sub-detail (e.g., role or location) */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-xs tracking-[0.4em] text-muted-foreground/60 uppercase mt-2 font-mono"
                >
                    {`${portfolio.hero.role?.before} ${portfolio.hero.role?.highlight}`} — {new Date().getFullYear()}
                </motion.p>
            </motion.div>
        </div>
    );
}
export default function Footer() {
    const reduce = !!useReducedMotion();
    const [copied, setCopied] = useState(false);
    const year = new Date().getFullYear();

    function toTop() {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(site.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback silently if clipboard permissions are blocked
        }
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: reduce ? 0 : 0.1,
                delayChildren: reduce ? 0 : 0.05,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 14 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <footer
            id="footer"
            className="relative w-full max-w-[100vw] overflow-hidden border-t border-border/80 bg-background px-4 pt-14 pb-8 sm:px-6 sm:pt-20 sm:pb-10"
        >
            <AmbientGraphics reduce={reduce} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-14"
            >
                {/* Main 3-Column Grid */}
                <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
                    {/* Column 1: Identity & Status Pill */}
                    <motion.div variants={itemVariants} className="flex flex-col items-start gap-4">
                        <div className="group inline-flex items-center gap-2">
                            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                {site.fullName}
                                <motion.span
                                    className="inline-block text-primary"
                                    whileHover={reduce ? undefined : { scale: 1.4, rotate: 12 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    .
                                </motion.span>
                            </p>
                        </div>

                        {f.note && (
                            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                                {f.note}
                            </p>
                        )}

                        {f.availability && (
                            <div className="mt-1 inline-flex items-center gap-2.5 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:border-primary/40">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-65 motion-reduce:animate-none" />
                                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                                </span>
                                <span>{f.availability}</span>
                                <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={1.75} className="text-primary" />
                            </div>
                        )}
                    </motion.div>

                    {/* Column 2: Contact & Live Telemetry */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-3.5">
                        <p className={LABEL}>Contact</p>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-2 text-base font-medium [overflow-wrap:anywhere]">
                                <HugeiconsIcon icon={Mail01Icon} size={17} strokeWidth={1.75} className="shrink-0 text-primary" />
                                <AnimatedLink href={`mailto:${site.email}`}>{site.email}</AnimatedLink>
                            </div>

                            {/* Quick Copy Button */}
                            <motion.button
                                type="button"
                                onClick={copyEmail}
                                whileTap={reduce ? undefined : { scale: 0.92 }}
                                aria-label="Copy email address"
                                title={copied ? "Copied!" : "Copy email"}
                                className="inline-flex size-7 items-center justify-center rounded-md border border-border/70 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {copied ? (
                                        <motion.span
                                            key="check"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2} className="text-primary" />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="copy"
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <HugeiconsIcon icon={Copy01Icon} size={14} strokeWidth={1.75} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>

                        <LocalClock />
                    </motion.div>

                    {/* Column 3: Social Links */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-3.5">
                        <p className={LABEL}>Elsewhere</p>
                        <ul className="flex flex-col gap-2.5 text-sm sm:text-base">
                            {site.social.map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-2.5 text-foreground/90 transition-colors hover:text-foreground"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/20 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                                            <HugeiconsIcon
                                                icon={getSocialIcon(l.label)}
                                                size={16}
                                                strokeWidth={1.75}
                                                className="text-muted-foreground transition-colors duration-300 group-hover:text-primary"
                                            />
                                        </span>
                                        <span className="relative">
                                            {l.label}
                                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                                        </span>
                                        <HugeiconsIcon
                                            icon={ArrowUpRight01Icon}
                                            size={14}
                                            strokeWidth={2}
                                            className="text-muted-foreground/60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        © {year} {site.fullName}. {f.copyright ?? "All rights reserved."}
                    </p>

                    <motion.button
                        type="button"
                        onClick={toTop}
                        whileHover={reduce ? undefined : { y: -2 }}
                        whileTap={reduce ? undefined : { scale: 0.96 }}
                        className="group inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/70 hover:text-foreground"
                    >
                        <span>Back to top</span>
                        <span className="flex size-4 items-center justify-center rounded-full bg-background/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-primary">
                            <HugeiconsIcon icon={ArrowUp02Icon} size={12} strokeWidth={2.2} />
                        </span>
                    </motion.button>
                </motion.div>

                {/* Giant Kinetic Name Banner */}
                <Signature reduce={reduce} />
            </motion.div>
        </footer>
    );
}