"use client";
/* redesign:v1 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
} from "react";
import {
    AnimatePresence,
    LayoutGroup,
    animate,
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import Shapes from "@/components/ui/Shapes"
import SkillTile from "@/components/section/skill/SkillTile";
import {
    copy,
    CATEGORIES,
    LEVELS,
    SKILLS,
    SKILL_BY_ID,
    CAT_BY_ID,
    COLS,
    type FilterId,
    type Skill,
} from "@/content/skills";
import ConfettiLayer from "@/components/ui/ConfettiLayer";
import SectionHeader from "@/components/ui/SectionHeader";
import { useConfetti } from "@/hooks/useConfetti";
import { useFinePointer } from "@/hooks/useFinePointer";
import { spring, softSpring, bouncy } from "@/lib/motion";
import { clamp } from "@/lib/utils";

/* ==========================================================================
   CONTENT
   Content lives in src/content/skills.ts.
   Levels and notes are my best guess: check them against your resume.
   ========================================================================== */



/* ==========================================================================
   SMALL HELPERS
   ========================================================================== */


const tintOf = (skill: Skill) => CAT_BY_ID[skill.cat].tint;

/* Up to four rows fit one screen. More skills let the section grow. */
const FIXED = SKILLS.length <= COLS * 4;

/* ==========================================================================
   MOTION VARIANTS
   One entrance: the heading wipes in, then the tiles pop onto the board.
   Everything after that is a response to something the visitor does.
   ========================================================================== */

/* ==========================================================================
   CONFETTI   CONFETTI
   Tiny home-made particle burst. Fires when every tile is explored,
   and as a small pop when you open a "Daily driver" skill.
   ========================================================================== */

/* ==========================================================================
   BACKGROUND
   Two soft blobs that drift against the cursor, plus a few quiet shapes.
   ========================================================================== */






/* ==========================================================================
   HEADER
   ========================================================================== */

/* Segmented control with a pill that glides between options. */
function FilterBar({
    value,
    onChange,
    counts,
    reduce,
}: {
    value: FilterId;
    onChange: (id: FilterId) => void;
    counts: Record<string, number>;
    reduce: boolean;
}) {
    return (
        <div
            role="group"
            aria-label="Filter skills by category"
            className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-muted/50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {CATEGORIES.map((c) => {
                const active = c.id === value;
                return (
                    <button
                        key={c.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(c.id)}
                        className="relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-9 sm:px-3.5 sm:text-sm"
                    >
                        {active && (
                            <motion.span
                                layoutId="filter-pill"
                                transition={reduce ? { duration: 0 } : softSpring}
                                className="absolute inset-0 rounded-full bg-foreground"
                            />
                        )}
                        <span
                            aria-hidden
                            className="relative size-1.5 rounded-full"
                            style={{ background: c.tint }}
                        />
                        <span
                            className={`relative transition-colors duration-200 ${
                                active ? "text-background" : "text-foreground/80"
                            }`}
                        >
                            {c.label}
                        </span>
                        <span
                            className={`relative text-xs tabular-nums pt-1 transition-colors duration-200 ${
                                active ? "text-background/70" : "text-muted-foreground"
                            }`}
                        >
                            {counts[c.id]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/* ==========================================================================
   LEVEL METER
   ========================================================================== */

function LevelMeter({
    level,
    tint,
    reduce,
}: {
    level: number;
    tint: string;
    reduce: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                role="img"
                aria-label={`${LEVELS[level - 1]}, level ${level} of 4`}
                className="flex flex-1 gap-1.5"
            >
                {Array.from({ length: 4 }, (_, i) => (
                    <span
                        key={i}
                        className="relative h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_10%,transparent)]"
                    >
                        {i < level && (
                            <motion.span
                                initial={reduce ? false : { scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ ...spring, delay: 0.15 + i * 0.09 }}
                                className="absolute inset-0 origin-left rounded-full"
                                style={{ background: tint }}
                            />
                        )}
                    </span>
                ))}
            </div>
            <span className="w-24 shrink-0 text-right text-xs font-medium text-muted-foreground">
                {LEVELS[level - 1]}
            </span>
        </div>
    );
}

/* ==========================================================================
   SKILL TILE
   Implemented in SkillTile.tsx.
   ========================================================================== */

/* ==========================================================================
   INSPECTOR   INSPECTOR
   Shows how I use the selected tool and what it pairs with.
   ========================================================================== */

function Inspector({
    skill,
    reduce,
    onPick,
}: {
    skill: Skill | null;
    reduce: boolean;
    onPick: (id: string) => void;
}) {
    const tint = skill ? tintOf(skill) : "var(--primary)";
    const tintVars = { "--tint": tint } as CSSProperties;

    return (
        <div
            aria-live="polite"
            style={tintVars}
            className="relative h-48 min-h-0 lg:h-auto lg:flex-1"
        >
            <AnimatePresence mode="wait" initial={false}>
                {skill ? (
                    <motion.article
                        key={skill.id}
                        initial={reduce ? false : { opacity: 0, y: 14, rotate: -1.5 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -10 }}
                        transition={spring}
                        className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--tint)_40%,transparent)] bg-[color-mix(in_oklab,var(--tint)_12%,var(--background))] p-3.5 sm:p-5"
                    >
                        <span
                            aria-hidden
                            className="absolute -top-0.5 left-1/2 hidden h-5 w-14 -translate-x-1/2 -rotate-2 rounded-b-[3px] bg-[color-mix(in_oklab,var(--tint)_38%,transparent)] lg:block"
                        />

                        <div className="flex items-center gap-3">
                            <motion.span
                                initial={reduce ? false : { rotate: -18, scale: 0.6 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={bouncy}
                                className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--tint)_24%,transparent)] text-sm font-semibold text-[color:var(--tint)] sm:size-12 sm:text-base"
                            >
                                {skill.mark}
                            </motion.span>

                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold leading-tight tracking-tight sm:text-xl">
                                    {skill.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {CAT_BY_ID[skill.cat].label}
                                </p>
                            </div>
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-[13px] leading-5 text-foreground/80 sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6 lg:mt-4 lg:line-clamp-4">
                            {skill.note}
                        </p>

                        <div className="mt-auto flex flex-col gap-3 pt-2">
                            <LevelMeter level={skill.level} tint={tint} reduce={reduce} />

                            {skill.usedIn && (
                                <p className="hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
                                    <span className="font-medium text-foreground/80">Used in</span>
                                    {skill.usedIn}
                                </p>
                            )}

                            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] lg:flex-wrap lg:overflow-visible">
                                <span className="shrink-0 text-xs font-medium text-foreground/80">
                                    Pairs with
                                </span>
                                {skill.related.map((rid) => {
                                    const r = SKILL_BY_ID[rid];
                                    if (!r) return null;
                                    return (
                                        <motion.button
                                            key={rid}
                                            type="button"
                                            onClick={() => onPick(rid)}
                                            whileHover={reduce ? undefined : { y: -2 }}
                                            whileTap={reduce ? undefined : { scale: 0.94 }}
                                            transition={spring}
                                            style={{ "--chip": tintOf(r) } as CSSProperties}
                                            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-[color-mix(in_oklab,var(--chip)_40%,transparent)] bg-[color-mix(in_oklab,var(--chip)_10%,transparent)] px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        >
                                            {r.name}
                                            <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={2} />
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.article>
                ) : (
                    <motion.div
                        key="empty"
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-muted/30 p-4 text-center"
                    >
                        <motion.span
                            aria-hidden
                            animate={reduce ? undefined : { x: [0, -6, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                        >
                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                size={18}
                                strokeWidth={2}
                                className="-rotate-90 lg:rotate-180"
                            />
                        </motion.span>
                        <p className="text-sm font-semibold">{copy.emptyTitle}</p>
                        <p className="max-w-[14rem] text-xs leading-5 text-muted-foreground">
                            {copy.emptyText}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ==========================================================================
   EXPLORE BAR
   A progress ring that fills as you look at each tool, a rank that grows,
   and a "Surprise me" button that scans the board and lands on one.
   ========================================================================== */

function ProgressRing({ value, reduce }: { value: number; reduce: boolean }) {
    return (
        <svg viewBox="0 0 40 40" aria-hidden className="size-10 shrink-0 -rotate-90">
            <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
            />
            <motion.circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: value }}
                transition={reduce ? { duration: 0 } : softSpring}
            />
        </svg>
    );
}

function ExploreBar({
    explored,
    total,
    busy,
    onSurprise,
    reduce,
    hint,
}: {
    explored: number;
    total: number;
    busy: boolean;
    onSurprise: () => void;
    reduce: boolean;
    hint: string;
}) {
    const done = explored === total;
    const rank = done
        ? "Completionist"
        : explored >= total / 2
          ? "Explorer"
          : explored > 0
            ? "Curious"
            : "Fresh eyes";

    return (
        <div className="flex shrink-0 items-center gap-3">
            <ProgressRing value={explored / total} reduce={reduce} />

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" aria-live="polite">
                    {done ? copy.done : `${explored} of ${total} · ${rank}`}
                </p>
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{hint}</p>
            </div>

            <motion.button
                type="button"
                onClick={onSurprise}
                disabled={busy}
                whileHover={reduce || busy ? undefined : { y: -2 }}
                whileTap={reduce || busy ? undefined : { scale: 0.94 }}
                transition={spring}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm font-medium outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 sm:h-10 sm:px-4"
            >
                <motion.span
                    aria-hidden
                    animate={busy && !reduce ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                        busy && !reduce
                            ? { duration: 0.7, repeat: Infinity, ease: "linear" }
                            : softSpring
                    }
                    className="flex"
                >
                    <HugeiconsIcon icon={RefreshIcon} size={16} strokeWidth={2} />
                </motion.span>
                Surprise me
            </motion.button>
        </div>
    );
}

/* ==========================================================================
   SECTION
   Phones and tablets: the section grows with its content, tiles stay square.
   Desktop (lg+): exactly one screen, never taller than the viewport.
   ========================================================================== */

export default function Skills() {
    const reduce = !!useReducedMotion();
    const fine = useFinePointer();
    const initial = reduce ? "show" : "hidden";

    const sectionRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLUListElement>(null);
    const ready = useInView(sectionRef, { once: true, amount: 0.3 });
    const { bursts, fire } = useConfetti(!reduce);

    const [filter, setFilter] = useState<FilterId>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [explored, setExplored] = useState<string[]>([]);
    const [scanId, setScanId] = useState<string | null>(null);


    const visible = useMemo(
        () => (filter === "all" ? SKILLS : SKILLS.filter((s) => s.cat === filter)),
        [filter],
    );

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: SKILLS.length };
        for (const s of SKILLS) c[s.cat] = (c[s.cat] ?? 0) + 1;
        return c;
    }, []);

    const selected = selectedId ? SKILL_BY_ID[selectedId] : null;
    const relatedSet = useMemo(
        () => new Set(selected ? [selected.id, ...selected.related] : []),
        [selected],
    );

    const pick = useCallback(
        (id: string) => {
            const s = SKILL_BY_ID[id];
            setSelectedId(id);
            setExplored((e) => (e.includes(id) ? e : [...e, id]));
            // if the pick lives in a different category, switch so you can see it
            setFilter((f) => (f === "all" || f === s.cat ? f : s.cat));

            // daily drivers earn a tiny pop
            if (s.level === 4) {
                const el = document.querySelector<HTMLElement>(`[data-skill="${id}"]`);
                const r = el?.getBoundingClientRect();
                if (r) fire(r.left + r.width / 2, r.top + r.height / 2, 12);
            }
        },
        [fire],
    );

    // "Surprise me": scan the visible tiles, slow down, land on one
    const timers = useRef<number[]>([]);
    const busy = scanId !== null;

    useEffect(
        () => () => {
            timers.current.forEach((t) => window.clearTimeout(t));
        },
        [],
    );

    function surprise() {
        if (busy || visible.length === 0) return;

        const unexplored = visible.filter(
            (s) => !explored.includes(s.id) && s.id !== selectedId,
        );
        const pool = unexplored.length ? unexplored : visible;
        const target = pool[Math.floor(Math.random() * pool.length)];

        if (reduce) {
            pick(target.id);
            return;
        }

        const start = Math.floor(Math.random() * visible.length);
        const steps = 9;
        let t = 0;

        for (let k = 0; k < steps; k++) {
            const id = visible[(start + k) % visible.length].id;
            t += 55 + k * 22;
            timers.current.push(window.setTimeout(() => setScanId(id), t));
        }

        t += 260;
        timers.current.push(window.setTimeout(() => setScanId(target.id), t));
        t += 360;
        timers.current.push(
            window.setTimeout(() => {
                setScanId(null);
                pick(target.id);
            }, t),
        );
    }

    // easter egg: explore everything and the board celebrates
    const allDone = explored.length === SKILLS.length;
    const wasDone = useRef(false);

    useEffect(() => {
        if (allDone && !wasDone.current) {
            const r = gridRef.current?.getBoundingClientRect();
            if (r) fire(r.left + r.width / 2, r.top + r.height / 2, 36);
        }
        wasDone.current = allDone;
    }, [allDone, fire]);

    // roving keyboard navigation across the tile grid
    function onGridKey(e: KeyboardEvent<HTMLUListElement>) {
        if (e.key === "Escape") {
            setSelectedId(null);
            return;
        }

        const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-tile]"),
        );
        const idx = items.indexOf(document.activeElement as HTMLButtonElement);
        if (idx < 0) return;

        let next = idx;
        if (e.key === "ArrowRight") next = idx + 1;
        else if (e.key === "ArrowLeft") next = idx - 1;
        else if (e.key === "ArrowDown") next = idx + COLS;
        else if (e.key === "ArrowUp") next = idx - COLS;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = items.length - 1;
        else return;

        e.preventDefault();
        items[clamp(next, 0, items.length - 1)]?.focus();
    }

    // nudge the hint so it matches how you interact
    const hint = fine ? copy.hintFine : copy.hintTouch;

    // fade the board's dashed frame in once the section is on screen
    const glowOpacity = useMotionValue(0);
    useEffect(() => {
        if (!ready || reduce) return;
        const controls = animate(glowOpacity, 1, { duration: 1.2, delay: 0.3 });
        return () => controls.stop();
    }, [ready, reduce, glowOpacity]);

    return (
        <section
            id="skills"
            ref={sectionRef}
            
            className={`relative box-border flex min-h-svh w-full  flex-col overflow-hidden border-t border-border bg-background px-4 pb-6 pt-12 sm:px-6 ${FIXED ? "lg:h-svh" : "lg:min-h-svh"} lg:pb-8 lg:pt-16`}
        >
            <Shapes reduce={reduce} />

            <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 lg:min-h-0 lg:gap-7">
                {/* ---------- header ---------- */}
                <SectionHeader
                    index=""
                    label={copy.badge}
                    top={copy.headingTop}
                    bottom={copy.headingBottom}
                    reduce={reduce}
                    aside={
                        <FilterBar value={filter} onChange={setFilter} counts={counts} reduce={reduce} />
                    }
                />

                {/* ---------- board + inspector ---------- */}
                <div className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
                    <LayoutGroup>
                        <div className="relative flex flex-col lg:min-h-0">
                            <motion.div
                                style={{ opacity: reduce ? 1 : glowOpacity }}
                                className="relative rounded-[1.5rem] border border-dashed border-border p-3 sm:rounded-[2rem] sm:p-5 lg:min-h-0 lg:flex-1"
                            >
                                <ul
                                    ref={gridRef}
                                    onKeyDown={onGridKey}
                                    className={`grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 ${FIXED ? "lg:h-full lg:grid-rows-4" : ""}`}
                                >
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {visible.map((skill, i) => (
                                            <SkillTile
                                                key={skill.id}
                                                skill={skill}
                                                index={i}
                                                selected={selectedId === skill.id}
                                                dimmed={!!selected && !relatedSet.has(skill.id)}
                                                related={
                                                    !!selected && selected.related.includes(skill.id)
                                                }
                                                scanning={scanId === skill.id}
                                                explored={explored.includes(skill.id)}
                                                ready={ready}
                                                reduce={reduce}
                                                fine={fine}
                                                onSelect={pick}
                                                fixedGrid={FIXED}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            </motion.div>

                            <p className="mt-2 hidden truncate text-xs text-muted-foreground sm:block">
                                {CAT_BY_ID[filter].blurb}
                            </p>
                        </div>
                    </LayoutGroup>

                    <div className="flex flex-col gap-3 lg:min-h-0 lg:gap-4">
                        <Inspector skill={selected} reduce={reduce} onPick={pick} />
                        <ExploreBar
                            explored={explored.length}
                            total={SKILLS.length}
                            busy={busy}
                            onSurprise={surprise}
                            reduce={reduce}
                            hint={hint}
                        />
                    </div>
                </div>
            </div>

            <ConfettiLayer bursts={bursts} />
        </section>
    );
}