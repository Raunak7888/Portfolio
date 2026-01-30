"use client";

import { GridBackground } from "@/components/GridBackground";
import ProjectSection from "@/components/section/project/ProjectSection";
import SkillGraph from "@/components/section/skill/SkillGraph";
import AboutSection from "@/components/section/about/AboutSection";
import ContactSection from "@/components/section/contact/ContactSection";
import HeroSection from "@/components/section/hero/HeroSection";
import { useMounted } from "@/hooks/useMounted";
import Footer from "@/components/footer/Footer";

export default function Home() {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full relative bg-background overflow-hidden">
            <GridBackground>
                <main className="relative w-screen min-h-screen" id="home">
                    <HeroSection />
                </main>

                <section className="relative w-screen min-h-screen" id="about">
                    <AboutSection />
                </section>

                <section className="relative w-screen min-h-screen" id="skills">
                    <SkillGraph />
                </section>

                <section className="relative w-screen min-h-screen" id="projects">
                    <ProjectSection />
                </section>

                <section
                    className="relative w-screen min-h-screen"
                    id="contact"
                >
                    <ContactSection />
                </section>

                <footer>
                    <Footer />
                </footer>
            </GridBackground>
        </div>
    );
}
