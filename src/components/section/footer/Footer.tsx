"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import FlapText from "@/components/ui/FlapText";
import Screen from "@/components/ui/Screen";
import { site } from "@/content/site";
import { chunky } from "@/lib/ds";
import { spring } from "@/lib/motion";

type Row = { label: string; href: string; gate: string; status: string };

const PAGES: Row[] = site.nav.map((p, i) => ({
    label: p.label.toUpperCase(),
    href: p.href,
    gate: `A${i + 1}`,
    status: "On time",
}));

const ELSEWHERE: Row[] = [...site.social, { label: "Email", href: `mailto:${site.email}` }].map((l, i) => ({
    label: l.label.toUpperCase(),
    href: l.href,
    gate: `B${i + 1}`,
    status: l.label === "Email" ? "Replies in a day" : "Boarding",
}));

/* Click the badge to change what this site was "made with". */
const FUEL = [
    { emoji: "☕", text: "coffee" },
    { emoji: "🍕", text: "pizza" },
    { emoji: "🎧", text: "lo-fi beats" },
    { emoji: "🌙", text: "late nights" },
    { emoji: "🐛", text: "a few bugs" },
];


function BoardRow({
    row,
    index,
    inView,
    reduce,
}: {
    row: Row;
    index: number;
    inView: boolean;
    reduce: boolean;
}) {
    const [go, setGo] = useState(false);
    const [hover, setHover] = useState(0);
    const external = row.href.startsWith("http");

    // rows flip one after another once the board is on screen
    useEffect(() => {
        if (!inView) return;
        const t = window.setTimeout(() => setGo(true), index * 140);
        return () => window.clearTimeout(t);
    }, [inView, index]);

    function onClick(e: MouseEvent<HTMLAnchorElement>) {
        if (!row.href.startsWith("#")) return;
        e.preventDefault();
        document.querySelector(row.href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }

    return (
        <li>
            <a
                href={row.href}
                onClick={onClick}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                onPointerEnter={() => setHover((h) => h + 1)}
                onFocus={() => setHover((h) => h + 1)}
                className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-background/15 py-[clamp(0.3rem,1.1vh,0.7rem)] text-[clamp(0.85rem,2vh,1.2rem)] outline-none transition-colors hover:bg-background/10 focus-visible:bg-background/15"
            >
                <span className="font-mono text-xs opacity-60">{row.gate}</span>
                <FlapText text={row.label} trigger={go ? 1 + hover : 0} reduce={reduce} />
                <span className="inline-flex items-center gap-2 text-xs opacity-85">
                    <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[oklch(0.78_0.17_150)] opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-[oklch(0.78_0.17_150)]" />
                    </span>
                    {row.status}
                    <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                        ↗
                    </span>
                </span>
            </a>
        </li>
    );
}

function FuelBadge({ reduce }: { reduce: boolean }) {
    const [i, setI] = useState(0);
    const item = FUEL[i];

    return (
        <button
            type="button"
            onClick={() => setI((n) => (n + 1) % FUEL.length)}
            title="Click to change"
            className={`inline-flex h-9 items-center gap-2 rounded-full bg-background px-4 text-sm ${chunky}`}
        >
            Fuelled by
            <span className="relative inline-flex h-6 min-w-[6.5rem] items-center overflow-hidden font-semibold">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={item.text}
                        initial={reduce ? false : { y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? undefined : { y: -18, opacity: 0 }}
                        transition={spring}
                        className="flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <span aria-hidden>{item.emoji}</span>
                        {item.text}
                    </motion.span>
                </AnimatePresence>
            </span>
        </button>
    );
}

/** Local time, computed on the client so it never mismatches on hydration. */
function LocalClock() {
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        const fmt = () =>
            new Intl.DateTimeFormat("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: site.timezone,
            }).format(new Date());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTime(fmt());
        const id = window.setInterval(() => setTime(fmt()), 15000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <p className="font-mono text-xs opacity-75" suppressHydrationWarning>
            {site.location} · <span className="tabular-nums">{time ?? "--:--"}</span> IST
        </p>
    );
}

export default function Footer() {
    const reduce = !!useReducedMotion();
    const year = new Date().getFullYear();
    const boardRef = useRef<HTMLDivElement>(null);
    const inView = useInView(boardRef, { once: true, amount: 0.35 });
    const [launched, setLaunched] = useState(0);

    function toTop() {
        setLaunched((n) => n + 1);
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }

    return (
        <Screen id="footer" as="footer">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-[clamp(0.75rem,2.4vh,1.75rem)] px-4 pb-4 pt-[clamp(4.5rem,10vh,6rem)] sm:px-6 lg:min-h-0">
                {/* ---------- status ---------- */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-background px-3.5 py-1.5 text-sm font-medium">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                        </span>
                        Open to new projects
                    </span>
                    <span className="text-sm text-muted-foreground">Last stop on the page, next stop is you.</span>
                </div>

                {/* ---------- the board ---------- */}
                <motion.div
                    ref={boardRef}
                    initial={reduce ? false : { opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={spring}
                    className="rounded-[1.75rem] bg-foreground p-[clamp(0.9rem,2.2vh,1.6rem)] text-background shadow-[8px_8px_0_0_var(--primary)]"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-background/20 pb-[clamp(0.5rem,1.4vh,0.9rem)]">
                        <p className="text-sm font-semibold">Departures</p>
                        <LocalClock />
                    </div>

                    <h2 className="py-[clamp(0.75rem,2.4vh,1.75rem)] text-[clamp(1.1rem,min(2.7vw,5.2vh),2.6rem)] leading-[1.5]">
                        <FlapText text="THANKS FOR SCROLLING" trigger={inView ? 1 : 0} reduce={reduce} />
                        <br />
                        <FlapText text="THIS FAR. YOU'RE NICE." trigger={inView ? 2 : 0} reduce={reduce} />
                    </h2>

                    <div className="grid gap-x-10 lg:grid-cols-2">
                        <nav aria-label="Pages">
                            <h3 className="mb-1 text-xs font-medium opacity-65">Pages</h3>
                            <ul>
                                {PAGES.map((r, i) => (
                                    <BoardRow key={r.label} row={r} index={i} inView={inView} reduce={reduce} />
                                ))}
                            </ul>
                        </nav>
                        <div className="mt-3 lg:mt-0">
                            <h3 className="mb-1 text-xs font-medium opacity-65">Find me</h3>
                            <ul>
                                {ELSEWHERE.map((r, i) => (
                                    <BoardRow key={r.label} row={r} index={i + 2} inView={inView} reduce={reduce} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* ---------- runway + fine print ---------- */}
                <div>
                    <div aria-hidden className="relative mb-3 h-5 overflow-hidden">
                        <span className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-border" />
                        {!reduce && <span className="rd-runway absolute top-0 text-base">🚀</span>}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                            <p className="text-xs text-muted-foreground">
                                © {year} {site.fullName}
                            </p>
                            <FuelBadge reduce={reduce} />
                        </div>

                        <motion.button
                            type="button"
                            onClick={toTop}
                            whileTap={reduce ? undefined : { scale: 0.94 }}
                            className={`group inline-flex h-10 items-center gap-2 self-start rounded-full bg-background px-4 text-sm font-semibold sm:self-auto ${chunky}`}
                        >
                            Back to top
                            <motion.span
                                key={launched}
                                aria-hidden
                                animate={launched && !reduce ? { y: [0, -22, 0], rotate: [0, -10, 0] } : undefined}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5"
                            >
                                🚀
                            </motion.span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </Screen>
    );
}
