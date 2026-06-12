"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import HeroContent from "./HeroCard";

export default function HeroSection() {
    const heroRef = useRef<HTMLElement | null>(null);
    const spotlightRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                heroRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power2.out" },
            );
        }, heroRef);

        const handleMouseMove = (e: MouseEvent) => {
            if (!spotlightRef.current || !heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spotlightRef.current.style.setProperty("--mx", `${x}px`);
            spotlightRef.current.style.setProperty("--my", `${y}px`);
        };

        const el = heroRef.current;
        el?.addEventListener("mousemove", handleMouseMove);

        return () => {
            ctx.revert();
            el?.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <section
            ref={heroRef}
            className="hero-section relative min-h-screen w-full flex flex-col items-center overflow-hidden opacity-0"
        >
            {/* ── Layer 1: Blueprint grid ── */}
            {/*
                Very faint 1px horizontal + vertical lines.
                Using two separate divs so each axis fades differently.
                X-axis lines fade out toward bottom.
                Y-axis lines fade out toward the right.
            */}
            <div
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "72px 72px",
                    maskImage: `
                        radial-gradient(ellipse 90% 70% at 50% 0%,
                            black 0%,
                            black 35%,
                            transparent 80%
                        )
                    `,
                    WebkitMaskImage: `
                        radial-gradient(ellipse 90% 70% at 50% 0%,
                            black 0%,
                            black 35%,
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* ── Layer 2: Scan line ── */}
            {/*
                A single 1px bright line that drifts slowly upward.
                It's only visible where it intersects the grid — elsewhere
                it blends into the background. Pure CSS animation.
            */}
            <div
                aria-hidden
                className="absolute inset-x-0 z-0 pointer-events-none"
                style={{
                    height: "1px",
                    background:
                        "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.25) 20%, hsl(var(--primary) / 0.5) 50%, hsl(var(--primary) / 0.25) 80%, transparent 100%)",
                    animation: "heroScanLine 9s linear infinite",
                    top: "60%",
                }}
            />

            {/* ── Layer 3: Top radial glow (wide, soft) ── */}
            <div
                aria-hidden
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
                style={{
                    width: "800px",
                    height: "340px",
                    background:
                        "radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.09) 0%, transparent 70%)",
                }}
            />

            {/* ── Layer 4: Cursor spotlight ── */}
            <div
                ref={spotlightRef}
                aria-hidden
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(360px circle at var(--mx, 50%) var(--my, 30%), hsl(var(--primary) / 0.05) 0%, transparent 70%)",
                }}
            />

            {/* ── Layer 5: HUD corner brackets ── */}
            {/*
                Four corner marks at the section boundary.
                Ultra-light, monospace. They frame the content without
                drawing the eye — noticed only on close inspection.
            */}
            <span
                aria-hidden
                className="absolute top-6 left-6 font-mono text-[10px] text-foreground/10 select-none pointer-events-none z-0 leading-none"
            >
                ⌐
            </span>
            <span
                aria-hidden
                className="absolute top-6 right-6 font-mono text-[10px] text-foreground/10 select-none pointer-events-none z-0 leading-none"
            >
                ¬
            </span>
            <span
                aria-hidden
                className="absolute bottom-6 left-6 font-mono text-[10px] text-foreground/10 select-none pointer-events-none z-0 leading-none rotate-180"
            >
                ¬
            </span>
            <span
                aria-hidden
                className="absolute bottom-6 right-6 font-mono text-[10px] text-foreground/10 select-none pointer-events-none z-0 leading-none rotate-180"
            >
                ⌐
            </span>

            {/* ── Layer 6: Bottom fade ── */}
            <div
                aria-hidden
                className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-0"
                style={{
                    background:
                        "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mt-16 sm:mt-0 px-6 lg:px-16">
                <HeroContent />
            </div>

           
        </section>
    );
}