"use client";

import { GridBackground } from "@/components/GridBackground";
import { useMounted } from "@/hooks/useMounted";

export default function Home() {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full relative bg-background overflow-hidden">
            <GridBackground>
                {/* <main className="relative w-[98vw] min-h-screen" id="home">
                    <HeroSection />
                </main> */}

                {/* <section
                    className="relative w-[98vw] min-h-screen z-22"
                    id="about"
                >
                    <AboutSection />
                </section> */}

                <section
                    className="relative w-[98vw] min-h-screen"
                    id="contact"
                >
                </section>

                {/* <section
                    className="relative w-[98vw] min-h-screen"
                    id="contact"
                >
                    <ContactSection />
                </section> */}
            </GridBackground>
        </div>
    );
}
