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