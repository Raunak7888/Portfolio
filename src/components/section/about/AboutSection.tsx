"use client";

import React, { useLayoutEffect, useRef, JSX, useCallback } from "react";
import {
    motion,
    useReducedMotion,
    useSpring,
    useMotionValue,
} from "framer-motion";
import { gsap } from "@/lib/gsap";
import Divider from "../Divider";
import {
    ShieldCheck,
    Cpu,
    Map,
    Terminal,
    Brain,
    ArrowUpRight,
} from "lucide-react";
import data from "@/Data/Data.json";

const iconMap: Record<string, JSX.Element> = {
    "01": <ShieldCheck className="w-5 h-5 text-primary" />,
    "02": <Cpu className="w-5 h-5 text-primary" />,
    "03": <Brain className="w-5 h-5 text-primary" />,
    "04": <Map className="w-5 h-5 text-primary" />,
};

const AboutSection: React.FC = () => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const terminalRef = useRef<HTMLDivElement | null>(null);
    const bgTextRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    const prefersReducedMotion = useReducedMotion();

    // Magnetic Effect Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Increased damping slightly for smoother performance
    const springConfig = { damping: 25, stiffness: 120, restDelta: 0.001 };
    const transX = useSpring(mouseX, springConfig);
    const transY = useSpring(mouseY, springConfig);

    const { endingLine, segments } = data.about;

    // Optimized Mouse Move
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!terminalRef.current || window.innerWidth < 1024) return;

            const rect = terminalRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;

            // Check range before updating motion values
            if (Math.abs(distanceX) < 300 && Math.abs(distanceY) < 300) {
                mouseX.set(distanceX * 0.15);
                mouseY.set(distanceY * 0.15);
            } else if (mouseX.get() !== 0 || mouseY.get() !== 0) {
                mouseX.set(0);
                mouseY.set(0);
            }
        },
        [mouseX, mouseY],
    );

    useLayoutEffect(() => {
        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // 1. Background Parallax - Use x instead of xPercent for better GPU usage
            gsap.to(bgTextRef.current, {
                x: -200,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "40% 70%",
                    scrub: 0.5, // Reduced scrub for responsiveness
                },
            });

            // 2. Card Entrance - Removed Blur/Brightness filters (Performance Killers)
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const isLeft = i % 2 === 0;

                gsap.fromTo(
                    card,
                    {
                        opacity: 0,
                        x: isLeft ? -50 : 50,
                        skewX: isLeft ? 2 : -2,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        skewX: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "25% 80%",
                            toggleActions: "play none none reverse",
                        },
                    },
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    return (
        <section
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            className="relative w-full min-h-screen flex flex-col overflow-hidden py-10 lg:py-20"
        >
            <div
                ref={bgTextRef}
                className="absolute top-1/4 left-0 text-[20vw] font-black text-foreground/2 whitespace-nowrap pointer-events-none select-none z-0 uppercase will-change-transform"
            >
                Digital Craftsman
            </div>

            <div className="px-6 relative z-10">
                <Divider sectionName="About Me" />
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 flex items-center relative z-10">
                <div
                    ref={containerRef}
                    className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-px border border-foreground/10 rounded-4xl overflow-hidden bg-foreground/5 backdrop-blur-md shadow-2xl"
                >
                    {/* Central Terminal */}
                    <motion.div
                        ref={terminalRef}
                        style={{ x: transX, y: transY }}
                        className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none will-change-transform"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative p-6 bg-zinc-900 border border-primary/50 rounded-2xl shadow-xl">
                                <Terminal className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                    </motion.div>

                    {segments.map((s, index) => (
                        <motion.div
                            key={s.id}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            whileHover={{
                                backgroundColor:
                                    "rgba(var(--primary-rgb), 0.02)",
                            }}
                            className="relative group p-8 lg:p-16 bg-background flex flex-col gap-6 border-foreground/5 transition-colors duration-300"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-[10px] font-bold text-primary border border-primary/30 px-2 py-1 rounded-sm bg-primary/5">
                                            NODE_{s.id}
                                        </span>
                                        <div className="h-px w-12 bg-primary/20" />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-transform duration-300" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-bold tracking-tighter uppercase">
                                    {s.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-3 bg-foreground/5 self-start px-4 py-2 rounded-full border border-foreground/10">
                                <div className="animate-spin-slow">
                                    {iconMap[s.id]}
                                </div>
                                <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground tracking-widest">
                                    {s.label}
                                </span>
                            </div>

                            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-light">
                                {s.text}
                            </p>

                            <div className="absolute -bottom-2 -right-2 text-[10rem] font-black text-foreground/1 pointer-events-none italic">
                                {s.id}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="w-full flex flex-col md:flex-row justify-between items-end px-10 pt-10 gap-6 relative z-10">
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary/20 animate-pulse"
                        />
                    ))}
                </div>
                <div className="border-r-4 border-primary/40 pr-6 text-right max-w-sm">
                    <p className="text-[12px] font-mono text-zinc-500 leading-snug uppercase italic">
                        {endingLine}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
