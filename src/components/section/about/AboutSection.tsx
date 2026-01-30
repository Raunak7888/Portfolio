"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Divider from "../Divider";
import { ShieldCheck, Cpu, Map, Terminal, Brain, Layers } from "lucide-react";
import data from "@/Data/Data.json";
const iconMap: Record<string, React.ReactNode> = {
    "01": <ShieldCheck className="w-5 h-5 text-primary" />,
    "02": <Cpu className="w-5 h-5 text-primary" />,
    "03": <Brain className="w-5 h-5 text-primary" />,
    "04": <Map className="w-5 h-5 text-primary" />,
};
const AboutSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const terminalRef = useRef<HTMLDivElement>(null);

    const { endingLine, segments } = data.about;

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 40%", // Triggers when top of section hits 40% of viewport
                    toggleActions: "play none none none",
                },
            });

            // 1. Initial State: Hide elements but keep layout
            gsap.set(cardsRef.current, {
                opacity: 0,
                scale: 0.9,
                rotateX: -15,
            });

            // 2. The "Power On" Pulse
            tl.fromTo(
                containerRef.current,
                {
                    outline: "2px solid transparent",
                    backgroundColor: "rgba(255,255,255,0)",
                },
                {
                    outline: "1px solid var(--primary)",
                    backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                    duration: 0.5,
                },
            )

                // 3. Staggered Card Reveal with 3D Tilt
                .to(
                    cardsRef.current,
                    {
                        opacity: 1,
                        scale: 1,
                        rotateX: 0,
                        duration: 1.2,
                        stagger: {
                            each: 0.2,
                            from: "start",
                        },
                        ease: "expo.out",
                    },
                    "-=0.3",
                )

                // 4. "Scanning" Clip Effect (Simulates a laser scan)
                .fromTo(
                    cardsRef.current,
                    { clipPath: "inset(0 100% 0 0)" },
                    {
                        clipPath: "inset(0 0% 0 0)",
                        duration: 1.5,
                        stagger: 0.2,
                        ease: "power4.inOut",
                    },
                    "<", // Start at the same time as step 3
                )

                // 5. The Terminal Pop & Infinite Float
                .fromTo(
                    terminalRef.current,
                    { scale: 0, y: 20, opacity: 0 },
                    {
                        scale: 1,
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "back.out(2)",
                    },
                    "-=0.8",
                )
                .to(terminalRef.current, {
                    y: -10,
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-screen flex flex-col text-foreground overflow-hidden perspective-1000" // Added perspective
        >
            <div className="w-full px-6 shrink-0">
                <Divider sectionName="About Me" />
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-5 lg:pb-10 flex items-center justify-center">
                <div
                    ref={containerRef}
                    className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/5"
                >
                    {/* Central Floating Node */}
                    <div
                        ref={terminalRef}
                        className="central-node hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/40 transition-all duration-500" />
                            <div className="relative p-5 rounded-xl bg-background border border-foreground/20 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Terminal className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>

                    {segments.map((s, index: number) => (
                        <div
                            key={s.id}
                            ref={(el) => {
                                if (el) cardsRef.current[index] = el;
                            }}
                            className="group relative p-8 lg:p-14 bg-background hover:bg-white/2 transition-colors duration-500 flex flex-col gap-6 transform-gpu"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-primary/60 font-bold border border-primary/20 px-2 py-0.5 rounded">
                                        LVL_{s.id}
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold font-jersey uppercase tracking-wide group-hover:text-primary transition-colors">
                                    {s.title}
                                </h3>
                            </div>

                            {/* Status Tag */}
                            <div className="flex items-center gap-3 bg-foreground/5 self-start px-3 py-1.5 rounded-md border border-foreground/10">
                                {iconMap[s.id as keyof typeof iconMap]}
                                <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-widest">
                                    {s.label}
                                </span>
                            </div>

                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-mitr">
                                {s.text}
                            </p>

                            {/* Background Number Decal (Added for "Better" visual) */}
                            <span className="absolute bottom-4 right-8 text-7xl font-bold opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                                0{s.id}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ending Line with Fade In */}
            <div className="w-full flex items-center justify-end px-6 pb-6">
                <div className="md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/40 pl-4 md:pl-0 md:pr-4 opacity-70">
                    <p className="font-poetsen max-w-xs text-[11px] text-zinc-500 leading-tight">
                        {endingLine}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
