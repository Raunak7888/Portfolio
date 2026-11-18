"use client";
/* redesign:v2 */

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import HeroTray from "@/components/ui/Herotray";
import NightSky from "@/components/hero/NightSky";
import Eyebrow from "@/components/ui/Eyebrow";
import { portfolio } from "@/content/data";
import { TINT_LIST as TINTS } from "@/lib/tokens";

const hero = portfolio.hero;
const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Name                                                                      */
/*  Each word has a fixed clip box, so nothing is ever clipped late or        */
/*  shifted. Size scales with the viewport, capped at 7.5rem.                 */
/* -------------------------------------------------------------------------- */

const nameV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const wordV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
};
const letterV: Variants = {
    hidden: { y: "105%", opacity: 0 },
    show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

function AnimatedName({ first, last, label }: { first: string; last: string; label: string }) {
    let n = 0;
    return (
        <motion.h1
            aria-label={label}
            initial="hidden"
            animate="show"
            variants={nameV}
            className="flex flex-wrap justify-center gap-x-[0.24em] text-[clamp(2.75rem,11.5vw,7.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
        >
            {[first, last].filter(Boolean).map((word, wi, all) => (
                <motion.span
                    key={word + wi}
                    aria-hidden
                    variants={wordV}
                    className="inline-flex overflow-hidden whitespace-nowrap pb-[0.16em] -mb-[0.16em]"
                >
                    {word.split("").map((ch) => {
                        const tint = TINTS[n++ % TINTS.length];
                        return (
                            <motion.span
                                key={n}
                                variants={letterV}
                                style={{ "--c": tint } as CSSProperties}
                                className="inline-block cursor-default transition-colors duration-300 hover:text-[color:var(--c)]"
                            >
                                {ch}
                            </motion.span>
                        );
                    })}
                    {wi === all.length - 1 && (
                        <motion.span variants={letterV} className="inline-block text-primary">
                            .
                        </motion.span>
                    )}
                </motion.span>
            ))}
        </motion.h1>
    );
}

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
});

/* -------------------------------------------------------------------------- */
/*  Rotating word                                                             */
/* -------------------------------------------------------------------------- */

function Rotator({ words, reduce }: { words: string[]; reduce: boolean }) {
    const [i, setI] = useState(0);

    useEffect(() => {
        if (reduce || words.length < 2) return;
        const t = window.setInterval(() => setI((v) => (v + 1) % words.length), 2200);
        return () => window.clearInterval(t);
    }, [reduce, words.length]);

    const tint = TINTS[i % TINTS.length];
    const mark = `linear-gradient(color-mix(in oklab, ${tint} 40%, transparent), color-mix(in oklab, ${tint} 40%, transparent))`;

    return (
        <span
            className="inline-block overflow-hidden align-bottom text-foreground"
            style={{
                backgroundImage: mark,
                backgroundSize: "100% 38%",
                backgroundPosition: "0 88%",
                backgroundRepeat: "no-repeat",
                transition: "background-image 0.4s",
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={words[i]}
                    initial={reduce ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    className="inline-block"
                >
                    {words[i]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*  Sticker chips                                                             */
/* -------------------------------------------------------------------------- */

function Stickers({ items, reduce }: { items: { label: string; tilt?: number }[]; reduce: boolean }) {
    if (items.length === 0) return null;
    return (
        <ul className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {items.map((s, i) => (
                <motion.li
                    key={s.label}
                    data-sticker
                    drag={!reduce}
                    dragSnapToOrigin
                    dragElastic={0.5}
                    dragMomentum={false}
                    initial={reduce ? false : { opacity: 0, scale: 0.5, y: 20, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: s.tilt ?? 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 17, delay: reduce ? 0 : 1.35 + i * 0.08 }}
                    whileHover={reduce ? undefined : { y: -4, scale: 1.06 }}
                    whileTap={reduce ? undefined : { scale: 0.95 }}
                    whileDrag={{ scale: 1.1, zIndex: 20 }}
                    style={{ "--tint": TINTS[i % TINTS.length] } as CSSProperties}
                    className="inline-flex cursor-grab touch-none select-none items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--tint)_40%,transparent)] bg-[color-mix(in_oklab,var(--tint)_10%,var(--background))] px-3.5 py-1.5 text-xs font-medium active:cursor-grabbing sm:text-sm"
                >
                    <span className="size-1.5 rounded-full bg-[color:var(--tint)]" />
                    {s.label}
                </motion.li>
            ))}
        </ul>
    );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/*  Nothing here reacts to page scroll: the content stays where it is.        */
/* -------------------------------------------------------------------------- */

export default function Hero() {
    const reduce = !!useReducedMotion();
    const words = hero.rotatorWords?.length ? hero.rotatorWords : ["products"];
    const first = hero.firstName;
    const last = hero.secondName ?? hero.fullName.split(" ").slice(1).join(" ");
    const intro = hero.intro;

    return (
        <section id="home" className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-4 sm:px-6">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--primary)_0%,transparent_45%)] opacity-[0.07]" />
                <div className="absolute -left-1/4 top-[30%] h-56 w-[150%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_center,var(--foreground)_0%,transparent_65%)] opacity-[0.035] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-[0.14] mask-[linear-gradient(to_bottom,black,transparent_75%)]" />
                <NightSky />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,var(--background)_0%,transparent_100%)] opacity-70" />
            </div>

            <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center pb-24 pt-24 text-center sm:pt-28">
                {hero.eyebrow && (
                    <motion.div {...fadeUp(0.1)} className="mb-6">
                        <Eyebrow>{hero.eyebrow}</Eyebrow>
                    </motion.div>
                )}

                {hero.greeting && (
                    <motion.p {...fadeUp(0.2)} className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
                        {hero.greeting}
                        <motion.span
                            aria-hidden
                            className="ml-2 inline-block origin-[70%_70%]"
                            animate={reduce ? undefined : { rotate: [0, 14, -8, 14, -4, 10, 0] }}
                            transition={{ duration: 1.8, delay: 1.4, repeat: Infinity, repeatDelay: 3.5 }}
                        >
                            👋
                        </motion.span>
                    </motion.p>
                )}

                <AnimatedName first={first} last={last} label={hero.fullName} />

                {hero.role && (
                    <motion.h2 {...fadeUp(1.0)} className="mt-6 text-lg font-medium tracking-tight sm:mt-8 sm:text-xl md:text-2xl">
                        {hero.role.before} <span className="text-primary">{hero.role.highlight}</span>
                    </motion.h2>
                )}

                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.1, delay: 1.15, ease: EASE }}
                    className="mt-6 h-px w-40 origin-center bg-linear-to-r from-transparent via-primary to-transparent"
                />

                {intro && (
                    <motion.p {...fadeUp(1.25)} className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                        {intro.before} <span className="text-foreground">{intro.emphasis}</span> {intro.middle}{" "}
                        <Rotator words={words} reduce={reduce} /> {intro.after}
                    </motion.p>
                )}

                <Stickers items={hero.stickers ?? []} reduce={reduce} />

                

                <div className="mt-8 flex w-full justify-center sm:mt-10 sm:w-auto">
                    <HeroTray delay={1.6} />
                </div>
            </div>

            <motion.a
                href="#about"
                aria-label="Scroll to next section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 1 }}
                className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-primary sm:block"
            >
                <motion.span
                    animate={reduce ? undefined : { y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="block"
                >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={26} strokeWidth={1.8} />
                </motion.span>
            </motion.a>
        </section>
    );
}
