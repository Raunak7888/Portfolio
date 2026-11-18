"use client";
/* redesign:v1 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
    AnimatePresence,
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import HeroTray from "@/components/ui/Herotray";
import NightSky from "@/components/hero/NightSky";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import { useScroll, useTransform } from "framer-motion";
import { TINT_LIST as TINTS } from "@/lib/tokens";

/* -------------------------------------------------------------------------- */
/*  Shared with the Skills section                                            */
/* -------------------------------------------------------------------------- */

const bouncy = { type: "spring", stiffness: 320, damping: 16 } as const;

/* -------------------------------------------------------------------------- */
/*  Name: letters rise in, then each one jumps and takes a color on hover     */
/* -------------------------------------------------------------------------- */

const letter: Variants = {
    hidden: { y: "110%", opacity: 0, rotate: 4, filter: "blur(8px)" },
    show: {
        y: "0%",
        opacity: 1,
        rotate: 0,
        filter: "blur(0px)",
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
};

function Char({
    char,
    i,
    settled,
    accent,
}: {
    char: string;
    i: number;
    settled: boolean;
    accent?: boolean;
}) {
    const tint = TINTS[i % TINTS.length];
    return (
        <span
            className={`mb-[-0.12em] inline-block pb-[0.12em] ${
                settled ? "" : "overflow-hidden"
            }`}
        >
            <motion.span
                variants={letter}
                whileHover={
                    settled
                        ? {
                              y: "-14%",
                              rotate: i % 2 ? 7 : -7,
                              color: tint,
                              transition: bouncy,
                          }
                        : undefined
                }
                className={`inline-block cursor-default ${accent ? "text-primary" : ""}`}
            >
                {char}
            </motion.span>
        </span>
    );
}

function AnimatedName({ text }: { text: string }) {
    const words = text.split(" ");
    const [settled, setSettled] = useState(false);

    // let the intro finish, then unclip so the letters can jump
    useEffect(() => {
        const t = window.setTimeout(() => setSettled(true), 1900);
        return () => window.clearTimeout(t);
    }, []);

    let n = 0;
    return (
        <motion.h1
            aria-label={text}
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.045, delayChildren: 0.35 }}
            className="flex flex-wrap justify-center gap-x-[0.28em] text-5xl font-semibold leading-[1.05] tracking-tight min-[400px]:text-6xl sm:text-7xl md:text-8xl lg:text-[clamp(5rem,min(10vw,17vh),9rem)]"
        >
            {words.map((word, wi) => (
                <span key={wi} className="inline-flex" aria-hidden>
                    {word.split("").map((char) => (
                        <Char key={n} char={char} i={n++} settled={settled} />
                    ))}
                    {wi === words.length - 1 && (
                        <Char char="." i={n++} settled={settled} accent />
                    )}
                </span>
            ))}
        </motion.h1>
    );
}

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 18, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

/* -------------------------------------------------------------------------- */
/*  Rotating word, with the same marker swipe as the Skills heading           */
/* -------------------------------------------------------------------------- */

const WORDS = ["products", "APIs", "interfaces", "systems"];

function Rotator({ reduce }: { reduce: boolean }) {
    const [i, setI] = useState(0);

    useEffect(() => {
        if (reduce) return;
        const t = window.setInterval(
            () => setI((v) => (v + 1) % WORDS.length),
            2200,
        );
        return () => window.clearInterval(t);
    }, [reduce]);

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
                    key={WORDS[i]}
                    initial={reduce ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    className="inline-block"
                >
                    {WORDS[i]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*  Sticker chips: grab one, fling it, it snaps back                          */
/* -------------------------------------------------------------------------- */

const STICKERS = [
    { label: "Next.js", tilt: -4 },
    { label: "TypeScript", tilt: 3 },
    { label: "AI agents", tilt: -2 },
    { label: "Spring Boot", tilt: 4 },
];

function Stickers({ reduce }: { reduce: boolean }) {
    return (
        <ul className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {STICKERS.map((s, i) => (
                <motion.li
                    key={s.label}
                    data-sticker
                    drag={!reduce}
                    dragSnapToOrigin
                    dragElastic={0.5}
                    dragMomentum={false}
                    initial={
                        reduce ? false : { opacity: 0, scale: 0.5, y: 20, rotate: -10 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: s.tilt }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 17,
                        delay: reduce ? 0 : 1.35 + i * 0.08,
                    }}
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
/* -------------------------------------------------------------------------- */

export default function Hero() {
    const reduce = !!useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
    const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section
            ref={sectionRef}
            id="home"
            className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-4 sm:px-6"
        >
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--primary)_0%,transparent_45%)] opacity-[0.07]" />

                {/* faint milky-way band */}
                <div className="absolute -left-1/4 top-[30%] h-56 w-[150%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_center,var(--foreground)_0%,transparent_65%)] opacity-[0.035] blur-3xl" />

                {/* grid, fading down */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-[0.14] mask-[linear-gradient(to_bottom,black,transparent_75%)]" />

                {/* stars + constellations */}
                <NightSky />

                {/* keep the centre calm so the text stays readable */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,var(--background)_0%,transparent_100%)] opacity-70" />
            </div>

            {/* Content */}
            <motion.div
                style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
                className="relative mx-auto flex w-full max-w-5xl flex-col items-center py-20 text-center sm:py-24"
            >
                {/* same badge style as Skills */}
                <motion.div {...fadeUp(0.1)} className="mb-6">
                    <Eyebrow>Open to full-stack roles</Eyebrow>
                </motion.div>

                <motion.p
                    {...fadeUp(0.2)}
                    className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground sm:text-sm"
                >
                    Hello, I&apos;m
                    <motion.span
                        aria-hidden
                        className="ml-2 inline-block origin-[70%_70%]"
                        animate={
                            reduce ? undefined : { rotate: [0, 14, -8, 14, -4, 10, 0] }
                        }
                        transition={{
                            duration: 1.8,
                            delay: 1.4,
                            repeat: Infinity,
                            repeatDelay: 3.5,
                        }}
                    >
                        👋
                    </motion.span>
                </motion.p>

                <AnimatedName text="Raunak Yadav" />

                <motion.h2
                    {...fadeUp(1.0)}
                    className="mt-6 text-lg font-medium tracking-tight sm:mt-8 sm:text-xl md:text-2xl"
                >
                    Full-Stack <span className="text-primary">Developer</span>
                </motion.h2>

                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                        duration: 1.1,
                        delay: 1.15,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="mt-6 h-px w-40 origin-center bg-linear-to-r from-transparent via-primary to-transparent"
                />

                <motion.p
                    {...fadeUp(1.25)}
                    className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl"
                >
                    I turn <span className="text-foreground">hard problems</span> into{" "}
                    <Rotator reduce={reduce} /> people love.
                </motion.p>

                <Stickers reduce={reduce} />

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <PlayButton href="#projects" variant="solid">
                        See Hermes, my main project
                    </PlayButton>
                    <PlayButton href="#contact">Get in touch</PlayButton>
                </div>

                <div className="mt-8 flex w-full justify-center sm:mt-10 sm:w-auto">
                    <HeroTray delay={1.6} />
                </div>
            </motion.div>

            {/* Scroll cue */}
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
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="block"
                >
                    <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={26}
                        strokeWidth={1.8}
                    />
                </motion.span>
            </motion.a>
        </section>
    );
}