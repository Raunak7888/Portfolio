"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { copy, education, experience, writing } from "@/content/experience";
import { fade, stackLoose, viewportOnce } from "@/lib/motion";

export default function Experience() {
    const reduce = !!useReducedMotion();

    return (
        <section id="experience" className="relative border-t border-border bg-background px-4 py-16 sm:px-6 lg:py-24">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:gap-12">
                <SectionHeader index="04" label={copy.badge} top={copy.headingTop} bottom={copy.headingBottom} reduce={reduce} />

                <motion.div
                    initial={reduce ? "show" : "hidden"}
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={stackLoose}
                    className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:gap-8"
                >
                    <motion.div variants={fade} className="ds-spine flex flex-col gap-6 pl-7">
                        {experience.map((job) => (
                            <article key={job.role + job.org} className="ds-card ds-card--lift relative p-5 sm:p-6">
                                <span aria-hidden className="absolute -left-[1.85rem] top-6 flex size-3.5">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex size-3.5 rounded-full border-2 border-foreground bg-primary" />
                                </span>
                                <p className="ds-eyebrow text-primary">{job.period}</p>
                                <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                                    {job.role} <span className="ds-serif text-primary">at {job.org}</span>
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{job.summary}</p>
                                <ul className="mt-4 flex flex-col gap-2 text-sm leading-6 sm:text-base">
                                    {job.points.map((p) => (
                                        <li key={p} className="flex gap-3">
                                            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="mt-5 flex flex-wrap gap-2">
                                    {job.stack.map((s) => (
                                        <li key={s} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </motion.div>

                    <motion.div variants={fade} className="flex flex-col gap-6">
                        <article className="ds-card p-5 sm:p-6">
                            <p className="ds-eyebrow text-primary">Education · {education.year}</p>
                            <h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{education.degree}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">{education.school}</p>
                        </article>

                        <article className="ds-card p-5 sm:p-6">
                            <p className="ds-eyebrow text-primary">Writing</p>
                            <ul className="mt-2 flex flex-col gap-3">
                                {writing.map((w) => (
                                    <li key={w.href}>
                                        <a
                                            href={w.href}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="group inline-flex flex-col gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            <span className="text-base font-semibold leading-snug underline-offset-4 group-hover:underline">
                                                {w.title}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{w.source} ↗</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
