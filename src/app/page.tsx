"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useScroll, useSpring, Variants } from "framer-motion";
import { gsap } from "gsap";

import { GridBackground } from "@/components/GridBackground";
import SkillGraph from "@/components/section/skill/SkillGraph";
import AboutSection from "@/components/section/about/AboutSection";
import ContactSection from "@/components/section/contact/ContactSection";
import HeroSection from "@/components/section/hero/HeroSection";
import { useMounted } from "@/hooks/useMounted";
import Footer from "@/components/section/footer/Footer";
import ProjectSection from "@/components/section/project/ProjectSection";

// Reveal animation variant
const sectionReveal: Variants = {
    hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
    visible: { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } 
    }
};

export default function Home() {
    const mounted = useMounted();
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Smooth scroll progress bar logic
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useLayoutEffect(() => {
        if (!mounted) return;

        const ctx = gsap.context(() => {
            // Intro sequence: Grid and Hero power up
            gsap.timeline()
                .fromTo(".bg-grid-line", 
                    { opacity: 0, scale: 1.1 }, 
                    { opacity: 0.4, scale: 1, duration: 2, stagger: 0.1, ease: "power2.out" }
                )
                .fromTo("main", 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 1.5 }, "-=1");
        }, containerRef);

        return () => ctx.revert();
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div ref={containerRef} className="min-h-screen w-full relative bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
            
            {/* Cinematic Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-100 origin-left"
                style={{ scaleX }}
            />

            <GridBackground>
                {/* Hero Section - Direct Entrance */}
                <main className="relative w-screen min-h-screen flex items-center justify-center" id="home">
                    <HeroSection />
                </main>

                {/* Scroll-Triggered Sections */}
                {[
                    { id: "about", Component: AboutSection },
                    { id: "skills", Component: SkillGraph },
                    { id: "projects", Component: ProjectSection },
                    { id: "contact", Component: ContactSection },
                ].map(({ id, Component }) => (
                    <motion.section
                        key={id}
                        id={id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-10%" }}
                        variants={sectionReveal}
                        className="relative w-screen min-h-screen"
                    >
                        <Component />
                    </motion.section>
                ))}

                <footer className="relative border-t border-foreground/5">
                    <Footer />
                </footer>
            </GridBackground>

            {/* Ambient vignette for depth */}
            <div className="pointer-events-none fixed inset-0 z-50 shadow-[inset_0_0_15vw_rgba(0,0,0,0.4)]" />
        </div>
    );
}