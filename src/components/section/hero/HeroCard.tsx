"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaArrowRight } from "react-icons/fa";
import { gsap } from "@/lib/gsap";

import { SocialIcons } from "@/components/ui/SocialLinks";
import HeroVisualStack from "./CodeCard";
import data from "@/Data/Data.json";
import ResumeButton from "./ResumeDownloader";

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
            hi.textContent = "";
            desc.textContent = "";

            gsap.set([hi, name, desc], { visibility: "visible" });

            const tl = gsap.timeline({ delay: 0.6 });

            tl.to(hi, { text: "Hi, I'm", duration: 0.8, ease: "none" }, 0);
            tl.to(
                name,
                { text: data.hero.fullName, duration: 1.2, ease: "none" },
                0,
            );
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
            className="
                grid
                grid-cols-1
                lg:grid-cols-12
                select-none
                gap-8 sm:gap-10 lg:gap-12
                items-center
                w-full
                px-4 sm:px-6 lg:px-0
            "
        >
            {/* ── Left column ── */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 relative lg:top-3 text-center sm:text-left">
                {/* Badge */}
                <motion.div
                    variants={itemVariants}
                    className="flex justify-center sm:justify-start"
                >
                    <Link
                        href={data.heroSection.viewSourceGithubLinkUrl}
                        target="_blank"
                        className="
                            inline-flex items-center gap-2
                            px-3 py-1 rounded-full
                            bg-primary/10 border border-primary/20 text-primary
                            text-xs font-medium
                            hover:bg-primary/20 transition-all group
                        "
                    >
                        <FaGithub />
                        <span>Portfolio Source Code</span>
                        <FaArrowRight size={10} className="opacity-50" />
                    </Link>
                </motion.div>

                {/* Greeting + Name */}
                <motion.div
                    variants={itemVariants}
                    className="space-y-2 sm:space-y-4"
                >
                    <h2 className="text-foreground/70 text-base sm:text-lg md:text-xl font-medium">
                        <span
                            ref={hiRef}
                            className="inline-block"
                            aria-hidden
                        />
                        <span className="sr-only">Hi, I&apos;m</span>
                    </h2>

                    <h1
                        ref={nameRef}
                        className="
                            text-4xl xs:text-5xl sm:text-6xl md:text-7xl
                            text-primary font-bungee font-bold tracking-tight
                            min-h-12 sm:min-h-16 md:min-h-18
                            leading-tight
                        "
                    >
                        {data.hero.fullName}
                    </h1>
                </motion.div>

                {/* Description */}
                <motion.p
                    ref={descRef}
                    variants={itemVariants}
                    className="
                        mx-auto sm:mx-0
                        max-w-prose sm:max-w-lg lg:max-w-135
                        text-muted-foreground
                        text-base sm:text-lg md:text-xl
                        leading-relaxed
                        min-h-12 sm:min-h-14
                    "
                >
                    {data.heroSection.description}
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    variants={itemVariants}
                    className="
                        flex flex-col xs:flex-row
                        items-center sm:items-start
                        gap-3 sm:gap-4 lg:gap-6
                        pt-2 sm:pt-4
                        w-full sm:w-fit
                    "
                >
                    {/* Social icons pill */}
                    <div
                        className="
                            h-11 sm:h-12 flex items-center px-4
                            border-2 backdrop-blur-sm border-primary rounded-full
                        "
                    >
                        <SocialIcons />
                    </div>

                    <ResumeButton />

                    <button
                        className="
                            h-11 sm:h-12 px-6 sm:px-8
                            bg-primary text-primary-foreground
                            font-semibold rounded-full
                            transition-transform hover:scale-[1.05]
                            flex items-center gap-2
                            w-fit xs:w-auto justify-center
                        "
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

            {/* ── Right column (visual stack) ── */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="
                    hidden md:flex md:justify-center
                    lg:block lg:col-span-5
                    relative
                "
            >
                <HeroVisualStack />
                <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10" />
            </motion.div>
        </motion.div>
    );
}
