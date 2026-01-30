"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap"; // Using your existing GSAP lib
import Navbar from "@/components/section/navbar/Navbar";
import HeroContent from "./HeroCard";

export default function HeroSection() {
    const heroRef = useRef<HTMLElement | null>(null);
    const bgRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // GSAP Timeline for the entry
            const tl = gsap.timeline();

            tl.fromTo(
                heroRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1 },
            ).fromTo(
                bgRef.current,
                { scale: 1.2, filter: "blur(20px)" },
                {
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1.5,
                    ease: "power2.out",
                },
                0, // Start at same time as parent fade
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen w-full flex flex-col items-center overflow-hidden opacity-0"
        >
            {/* Background Layer for GSAP to manipulate */}
            <div ref={bgRef} className="absolute inset-0 pointer-events-none" />

            <Navbar />

            <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mt-20 sm:mt-0 px-6">
                <HeroContent />
            </div>
        </section>
    );
}
