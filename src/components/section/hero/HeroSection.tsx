"use client";
import { useRef } from "react";
import Navbar from "@/components/navbar/Navbar";
import HeroContent from "./HeroCard";

export default function HeroSection() {
    const heroRef = useRef<HTMLElement | null>(null);

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen w-full flex flex-col items-center overflow-hidden"
        >
            <Navbar />

            <div className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mt-20 sm:mt-0 px-6">
                <HeroContent />
            </div>
        </section>
    );
}
