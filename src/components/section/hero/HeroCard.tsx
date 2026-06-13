"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { gsap } from "@/lib/gsap";

import { SocialIcons } from "@/components/ui/SocialLinks";
import HeroVisualStack from "./CodeCard";
import data from "@/Data/Data.json";
import ResumeButton from "./ResumeDownloader";

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.3 },
    },
} as const;

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroContent() {
    const hiRef = useRef<HTMLSpanElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const hi = hiRef.current;
        const name = nameRef.current;
        const desc = descRef.current;
        if (!hi || !name || !desc) return;

        const ctx = gsap.context(() => {
            hi.textContent = "";
            desc.textContent = "";

            gsap.set([hi, name, desc], { visibility: "visible" });

            const tl = gsap.timeline({ delay: 0.5 });
            tl.to(hi, { text: "Hi, I'm", duration: 0.6, ease: "none" }, 0);
            tl.to(
                desc,
                {
                    text: data.heroSection.description,
                    duration: 1.2,
                    ease: "none",
                },
                0,
            );

            /*
             * The headline uses a CSS gradient for its color treatment.
             * GSAP TextPlugin rewrites textContent which strips the gradient.
             * Solution: typewrite into a visually hidden <span> that drives
             * the real visible headline via a ResizeObserver-free pattern —
             * instead we just fade the name in as a whole after the hi text
             * finishes, matching the rhythm without fighting the CSS.
             */
           
        });

        return () => ctx.revert();
    }, []);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full"
        >
            <div className="lg:col-span-7 space-y-7 text-center sm:text-left">
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center sm:justify-start gap-2"
                >
                    <Link
                        href={data.heroSection.viewSourceGithubLinkUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200 group"
                    >
                        <Github size={11} />
                        <span>View source</span>
                        <ArrowRight
                            size={9}
                            className="opacity-50 group-hover:translate-x-0.5 transition-transform"
                        />
                    </Link>

                    {/* Separator dot */}
                    <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-border" />

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-full text-[11px] font-mono text-muted-foreground bg-muted/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Open to opportunities
                    </span>
                </motion.div>

                {/* ── Greeting ── */}
                <motion.div variants={itemVariants} className="">
                    <p className="text-sm sm:text-base text-muted-foreground font-medium h-5">
                        <span
                            ref={hiRef}
                            className="inline-block"
                            aria-hidden
                            style={{ visibility: "hidden" }}
                        />
                        <span className="sr-only">Hi, I&apos;m</span>
                    </p>

                    {/*
                     * Headline with gradient text treatment.
                     * Note: visibility toggled by GSAP (set to visible + fade-in).
                     * The gradient is purely CSS — safe with opacity animation.
                     */}
                    <div className="relative">
                        {/*
                         * Stage light: a tight radial glow directly behind the
                         * headline text. Positioned flush to the text block.
                         * Visible only on the text area, not the whole section.
                         */}
                        <div
                            aria-hidden
                            className="absolute pointer-events-none select-none hidden sm:block"
                            style={{
                                inset: "-20px -40px -20px -40px",
                                background:
                                    "radial-gradient(ellipse 70% 60% at 40% 50%, hsl(var(--primary) / 0.07) 0%, transparent 70%)",
                                zIndex: 0,
                            }}
                        />
                        <h1
                            ref={nameRef}
                            className="relative z-10 py-4 pb-0 mb-0 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-aclonica font-bold tracking-tight leading-none min-h-16 md:min-h-20"
                            style={{
                                visibility: "hidden",
                                background:
                                    "linear-gradient(160deg, hsl(var(--foreground)) 0%, hsl(var(--foreground) / 0.65) 100%)",
                                backgroundClip: "text",
                            }}
                        >
                            {data.hero.firstName}
                        </h1>
                    </div>
                </motion.div>

                {/* Description */}
                <motion.p
                    ref={descRef}
                    variants={itemVariants}
                    className="max-w-md mx-auto sm:mx-0 text-base sm:text-lg text-muted-foreground leading-relaxed min-h-14"
                    style={{ visibility: "hidden" }}
                >
                    {data.heroSection.description}
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2"
                >
                    <button
                        onClick={() =>
                            document
                                .getElementById("contact")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="relative h-10 px-6 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-150 rounded-2xl overflow-hidden group"
                    >
                        {/* Shimmer sweep */}
                        <span
                            aria-hidden
                            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-linear-to-r from-transparent via-white/10 to-transparent"
                        />
                        Get in Touch
                        <ArrowRight size={14} />
                    </button>

                    <ResumeButton />
                </motion.div>

                <div className="relative h-10 w-fit border-2 border-primary text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-150 rounded-2xl overflow-hidden group">
                  <SocialIcons size={38} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                RIGHT COLUMN
            ═══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.9,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="hidden md:flex md:justify-center lg:block lg:col-span-5 relative"
            >
                {/* Ambient glow behind card stack */}
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 55% 45% at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
                    }}
                />

                <HeroVisualStack />
            </motion.div>
        </motion.div>
    );
}
