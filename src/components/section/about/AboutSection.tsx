"use client";

import React, { JSX } from "react";
import { motion, Variants } from "framer-motion";
import Divider from "../Divider";
import data from "@/Data/Data.json";

import {
    SecurityLockIcon,
    CpuIcon,
    AiBrainIcon,
    Location01Icon,
    FlashIcon,
    CodeIcon,
    StarIcon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// ─── Motion variants ──────────────────────────────────────────────────────────

const fadeUp: Variants = {
    hidden:  { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    }),
};

// ─── Icon map (segment cards) ─────────────────────────────────────────────────

const iconMap: Record<string, JSX.Element> = {
    "01": <HugeiconsIcon icon={SecurityLockIcon} size={14} className="text-primary" />,
    "02": <HugeiconsIcon icon={CpuIcon}          size={14} className="text-primary" />,
    "03": <HugeiconsIcon icon={AiBrainIcon}       size={14} className="text-primary" />,
    "04": <HugeiconsIcon icon={Location01Icon}    size={14} className="text-primary" />,
};

// ─── Dot-grid decoration ──────────────────────────────────────────────────────
// A subtle SVG pattern used as a visual anchor behind the headline.
// Pure atmosphere — no meaning, no interaction.

function DotGrid() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-[340px] opacity-[0.035] dark:opacity-[0.055]"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <pattern
                    id="dot-pattern"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" className="text-foreground" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
    );
}

// ─── Segment card ─────────────────────────────────────────────────────────────

interface Segment {
    id:    string;
    title: string;
    label: string;
    text:  string;
}

function SegmentCard({ s, index }: { s: Segment; index: number }) {
    return (
        <motion.div
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="group relative flex flex-col gap-5 p-7 lg:p-8 bg-background hover:bg-card border border-border rounded-2xl transition-colors duration-200 cursor-default overflow-hidden"
        >
            {/* Hover glow — top-left origin */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -left-10 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)" }}
            />

            {/* Icon + id */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-2xl border border-border bg-muted group-hover:border-primary/30 transition-colors duration-200">
                        {iconMap[s.id]}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                        {s.id}
                    </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {/* Title + label */}
            <div>
                <h3 className="text-base lg:text-lg font-semibold tracking-tight text-foreground mb-2">
                    {s.title}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="h-px w-4 bg-primary rounded-full shrink-0" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        {s.label}
                    </span>
                </div>
            </div>

            {/* Body */}
            <p className="text-sm text-muted-foreground leading-relaxed">
                {s.text}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-primary transition-all duration-500 ease-out" />
        </motion.div>
    );
}

// ─── Philosophy section ───────────────────────────────────────────────────────
// Four pillars as full bento cells — icon, label, one-liner.
// The pillars are the visual anchor of this section; they earn their own row.

const pillars = [
    {
        icon:  FlashIcon,
        label: "Zero compromise DX",
        desc:  "Every abstraction earns its keep. If it slows down the feedback loop, it goes.",
    },
    {
        icon:  CodeIcon,
        label: "Open by default",
        desc:  "Prefer legible code over clever code. Future-you is reading this at 2 am.",
    },
    {
        icon:  CheckmarkCircle02Icon,
        label: "Correctness first",
        desc:  "A fast wrong answer is worse than a slow right one. Test before you ship.",
    },
    {
        icon:  StarIcon,
        label: "Clarity over clever",
        desc:  "Naming things well is the hardest part. Take the time — it compounds.",
    },
];

function PhilosophySection() {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-3"
        >
            {/* Section label */}
            <motion.div
                variants={fadeUp}
                custom={0}
                className="flex items-center gap-3 mb-4"
            >
                <div className="h-px w-5 bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                    Philosophy
                </span>
            </motion.div>

            {/* Pillar grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border rounded-2xl overflow-hidden">
                {pillars.map((p, i) => (
                    <motion.div
                        key={i}
                        custom={i + 1}
                        variants={fadeUp}
                        className={[
                            "group relative flex flex-col gap-4 p-6 lg:p-7",
                            "bg-background hover:bg-card transition-colors duration-200 cursor-default overflow-hidden",
                            // right borders between columns
                            i < pillars.length - 1
                                ? "border-b lg:border-b-0 lg:border-r border-border"
                                : "",
                            // for 2-col on sm: bottom border on first row
                            i === 1 ? "sm:border-r-0 border-b sm:border-b border-border" : "",
                        ]
                            .join(" ")
                            .replace(/\s+/g, " ")
                            .trim()}
                    >
                        {/* Hover radial */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-8 -left-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.07) 0%, transparent 70%)" }}
                        />

                        {/* Icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-2xl border border-border bg-muted group-hover:border-primary/30 transition-colors duration-200 shrink-0">
                            <HugeiconsIcon icon={p.icon} size={14} className="text-primary" />
                        </div>

                        {/* Label */}
                        <div>
                            <p className="text-sm font-semibold text-foreground tracking-tight mb-1.5">
                                {p.label}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {p.desc}
                            </p>
                        </div>

                        {/* Bottom accent */}
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-primary transition-all duration-500 ease-out" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ─── Closing bar ──────────────────────────────────────────────────────────────

function ClosingBar() {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
            custom={0}
            className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <p className="font-mono text-xs text-muted-foreground tracking-wide max-w-lg">
                {data.about.endingLine}
            </p>
            <div className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                    Available for projects
                </span>
            </div>
        </motion.div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────

const AboutSection: React.FC = () => {
    const { segments } = data.about;

    return (
        <section className="relative w-full min-h-screen flex flex-col">
            <Divider sectionName="About Me" />

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-16 pb-24">

                {/* ── Headline block with dot-grid decoration ── */}
                

                {/* ── Segment cards — 2-col grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {segments.map((s, i) => (
                        <SegmentCard key={s.id} s={s} index={i} />
                    ))}
                </div>

                <ClosingBar />
            </div>
        </section>
    );
};

export default AboutSection;