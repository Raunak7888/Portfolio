"use client";
/* redesign:v1 */
/* eslint-disable @next/next/no-img-element */

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react";
import {
    AnimatePresence,
    animate,
    motion,
    useMotionValue,
    useInView,
    useReducedMotion,
    useTransform,
    type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { copy, STATUS, PROJECTS, TOTAL, type Project, type StatusKind, type LinkKind } from "@/content/projects";
import { SCENES } from "@/components/section/project/scenes";
import PlayButton from "@/components/ui/PlayButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { useFinePointer } from "@/hooks/useFinePointer";
import { spring, softSpring } from "@/lib/motion";
import { pad2 } from "@/lib/utils";

/* ==========================================================================
   CONTENT
   Content lives in src/content/projects.ts.
   Text comes from your project JSON. Check links and wording before you ship.
   ========================================================================== */



/* ==========================================================================
   SMALL HELPERS
   ========================================================================== */

/* ==========================================================================
   MOTION VARIANTS
   ========================================================================== */

const panelStack: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const panelItem: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: spring },
};

const cardEnter: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 140, damping: 20 },
    },
};

/* ==========================================================================
   COUNT-UP
   ========================================================================== */

function CountUp({ to, suffix, reduce }: { to: number; suffix?: string; reduce: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const mv = useMotionValue(reduce ? to : 0);
    const text = useTransform(mv, (v) => Math.round(v).toString());

    useEffect(() => {
        if (reduce) {
            mv.set(to);
            return;
        }
        if (!inView) return; // count only once the number is on screen
        const controls = animate(mv, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [to, reduce, inView, mv]);

    return (
        <span ref={ref} className="tabular-nums">
            <motion.span>{text}</motion.span>
            {suffix}
        </span>
    );
}

/* ==========================================================================
   ICONS   ICONS
   ========================================================================== */

function GithubMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
    );
}

function ExternalMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
        </svg>
    );
}

function PageMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h7M9 17h5" />
        </svg>
    );
}

function LinkIcon({ kind, className }: { kind: LinkKind; className?: string }) {
    if (kind === "repo") return <GithubMark className={className} />;
    if (kind === "post") return <PageMark className={className} />;
    return <ExternalMark className={className} />;
}

function Sparkle({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
            <path d="M12 2c.6 4.8 2.2 7.4 10 10-7.8 2.6-9.4 5.2-10 10-.6-4.8-2.2-7.4-10-10 7.8-2.6 9.4-5.2 10-10Z" />
        </svg>
    );
}

/* ==========================================================================
   GLASS BUTTON
   Same family as the navbar pills: a vertical gradient, an inner highlight,
   a soft drop shadow and a sheen that sweeps across on hover.
   "glass" is the dark glossy pill, "bright" is the lighter one (Home, Book a Call).
   ========================================================================== */

/* ==========================================================================
   HEADER
   ========================================================================== */


function ScrollHint({ text, reduce }: { text: string; reduce: boolean }) {
    return (
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-muted/50 py-1.5 pl-3 pr-4 text-sm text-muted-foreground">
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

/* ==========================================================================
   STATUS CHIP
   ========================================================================== */

function StatusChip({ status }: { status: StatusKind }) {
    const s = STATUS[status];
    return (
        <span
            style={{ "--chip": s.color } as CSSProperties}
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
        >
            <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[color:var(--chip)] opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[color:var(--chip)]" />
            </span>
            {s.label}
        </span>
    );
}

/* ==========================================================================
   STORY
   The pinned text: serif title, stack chips, summary, sparkle bullets,
   metrics and buttons. Used by the sticky panel and by the mobile cards.
   ========================================================================== */

function Story({
    project,
    reduce,
    animated,
}: {
    project: Project;
    reduce: boolean;
    animated: boolean;
}) {
    const tintVars = { "--tint": project.tint, "--on-tint": "oklch(0.2 0 0)" } as CSSProperties;

    return (
        <motion.div
            variants={panelStack}
            initial={animated && !reduce ? "hidden" : false}
            animate="show"
            style={tintVars}
            className="flex flex-col gap-5"
        >
            <motion.div variants={panelItem} className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <h3 className="ds-serif text-4xl font-normal leading-none tracking-tight xl:text-5xl">
                    {project.name}
                </h3>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {project.kind}
                </span>
                <StatusChip status={project.status} />
            </motion.div>

            <motion.ul variants={panelItem} className="flex flex-wrap gap-1.5">
                {project.chips.map((c) => (
                    <li
                        key={c}
                        className="inline-flex h-7 items-center rounded-full border border-border bg-muted/40 px-3 text-xs font-medium text-foreground/80"
                    >
                        {c}
                    </li>
                ))}
            </motion.ul>

            <motion.p variants={panelItem} className="text-[15px] font-medium leading-7 text-foreground/90">
                {project.summary}
            </motion.p>

            <motion.ul variants={panelItem} className="flex flex-col gap-3">
                {project.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                        <Sparkle className="mt-[5px] size-3.5 shrink-0 text-[color:var(--tint)]" />
                        <span className="text-sm leading-6 text-muted-foreground">{b}</span>
                    </li>
                ))}
            </motion.ul>

            <motion.div
                variants={panelItem}
                className="grid grid-cols-3 gap-3 border-y border-dashed border-border py-3"
            >
                {project.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col gap-1">
                        <span className="text-lg font-semibold leading-none tracking-tight text-[color:var(--tint)]">
                            {typeof m.value === "number" ? (
                                <CountUp to={m.value} suffix={m.suffix} reduce={reduce} />
                            ) : (
                                m.value
                            )}
                        </span>
                        <span className="text-xs leading-4 text-muted-foreground">{m.label}</span>
                    </div>
                ))}
            </motion.div>

            <motion.div variants={panelItem} className="flex flex-wrap items-center gap-2.5">
                <PlayButton href={project.caseStudy} variant="solid">
                    {copy.caseStudy}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
                </PlayButton>

                {project.links.map((l) => (
                    <PlayButton key={l.href} href={l.href} external>
                        <LinkIcon kind={l.kind} className="size-4" />
                        {l.label}
                    </PlayButton>
                ))}

                {project.links.length === 0 && (
                    <span className="text-xs text-muted-foreground">{copy.comingSoon}</span>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ==========================================================================
   PROGRESS DASHES
   Little horizontal lines hanging in the left margin of the pinned panel.
   The active one grows and takes the project's colour.
   ========================================================================== */

function Dashes({
    active,
    onGo,
    reduce,
}: {
    active: number;
    onGo: (i: number) => void;
    reduce: boolean;
}) {
    return (
        <div
            role="group"
            aria-label="Jump to a project"
            className="absolute left-4 top-24 mt-2 flex flex-col gap-1"
        >
            {PROJECTS.map((p, i) => {
                const on = i === active;
                return (
                    <button
                        key={p.id}
                        type="button"
                        aria-label={`Go to ${p.name}`}
                        aria-current={on ? "true" : undefined}
                        onClick={() => onGo(i)}
                        className="flex h-4 w-9 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <motion.span
                            initial={false}
                            animate={{
                                width: on ? 28 : 14,
                                opacity: on ? 1 : 0.55,
                            }}
                            transition={reduce ? { duration: 0 } : softSpring}
                            className="block h-0.5 rounded-full"
                            style={{
                                background: on
                                    ? p.tint
                                    : "color-mix(in oklab, var(--foreground) 30%, transparent)",
                            }}
                        />
                    </button>
                );
            })}
        </div>
    );
}

/* ==========================================================================
   PINNED PANEL
   Stays in place while the cards scroll. Its content swaps when the
   observer reports a new active project.
   ========================================================================== */

function Panel({
    project,
    active,
    onGo,
    reduce,
}: {
    project: Project;
    active: number;
    onGo: (i: number) => void;
    reduce: boolean;
}) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="relative my-auto w-full pb-12 pl-14 pr-6 pt-24 xl:pr-8">
                <Dashes active={active} onGo={onGo} reduce={reduce} />

                <div aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={project.id}
                            exit={reduce ? undefined : { opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Story project={project} reduce={reduce} animated />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   PROJECT CARD
   An outer frame, an inner gradient card with the one-line pitch and a glass
   arrow on top, and the scene below. Inactive cards dim on desktop and
   focus when clicked.
   ========================================================================== */

function ProjectCard({
    project,
    index,
    active,
    reduce,
    fine,
    registerRef,
    onSelect,
}: {
    project: Project;
    index: number;
    active: boolean;
    reduce: boolean;
    fine: boolean;
    registerRef: (el: HTMLLIElement | null) => void;
    onSelect: (i: number) => void;
}) {
    const [hover, setHover] = useState(false);

    /* mouse: play while hovering the active card. touch: play on the card in view. */
    const play = !reduce && active && (fine ? hover : true);

    const Scene = SCENES[project.scene];
    const tintVars = { "--tint": project.tint, "--on-tint": "oklch(0.2 0 0)" } as CSSProperties;

    return (
        <li
            ref={registerRef}
            data-index={index}
            style={tintVars}
            className="relative lg:flex lg:min-h-[92svh] lg:items-center"
        >
            <motion.article
                variants={cardEnter}
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                aria-label={project.name}
                className={`relative w-full transition-[opacity,filter,transform] duration-500 ${
                    active ? "" : "lg:scale-[0.97] lg:opacity-45 lg:saturate-50"
                }`}
            >
                <div className="rounded-[2rem] border border-border bg-[color-mix(in_oklab,var(--foreground)_4%,var(--background))] p-1.5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.8)] sm:p-2">
                    <div
                        onPointerEnter={() => fine && setHover(true)}
                        onPointerLeave={() => setHover(false)}
                        className="relative overflow-hidden rounded-[1.6rem] border border-[color-mix(in_oklab,var(--tint)_30%,transparent)]"
                        style={{
                            background:
                                "linear-gradient(165deg, color-mix(in oklab, var(--tint) 44%, var(--background)) 0%, color-mix(in oklab, var(--tint) 16%, var(--background)) 55%, color-mix(in oklab, var(--tint) 7%, var(--background)) 100%)",
                        }}
                    >
                        {/* soft glow along the top edge, anchored to the card */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
                            style={{
                                background:
                                    "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--tint) 38%, transparent), transparent)",
                            }}
                        />

                        {/* pitch + arrow */}
                        <div className="relative z-10 flex items-start justify-between gap-6 p-5 sm:p-7">
                            <p className="max-w-[24ch] text-lg font-normal leading-snug tracking-tight sm:text-2xl">
                                {project.cardLine}
                            </p>
                            <PlayButton
                                href={project.caseStudy}
                                round
                                ariaLabel={`Open the ${project.name} case study`}
                            >
                                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
                            </PlayButton>
                        </div>

                        {/* the scene */}
                        <div className="relative aspect-[16/11] w-full">
                            <Scene project={project} play={play} fine={fine} reduce={reduce} />
                            <span className="absolute bottom-2 right-[5%] font-mono text-xs tabular-nums text-muted-foreground">
                                {pad2(index + 1)} / {pad2(TOTAL)}
                            </span>
                        </div>

                        {/* desktop: clicking a dimmed card brings it into focus */}
                        {!active && (
                            <button
                                type="button"
                                aria-label={`Focus ${project.name}`}
                                onClick={() => onSelect(index)}
                                className="absolute inset-0 z-30 hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary lg:block"
                            />
                        )}
                    </div>
                </div>

                {/* below lg there is no pinned panel, so each card carries its story */}
                <div className="mt-6 px-1 lg:hidden">
                    <Story project={project} reduce={reduce} animated={false} />
                </div>
            </motion.article>
        </li>
    );
}

/* ==========================================================================
   OUTRO
   ========================================================================== */

function Outro({ reduce }: { reduce: boolean }) {
    return (
        <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={spring}
            className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-dashed border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:p-6"
        >
            <div>
                <p className="text-base font-semibold tracking-tight sm:text-lg">{copy.outroTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">{copy.outroText}</p>
            </div>

            <PlayButton href={copy.githubProfile} variant="solid" external>
                <GithubMark className="size-4" />
                {copy.outroCta}
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2} />
            </PlayButton>
        </motion.div>
    );
}

/* ==========================================================================
   SECTION
   Desktop (lg+): a framed two-column block. The left column is hatched and
   scrolls through the cards. The right column is sticky and shows the
   active project's story.
   Below lg: one column, and each card carries its own story.

   IMPORTANT: this section uses overflow-x-clip, never overflow-hidden.
   An overflow-hidden ancestor would silently break position: sticky.
   ========================================================================== */

export default function Projects() {
    const reduce = !!useReducedMotion();
    const fine = useFinePointer();
    const initial = reduce ? "show" : "hidden";

    const [active, setActive] = useState(0);

    const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
    const lockUntil = useRef(0);

    /* which card is crossing the middle of the viewport? */
    useEffect(() => {
        const nodes = cardRefs.current.filter((n): n is HTMLLIElement => n !== null);
        if (nodes.length === 0) return;

        const io = new IntersectionObserver(
            (entries) => {
                // ignore the observer while a programmatic scroll is in flight
                if (Date.now() < lockUntil.current) return;

                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const i = Number((entry.target as HTMLElement).dataset.index);
                    if (!Number.isNaN(i)) setActive(i);
                }
            },
            { rootMargin: "-48% 0px -48% 0px", threshold: 0 },
        );

        nodes.forEach((n) => io.observe(n));
        return () => io.disconnect();
    }, []);

    const goTo = useCallback(
        (i: number) => {
            if (i < 0 || i >= TOTAL) return;
            const el = cardRefs.current[i];
            if (!el) return;

            lockUntil.current = Date.now() + 900;
            setActive(i);
            el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        },
        [reduce],
    );

    const registerRef = useCallback(
        (i: number) => (el: HTMLLIElement | null) => {
            cardRefs.current[i] = el;
        },
        [],
    );

    const project = PROJECTS[active];
    const hint = fine ? copy.hintFine : copy.hintTouch;

    return (
        <section
            id="projects"
            className="relative box-border w-full overflow-x-clip border-t border-border bg-background px-4 pb-20 pt-12 sm:px-6 lg:pb-28 lg:pt-16"
        >
            <div className="relative ">
                {/* ---------- header ---------- */}
                <SectionHeader
                    index="03"
                    label={copy.badge}
                    top={copy.headingTop}
                    bottom={copy.headingBottom}
                    reduce={reduce}
                    className="mx-auto max-w-6xl"
                    aside={<ScrollHint text={hint} reduce={reduce} />}
                />

                {/* ---------- framed two columns ---------- */}
                <div className="mx-auto mt-8 grid max-w-6xl lg:mt-12 lg:grid-cols-[minmax(0,1fr)_35rem] rounded-4xl lg:items-start lg:border lg:border-border ">
                    {/* scrolling cards, hatched on desktop */}
                    <ol
                        // style={{ "--hatch": HATCH } as CSSProperties}
                        className="flex min-w-0 flex-col gap-12 lg:gap-0 lg:px-10 lg:py-6 "
                    >
                        {PROJECTS.map((p, i) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                index={i}
                                active={active === i}
                                reduce={reduce}
                                fine={fine}
                                registerRef={registerRef(i)}
                                onSelect={goTo}
                            />
                        ))}
                    </ol>

                    {/* sticky story column, desktop only */}
                    <aside
                        aria-label="Project details"
                        className="hidden lg:sticky lg:top-0  lg:block lg:h-svh lg:border-l lg:border-border"
                    >
                        <Panel project={project} active={active} onGo={goTo} reduce={reduce} />
                    </aside>
                </div>

                <div className="mx-auto max-w-6xl">
                    <Outro reduce={reduce} />
                </div>
            </div>
        </section>
    );
}