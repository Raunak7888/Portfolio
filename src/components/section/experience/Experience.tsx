"use client";
// redesign.sh:v1

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, Variants, type MotionValue } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { copy, education, experience, writing } from "@/content/experience";

type Job = (typeof experience)[number];

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
                <span className="mr-3 align-middle font-mono text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
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
    const numY = useTransform(whole, [0, 1], ["-8%", "14%"]);

    const { scrollYProgress: rail } = useScroll({ target: list, offset: ["start 75%", "end 55%"] });

    return (
        <article ref={article} className="grid gap-8 border-t border-border pt-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14 lg:pt-14">
            {/* ---------- the year, as typography ---------- */}
            <div className="relative lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </p>
                <motion.p
                    aria-label={job.period}
                    style={reduce ? undefined : { y: numY }}
                    className=" mt-2 text-[clamp(4.5rem,9.5vw,9rem)] font-semibold leading-[0.9] tracking-tight [overflow-wrap:anywhere]"
                >
                    {job.period}
                </motion.p>
                <Reveal delay={0.1} className="mt-4">
                    <p className="ds-serif text-2xl italic text-primary">{job.org}</p>
                </Reveal>
            </div>

            {/* ---------- the story ---------- */}
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

    // Stagger container animation variants for smooth entry when scrolled into view
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: reduce ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1], // Custom smooth cubic-bezier easing
            },
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

                {/* ---------- margin notes: education & writing animated entry ---------- */}
                <motion.div 
                    variants={reduce ? undefined : containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-12 border-t border-border pt-14 lg:grid-cols-2 lg:gap-16"
                >
                    {/* Education Column */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">01</span>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Education</p>
                        </div>
                        <ul className="mt-8 flex flex-col gap-10">
                            {education.map((entry) => (
                                <li 
                                    key={`${entry.degree}-${entry.school}`}
                                    className="group relative pl-6 border-l border-border/60 hover:border-primary transition-colors duration-300"
                                >
                                    <div className="absolute -left-[1px] top-1.5 size-0.5 rounded-full bg-border group-hover:bg-primary transition-colors duration-300" />
                                    <p className="font-mono text-xs tracking-wider text-muted-foreground">{entry.year}</p>
                                    <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl mt-2 group-hover:text-primary transition-colors duration-300">
                                        {entry.degree}
                                    </h3>
                                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">{entry.school}</p>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Writing Column */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">02</span>
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Writing & Articles</p>
                        </div>
                        <ul className="mt-8 flex flex-col gap-6">
                            {writing.map((w) => (
                                <li key={w.href}>
                                    <a
                                        href={w.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="group relative flex flex-col gap-1.5 p-4 -mx-4 rounded-lg transition-colors duration-300 hover:bg-muted/40 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-muted-foreground">{w.source}</span>
                                            <span aria-hidden className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary">
                                                ↗
                                            </span>
                                        </div>
                                        <span className="text-lg font-medium leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 sm:text-xl">
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