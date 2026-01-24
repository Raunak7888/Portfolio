"use client";

import AboutSection from "@/components/section/aboutSection/AboutSection";
import ContactSection from "@/components/section/contact/ContactSection";
import HeroSection from "@/components/section/heroSection/HeroSection";
import { useMounted } from "@/hooks/useMounted";

export default function Home() {
    const mounted = useMounted();

    // Prevent hydration flicker
    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
            
            <main className="relative w-[98vw] min-h-screen" id="home">
                <HeroSection />
            </main>

            <section className="relative w-[98vw] min-h-screen z-22" id="about">
                <AboutSection />
            </section>

            <section className="relative w-[98vw] min-h-screen" id="contact">
                <ContactSection />
            </section>

            {/* <Footer /> */}
        </div>
    );
}
