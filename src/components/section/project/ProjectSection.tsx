"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ExternalLink,
    Shield,
    Zap,
    Globe,
    ChevronLeft,
    ChevronRight,
    MessageCircleCode,
    Calculator,
    Github,
} from "lucide-react";
import Divider from "../Divider";
import projectData from "@/Data/Data.json";

/* ===================== TYPES ===================== */

interface Project {
    id: string;
    title: string;
    category: string;
    accent: string;
    iconKey: string;
    highlights: string[];
    description: string;
    link: string;
    github: string;
    images: string[];
}

const iconMap: Record<string, React.ReactNode> = {
    globe: <Globe size={18} />,
    shield: <Shield size={18} />,
    zap: <Zap size={18} />,
    message_circle: <MessageCircleCode size={18} />,
    calculator: <Calculator size={18} />,
};

/* ===================== PROJECT CARD ===================== */

function ProjectCard({
    project,
    isEven,
}: {
    project: Project;
    isEven: boolean;
}) {
    const [imgIndex, setImgIndex] = useState(0);
    const detailsHref = `/project/${encodeURIComponent(project.id)}`;
    const liveDemoHref = project.link.replace("[projectId]", project.id);

    return (
        <motion.div
            /**
             * REVERSE ANIMATION LOGIC:
             * - initial: The state when the component is off-screen.
             * - whileInView: The state when the component enters the viewport.
             * - viewport: { once: false } allows the animation to play in reverse when scrolling away.
             */
            initial={{
                opacity: 0,
                y: 50,
                x: isEven ? -50 : 50, // Slides in from left if even, right if odd
            }}
            whileInView={{
                opacity: 1,
                y: 0,
                x: 0,
            }}
            viewport={{
                once: false, // Set to false to enable reverse animation
                amount: 0.2, // Triggers when 20% of the element is visible
                margin: "-50px",
            }}
            transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a smooth "pro" feel
            }}
            className="w-full py-16 lg:py-24 border-b border-foreground/5 last:border-none"
        >
            <div
                className={`flex flex-col ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                } gap-12 items-center max-w-7xl mx-auto px-6`}
            >
                {/* Image Container */}
                <div className="w-full lg:w-3/5 group">
                    <div className="relative aspect-16/10 rounded-4xl overflow-hidden border border-foreground/10 bg-muted shadow-xl transition-transform duration-500 group-hover:scale-[1.02]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={imgIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={project.images[imgIndex]}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Image Navigation */}
                        {project.images.length > 1 && (
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    className="p-3 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-white transition-all"
                                    onClick={() =>
                                        setImgIndex(
                                            (i) =>
                                                (i -
                                                    1 +
                                                    project.images.length) %
                                                project.images.length,
                                        )
                                    }
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="p-3 rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-primary hover:text-white transition-all"
                                    onClick={() =>
                                        setImgIndex(
                                            (i) =>
                                                (i + 1) % project.images.length,
                                        )
                                    }
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-2/5 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <span style={{ color: project.accent }}>
                            {iconMap[project.iconKey] || <Globe size={18} />}
                        </span>
                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-foreground/60">
                            {project.category}
                        </span>
                    </div>

                    <h3 className="text-4xl lg:text-6xl font-black mb-6 tracking-tighter text-foreground">
                        {project.title}
                    </h3>

                    <p className="text-foreground/70 mb-8 text-lg leading-relaxed">
                        {project.description}
                    </p>

                    {/* Highlights */}
                    <ul className="grid grid-cols-1 gap-3 mb-10">
                        {project.highlights.map((h, idx) => (
                            <motion.li
                                key={h}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: project.accent }}
                                />
                                <span className="text-sm font-semibold text-foreground/80">
                                    {h}
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        {project.link !== "" ? (
                            <Link
                                href={liveDemoHref}
                                target="_blank"
                                className={`px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 `}
                            >
                                Live Demo <ExternalLink size={18} />
                            </Link>
                        ) : (
                            <div
                                className={`px-8 py-4 rounded-2xl bg-gray-400 cursor-not-allowed text-primary-foreground font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 `}
                            >
                                Live Demo <ExternalLink size={18} />
                            </div>
                        )}

                        <Link
                            href={detailsHref}
                            className="px-8 py-4 rounded-2xl border-2 border-foreground/10 font-bold hover:bg-foreground hover:text-background transition-all"
                        >
                            Details
                        </Link>
                        <Link
                            href={project.github}
                            target="_blank"
                            className="px-8 py-4 rounded-2xl border-2 border-foreground/10 font-bold flex flex-row gap-2 hover:bg-foreground hover:text-background transition-all"
                        >
                            <Github />Github
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ===================== MAIN SECTION ===================== */

export default function ProjectSection() {
    return (
        <section className="relative w-full  overflow-hidden">
            <Divider sectionName="Featured Work" />

            <div className="flex flex-col py-10">
                {projectData.projects.map((p: Project, i: number) => (
                    <ProjectCard key={p.id} project={p} isEven={i % 2 === 0} />
                ))}
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -z-10" />
        </section>
    );
}
