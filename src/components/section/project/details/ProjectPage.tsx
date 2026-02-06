"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Data from "@/Data/Project.json";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";

import { Zap, Milestone, Play, ChevronRight } from "lucide-react";

import ProjectFooter from "./ProjectFooter";
import { ProjectData } from "./Types";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

// Mermaid must NEVER be SSR
const MermaidDiagram = dynamic(
    () => import("./MermaidScript").then((m) => m.MermaidDiagram),
    { ssr: false },
);

const ProjectDetail = ({ projectId }: { projectId: string }) => {
    const data = (Data as Record<string, ProjectData>)[projectId];

    const containerRef = useRef<HTMLDivElement | null>(null);
    const galleryTriggerRef = useRef<HTMLDivElement | null>(null);
    const gallerySectionRef = useRef<HTMLDivElement | null>(null);
    const featureTriggerRef = useRef<HTMLDivElement | null>(null);
    const featureSectionRef = useRef<HTMLDivElement | null>(null);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, []);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            mm.add("(min-width: 1024px)", () => {
                if (gallerySectionRef.current && galleryTriggerRef.current) {
                    const w = gallerySectionRef.current.scrollWidth;
                    gsap.to(gallerySectionRef.current, {
                        x: () => -(w - window.innerWidth),
                        ease: "none",
                        scrollTrigger: {
                            trigger: galleryTriggerRef.current,
                            pin: true,
                            scrub: 0.5,
                            start: "top top",
                            end: () => `+=${w}`,
                            invalidateOnRefresh: true,
                        },
                    });
                }

                if (featureSectionRef.current && featureTriggerRef.current) {
                    const w = featureSectionRef.current.scrollWidth;
                    gsap.to(featureSectionRef.current, {
                        x: () => -(w - window.innerWidth),
                        ease: "power2.inOut",
                        scrollTrigger: {
                            trigger: featureTriggerRef.current,
                            pin: true,
                            scrub: 1,
                            start: "top top",
                            end: () => `+=${w}`,
                            invalidateOnRefresh: true,
                        },
                    });
                }
            });

            gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "expo.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 90%",
                        },
                    },
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen text-foreground overflow-x-hidden selection:bg-primary"
        >
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-0.5 bg-primary z-50 origin-left"
                style={{ scaleX }}
            />

            {/* HERO */}
            <section className="min-h-[80vh] lg:h-screen px-6 lg:px-24 flex flex-col justify-center">
                <span className="font-mono text-[10px] tracking-widest text-primary mb-6 block">
                    SYSTEM INITIALIZED // {data.meta.codename}
                </span>

                <h1 className="text-[clamp(4rem,16vw,14rem)] font-black leading-[0.8] tracking-tighter wrap-break-word">
                    {data.meta.projectName.toUpperCase()}
                    <span className="text-primary">.</span>
                </h1>

                <p className="mt-8 text-xl md:text-3xl text-zinc-500 max-w-4xl border-l-2 border-primary pl-6">
                    {data.executiveSummary.oneLiner}
                </p>
                {data.meta.post !== "" ? (
                    <Link href={data.meta.post} className="bg-primary w-fit p-4 mt-4 rounded-3xl">
                        Medium Post
                    </Link>
                ) : (
                    ""
                )}
            </section>

            {/* VISUAL GROUNDING */}
            <section
                ref={galleryTriggerRef}
                className="py-16 lg:h-screen flex items-center overflow-hidden"
            >
                <div
                    ref={gallerySectionRef}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-16 px-6 lg:px-[10vw]"
                >
                    <div className="lg:w-96 shrink-0">
                        <h2 className="text-5xl lg:text-7xl font-bold tracking-tighter">
                            VISUAL{" "}
                            <span className="text-primary">GROUNDING</span>
                        </h2>
                        <p className="mt-2 text-xs font-mono text-zinc-500 flex gap-2 items-center">
                            <Play size={12} /> Scroll to explore
                        </p>
                    </div>

                    {data.images.map((img, i) => (
                        <div
                            key={i}
                            className="relative w-[94vw] lg:w-[70vw] pl-10 aspect-video border border-zinc-900 overflow-hidden"
                        >
                            <Image
                                src={img}
                                alt="Project Screenshot"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* CAPABILITIES */}
            <section
                ref={featureTriggerRef}
                className="py-16 lg:h-screen flex items-center overflow-hidden"
            >
                <div
                    ref={featureSectionRef}
                    className="lg:flex grid grid-cols-2 lg:flex-row gap-8 lg:gap-20 px-6 lg:px-[10vw]"
                >
                    <div className="lg:w-80 shrink-0">
                        <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight">
                            Engine <span className="text-primary">Specs</span>
                        </h2>
                    </div>

                    {data.executiveSummary.keyCapabilities.map((cap, i) => (
                        <div
                            key={i}
                            className=" sm:w-70 lg:w-96 aspect-square p-4 lg:p-8 bg-zinc-950 border border-zinc-800 flex flex-col justify-between"
                        >
                            <Zap className="text-primary/30 text-sm" />
                            <h3 className="text-sm lg:text-2xl font-bold">
                                {cap}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* ARCHITECTURE */}
            <section className="reveal py-24 px-6 lg:px-24">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-black mb-10">
                            Architecture Flow
                        </h2>
                        {data.architecture.dataFlow.map((flow) => (
                            <div key={flow.flowName} className="mb-10">
                                <h4 className="font-mono text-primary text-xs mb-2">
                                    {flow.flowName}
                                </h4>
                                {flow.steps.map((s, i) => (
                                    <p
                                        key={i}
                                        className="text-zinc-400 text-sm"
                                    >
                                        {i + 1}. {s}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="border border-zinc-800 p-6 h-fit overflow-x-auto">
                        <div className="font-3xl">Design</div>
                        <MermaidDiagram
                            code={data.architecture.diagram.content}
                        />
                    </div>
                </div>
            </section>

            {/* TECH LEDGER */}
            <section className="reveal py-24 px-6 lg:px-24">
                <h2 className="text-center font-mono text-xs tracking-widest mb-16">
                    ENGINEERING LEDGER
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px">
                    {[
                        ...data.technologyStack.backend,
                        ...data.technologyStack.frontend,
                    ].map((tech, i) => (
                        <div
                            key={i}
                            className="p-8 bg-zinc-950 border border-zinc-900"
                        >
                            <h4 className="font-bold">{tech.name}</h4>
                            <p className="text-sm text-zinc-500 mt-2">
                                {tech.purpose}
                            </p>
                            <p className="mt-4 text-xs italic text-zinc-600">
                                Trade-off: {tech.tradeOffs}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ROADMAP */}
            <section className="reveal py-24 px-6 lg:px-24">
                <h2 className="text-3xl font-bold flex gap-3 items-center mb-12">
                    <Milestone className="text-primary" /> Development Horizon
                </h2>

                {Object.entries(data.roadmap).map(([period, goals]) => (
                    <div key={period} className="mb-10">
                        <span className="font-mono text-xs text-zinc-600 uppercase">
                            {period}
                        </span>
                        <div className="flex flex-wrap gap-4 mt-4">
                            {goals.map((g: string) => (
                                <span
                                    key={g}
                                    className="text-xl font-bold text-zinc-400"
                                >
                                    / {g}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <ProjectFooter link={data.meta.repository} />
        </div>
    );
};

export default ProjectDetail;
