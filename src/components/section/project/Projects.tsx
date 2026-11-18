"use client";
// redesign.sh:v1

import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import PlayButton from "@/components/ui/PlayButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { copy, PROJECTS } from "@/content/projects";
import { useFinePointer } from "@/hooks/useFinePointer";
import { spring } from "@/lib/motion";
import { GithubMark } from "./ProjectParts";
import ProjectStage from "./ProjectStage";

/*
 * Sticky-stack Projects.
 * Desktop (lg+): every project is a full-height stage that sticks while the next
 * one rises over it (see the geometry note in ProjectStage.tsx).
 * Below lg: ordinary stacked panels, no sticky behaviour.
 *
 * IMPORTANT: no ancestor of a stage may set overflow other than visible/clip,
 * or position: sticky silently stops working. `isolate` keeps the stage
 * z-indexes inside this section.
 */

function ScrollHint({ text, reduce }: { text: string; reduce: boolean }) {
    return (
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-3 pr-4 text-sm text-muted-foreground">
            <motion.span
                aria-hidden
                animate={reduce ? undefined : { y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} className="rotate-90" />
            </motion.span>
            <span className="truncate">{text}</span>
        </div>
    );
}

export default function Projects() {
    const reduce = !!useReducedMotion();
    const fine = useFinePointer();
    const hint = fine ? copy.hintFine : copy.hintTouch;

    return (
        <section id="projects" className="relative isolate box-border w-full overflow-x-clip border-t border-border bg-background pt-12 sm:pt-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeader
                    index="03"
                    label={copy.badge}
                    top={copy.headingTop}
                    bottom={copy.headingBottom}
                    reduce={reduce}
                    aside={<ScrollHint text={hint} reduce={reduce} />}
                />
            </div>

            <ol className="mt-10 flex list-none flex-col gap-10 px-3 sm:px-4 lg:mt-14 lg:gap-0 lg:px-0">
                {PROJECTS.map((project, i) => (
                    <ProjectStage key={project.id} project={project} index={i} last={i === PROJECTS.length - 1} reduce={reduce} />
                ))}
            </ol>

            <div className="relative z-[60] mx-auto max-w-6xl bg-background px-4 pb-20 pt-10 sm:px-6 lg:pb-28">
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={spring}
                    className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center"
                >
                    <div>
                        <p className="text-base font-semibold tracking-tight sm:text-lg">{copy.outroTitle}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{copy.outroText}</p>
                    </div>
                    <PlayButton href={copy.githubProfile} variant="solid" external>
                        <GithubMark className="size-4" />
                        {copy.outroCta}
                    </PlayButton>
                </motion.div>
            </div>
        </section>
    );
}
