"use client";
// redesign.sh:v1

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useReducedMotion, useScroll } from "framer-motion";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import ScrollChars from "@/components/motion/ScrollChars";
import { site } from "@/content/site";
import { useMinWidth } from "@/hooks/useMinWidth";

const PAGES = site.nav;
const ELSEWHERE = [...site.social, { label: "Email", href: `mailto:${site.email}` }];

function FooterLink({ label, href, reduce }: { label: string; href: string; reduce: boolean }) {
    const external = href.startsWith("http");
    function onClick(e: MouseEvent<HTMLAnchorElement>) {
        if (!href.startsWith("#")) return;
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
    return (
        <a
            href={href}
            onClick={onClick}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
            className="ed-link rounded-sm text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            {label}
            {external && <span aria-hidden> ↗</span>}
        </a>
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
        <p className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
            {site.location} · <span className="tabular-nums">{time ?? "--:--"}</span> IST
        </p>
    );
}

export default function Footer() {
    const reduce = !!useReducedMotion();
    const desktop = useMinWidth(768);
    const ref = useRef<HTMLElement>(null);
    const year = new Date().getFullYear();

    // 0 when the footer's top meets the viewport bottom, 1 when the page ends.
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
    const live = !reduce;

    function toTop() {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }

    return (
        <footer
            id="footer"
            ref={ref}
            className="relative flex min-h-[90svh] w-full max-w-[100vw] flex-col justify-between gap-16 overflow-x-clip border-t border-border bg-background px-4 pb-6 pt-24 sm:px-6"
        >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
                <Reveal className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2.5 text-sm font-medium">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                        </span>
                        Open to new projects
                    </span>
                    <LocalClock />
                </Reveal>

                <div className="grid gap-12 md:grid-cols-[minmax(0,6fr)_minmax(0,3fr)_minmax(0,3fr)] md:gap-10">
                    <Reveal>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Say hello</p>
                        <a
                            href={`mailto:${site.email}`}
                            className="ed-link ds-serif mt-3 inline-block rounded-sm text-[clamp(1.6rem,3.6vw,3.25rem)] italic leading-tight outline-none [overflow-wrap:anywhere] focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            {site.email}
                        </a>
                    </Reveal>

                    <Reveal delay={0.08}>
                        <nav aria-label="Pages">
                            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Pages</p>
                            <ul className="mt-3 flex flex-col gap-2.5">
                                {PAGES.map((p) => (
                                    <li key={p.label}>
                                        <FooterLink label={p.label} href={p.href} reduce={reduce} />
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </Reveal>

                    <Reveal delay={0.16}>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Find me</p>
                        <ul className="mt-3 flex flex-col gap-2.5">
                            {ELSEWHERE.map((l) => (
                                <li key={l.label}>
                                    <FooterLink label={l.label} href={l.href} reduce={reduce} />
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
                {/* The signature: one character at a time, driven by scroll. */}
                <h2
                    aria-label={site.fullName}
                    className="flex flex-col gap-1 font-semibold uppercase leading-none tracking-tighter text-[length:min(20vw,9rem)] transition-none md:flex-row md:justify-between md:gap-6 md:text-[length:min(11.2vw,12rem)]"
                >
                    <ScrollChars text="RAUNAK" progress={scrollYProgress} from={0.3} to={desktop ? 0.66 : 0.62} live={live} charClassName="transition-colors duration-300 hover:text-primary" />
                    <ScrollChars text="YADAV" progress={scrollYProgress} from={desktop ? 0.62 : 0.6} to={0.98} live={live} charClassName="transition-colors duration-300 hover:text-primary" />
                </h2>

                <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        © {year} {site.fullName}. Designed and built by hand.
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toTop}
                        icon={
                            <svg viewBox="0 0 24 24" aria-hidden className="size-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        }
                    >
                        Back to top
                    </Button>
                </div>
            </div>
        </footer>
    );
}
