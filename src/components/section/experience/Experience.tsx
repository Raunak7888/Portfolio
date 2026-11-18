"use client";
// redesign.sh:v1

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { motion, useReducedMotion, useScroll, useTransform, useInView, Variants, type MotionValue } from "framer-motion";
import { copy, education, experience, writing } from "@/content/experience";

type Job = (typeof experience)[number];

/* ---------- period parsing: "Oct 2026 – Present" -> start / end ---------- */
type Side = { month?: string; year?: string; present?: boolean };
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function parseSide(raw = ""): Side {
    const s = raw.trim();
    if (/^(present|now|current)$/i.test(s)) return { present: true };
    const m = s.match(/^([A-Za-z]{3,9})?\s*(\d{4})?$/);
    return { month: m?.[1]?.slice(0, 3), year: m?.[2] };
}

function parsePeriod(p: string): [Side, Side | null] {
    const [a, b] = p.split(/\s*[–—-]\s*/);
    return [parseSide(a), b ? parseSide(b) : null];
}

/** "2 mo" / "1 yr 3 mo", computed after mount to avoid hydration mismatch. */
function useDuration(start: Side, end: Side | null) {
    const [label, setLabel] = useState<string | null>(null);
    const startMonth = start.month;
    const startYear = start.year;
    const isPresent = !!end?.present;

    useEffect(() => {
        const mi = MONTHS.indexOf((startMonth ?? "").toLowerCase());
        if (!isPresent || mi < 0 || !startYear) {
            setLabel(null);
            return;
        }
        const now = new Date();
        const n = (now.getFullYear() - Number(startYear)) * 12 + (now.getMonth() - mi) + 1;
        if (n < 1) {
            setLabel(null);
            return;
        }
        const y = Math.floor(n / 12);
        const m = n % 12;
        setLabel(y ? `${y} yr${m ? ` ${m} mo` : ""}` : `${m} mo`);
    }, [startMonth, startYear, isPresent]);

    return label;
}

/* ---------- a line of text that rolls up out of a mask ---------- */
function Roll({ children, delay = 0, reduce, className = "" }: { children: React.ReactNode; delay?: number; reduce: boolean; className?: string }) {
    // Observe the static mask, not the translated child, which is clipped and never "visible".
    const mask = useRef<HTMLSpanElement>(null);
    const inView = useInView(mask, { once: true, margin: "0px 0px -10% 0px" });

    return (
        <span ref={mask} className={`block overflow-hidden py-[0.04em] ${className}`}>
            <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={reduce || inView ? { y: 0 } : { y: "105%" }}
                transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
            >
                {children}
            </motion.span>
        </span>
    );
}

/* ---------- one end of the period: MONTH over YEAR ---------- */
function Stamp({ side, delay, reduce, accent = false }: { side: Side; delay: number; reduce: boolean; accent?: boolean }) {
    const big = "font-semibold leading-[0.9] tracking-tight tabular-nums";
    return (
        <div className="flex flex-col gap-1">
            <Roll delay={delay} reduce={reduce}>
                <span className={`font-mono text-xs uppercase tracking-[0.3em] ${accent ? "text-primary" : "text-foreground"}`}>
                    {side.present ? "Now" : side.month ?? ""}
                </span>
            </Roll>
            <Roll delay={delay + 0.08} reduce={reduce}>
                {side.present ? (
                    <span className={`ds-serif italic text-primary ${big} text-[clamp(2.75rem,5.5vw,5rem)]`}>Present</span>
                ) : (
                    <span className={`${big} text-[clamp(4.5rem,9.5vw,9rem)] [overflow-wrap:anywhere]`}>{side.year}</span>
                )}
            </Roll>
        </div>
    );
}

/* ---------- start stamp -> rail (fills on scroll) -> end stamp ---------- */
function PeriodTimeline({ period, progress, reduce }: { period: string; progress: MotionValue<number>; reduce: boolean }) {
    const [start, end] = parsePeriod(period);
    const duration = useDuration(start, end);
    const fill = useTransform(progress, [0.1, 0.55], [0, 1]);
    const live = !!end?.present;

    return (
        <div aria-label={period} role="group" className="mt-3 flex flex-col">
            <Stamp side={start} delay={0} reduce={reduce} />

            {end && (
                <>
                    {/* the rail: anchored tick at the top, live dot at the bottom */}
                    <div className="relative my-5 ml-1 h-16 w-px bg-border lg:h-24">
                        <motion.span
                            aria-hidden
                            style={reduce ? { scaleY: 1 } : { scaleY: fill }}
                            className="absolute inset-0 origin-top bg-primary"
                        />
                        <span aria-hidden className="absolute -top-px left-1/2 h-px w-3 -translate-x-1/2 bg-primary" />
                        {duration && (
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {duration}
                            </span>
                        )}
                        <span aria-hidden className="absolute -bottom-1 left-1/2 flex size-2.5 -translate-x-1/2 items-center justify-center">
                            {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none" />}
                            <span className="relative size-2.5 rounded-full bg-primary" />
                        </span>
                    </div>

                    <Stamp side={end} delay={0.35} reduce={reduce} accent={live} />
                </>
            )}
        </div>
    );
}

/** One point of the job. Its dot fills and its text brightens as the rail reaches it. */
function Point({ text, i, n, progress, reduce }: { text: string; i: number; n: number; progress: MotionValue<number>; reduce: boolean }) {
    const a = (i / n) * 0.8;
    const b = a + 0.18;
    const o = useTransform(progress, [a, b], [0.35, 1]);
    const s = useTransform(progress, [a, b], [0, 1]);
    return (
        <li className="relative grid grid-cols-[2.5rem_1fr] items-start gap-x-3">
            <span className="relative flex justify-center pt-[0.7rem]">
                <span className="absolute size-2.5 rounded-full border border-border bg-background" />
                <motion.span style={reduce ? undefined : { scale: s }} className="relative size-2.5 rounded-full bg-primary" />
            </span>
            <motion.p style={reduce ? undefined : { opacity: o }} className="text-lg leading-8 sm:text-xl sm:leading-9">
                <span className="mr-3 align-middle font-mono text-xs tabular-nums text-foreground">{String(i + 1).padStart(2, "0")}</span>
                {text}
            </motion.p>
        </li>
    );
}

function Chapter({ job, index, total, reduce }: { job: Job; index: number; total: number; reduce: boolean }) {
    const article = useRef<HTMLElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const points = job.points ?? [];

    const { scrollYProgress: whole } = useScroll({ target: article, offset: ["start end", "end start"] });
    const { scrollYProgress: rail } = useScroll({ target: list, offset: ["start 75%", "end 55%"] });

    return (
        <article ref={article} className="grid gap-8 border-t border-border pt-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14 lg:pt-14">
            {/* ---------- left: counter, period timeline, company (each ONCE) ---------- */}
            <div className="relative lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </p>

                <PeriodTimeline period={job.period} progress={whole} reduce={reduce} />

                <Reveal delay={0.1} className="mt-6">
                    <p className="ds-serif text-2xl italic text-primary">{job.org}</p>
                </Reveal>
            </div>

            {/* ---------- right: the story ---------- */}
            <div className="flex min-w-0 flex-col gap-8">
                <Reveal>
                    <h3 className="text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">{job.role}</h3>
                </Reveal>
                <Reveal delay={0.05}>
                    <p className="max-w-[60ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{job.summary}</p>
                </Reveal>

                <div className="relative">
                    <span aria-hidden className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-border" />
                    <motion.span
                        aria-hidden
                        style={reduce ? { scaleY: 1 } : { scaleY: rail }}
                        className="absolute bottom-2 left-5 top-2 w-px origin-top -translate-x-1/2 bg-primary"
                    />
                    <ul ref={list} className="flex flex-col gap-6">
                        {points.map((p, i) => (
                            <Point key={p} text={p} i={i} n={points.length} progress={rail} reduce={reduce} />
                        ))}
                    </ul>
                </div>

                <Reveal>
                    <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm text-muted-foreground">
                        <li className="text-foreground">Built with</li>
                        {(job.stack ?? []).map((s, i) => (
                            <li key={s} className="flex items-center gap-3">
                                {i > 0 && <span aria-hidden>/</span>}
                                <span className="ed-link cursor-default hover:text-foreground">{s}</span>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </article>
    );
}

export default function Experience() {
    const reduce = !!useReducedMotion();

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
    };

    return (
        <section id="experience" className="relative border-t border-border bg-background px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:gap-16">
                <SectionHeader index="" label={copy.badge} top={copy.headingTop} bottom={copy.headingBottom} reduce={reduce} />

                <div className="flex flex-col gap-16">
                    {experience.map((job, i) => (
                        <Chapter key={job.role + job.org} job={job} index={i} total={experience.length} reduce={reduce} />
                    ))}
                </div>

                {/* ---------- education & writing ---------- */}
                <motion.div
                    variants={reduce ? undefined : containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-12 border-t border-border pt-14 lg:grid-cols-2 lg:gap-16"
                >
                    {/* Education */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">01</span>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Education</p>
                        </div>
                        <ul className="mt-8 flex flex-col gap-10">
                            {education.map((entry) => (
                                <li
                                    key={`${entry.degree}-${entry.school}`}
                                    className="group relative border-l border-border/60 pl-6 transition-colors duration-300 hover:border-primary"
                                >
                                    <div className="absolute -left-[1px] top-1.5 size-0.5 rounded-full bg-border transition-colors duration-300 group-hover:bg-primary" />
                                    <p className="font-mono text-xs tracking-wider text-muted-foreground">{entry.year}</p>
                                    <h3 className="mt-2 text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-3xl">
                                        {entry.degree}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground sm:text-base">{entry.school}</p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Writing */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">02</span>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Writing &amp; Articles</p>
                        </div>
                        <ul className="mt-8 flex flex-col gap-6">
                            {writing.map((w) => (
                                <li key={w.href}>
                                    <a
                                        href={w.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="group relative -mx-4 flex flex-col gap-1.5 rounded-lg p-4 outline-none transition-colors duration-300 hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-primary"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-muted-foreground">{w.source}</span>
                                            <span
                                                aria-hidden
                                                className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                                            >
                                                ↗
                                            </span>
                                        </div>
                                        <span className="text-lg font-medium leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-xl">
                                            {w.title}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}