// ProjectSection.tsx — full rewrite
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { BrowserFrame } from "./BrowserFrame";
import { TechBadge } from "./TechBadge";
import { Project } from "@/components/section/project/project";
import data from "@/Data/Data.json";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { TickIcon } from "@hugeicons/core-free-icons";
import Divider from "../Divider";

/* ─── helper ──────────────────────────────────────────────────────────────── */
function getIconKey(name: string, category: string): string {
    const n = name.toLowerCase();
    if (n.includes("java") && !n.includes("javascript")) return "java";
    if (n.includes("spring"))
        return n.includes("security") ? "security" : "spring";
    if (n.includes("next")) return "nextjs";
    if (n.includes("react")) return "react";
    if (n.includes("typescript")) return "typescript";
    if (n.includes("postgres")) return "postgres";
    if (n.includes("redis")) return "redis";
    if (n.includes("docker")) return "docker";
    if (n.includes("kubernetes")) return "kubernetes";
    if (n.includes("gcp") || n.includes("google cloud")) return "gcp";
    if (n.includes("aws") || n.includes("amazon")) return "aws";
    if (n.includes("github")) return "github";
    if (
        category.toLowerCase() === "security" ||
        n.includes("jwt") ||
        n.includes("oauth")
    )
        return "security";
    return "default";
}

/* ─── ProjectSlide ────────────────────────────────────────────────────────── */
interface SlideProps {
    project: Project;
    index: number;
    total: number;
    isActive: boolean;
    hasEntered: boolean;
}
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
};
function ProjectSlide({
    project,
    index,
    total,
    isActive,
    hasEntered,
}: SlideProps) {
    const [imgIndex, setImgIndex] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setImgIndex(0);
        }
    }, [isActive]);

    return (
        <div
            data-slide
            data-index={index}
            className="relative py-20 overflow-hidden flex items-center"
        >
            {/* ── Content grid ── */}
            <div
                className="relative z-10 w-full max-w-7xl mx-auto px-8 xl:px-16
                      grid grid-cols-[1fr_1.2fr] gap-12 xl:gap-20 items-center"
            >
                {/* Info column */}
                <motion.div
                    className="flex flex-col gap-5"
                    initial={{ opacity: 0, x: -24 }}
                    animate={
                        hasEntered
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -24 }
                    }
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.05,
                    }}
                >
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-neutral-600">
                            {String(index + 1).padStart(2, "0")} /{" "}
                            {String(total).padStart(2, "0")}
                        </span>
                        <span className="w-5 h-px bg-neutral-800" />
                        <span
                            className="font-mono text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: project.accent }}
                        >
                            {project.category}
                        </span>
                    </div>

                    {/* Title + tagline */}
                    <div>
                        <h2
                            className="font-black font-aclonica tracking-tighter text-white"
                            style={{
                                fontSize: "clamp(2.25rem, 3.8vw, 3.75rem)",
                                lineHeight: 0.9,
                            }}
                        >
                            {project.title}
                        </h2>
                        <p className="mt-2.5 text-[14px] text-neutral-400 font-medium leading-snug">
                            {project.tagline}
                        </p>
                    </div>

                    {/* Description */}
                    {/* <p className="text-[13px] text-neutral-500 leading-relaxed">
                        {project.description}
                    </p> */}
                    <motion.ul
                        variants={itemVariants}
                        initial="hidden"
                        animate={hasEntered ? "show" : "hidden"}
                        className="flex flex-col gap-2"
                    >
                        {project.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2.5">
                                <span className="mt-0.5 shrink-0 text-neutral-500">
                                    <HugeiconsIcon icon={TickIcon} size={14} />
                                </span>
                                <span className="text-sm text-neutral-400 leading-snug">
                                    {h}
                                </span>
                            </li>
                        ))}
                    </motion.ul>

                    {/* Metrics */}
                    {project.metrics && project.metrics.length > 0 && (
                        <div className="flex gap-8 py-3.5 border-y border-neutral-800/50">
                            {project.metrics.slice(0, 3).map((m) => (
                                <div key={m.label}>
                                    <p
                                        className="text-xl font-black tracking-tight"
                                        style={{ color: project.accent }}
                                    >
                                        {m.value}
                                    </p>
                                    <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-widest mt-0.5">
                                        {m.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, 8).map((t) => (
                            <TechBadge
                                key={t.name}
                                name={t.name}
                                iconKey={t.iconKey}
                            />
                        ))}
                    </div>

                    {/* Status + links */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         text-[10px] font-mono uppercase tracking-wider"
                            style={{
                                backgroundColor: `${project.accent}12`,
                                color: project.accent,
                                border: `1px solid ${project.accent}22`,
                            }}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${project.status === "live" ? "animate-pulse" : ""}`}
                                style={{ backgroundColor: project.accent }}
                            />
                            {project.status === "live"
                                ? "Live"
                                : project.status === "wip"
                                  ? "In Progress"
                                  : "Archived"}
                        </span>

                        {project.links.github && (
                            <Link
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full
                           border-2 border-neutral-800  text-[11px] font-medium bg-foreground text-background
                           hover:border-neutral-600 hover:text-foreground hover:bg-transparent hover:underline transition-all duration-200"
                            >
                                GitHub ↗
                            </Link>
                        )}
                        <Link
                            href={`/project/${project.id}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full
                           border-2 border-primary  text-[11px] font-medium bg-primary text-background
                           hover:bg-primary/90 hover:underline transition-all duration-200"
                        >
                            Case Study ↗
                        </Link>
                        {project.links.live && (
                            <Link
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                           text-[11px] font-medium transition-all duration-200 hover:opacity-75"
                                style={{
                                    backgroundColor: `${project.accent}15`,
                                    color: project.accent,
                                    border: `1px solid ${project.accent}30`,
                                }}
                            >
                                Live Demo ↗
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Preview column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                        hasEntered
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                    }
                    transition={{
                        duration: 0.65,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.15,
                    }}
                >
                    <BrowserFrame
                        images={project.images}
                        activeImageIndex={imgIndex}
                        onPrev={() => setImgIndex((i) => Math.max(i - 1, 0))}
                        onNext={() =>
                            setImgIndex((i) =>
                                Math.min(i + 1, project.images.length - 1),
                            )
                        }
                        previewUrl={project.previewUrl}
                        projectTitle={project.title}
                    />
                </motion.div>
            </div>
        </div>
    );
}

/* ─── ProjectsSection ─────────────────────────────────────────────────────── */
interface ProjectsSectionProps {
    projects?: Project[];
    sectionTitle?: string;
}

export default function ProjectsSection({
    projects: projectsProp,
    sectionTitle = "Featured Work",
}: ProjectsSectionProps) {
    const projects: Project[] =
        projectsProp ??
        (data.projects as any[]).map((p) => ({
            id: p.id,
            title: p.title,
            tagline: p.tagline,
            category: p.category,
            description: p.description,
            accent: p.accent,
            iconKey: p.iconKey,
            images: p.images,
            highlights: p.highlights,
            status: p.status as Project["status"],
            previewUrl: p.previewUrl,
            metrics: p.metrics,
            links: {
                github: p.links?.github,
                live: p.links?.live,
                caseStudy: p.links?.caseStudy,
            },
            technologies: ((p.technologies as any[]) || []).map((t) => ({
                name: t.name,
                iconKey: getIconKey(t.name, t.category),
            })),
        }));

    /* ── Desktop snap state ── */
    const [activeIndex, setActiveIndex] = useState(0);
    const [enteredIndices, setEnteredIndices] = useState<Set<number>>(
        new Set([0]),
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Track active slide via IntersectionObserver with scroll container as root
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(
                            (entry.target as HTMLElement).dataset.index ?? 0,
                        );
                        setActiveIndex(idx);
                        setEnteredIndices((prev) => new Set([...prev, idx]));
                    }
                });
            },
            { root: container, threshold: 0.55 },
        );

        container
            .querySelectorAll("[data-slide]")
            .forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [projects.length]);

    const scrollToIndex = useCallback((i: number) => {
        const c = containerRef.current;
        if (!c) return;
        c.scrollTo({ top: i * c.clientHeight, behavior: "smooth" });
    }, []);

    /* ── Mobile state (keep original tab UX) ── */
    const [mobileActive, setMobileActive] = useState(0);
    const [mobileImgIndex, setMobileImgIndex] = useState(0);
    const mobileTabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        setMobileImgIndex(0);
    }, [mobileActive]);

    useEffect(() => {
        mobileTabRefs.current[mobileActive]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [mobileActive]);

    const mob = projects[mobileActive];

    return (
        <section className="relative w-full" aria-label="Featured projects">
            <Divider sectionName={"Projects"} />
            {/* ── Section header ── */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                    {sectionTitle}
                </h2>
            </div>

            {/* ════════════════════════════════════════
          DESKTOP — snap scroll
      ════════════════════════════════════════ */}
            <div className="relative hidden lg:block">
                {/* ── Snap scroll container ── */}
                {/* Add to globals.css: .no-scrollbar::-webkit-scrollbar { display: none } */}
                <div
                    ref={containerRef}
                    className="h-full  "
                    style={
                        {
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        } as React.CSSProperties
                    }
                >
                    {projects.map((project, i) => (
                        <ProjectSlide
                            key={project.id}
                            project={project}
                            index={i}
                            total={projects.length}
                            isActive={activeIndex === i}
                            hasEntered={enteredIndices.has(i)}
                        />
                    ))}
                </div>
            </div>

            {/* ════════════════════════════════════════
          MOBILE — horizontal tab strip (unchanged UX)
      ════════════════════════════════════════ */}
            <div className="lg:hidden flex flex-col gap-6 pb-2 px-4">
                {/* Tab strip */}
                <div
                    className="overflow-x-auto flex gap-2 pb-1 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none" } as React.CSSProperties}
                >
                    {projects.map((p, i) => (
                        <button
                            key={p.id}
                            ref={(el) => {
                                mobileTabRefs.current[i] = el;
                            }}
                            onClick={() => setMobileActive(i)}
                            className={`snap-start shrink-0 px-4 py-2 rounded-full border text-sm
                          font-medium transition-all duration-150 ${
                              i === mobileActive
                                  ? "border-neutral-600 bg-neutral-900 text-white"
                                  : "border-neutral-800 text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                            {p.title}
                        </button>
                    ))}
                </div>

                {/* Active project card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mob.id + "-mobile"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col gap-6"
                    >
                        <BrowserFrame
                            images={mob.images}
                            activeImageIndex={mobileImgIndex}
                            onPrev={() =>
                                setMobileImgIndex((i) => Math.max(i - 1, 0))
                            }
                            onNext={() =>
                                setMobileImgIndex((i) =>
                                    Math.min(i + 1, mob.images.length - 1),
                                )
                            }
                            previewUrl={mob.previewUrl}
                            projectTitle={mob.title}
                        />

                        <div className="flex flex-col gap-4 px-1">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-600">
                                    {String(mobileActive + 1).padStart(2, "0")}{" "}
                                    / {String(projects.length).padStart(2, "0")}
                                </span>
                                <span className="w-4 h-px bg-neutral-800" />
                                <span
                                    className="font-mono text-[10px] uppercase tracking-[0.25em]"
                                    style={{ color: mob.accent }}
                                >
                                    {mob.category}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black tracking-tighter text-white leading-tight">
                                    {mob.title}
                                </h3>
                                <p className="mt-1 text-sm text-neutral-400 font-medium">
                                    {mob.tagline}
                                </p>
                            </div>

                            <p className="text-[13px] text-neutral-500 leading-relaxed">
                                {mob.description}
                            </p>

                            {mob.metrics && mob.metrics.length > 0 && (
                                <div className="flex gap-6 py-3 border-y border-neutral-800/50">
                                    {mob.metrics.slice(0, 3).map((m) => (
                                        <div key={m.label}>
                                            <p
                                                className="text-lg font-black"
                                                style={{ color: mob.accent }}
                                            >
                                                {m.value}
                                            </p>
                                            <p className="text-[10px] text-neutral-600 font-medium uppercase tracking-widest mt-0.5">
                                                {m.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {mob.technologies.slice(0, 6).map((t) => (
                                    <TechBadge
                                        key={t.name}
                                        name={t.name}
                                        iconKey={t.iconKey}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                             text-[10px] font-mono uppercase tracking-wider"
                                    style={{
                                        backgroundColor: `${mob.accent}12`,
                                        color: mob.accent,
                                        border: `1px solid ${mob.accent}22`,
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-2xl"
                                        style={{ backgroundColor: mob.accent }}
                                    />
                                    {mob.status === "live"
                                        ? "Live"
                                        : mob.status === "wip"
                                          ? "In Progress"
                                          : "Archived"}
                                </span>
                                {mob.links.github && (
                                    <Link
                                        href={mob.links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl
                               border border-neutral-800  text-[11px] font-medium bg-foreground text-background
                               hover:border-neutral-600 hover:text-white transition-all duration-200"
                                    >
                                        GitHub ↗
                                    </Link>
                                )}
                                {mob.links.live && (
                                    <Link
                                        href={mob.links.live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl
                               text-[11px] font-medium transition-all duration-200 hover:opacity-75"
                                        style={{
                                            backgroundColor: `${mob.accent}15`,
                                            color: mob.accent,
                                            border: `1px solid ${mob.accent}30`,
                                        }}
                                    >
                                        Live Demo ↗
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
