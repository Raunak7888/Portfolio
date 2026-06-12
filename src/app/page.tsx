"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, Variants } from "framer-motion";

import { GridBackground } from "@/components/GridBackground";
import AboutSection from "@/components/section/about/AboutSection";
import ContactSection from "@/components/section/contact/ContactSection";
import HeroSection from "@/components/section/hero/HeroSection";
import { useMounted } from "@/hooks/useMounted";
import Footer from "@/components/section/footer/Footer";
import SkillSection from "@/components/section/skill/Skill";
import { ProjectsSection } from "@/components/section/project";

const sectionReveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function Home() {
    const mounted = useMounted();
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 40,
        restDelta: 0.001,
    });

    if (!mounted) return null;

    return (
        <div
            ref={containerRef}
            className="min-h-screen w-full relative bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground"
        >
            {/* Scroll progress indicator */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
                style={{ scaleX }}
            />

            <GridBackground>
                <main
                    className="relative w-screen min-h-screen flex items-center justify-center"
                    id="home"
                >
                    <HeroSection />
                </main>

                {[
                    { id: "about", Component: AboutSection },
                    { id: "skills", Component: SkillSection },
                    { id: "projects", Component: ProjectsSection },
                    { id: "contact", Component: ContactSection },
                ].map(({ id, Component }) => (
                    <motion.section
                        key={id}
                        id={id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-8%" }}
                        variants={sectionReveal}
                        className="relative w-screen min-h-screen"
                    >
                        <Component />
                    </motion.section>
                ))}

                <footer className="relative border-t border-border">
                    <Footer />
                </footer>
            </GridBackground>
        </div>
    );
}