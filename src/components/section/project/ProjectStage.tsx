"use client";
// redesign.sh:v1

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import PlayButton from "@/components/ui/PlayButton";
import ScrollChars from "@/components/motion/ScrollChars";
import { copy, TOTAL, type Project } from "@/content/projects";
import { useMinWidth } from "@/hooks/useMinWidth";
import { pad2 } from "@/lib/utils";
import { LinkIcon, Metrics, Sparkle, StatusChip } from "./ProjectParts";
import { visualFor } from "./visuals";

/*
 * STICKY STACK GEOMETRY (desktop, lg+)
 *
 *   <li>   relative, z-index = index + 1, margin-top: -100svh (except the first)
 *     <div>  height WRAP svh          <- scroll target
 *       <article> position: sticky; top: 0; height: 100svh
 *
 * Each stage sticks for (WRAP - 100)svh. The next stage's wrapper starts
 * (WRAP - 100)svh after this one, so it rises over the stuck stage while this
 * one keeps its place: a pure-CSS overlap. The numbers below only drive the
 * transforms inside the stage and must match the Tailwind classes.
 *
 *   WRAP = 250 -> "lg:h-[250svh]"      WRAP_LAST = 180 -> "lg:h-[180svh]"
 *   dwell (nothing moving) = WRAP - 200 = 50svh
 */
const WRAP = 250;
const WRAP_LAST = 180;

function Rise({
    enter,
    at,
    live,
    className = "",
    children,
}: {
    enter: MotionValue<number>;
    at: number;
    live: boolean;
    className?: string;
    children: ReactNode;
}) {
    const o = useTransform(enter, [at, at + 0.35], [0, 1]);
    const y = useTransform(enter, [at, at + 0.35], [28, 0]);
    return (
        <motion.div data-ed-hide style={live ? { opacity: o, y } : undefined} className={className}>
            {children}
        </motion.div>
    );
}

export default function ProjectStage({
    project,
    index,
    last,
    reduce,
}: {
    project: Project;
    index: number;
    last: boolean;
    reduce: boolean;
}) {
    const desktop = useMinWidth(1024);
    const live = desktop && !reduce;
    const wrapRef = useRef<HTMLDivElement>(null);

    const wrapH = last ? WRAP_LAST : WRAP;
    const L = 100 + wrapH;
    const enterEnd = 100 / L;
    const exitStart = (wrapH - 100) / L;
    const exitEnd = wrapH / L;

    const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ["start end", "end start"] });
    const enter = useTransform(p, [0, enterEnd], [0, 1]);
    const exit = useTransform(p, [exitStart, exitEnd], [0, 1]);

    const scale = useTransform(exit, [0, 1], [1, 0.95]);
    const lift = useTransform(exit, [0, 1], ["0%", "-3%"]);
    const dim = useTransform(exit, [0, 1], [0, 0.6]);
    const numY = useTransform(enter, [0, 1], ["22%", "0%"]);
    const numX = useTransform(exit, [0, 1], ["0%", "-8%"]);
    console.log(project);
    const Visual = visualFor(project.id);
    const covered = live && !last;
    const tintVars = { "--tint": project.tint, "--on-tint": "oklch(0.2 0 0)", zIndex: index + 1 } as CSSProperties;

    return (
        <li style={tintVars} className={`relative ${index > 0 ? "lg:-mt-[100svh]" : ""}`}>
            <div ref={wrapRef} className={last ? "lg:h-[180svh]" : "lg:h-[250svh]"}>
                <article aria-label={project.name} className="lg:sticky lg:top-0 lg:h-svh">
                    <motion.div
                        style={covered ? { scale, y: lift, transformOrigin: "50% 0%" } : undefined}
                        className="relative h-full overflow-hidden rounded-[1.25rem] border border-border bg-[color-mix(in_oklab,var(--tint)_7%,var(--background))] lg:rounded-b-none lg:rounded-t-[2.25rem] lg:border-b-0"
                    >
                        <motion.span
                            aria-hidden
                            style={live ? { y: numY, x: covered ? numX : "0%" } : undefined}
                            className="ds-serif pointer-events-none absolute -right-2 -top-6 hidden select-none text-[clamp(14rem,30vw,32rem)] leading-none text-[color:var(--tint)] opacity-[0.08] lg:block"
                        >
                            {pad2(index + 1)}
                        </motion.span>

                        <div className="relative mx-auto grid h-full w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:py-0 lg:pt-8">
                            {/* ---------- words ---------- */}
                            <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
                                <Rise enter={enter} at={0.02} live={live} className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                        {pad2(index + 1)} / {pad2(TOTAL)}
                                    </span>
                                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{project.kind}</span>
                                    <StatusChip status={project.status} />
                                </Rise>

                                <h3 aria-label={project.name} className="ds-serif whitespace-nowrap text-[clamp(3rem,5.6vw,6.25rem)] font-normal leading-[0.95] tracking-tight">
                                    <ScrollChars text={project.name} progress={enter} from={0.02} to={0.75} live={live} />
                                </h3>

                                <Rise enter={enter} at={0.14} live={live}>
                                    <p className="max-w-[24ch] text-xl font-medium leading-snug tracking-tight lg:text-2xl">{project.cardLine}</p>
                                </Rise>

                                <Rise enter={enter} at={0.2} live={live}>
                                    <p className="max-w-[52ch] text-[15px] leading-7 text-muted-foreground">{project.summary}</p>
                                </Rise>

                                <Rise enter={enter} at={0.26} live={live}>
                                    <ul className="flex flex-wrap gap-1.5">
                                        {project.chips.map((c) => (
                                            <li key={c} className="inline-flex h-7 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground/80">
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </Rise>

                                <Rise enter={enter} at={0.32} live={live} className="ed-tall-only">
                                    <ul className="flex flex-col gap-2.5">
                                        {project.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-3">
                                                <Sparkle className="mt-[5px] size-3.5 shrink-0 text-[color:var(--tint)]" />
                                                <span className="text-sm leading-6 text-muted-foreground">{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Rise>

                                <Rise enter={enter} at={0.38} live={live}>
                                    <Metrics metrics={project.metrics} reduce={reduce} />
                                </Rise>

                                <Rise enter={enter} at={0.44} live={live} className="flex flex-wrap items-center gap-2.5">
                                    <PlayButton href={project.caseStudy} variant="solid">
                                        {copy.caseStudy}
                                    </PlayButton>
                                    {project.links.map((l) => (
                                        <PlayButton key={l.href} href={l.href} external>
                                            <LinkIcon kind={l.kind} className="size-4" />
                                            {l.label}
                                        </PlayButton>
                                    ))}
                                    {project.links.length === 0 && <span className="text-xs text-muted-foreground">{copy.comingSoon}</span>}
                                </Rise>
                            </div>

                            {/* ---------- visual ---------- */}
                            <div className="min-w-0">
                                <Visual project={project} enter={enter} exit={exit} live={live} reduce={reduce} />
                            </div>
                        </div>

                        <motion.span
                            aria-hidden
                            style={{ opacity: covered ? dim : 0 }}
                            className="pointer-events-none absolute inset-0 z-40 bg-background"
                        />
                    </motion.div>
                </article>
            </div>
        </li>
    );
}
