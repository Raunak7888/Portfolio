"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaArrowRight } from "react-icons/fa";
import { gsap } from "@/lib/gsap";

import { SocialIcons } from "@/components/ui/SocialLinks";
import HeroVisualStack from "./CodeCard";
import data from "@/Data/Data.json";

/* ---------------- Framer Motion (layout only) ---------------- */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
} as const;

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 },
    },
} as const;

/* ---------------- Component ---------------- */

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
            // Clear text for typing targets
            hi.textContent = "";
            desc.textContent = "";

            // Keep layout, just hide initially
            gsap.set([hi, name, desc], { visibility: "visible" });

            const tl = gsap.timeline({ delay: 0.6 });

            // ALL START AT THE SAME TIME (position 0)

            // Typing: "Hi, I'm"
            tl.to(
                hi,
                {
                    text: "Hi, I'm",
                    duration: 0.8,
                    ease: "none",
                },
                0,
            );

            // Scramble name
            tl.to(
                name,
                {
                    scrambleText: {
                        text: data.hero.fullName,
                        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                        speed: 0.4,
                    },
                    duration: 1.2,
                    ease: "none",
                },
                0,
            );

            // Typing description
            tl.to(
                desc,
                {
                    text: data.heroSection.description,
                    duration: 1.2,
                    ease: "none",
                },
                0,
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-12 gap-12 items-center w-full"
        >
            {/* Left */}
            <div className="lg:col-span-7 space-y-8 relative top-3 text-left">
                <motion.div variants={itemVariants}>
                    <Link
                        href={data.heroSection.viewSourceGithubLinkUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                        bg-primary/10 border border-primary/20 text-primary
                        text-xs font-medium hover:bg-primary/20 transition-all group"
                    >
                        <FaGithub />
                        <span>Portfolio Source Code</span>
                        <FaArrowRight size={10} className="opacity-50" />
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-foreground/70 text-lg md:text-xl font-medium">
                        <span
                            ref={hiRef}
                            className="inline-block"
                            aria-hidden
                        />
                        <span className="sr-only">Hi, I&apos;m</span>
                    </h2>

                    <h1
                        ref={nameRef}
                        className="text-5xl md:text-7xl text-primary
                        font-bungee font-bold tracking-tight
                        min-h-18"
                                >
                        {data.hero.fullName}
                    </h1>
                </motion.div>

                <motion.p
                    ref={descRef}
                    variants={itemVariants}
                    className="max-w-135 text-muted-foreground
                    text-lg md:text-xl leading-relaxed
                    min-h-14"
                >
                    {data.heroSection.description}
                </motion.p>

                <motion.div variants={itemVariants} className="flex gap-6 pt-4">
                    <div
                        className="h-12 flex items-center px-4 border-2
                            backdrop-blur-sm border-primary rounded-full"
                    >
                        <SocialIcons />
                    </div>

                    <button
                        className="h-12 px-8 bg-primary text-primary-foreground
                        font-semibold rounded-full transition-transform
                        hover:scale-[1.05] flex items-center gap-2"
                        onClick={() =>
                            document
                                .getElementById("contact")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        Connect
                        <FaArrowRight size={14} />
                    </button>
                </motion.div>
            </div>

            {/* Right */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="hidden lg:block lg:col-span-5 relative"
            >
                <HeroVisualStack />
                <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10" />
            </motion.div>
        </motion.div>
    );
}
